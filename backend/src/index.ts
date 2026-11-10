import "dotenv/config"; // loads variables from .env into process.env
import express from "express";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";

const app = express();
const PORT = process.env.PORT || 5000;

// Parse JSON request bodies
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/auth", authRoutes);

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
