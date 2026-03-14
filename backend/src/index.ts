import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { modelsRouter } from "./routes/models";
import { authRouter } from "./routes/auth";
import { categoriesRouter } from "./routes/categories";
import { brandsRouter } from "./routes/brands";
import { productsRouter } from "./routes/products";
import { messagesRouter } from "./routes/messages";
import { newsletterRouter } from "./routes/newsletter";

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded files (e.g. category icons) from /uploads
const uploadsDir = path.join(__dirname, "..", "uploads");
app.use("/uploads", express.static(uploadsDir));

// Auth and admin-related routes
app.use("/api", authRouter);

// Domain routes
app.use("/api/categories", categoriesRouter);
app.use("/api/brands", brandsRouter);
app.use("/api/products", productsRouter);
app.use("/api/models", modelsRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/newsletter", newsletterRouter);

// Catch-all: no valid route matched
app.use("*", (req, res) => {
  res.status(404).json({ error: "Not found", path: req.originalUrl });
});

const PORT = process.env.PORT ?? 5000;

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});

