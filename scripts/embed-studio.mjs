import { cpSync, existsSync, mkdirSync } from "node:fs";

const src = "dist";
const dst = "public/studio";

if (!existsSync(src + "/index.html")) {
  console.log("studio dist/ not found — skip");
  process.exit(0);
}

mkdirSync(dst, { recursive: true });
cpSync(src, dst, { recursive: true, force: true });

// Keep the Sanity Studio's absolute /static/... asset paths. The vercel.json
// rewrite maps /static/:path* -> /studio/static/:path* so they resolve
// correctly at any /studio/* sub-path (e.g. /studio/structure/homepage).

console.log("studio copied to public/studio/");
