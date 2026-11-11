import fs from "fs";
import path from "path";
import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import multer from "multer";

// backend/uploads (works from src/ with tsx and from dist/ after build)
export const UPLOADS_DIR = path.join(__dirname, "..", "..", "uploads");
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// Allowed image types and the extension we save them with
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  // Unique random name, so two covers never overwrite each other
  filename: (req, file, cb) => {
    const name = crypto.randomUUID() + ALLOWED_TYPES[file.mimetype];
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES[file.mimetype]) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, PNG, WEBP or GIF images are allowed"));
    }
  },
});

// Accepts an optional image in the "cover" field of a multipart form.
// Multer errors are turned into clear 400 JSON messages.
export const uploadCover = (req: Request, res: Response, next: NextFunction) => {
  upload.single("cover")(req, res, (error: unknown) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "Cover image must be at most 5 MB" });
      }
      if (error.code === "LIMIT_UNEXPECTED_FILE") {
        return res
          .status(400)
          .json({ message: 'The image must be sent in the "cover" field' });
      }
      return res.status(400).json({ message: error.message });
    }

    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }
    return next(error);
  });
};

// Deletes a cover file from the uploads folder (ignores missing files)
export const deleteCoverFile = async (filename?: string | null) => {
  if (!filename) return;
  try {
    // path.basename prevents paths like "../something"
    await fs.promises.unlink(path.join(UPLOADS_DIR, path.basename(filename)));
  } catch {
    // File was already gone - nothing to do
  }
};
