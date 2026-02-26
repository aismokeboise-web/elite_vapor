import multer from "multer";

const MAX_MODEL_IMAGE_BYTES = 50 * 1024; // 50KB

export function getUpload(uploadsDir: string): multer.Multer {
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const base = (file.originalname || "image").replace(/[^a-zA-Z0-9.-]/g, "_");
      cb(null, `${Date.now()}-${base}`);
    },
  });
  return multer({ storage });
}

/** Single image upload for model images: max 50KB, one file at a time */
export function getModelImageUpload(uploadsDir: string): multer.Multer {
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const base = (file.originalname || "image").replace(/[^a-zA-Z0-9.-]/g, "_");
      cb(null, `${Date.now()}-${base}`);
    },
  });
  return multer({
    storage,
    limits: { fileSize: MAX_MODEL_IMAGE_BYTES },
    fileFilter: (_req, file, cb) => {
      const ok = file.mimetype.startsWith("image/");
      cb(ok ? null : new Error("Only image files are allowed"), ok);
    },
  });
}
