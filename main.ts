// FridayList entrypoint (Node 22, standard library only).
//
// The site is plain static files under app/, with its screenshots beside it.
// This program hands the site in: it copies app/ and screenshots/ into the
// output directory and writes /output/dossier.json, the summary the judge
// reads, using the vendored make.fun dossier library. It writes the same
// bytes on every run: no timestamps, no random values, files in sorted order.

import { copyFileSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const root = fileURLToPath(new URL(".", import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// Copy one directory tree, files in sorted order, skipping nothing.
function copyTree(from, to) {
  mkdirSync(to, { recursive: true });
  for (const name of readdirSync(from).sort()) {
    const src = join(from, name);
    const dst = join(to, name);
    if (statSync(src).isDirectory()) copyTree(src, dst);
    else copyFileSync(src, dst);
  }
}

mkdirSync(outDir, { recursive: true });
copyTree(join(root, "app"), join(outDir, "app"));
copyTree(join(root, "screenshots"), join(outDir, "screenshots"));

const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
writeFileSync(join(outDir, "dossier.json"), dossier);
