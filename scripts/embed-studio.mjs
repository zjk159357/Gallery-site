import { cpSync, existsSync, mkdirSync } from "node:fs";

const src = "dist";
const dst = "public/studio";

if (!existsSync(src + "/index.html")) {
  console.log("studio dist/ not found — skip");
  process.exit(0);
}

mkdirSync(dst, { recursive: true });
cpSync(src, dst, { recursive: true, force: true });
console.log("studio copied to public/studio/");
