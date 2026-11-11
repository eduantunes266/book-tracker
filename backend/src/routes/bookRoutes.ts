import { Router } from "express";
import auth from "../middleware/auth";
import { uploadCover } from "../middleware/upload";
import {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} from "../controllers/bookController";

const router = Router();

// Every /api/books route requires a valid JWT
router.use(auth);

router.get("/", getBooks);
router.get("/:id", getBookById);
// uploadCover reads the optional "cover" image before the controller runs
router.post("/", uploadCover, createBook);
router.put("/:id", uploadCover, updateBook);
router.delete("/:id", deleteBook);

export default router;
