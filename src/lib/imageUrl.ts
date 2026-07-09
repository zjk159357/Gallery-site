export function sizedImageUrl(src: string, width: number, quality = 82) {
  if (!src.includes("cdn.sanity.io")) {
    return src;
  }

  try {
    const url = new URL(src);
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", String(quality));
    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "max");
    return url.toString();
  } catch {
    return src;
  }
}

export function imageSrcSet(src: string, widths: number[], quality = 82) {
  return widths.map((width) => `${sizedImageUrl(src, width, quality)} ${width}w`).join(", ");
}
