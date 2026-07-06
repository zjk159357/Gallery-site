import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");

function parseArgs(argv) {
  const args = {
    dryRun: false,
    skipImport: false,
    skipUpload: false,
    limit: undefined,
    force: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--dry-run") {
      args.dryRun = true;
    } else if (arg === "--skip-import") {
      args.skipImport = true;
    } else if (arg === "--skip-upload") {
      args.skipUpload = true;
    } else if (arg === "--force") {
      args.force = true;
    } else if (arg === "--limit") {
      const value = Number(argv[index + 1]);
      if (!Number.isInteger(value) || value < 1) {
        throw new Error("--limit must be a positive integer");
      }
      args.limit = value;
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

async function loadEnvFile(filename) {
  const filePath = path.join(projectRoot, filename);

  try {
    const content = await readFile(filePath, "utf8");

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
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

async function loadEnv() {
  await loadEnvFile(".env.local");
  await loadEnvFile(".env");
}

function getConfig() {
  const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? process.env.VITE_SANITY_PROJECT_ID;
  const dataset = process.env.SANITY_STUDIO_DATASET ?? process.env.VITE_SANITY_DATASET ?? "production";
  const token = process.env.SANITY_WRITE_TOKEN ?? process.env.SANITY_AUTH_TOKEN;

  return { projectId, dataset, token };
}

function isMissingProjectId(projectId) {
  return !projectId || projectId === "your_sanity_project_id" || projectId === "yourprojectid";
}

function quoteCommand(command, args) {
  return [command, ...args].join(" ");
}

function run(command, args, options = {}) {
  console.log(`\n> ${quoteCommand(command, args)}`);

  if (options.dryRun) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      env: {
        ...process.env,
        SANITY_AUTH_TOKEN: process.env.SANITY_AUTH_TOKEN ?? process.env.SANITY_WRITE_TOKEN ?? "",
      },
      shell: process.platform === "win32",
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
      }
    });
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  await loadEnv();

  const { projectId, dataset, token } = getConfig();
  const missingProjectId = isMissingProjectId(projectId);

  console.log("Sanity content sync");
  console.log(`Dataset: ${dataset}`);
  console.log(`Project ID: ${missingProjectId ? "not configured" : projectId}`);
  console.log(`Write token: ${token ? "configured" : "not configured"}`);

  await run("npm", ["run", "cms:seed"], { dryRun: args.dryRun });

  if (!args.dryRun && (!args.skipImport || !args.skipUpload)) {
    if (missingProjectId) {
      throw new Error("Missing SANITY_STUDIO_PROJECT_ID or VITE_SANITY_PROJECT_ID in .env.local");
    }
  }

  if (!args.dryRun && !args.skipUpload && !token) {
    throw new Error("Missing SANITY_WRITE_TOKEN or SANITY_AUTH_TOKEN in .env.local");
  }

  if (!args.skipImport) {
    await run(
      "npx",
      ["sanity", "dataset", "import", "sanity/seed/generated/all.ndjson", dataset, "--replace"],
      { dryRun: args.dryRun },
    );
  }

  if (!args.skipUpload) {
    const uploadArgs = ["run", "cms:upload-assets", "--"];
    if (args.limit) uploadArgs.push("--limit", String(args.limit));
    if (args.force) uploadArgs.push("--force");
    await run("npm", uploadArgs, { dryRun: args.dryRun });
  }

  await run("npm", ["run", "cms:status"], { dryRun: args.dryRun });

  console.log("\nSync workflow complete.");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
