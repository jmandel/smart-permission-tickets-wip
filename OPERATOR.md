# Operator Guide — Regenerating READMEs

The README files in this repository are **regenerated on demand** from prompt files that live next to each target README. The prompts describe *what each README should contain and where to source the facts*; they do not hardcode the facts themselves. Running the generator re-reads the current repo state and produces fresh, accurate READMEs.

Regenerate when:

- The spec or reference implementation has changed enough that an existing README has drifted (stale field names, renamed use cases, new subprojects, removed endpoints).
- You have added or removed a README prompt and want all downstream READMEs to know about it.
- You want to audit whether the current READMEs are actually grounded in the current code — regenerating and diffing is the fastest way to find out.

**The prompts are the contract.** If a README is wrong, the fix is almost always to correct the prompt and regenerate, not to hand-edit the README. Hand-edits will be lost the next time the generator runs.

## Prerequisites

- `bun` on PATH (the standard local runner for repository scripts, including `scripts/bundle-context.ts`).
- `files-to-prompt` on PATH (install with `uv tool install files-to-prompt` or `pipx install files-to-prompt`). The bundle script calls it.
- A Claude Code session or Agent SDK capable of launching Opus subagents with ~1M context. The context bundle is ~1.8 MB (~470k tokens); Opus 4.6 1M handles it comfortably, smaller context windows do not.

## The generator pattern

Each README to be regenerated has a sibling file named `README.prompt.md` that is the generation instruction for that README. A prompt file contains:

- Audience and target length
- Required sections (and explicitly disallowed content)
- A source-of-truth table mapping each claim type to the file in the repo that answers it
- Style rules (no emoji, no absolute paths, exact field names from current source)
- A pre-write verification checklist

To regenerate one README, an Opus subagent is given two inputs:

1. The **context bundle** — a single XML file containing every relevant source file in the repo (spec prose, FSH, scripts, reference implementation source, plans, **and every README file currently on disk**). Re-dumped once per tier so that tier N's subagent sees the READMEs written by tier N-1.
2. The **prompt file** for this README.

The subagent reads both, follows the prompt literally, runs the prompt's verification checklist, and writes the target README. It does not need to read anything else from disk — the context bundle is the single source of truth. If a parent README needs to link deep into a child README, the child README will already be in the bundle because the bundle was re-dumped after the child was written.

## Why depth-first, and why re-dump between tiers

READMEs are regenerated from the **deepest** subproject outward, because parent READMEs act as maps into their children:

- The top-level `README.md` links into `reference-implementation/README.md`.
- `reference-implementation/README.md` links into `reference-implementation/fhir-server/README.md` and `reference-implementation/synth-data/README.md` — often into specific anchor sections.
- Deep links only work if the target README's heading structure is current. So child READMEs must exist first.

If you regenerate top-down, parent READMEs link into stale or soon-to-change anchors and you get broken references on the next child regeneration.

**Re-dump the context bundle between tiers.** A subagent in tier N reads `/tmp/context.xml` and nothing else from the repo. If the bundle was captured before tier N-1 ran, the parent subagent will see the *old* child READMEs in the capture — it will link into stale anchors, match stale terminology, and possibly contradict the freshly-regenerated children. The fix is trivial: rerun `bun run scripts/bundle-context.ts > /tmp/context.xml` after every tier finishes, so the next tier's subagent sees a capture that includes the new child READMEs. The bundle script runs in ~0.3 seconds; this is not a bottleneck.

## Step 1 — Dump the initial context bundle

Run from the repo root:

```bash
bun run scripts/bundle-context.ts > /tmp/context.xml
```

This walks the spec sources (`input/pagecontent`, `input/fsh`, `scripts/`, root `README.md`) and the full `reference-implementation/` tree, filters out build output, generated artifacts, patient bundles, node_modules, and other noise, and emits a Claude-friendly XML document to stdout. The bundle includes every `README.md` and `README.prompt.md` currently on disk, so each regeneration tier sees the READMEs written by the previous tier as long as you re-dump between tiers (see Step 3).

The script prints a one-line status summary on stderr (`wrote N bytes (M MB, ~K tokens) in T seconds`). Verify the byte count looks plausible — roughly 1.5–2.5 MB is normal. A wildly different size (e.g., 20 MB) means the exclusion list is out of date and is sweeping in generated bloat; fix `scripts/bundle-context.ts` before proceeding.

## Step 2 — Identify the READMEs to regenerate

As of this writing, the prompt files are:

| Order | Prompt | Target README | Depends on |
|---|---|---|---|
| 1a | `reference-implementation/fhir-server/README.prompt.md` | `reference-implementation/fhir-server/README.md` | (none) |
| 1b | `reference-implementation/synth-data/README.prompt.md` | `reference-implementation/synth-data/README.md` | (none) |
| 2 | `reference-implementation/README.prompt.md` | `reference-implementation/README.md` | 1a, 1b |
| 3 | `README.prompt.md` | `README.md` (repo root) | 2 |

To discover the current set authoritatively, run:

```bash
find . -name 'README.prompt.md' -not -path './node_modules/*' -not -path './reference-implementation/node_modules/*'
```

and order the results by path depth, deepest first. Prompts at the same depth (step 1a and 1b above) have no dependency between them and can regenerate in parallel.

## Step 3 — Regenerate, deepest first

For each prompt in depth order, launch an Opus subagent with the task below. **Within a depth tier, you can launch the subagents in parallel.** Between depth tiers, you must wait — a tier N subagent reads the tier N+1 READMEs from disk.

### Subagent task template

Copy this into the subagent's prompt, substituting `<PROMPT_PATH>` and `<TARGET_PATH>`:

```
You are regenerating a single README file in the smart-permission-tickets repo.

Working directory: /home/jmandel/work/smart-permission-tickets

Inputs:

1. Context bundle: /tmp/context.xml
   Read this file in its entirety. It contains every relevant source file
   (spec prose, FSH, scripts, reference implementation source, plans) AND
   every README.md and README.prompt.md currently on disk, captured from the
   current repo state. You have Opus 1M context; it will fit. Do not skim or
   sample. Every factual claim in the README you produce must trace to a
   file you actually read in this bundle.

   The bundle is your ONLY source of truth. Do not read anything else from
   disk, including the target file. If the bundle does not contain the
   information you need, describe the shape qualitatively or omit the claim
   — do not invent it.

2. README prompt: <PROMPT_PATH>
   This is your generation instruction. Read it and follow it literally.
   It defines the audience, required sections, target length, source-of-truth
   mapping, style rules, and a pre-write verification checklist. Run the
   checklist before writing.

Because the bundle was re-dumped immediately before this task ran, any
sibling or descendant README that was regenerated earlier in this run is
present in the bundle at its final regenerated form. If your prompt instructs
you to link deep into a subproject README, locate that README in the bundle,
read its heading structure, and link only to anchors that exist there. Match
the terminology that README uses so the whole tree is internally consistent.

The existing README at the target path is also in the bundle, but do NOT
trust its facts — it may predate recent changes. If the prompt and the
existing README disagree on a fact, trust the source files in the bundle.

Output: write the regenerated README to <TARGET_PATH>, replacing the existing
file. Do not modify any other files. Do not include a "generated by" footer.
Do not commit.

Report back with: the number of lines written, any claims you deliberately
softened or omitted because you could not verify them, and any inconsistencies
you noticed between the prompt, the existing README, and the source.
```

### Order of invocations for the current prompt set

```
# Initial bundle
bun run scripts/bundle-context.ts > /tmp/context.xml

# Tier 1 (parallel):
opus-subagent  <PROMPT=reference-implementation/fhir-server/README.prompt.md>  <TARGET=reference-implementation/fhir-server/README.md>
opus-subagent  <PROMPT=reference-implementation/synth-data/README.prompt.md>   <TARGET=reference-implementation/synth-data/README.md>

# Wait for both.

# Re-dump so tier 2 sees the tier 1 READMEs
bun run scripts/bundle-context.ts > /tmp/context.xml

# Tier 2:
opus-subagent  <PROMPT=reference-implementation/README.prompt.md>  <TARGET=reference-implementation/README.md>

# Wait.

# Re-dump so tier 3 sees the tier 2 README
bun run scripts/bundle-context.ts > /tmp/context.xml

# Tier 3:
opus-subagent  <PROMPT=README.prompt.md>  <TARGET=README.md>
```

From within Claude Code, this corresponds to launching Task agents with `subagent_type: general-purpose` and `model: "opus"`. Launch tier 1's two agents in a single message to get them running concurrently. Re-dump the bundle in the foreground (not in a subagent) between tiers — the bundle script is a local shell command and should not be delegated.

## Step 4 — Review and commit

After all tiers finish, diff the regenerated READMEs against the previous versions. **`reference-implementation/` is a nested git repo**, and the outer repo's `.gitignore` excludes everything under it. A `git diff` from the repo root will only show the root `README.md` — the three subproject READMEs are invisible from the outer repo. Run two diffs:

```bash
# Outer repo: root README only
git diff README.md

# Nested repo: the three subproject READMEs
git -C reference-implementation status README.md fhir-server/README.md synth-data/README.md
git -C reference-implementation diff README.md fhir-server/README.md synth-data/README.md
```

Use `git -C <path>` (or `cd reference-implementation && git ...`) so you're operating against the nested repo's index, not the outer one. A subproject README that is brand new will show as untracked (`??`) in the nested repo and won't appear in `git diff` at all — use `git status` to catch those, and `wc -l` or read the file directly to verify it was written.

Things to look for in the diffs:

- **Stale facts gone.** Renamed fields, removed use cases, retired endpoints should be absent.
- **Terminology consistency.** A term used in a child README should match the same term in the parent README (e.g., if `fhir-server/README.md` says "mode surface", `reference-implementation/README.md` should say "mode surface" too).
- **Deep links resolve.** Any anchor link like `./fhir-server/README.md#mode-surfaces` should point at a heading that actually exists in the target file now.
- **No invented content.** If a subagent reports "I deliberately softened X because I couldn't verify it", that softened text should be in the output — not replaced with a hallucinated version.
- **No absolute filesystem paths.** No `/home/...` anywhere. Subagents have been told not to produce them, but verify.
- **No emoji, no "generated by" footers.**

If anything is wrong, the fix order is:

1. If the wrong content came from the prompt, edit the prompt and regenerate that tier (and everything above it).
2. If the wrong content came from stale source in the repo, fix the source and regenerate.
3. If the wrong content came from the subagent misinterpreting the prompt, tighten the prompt's wording and regenerate.

Only hand-edit a README as an absolute last resort, and if you do, update the prompt immediately so the next regeneration reproduces the fix.

## Adding a new README prompt

When you add a new subproject that should have its own README:

1. Create `README.prompt.md` in the subproject's directory. Copy the structure of an existing prompt — audience, required sections, source-of-truth mapping, verification checklist. Lean on design/intent content (diagrams, mental models) rather than just mechanics.
2. Update the **order table** in step 2 above so operators know where the new prompt sits in the dependency tree.
3. If the new subproject should be linked from a parent README, update the parent prompt to mention it under "Where to gather fresh content" and to require a link to it in the parent README's subprojects section.
4. Run the generator end to end to produce the new README and propagate the new link into parents.

## Invariants the generator must preserve

Every regeneration run must produce READMEs that:

- Contain no `/home/...` or other absolute filesystem paths.
- Use repo-relative paths for all intra-repo links.
- Use exact field names and identifiers from the current source (no legacy names like `cnf.jkt`, `client_binding.key`, `access.scopes`, `context.kind`).
- Link deep into subproject READMEs where appropriate, and only to anchors that exist in those READMEs right now.
- Match their prompt's target length (within reason) and required section list.
- Contain no emoji.
- Contain no "generated by" footers or tool attributions.

If a regenerated README violates any of these, the prompt or the generator script needs a fix, not the README.

## Troubleshooting

**The context bundle is way bigger than usual.** Something new is bypassing the exclusion list in `scripts/bundle-context.ts`. Check `git status` for new large directories, extend the `IGNORES` list, and rerun.

**The subagent times out or runs out of context.** The default Agent tool invocation should use `model: "opus"` to get the 1M window. If you forgot that, the bundle will overflow a smaller model.

**A regenerated README hallucinates a field name or endpoint.** The prompt's source-of-truth table is incomplete for that claim type. Add a specific row mapping that claim to its source file and regenerate. Do not add the fact directly to the prompt — prompts should tell the generator *where to look*, not *what to write*.

**A deep link in the top-level README points at a stale anchor.** You probably regenerated the parent before the child. Rerun in depth order.

**The same README keeps regenerating with the same wrong content.** The source of truth itself is stale. Fix the source (e.g., update the server code, rename a field consistently, update the plans) and then regenerate.
