"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUpload = getUpload;
exports.getModelImageUpload = getModelImageUpload;
const multer_1 = __importDefault(require("multer"));
const MAX_MODEL_IMAGE_BYTES = 50 * 1024; // 50KB
function getUpload(uploadsDir) {
    const storage = multer_1.default.diskStorage({
        destination: (_req, _file, cb) => cb(null, uploadsDir),
        filename: (_req, file, cb) => {
            const base = (file.originalname || "image").replace(/[^a-zA-Z0-9.-]/g, "_");
            cb(null, `${Date.now()}-${base}`);
        },
    });
    return (0, multer_1.default)({ storage });
}
/** Single image upload for model images: max 50KB, one file at a time */
function getModelImageUpload(uploadsDir) {
    const storage = multer_1.default.diskStorage({
        destination: (_req, _file, cb) => cb(null, uploadsDir),
        filename: (_req, file, cb) => {
            const base = (file.originalname || "image").replace(/[^a-zA-Z0-9.-]/g, "_");
            cb(null, `${Date.now()}-${base}`);
        },
    });
    return (0, multer_1.default)({
        storage,
        limits: { fileSize: MAX_MODEL_IMAGE_BYTES },
        fileFilter: (_req, file, cb) => {
            const ok = file.mimetype.startsWith("image/");
            cb(ok ? null : new Error("Only image files are allowed"), ok);
        },
    });
}
