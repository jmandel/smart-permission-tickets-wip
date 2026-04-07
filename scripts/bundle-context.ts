#!/usr/bin/env bun
// Bundle spec + reference-implementation source into a single
// Claude-friendly XML context stream using `files-to-prompt`.
//
// The bundle goes to stdout so the caller can redirect however they like:
//
//   bun run scripts/bundle-context.ts > /tmp/context.xml
//   bun run scripts/bundle-context.ts | pbcopy
//   bun run scripts/bundle-context.ts | wc -c
//   bun run scripts/bundle-context.ts | llm -s 'explain the design'
//
// Progress / stats are written to stderr so they don't pollute stdout.
//
// What this captures
//   - Spec prose:        input/pagecontent/*.md
//   - Logical model:     input/fsh/**/*.fsh
//   - Spec scripts:      scripts/*.ts
//   - Root README:       README.md
//   - SUSHI config:      sushi-config.yaml (canonical, version, FHIR version)
//   - Reference impl:    reference-implementation/** (ts, tsx, md)
//       - fhir-server/ (server + UI + tests)
//       - shared/      (canonical Zod ticket schema)
//       - plans/       (design docs)
//       - synth-data/  (prompts, scripts, steps — NOT the generated
//                       patient bundles, terminology db, or validator)
//
// What it deliberately excludes
//   - node_modules, dist                             (build/install noise)
//   - input/includes/generated, input/examples       (generated artifacts)
//   - fsh-generated                                  (SUSHI output)
//   - output, temp, template, input-cache            (IG publisher output)
//   - reference-implementation/synth-data/patients   (huge FHIR bundles)
//   - reference-implementation/synth-data/few-shots  (example inputs)
//   - terminology.sqlite*, validator.jar, logs       (large local files)
//   - ux/, ux-variant-*/, calls/, .seed-data/        (unrelated working dirs)
//
// Requires `files-to-prompt` on PATH (https://github.com/simonw/files-to-prompt).

import { spawn } from "node:child_process";

// Directories/filenames to drop. files-to-prompt matches these against
// basenames, so a single token like "patients" excludes every directory
// named patients anywhere in the tree.
const IGNORES = [
  // Build / install noise
  "node_modules",
  "dist",

  // Spec generated artifacts
  "fsh-generated",
  "generated", // input/includes/generated
  "examples",  // input/examples/signed-tickets
  "output",
  "temp",
  "template",
  "input-cache",

  // Reference-impl large / generated data
  "patients",
  "few-shots",
  "logs",
  "seed-data",
  ".seed-data",
  "terminology.sqlite*",

  // Unrelated working dirs at the spec root
  "ux",
  "ux-variant-*",
  "calls",
];

// Starting points. Each path is walked independently; its own .gitignore
// is respected. We list the spec roots explicitly (rather than walking
// the whole repo) because the outer .gitignore excludes
// reference-implementation/ as a nested repo on purpose.
const PATHS = [
  "input/pagecontent",
  "input/fsh",
  "scripts",
  "README.md",
  "sushi-config.yaml",
  "reference-implementation",
];

const EXTENSIONS = ["md", "fsh", "ts", "tsx", "yaml"];

const args: string[] = [];
for (const ext of EXTENSIONS) args.push("-e", ext);
for (const pat of IGNORES) args.push("--ignore", pat);
args.push("-c"); // Claude XML output
args.push(...PATHS);

console.error(`> files-to-prompt ${args.map(quoteIfNeeded).join(" ")}`);

const start = Date.now();
let bytesOut = 0;

const child = spawn("files-to-prompt", args, {
  // stdin closed, stdout piped so we can meter it, stderr inherited
  stdio: ["ignore", "pipe", "inherit"],
});

child.on("error", (err) => {
  console.error(`files-to-prompt failed to launch: ${err.message}`);
  console.error(
    "Install it with: uv tool install files-to-prompt  (or pipx install files-to-prompt)",
  );
  process.exit(127);
});

child.stdout.on("data", (chunk: Buffer) => {
  bytesOut += chunk.length;
  process.stdout.write(chunk);
});

child.on("exit", (code) => {
  if (code !== 0) {
    console.error(`files-to-prompt exited with code ${code}`);
    process.exit(code ?? 1);
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(2);
  const mb = (bytesOut / 1024 / 1024).toFixed(2);
  const approxTokens = Math.round(bytesOut / 4).toLocaleString();
  console.error(`wrote ${bytesOut.toLocaleString()} bytes (${mb} MB, ~${approxTokens} tokens) in ${elapsed}s`);
});

function quoteIfNeeded(s: string): string {
  return /[*?\s]/.test(s) ? `'${s}'` : s;
}
