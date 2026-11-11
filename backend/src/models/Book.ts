import mongoose from "mongoose";

export const BOOK_STATUSES = ["read", "reading", "planned"];

const bookSchema = new mongoose.Schema(
  {
    // Owner of the book: each user only sees their own books
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    totalPages: {
      type: Number,
      required: true,
      min: 1,
    },
    pagesRead: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: BOOK_STATUSES,
      default: "planned",
    },
    // Optional: null or missing means "not rated"
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    // File name of the cover in backend/uploads (added with Multer later)
    coverImage: {
      type: String,
    },
  },
  { timestamps: true } // adds createdAt and updatedAt automatically
);

const Book = mongoose.model("Book", bookSchema);

export default Book;
