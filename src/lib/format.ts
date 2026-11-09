const WEEKDAYS = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

/** Tách "YYYY-MM-DD" mà không đổi múi giờ. */
function parts(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return { y, m, d };
}

/** 09/11/2026 */
export function formatDate(iso: string | null | undefined) {
  if (!iso) return "";
  const { y, m, d } = parts(iso);
  return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
}

/** Thứ Hai */
export function weekday(iso: string) {
  const { y, m, d } = parts(iso);
  return WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

/** Thứ Hai, 09/11/2026 */
export function formatLongDate(iso: string) {
  return `${weekday(iso)}, ${formatDate(iso)}`;
}

/** "Tháng 11 · 2026" */
export function monthLabel(iso: string) {
  const { y, m } = parts(iso);
  return `Tháng ${m} · ${y}`;
}

export function monthKey(iso: string) {
  return iso.slice(0, 7);
}

/** Hôm nay theo giờ Việt Nam, dạng YYYY-MM-DD */
export function todayVN() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" }).format(new Date());
}

export function phaseRange(start: string | null, end: string | null) {
  const a = start ? formatDate(start) : "…";
  const b = end ? formatDate(end) : "nay";
  return `${a} → ${b}`;
}

/** "Cá mới về bể!" -> "ca-moi-ve-be" */
export function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function mediaUrl(path: string | null | undefined) {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path}`;
}

export const TAGS = [
  { value: "cho-an", label: "Cho ăn", color: "var(--sun)" },
  { value: "thay-nuoc", label: "Thay nước", color: "var(--sky)" },
  { value: "ca-moi", label: "Cá mới", color: "var(--grass)" },
  { value: "su-co", label: "Sự cố", color: "var(--tomato)" },
  { value: "trang-tri", label: "Trang trí bể", color: "#b98ad6" },
  { value: "ghi-chep", label: "Ghi chép", color: "var(--paper-2)" },
] as const;

export function tagMeta(value: string) {
  return TAGS.find((t) => t.value === value) ?? { value, label: value, color: "var(--paper-2)" };
}
