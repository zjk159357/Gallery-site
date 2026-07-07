import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const src = "dist";
const dst = "public/studio";

if (!existsSync(src + "/index.html")) {
  console.log("studio dist/ not found — skip");
  process.exit(0);
}

mkdirSync(dst, { recursive: true });
cpSync(src, dst, { recursive: true, force: true });

// Fix absolute paths in the studio HTML so it works from /studio/ subdirectory.
// The Sanity Studio build outputs <script src="/static/..."> but we need
// <script src="./static/..."> so the browser resolves relative to /studio/.
const indexPath = join(dst, "index.html");
const html = readFileSync(indexPath, "utf8");
const patched = html
  .replace(/(src|href)="\/static\//g, '$1="./static/')
  .replace(/(src|href)="\/favicon/g, '$1="./favicon');
writeFileSync(indexPath, patched, "utf8");
console.log(`patched ${indexPath}: /static/ -> ./static/`);

console.log("studio copied to public/studio/");
