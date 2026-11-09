import "server-only";
import sanitizeHtml from "sanitize-html";

const storageHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).host;
  } catch {
    return "";
  }
})();

function isOwnMedia(src: string | undefined) {
  if (!src) return false;
  try {
    const u = new URL(src);
    return u.protocol === "https:" && u.host === storageHost;
  } catch {
    return false;
  }
}

/** Làm sạch HTML bài viết trước khi hiển thị. Ảnh/video chỉ được lấy từ Storage của dự án. */
export function cleanEntryHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "h2", "h3", "strong", "em", "s", "u", "a", "ul", "ol", "li",
      "blockquote", "code", "pre", "hr", "img", "video", "div", "iframe",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading"],
      video: ["src", "controls", "playsinline", "preload", "poster"],
      div: ["data-youtube-video"],
      iframe: ["src", "allowfullscreen", "allow", "loading", "title"],
    },
    allowedSchemes: ["https", "mailto"],
    allowedIframeHostnames: ["www.youtube-nocookie.com", "www.youtube.com"],
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, target: "_blank", rel: "noopener noreferrer nofollow" },
      }),
      img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: "lazy" } }),
      video: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, controls: "", playsinline: "", preload: "metadata" },
      }),
      iframe: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, loading: "lazy", title: "Video YouTube" },
      }),
    },
    exclusiveFilter: (frame) =>
      (frame.tag === "img" || frame.tag === "video") && !isOwnMedia(frame.attribs.src),
  });
}
