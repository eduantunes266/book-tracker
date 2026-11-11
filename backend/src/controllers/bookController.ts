import { Response } from "express";
import Book, { BOOK_STATUSES } from "../models/Book";
import { AuthRequest } from "../middleware/auth";
import { deleteCoverFile } from "../middleware/upload";

// Fields a client is allowed to send (userId and coverImage are set by the server)
interface BookInput {
  title?: string;
  author?: string;
  totalPages?: number;
  pagesRead?: number;
  status?: string;
  rating?: number | null;
  notes?: string;
}

// Converts a number or numeric string (e.g. "120") to a whole number.
// Returns null if it is not a whole number.
const toInteger = (value: unknown): number | null => {
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (typeof value === "string" && value.trim() === "") return null;
  const number = Number(value);
  return Number.isInteger(number) ? number : null;
};

// Validates the request body and returns only the allowed, cleaned fields.
// "partial" = true is used for updates, where missing fields are kept as they are.
const parseBookInput = (
  body: any,
  partial: boolean
): { data?: BookInput; error?: string } => {
  const { title, author, totalPages, pagesRead, status, rating, notes } =
    body ?? {};
  const data: BookInput = {};

  if (title !== undefined || !partial) {
    if (typeof title !== "string" || title.trim() === "") {
      return { error: "Title is required" };
    }
    data.title = title.trim();
  }

  if (author !== undefined || !partial) {
    if (typeof author !== "string" || author.trim() === "") {
      return { error: "Author is required" };
    }
    data.author = author.trim();
  }

  if (totalPages !== undefined || !partial) {
    const pages = toInteger(totalPages);
    if (pages === null || pages < 1) {
      return { error: "Total pages must be a whole number greater than 0" };
    }
    data.totalPages = pages;
  }

  if (pagesRead !== undefined) {
    const pages = toInteger(pagesRead);
    if (pages === null || pages < 0) {
      return { error: "Pages read must be a whole number of 0 or more" };
    }
    data.pagesRead = pages;
  }

  if (status !== undefined) {
    if (!BOOK_STATUSES.includes(status)) {
      return { error: 'Status must be "read", "reading" or "planned"' };
    }
    data.status = status;
  }

  if (rating !== undefined) {
    if (rating === null || rating === "") {
      data.rating = null; // removes the rating
    } else {
      const stars = toInteger(rating);
      if (stars === null || stars < 1 || stars > 5) {
        return { error: "Rating must be a whole number from 1 to 5" };
      }
      data.rating = stars;
    }
  }

  if (notes !== undefined) {
    if (typeof notes !== "string") {
      return { error: "Notes must be text" };
    }
    data.notes = notes.trim();
  }

  return { data };
};

// Escapes special characters so the search text is used literally in a RegExp
const escapeRegex = (text: string) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/books?status=reading&search=tolkien
export const getBooks = async (req: AuthRequest, res: Response) => {
  try {
    const { status, search } = req.query;
    const filter: Record<string, unknown> = { userId: req.userId };

    if (status !== undefined) {
      if (typeof status !== "string" || !BOOK_STATUSES.includes(status)) {
        return res
          .status(400)
          .json({ message: 'Status must be "read", "reading" or "planned"' });
      }
      filter.status = status;
    }

    if (typeof search === "string" && search.trim() !== "") {
      // Case-insensitive search on title OR author
      const regex = new RegExp(escapeRegex(search.trim()), "i");
      filter.$or = [{ title: regex }, { author: regex }];
    }

    const books = await Book.find(filter).sort({ createdAt: -1 }); // newest first
    return res.status(200).json(books);
  } catch (error) {
    console.error("Get books error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET /api/books/:id
export const getBookById = async (req: AuthRequest, res: Response) => {
  try {
    // Searching by id AND userId means users can never see other users' books
    const book = await Book.findOne({ _id: req.params.id, userId: req.userId });
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    return res.status(200).json(book);
  } catch (error) {
    if (error instanceof Error && error.name === "CastError") {
      return res.status(404).json({ message: "Book not found" }); // invalid id format
    }
    console.error("Get book error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /api/books (JSON or multipart form with an optional "cover" image)
export const createBook = async (req: AuthRequest, res: Response) => {
  // File name of the uploaded cover (if any). If the request fails,
  // we delete it so no unused files stay in the uploads folder.
  const uploadedCover = req.file?.filename;

  try {
    const { data, error } = parseBookInput(req.body, false);
    if (error || !data) {
      await deleteCoverFile(uploadedCover);
      return res.status(400).json({ message: error });
    }

    if ((data.pagesRead ?? 0) > data.totalPages!) {
      await deleteCoverFile(uploadedCover);
      return res
        .status(400)
        .json({ message: "Pages read cannot be greater than total pages" });
    }

    const book = await Book.create({
      ...data,
      userId: req.userId,
      coverImage: uploadedCover,
    });
    return res.status(201).json(book);
  } catch (error) {
    await deleteCoverFile(uploadedCover);
    console.error("Create book error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/books/:id (only the fields sent are changed; a new "cover" replaces the old one)
export const updateBook = async (req: AuthRequest, res: Response) => {
  const uploadedCover = req.file?.filename;

  try {
    const { data, error } = parseBookInput(req.body, true);
    if (error || !data) {
      await deleteCoverFile(uploadedCover);
      return res.status(400).json({ message: error });
    }

    const book = await Book.findOne({ _id: req.params.id, userId: req.userId });
    if (!book) {
      await deleteCoverFile(uploadedCover);
      return res.status(404).json({ message: "Book not found" });
    }

    // Compare the new values with the ones already saved
    const totalPages = data.totalPages ?? book.totalPages;
    const pagesRead = data.pagesRead ?? book.pagesRead;
    if (pagesRead > totalPages) {
      await deleteCoverFile(uploadedCover);
      return res
        .status(400)
        .json({ message: "Pages read cannot be greater than total pages" });
    }

    const oldCover = book.coverImage;
    book.set(data);
    if (uploadedCover) {
      book.coverImage = uploadedCover;
    }
    await book.save();

    // Only delete the old cover after the new one was saved successfully
    if (uploadedCover) {
      await deleteCoverFile(oldCover);
    }
    return res.status(200).json(book);
  } catch (error) {
    await deleteCoverFile(uploadedCover);
    if (error instanceof Error && error.name === "CastError") {
      return res.status(404).json({ message: "Book not found" });
    }
    console.error("Update book error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/books/:id
export const deleteBook = async (req: AuthRequest, res: Response) => {
  try {
    const book = await Book.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    await deleteCoverFile(book.coverImage); // remove the cover image too
    return res.status(200).json({ message: "Book deleted" });
  } catch (error) {
    if (error instanceof Error && error.name === "CastError") {
      return res.status(404).json({ message: "Book not found" });
    }
    console.error("Delete book error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
