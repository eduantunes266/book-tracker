import "dotenv/config"; // loads variables from .env into process.env
import express from "express";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import bookRoutes from "./routes/bookRoutes";
import { UPLOADS_DIR } from "./middleware/upload";

const app = express();
const PORT = process.env.PORT || 5000;

// Parse JSON request bodies
app.use(express.json());

// Serve cover images, e.g. GET /uploads/<file name>
app.use("/uploads", express.static(UPLOADS_DIR));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

// Connect to the database first, then start listening for requests
const startServer = async () => {
  await connectDB();
  // In Express 5 the callback also receives an error (e.g. port already in use)
  app.listen(PORT, (error) => {
    if (error) {
      console.error("Could not start server:", error.message);
      process.exit(1);
    }
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
