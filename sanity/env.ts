import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();

function loadEnvFile(filename: string) {
  const filePath = path.join(projectRoot, filename);
  if (!existsSync(filePath)) return;

  const content = readFileSync(filePath, "utf8");

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separator = line.indexOf("=");
    if (separator === -1) continue;

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

export function loadSanityEnv() {
  loadEnvFile(".env.local");
  loadEnvFile(".env");
}
