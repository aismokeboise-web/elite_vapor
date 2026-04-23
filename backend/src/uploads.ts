import fs from "fs";
import path from "path";
import multer from "multer";

const uploadsRoot = path.join(__dirname, "..", "uploads");
const categoryIconsDir = path.join(uploadsRoot, "category-icons");
const modelImagesDir = path.join(uploadsRoot, "model-images");

export const CATEGORY_PLACEHOLDER_FILENAME = "placeholder.svg";
export const CATEGORY_PLACEHOLDER_PATH = `/uploads/category-icons/${CATEGORY_PLACEHOLDER_FILENAME}`;

const MAX_MODEL_IMAGE_BYTES = 50 * 1024; // 50 kB

function ensureUploadsSetup() {
  fs.mkdirSync(categoryIconsDir, { recursive: true });
  fs.mkdirSync(modelImagesDir, { recursive: true });

  const placeholderFullPath = path.join(
    categoryIconsDir,
    CATEGORY_PLACEHOLDER_FILENAME
  );

  if (!fs.existsSync(placeholderFullPath)) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" role="img" aria-label="Category placeholder icon">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#38bdf8;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#22c1c3;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect x="6" y="6" width="52" height="52" rx="12" fill="#020617" stroke="url(#grad)" stroke-width="3"/>
  <circle cx="24" cy="27" r="6" fill="#38bdf8"/>
  <circle cx="40" cy="37" r="6" fill="#22c1c3"/>
  <path d="M20 42 Q24 46 32 46 Q40 46 44 42" fill="none" stroke="#64748b" stroke-width="2.5" stroke-linecap="round"/>
</svg>
`;
    fs.writeFileSync(placeholderFullPath, svg, "utf8");
  }
}

ensureUploadsSetup();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, categoryIconsDir);
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname
      .toLowerCase()
      .replace(/[^a-z0-9.-]+/g, "-")
      .replace(/-+/g, "-");
    const timestamp = Date.now();
    cb(null, `${timestamp}-${safeName || "icon.svg"}`);
  },
});

function svgFileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  if (file.mimetype === "image/svg+xml" || file.originalname.endsWith(".svg")) {
    cb(null, true);
  } else {
    cb(new Error("Only SVG files are allowed for category icons"));
  }
}

export const categoryIconUpload = multer({
  storage,
  fileFilter: svgFileFilter,
  limits: {
    fileSize: 64 * 1024, // 64 KB
  },
});

const modelImagesStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, modelImagesDir);
  },
  filename: (_req, file, cb) => {
    const ext = (file.originalname.match(/\.[a-z0-9]+$/i) || [".jpg"])[0].toLowerCase();
    const safeName = file.originalname
      .toLowerCase()
      .replace(/[^a-z0-9.-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/\.[a-z0-9]+$/i, "");
    const timestamp = Date.now();
    const id = Math.random().toString(36).slice(2, 10);
    cb(null, `${timestamp}-${id}-${safeName || "image"}${ext}`);
  },
});

function modelImageFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, WebP and GIF images are allowed"));
  }
}

export const modelImagesUpload = multer({
  storage: modelImagesStorage,
  fileFilter: modelImageFilter,
  limits: {
    fileSize: MAX_MODEL_IMAGE_BYTES, // 50 KB per file
  },
}).fields([
  { name: "image1", maxCount: 1 },
  { name: "image2", maxCount: 1 },
  { name: "image3", maxCount: 1 },
]);

