"use client";

import { createBrowser } from "./supabase/browser";

export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const MAX_IMAGE_EDGE = 2000;

export type Uploaded = {
  path: string;
  url: string;
  kind: "image" | "video";
  width: number | null;
  height: number | null;
};

/** Thu nhỏ ảnh về cạnh dài tối đa 2000px và chuyển sang WebP ngay trên trình duyệt. */
async function compressImage(file: File): Promise<{ blob: Blob; ext: string; width: number; height: number }> {
  if (file.type === "image/gif") {
    const bmp = await createImageBitmap(file);
    return { blob: file, ext: "gif", width: bmp.width, height: bmp.height };
  }
  const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bmp.width, bmp.height));
  const width = Math.round(bmp.width * scale);
  const height = Math.round(bmp.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, width, height);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Không nén được ảnh"))), "image/webp", 0.84),
  );
  return { blob, ext: "webp", width, height };
}

function videoSize(file: File): Promise<{ width: number | null; height: number | null }> {
  return new Promise((resolve) => {
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => {
      resolve({ width: v.videoWidth || null, height: v.videoHeight || null });
      URL.revokeObjectURL(v.src);
    };
    v.onerror = () => resolve({ width: null, height: null });
    v.src = URL.createObjectURL(file);
  });
}

function newPath(ext: string) {
  const d = new Date();
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${crypto.randomUUID()}.${ext}`;
}

export function publicUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path}`;
}

export function pathFromUrl(url: string) {
  const prefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/`;
  return url.startsWith(prefix) ? url.slice(prefix.length) : null;
}

export async function uploadMedia(file: File): Promise<Uploaded> {
  const supabase = createBrowser();

  if (file.type.startsWith("image/")) {
    const { blob, ext, width, height } = await compressImage(file);
    const path = newPath(ext);
    const { error } = await supabase.storage
      .from("media")
      .upload(path, blob, { contentType: ext === "gif" ? "image/gif" : "image/webp", cacheControl: "31536000" });
    if (error) throw new Error(error.message);
    return { path, url: publicUrl(path), kind: "image", width, height };
  }

  if (file.type.startsWith("video/")) {
    if (file.size > MAX_VIDEO_BYTES) {
      throw new Error(
        `Video “${file.name}” nặng ${(file.size / 1024 / 1024).toFixed(0)} MB, vượt giới hạn 50 MB. Hãy cắt ngắn, hoặc tải lên YouTube rồi dán link.`,
      );
    }
    const { width, height } = await videoSize(file);
    const ext = (file.name.split(".").pop() || "mp4").toLowerCase();
    const path = newPath(ext);
    const { error } = await supabase.storage
      .from("media")
      .upload(path, file, { contentType: file.type, cacheControl: "31536000" });
    if (error) throw new Error(error.message);
    return { path, url: publicUrl(path), kind: "video", width, height };
  }

  throw new Error(`Không hỗ trợ tệp “${file.name}”.`);
}
