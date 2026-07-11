import { readFile } from "node:fs/promises";
import path from "node:path";
import { ProxyAgent, setGlobalDispatcher } from "undici";

const projectRoot = path.resolve(import.meta.dirname, "..");

async function loadEnvFile(filename) {
  try {
    const content = await readFile(path.join(projectRoot, filename), "utf8");
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const sep = line.indexOf("=");
      if (sep === -1) continue;
      const key = line.slice(0, sep).trim();
      let value = line.slice(sep + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (key && process.env[key] === undefined) process.env[key] = value;
    }
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
}

await loadEnvFile(".env.local");
await loadEnvFile(".env");

const proxyUrl = process.env.HTTPS_PROXY ?? process.env.HTTP_PROXY ?? "http://127.0.0.1:7897";
setGlobalDispatcher(new ProxyAgent({ uri: proxyUrl, requestTls: { rejectUnauthorized: true } }));


const PROJECT = process.env.SANITY_STUDIO_PROJECT_ID;
const DATASET = process.env.SANITY_STUDIO_DATASET ?? "production";
const TOKEN = process.env.SANITY_WRITE_TOKEN;
const API = "2025-02-19";
const BASE = `https://${PROJECT}.api.sanity.io/v${API}/data`;

function parseArgs(argv) {
  const args = { dryRun: false, batch: 25 };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--dry-run") args.dryRun = true;
    else if (a === "--batch") {
      const v = Number(argv[i + 1]);
      if (!Number.isInteger(v) || v < 1) throw new Error("--batch must be positive integer");
      args.batch = v;
      i += 1;
    } else throw new Error(`Unknown argument: ${a}`);
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));

async function san(method, pathname, body) {
  const url = `${BASE}${pathname}`;
  for (let i = 0; i < 4; i += 1) {
    try {
      const init = {
        method,
        headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
        signal: AbortSignal.timeout(30000),
      };
      if (body) init.body = JSON.stringify(body);
      const r = await fetch(url, init);
      if (!r.ok) {
        const t = await r.text();
        throw new Error(`${r.status} ${r.statusText}: ${t.slice(0, 200)}`);
      }
      return await r.json();
    } catch (e) {
      if (i === 3) throw e;
      await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
    }
  }
}

async function listNeedingBackfill() {
  const all = [];
  let skip = 0;
  while (true) {
    const q = encodeURIComponent(
      `*[_type == "photo" && defined(image.asset) && (!defined(dimensions.width) || dimensions.width == null)]{ _id, sourceFilename, "assetId": image.asset->_id, "assetDims": image.asset->metadata.dimensions }`,
    );
    const data = await san("GET", `/query/${DATASET}?query=${q}&%24skip=${skip}&%24pageSize=200`);
    all.push(...data.result);
    if (data.result.length < 200) break;
    skip += 200;
  }
  return all;
}

console.log("Querying photos with null dimensions + an image asset...");
const photos = await listNeedingBackfill();
console.log(`Found ${photos.length} photos needing dimensions.`);

const mutations = [];
const skipped = [];
for (const p of photos) {
  const w = p.assetDims?.width ?? null;
  const h = p.assetDims?.height ?? null;
  if (typeof w !== "number" || typeof h !== "number") {
    skipped.push({ id: p._id, sourceFilename: p.sourceFilename, reason: "asset has no metadata.dimensions" });
    continue;
  }
  mutations.push({
    patch: {
      id: p._id,
      set: { dimensions: { _type: "object", width: w, height: h } },
    },
  });
}

console.log(`To patch: ${mutations.length}, Skipped: ${skipped.length}`);
if (skipped.length) {
  console.log("Skipped samples:");
  for (const s of skipped.slice(0, 5)) console.log("  ", s);
}

if (mutations.length === 0) {
  console.log("Nothing to do.");
  process.exit(0);
}

if (args.dryRun) {
  console.log("Dry run only. Sample mutations:");
  for (const m of mutations.slice(0, 5)) console.log("  ", JSON.stringify(m));
  process.exit(0);
}

let ok = 0;
let failed = 0;
for (let i = 0; i < mutations.length; i += args.batch) {
  const chunk = mutations.slice(i, i + args.batch);
  try {
    const r = await san("POST", `/mutate/${DATASET}`, { mutations: chunk });
    const oks = r.results?.filter((x) => !x.error).length ?? chunk.length;
    ok += oks;
    failed += chunk.length - oks;
    console.log(`  batch ${Math.floor(i / args.batch) + 1}/${Math.ceil(mutations.length / args.batch)} -> ${oks} ok`);
  } catch (e) {
    failed += chunk.length;
    console.error(`  batch ${Math.floor(i / args.batch) + 1} FAILED: ${e.message ?? e}`);
  }
}

console.log(`Done. ok=${ok} failed=${failed}`);
