import { Router } from "express";
import auth from "../middleware/auth";
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
router.post("/", createBook);
router.put("/:id", updateBook);
router.delete("/:id", deleteBook);

export default router;
