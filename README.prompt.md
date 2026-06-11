# README Generation Prompt — SMART Permission Tickets (Spec Project)

You are regenerating `README.md` for this repository. It is a **FHIR Implementation Guide** that defines the SMART Permission Tickets specification. Produce a README that is accurate *as of the current state of the repo*. Don't trust the old README — it drifts. For concrete claims, prefer (in order): a file in the bundle, the "Known facts" section in this prompt, or qualitative description if neither is available. Don't invent specifics.

## Audience

Two kinds of readers land here:

1. **Implementers and spec reviewers** who want to understand what SMART Permission Tickets are and how to read / build the specification.
2. **Returning maintainers** (often with AI agents) who need to rebuild, regenerate artifacts, or find the right entry point to make changes.

Write for both, but lead with the first. A reader who has never seen this project before should, in under a minute, understand *what problem this solves*, *how the solution is shaped*, and *where the normative text lives*.

## What makes a great README for this project

A great README for a spec project is **mostly about conveying the mental model**, not the mechanics. Someone who reads this once should walk away with a correct intuition about *what a Permission Ticket is*, *why it is shaped the way it is*, and *what it is deliberately not*. The build commands are a small tail at the bottom; the weight should sit in the design explanation.

- **Opens with the one-sentence pitch.** What is a Permission Ticket, who signs it, and what does presenting it get you. No FHIR jargon in the first sentence.
- **Shows the actor flow visually.** Include at least one ASCII diagram showing the three-party exchange (Trusted Issuer -> Client -> Data Holder -> FHIR). A second diagram showing the JWT structure (security envelope, subject, access constraints, profile claims, and optional binding) is welcome if it earns its space. Diagrams are high-information-density and worth the lines they take.
- **Explains the mental model, not just the fields.** What kind of authorization object is a Permission Ticket — is it a capability, a claim, a grant, a delegation? How is it different from a SMART access token, from a UMA ticket, from a bearer assertion? A reader from a vanilla SMART-on-FHIR background should finish this section understanding what changed and why.
- **Names the load-bearing design choices**, not every design choice. Think: the 3–5 things that would surprise someone coming from a vanilla SMART-on-FHIR background. For each, state the decision *and* the reason. Examples of the kind of decision that earns a bullet: why token exchange instead of a custom redemption endpoint, why a portable kernel vs. per-holder vocabularies, why presenter binding is optional, how access constraints fail closed, what was deliberately left out (e.g., no regrant, no authority chain).
- **Explains the boundary between limits and facts.** This is the single most important architectural idea in the spec. Readers must understand that limits live in `access` as enforce-or-reject constraints, while ticket-type facts live as top-level profile claims the Data Holder uses for policy selection and audit.
- **Points at the normative document** (the spec prose) and the machine-readable sources of truth (logical model, JSON Schema, examples) so readers know what is authoritative vs. derived.
- **Gives a build recipe that works from a clean clone.** Every command should be runnable as-is. Prefer `npm`/`bun`/`sushi`/`./_genonce.sh` invocations that already exist in the repo over invented ones.
- **States the status honestly** (draft, ballot, published, etc.) and links to the published IG if one exists.
- **Stays focused.** Target ~140–200 lines. Most of those lines should be design explanation and diagrams, not build commands. Anything longer belongs in the spec itself or in a subdirectory doc.

## Required sections

Include these, in roughly this order. Omit a section only if it genuinely does not apply.

1. **Title + one-sentence pitch.**
2. **What is a Permission Ticket** — 2–4 sentences. Include a small flow diagram.
3. **Key design points** — 4–6 bullets. Each bullet should be a decision, not a feature list. Examples of what qualifies: the transport binding (e.g., token exchange vs. custom endpoint), how presenter binding works, how ticket types are discovered, and why unknown access constraints fail closed.
4. **Repository structure** — a small tree of the directories a reader needs to know about (`input/pagecontent`, `input/fsh`, `input/examples`, `input/includes/generated`, `scripts/`, top-level IG config files). Annotate each line with one-phrase purpose. Do not enumerate every file.
5. **Building the IG** — prerequisites, install, generate derived artifacts, run the IG Publisher. Each command should be copy-pasteable.
6. **Where the spec lives** — explicit pointers to the spec prose file and to the ticket logical model file.
7. **Status** — one line, current.

Optional sections (include only if clearly useful):

- **Related repositories** (reference implementation, etc.)
- **Contributing / feedback** (only if the repo actually documents a process)

Do **not** include: use-case tables, field-by-field schema descriptions, change logs, roadmaps, or speculative future work. That content belongs in the spec or in plans/.

## Where to gather fresh content

Read these directly — don't copy from the old README, which drifts. Concrete claims should trace back to one of these sources or to the "Known facts" section above.

| Claim type | Source of truth |
|---|---|
| What a Permission Ticket *is* and the flow | `input/pagecontent/index.md` (opening sections: Introduction, Scope, Protocol Overview) |
| Ticket JWT field shape, required claims | `scripts/permission-ticket-schema.ts`, `scripts/permission-ticket-types.ts`, and `input/includes/generated/json-schema/permission-ticket.schema.json` |
| Ticket types currently defined | `scripts/use_case_catalog.ts` — this file is the canonical list of use case identifiers and labels |
| How binding / presenter binding works | Search `input/pagecontent/index.md` for `presenter_binding` |
| How the transport works (token exchange vs. other) | Search `input/pagecontent/index.md` for `RFC 8693` or `token_exchange` |
| Build pipeline commands | `package.json` (root), `scripts/package.json`, `_genonce.sh`, `_updatePublisher.sh`, `sushi-config.yaml`, `ig.ini` |
| Directory layout | `ls` of the repo root, plus `ls input/` and `ls scripts/` |
| Status (draft / ballot / published) | Top matter of `input/pagecontent/index.md` and `sushi-config.yaml` (`status:` field) |
| Published IG URL, if any | `sushi-config.yaml` (`canonical:` field) and `.github/workflows/` if CI publishes |

When counts, names, or identifiers matter (e.g., "seven use-case ticket types"), get the count by reading the source of truth, not by trusting prior prose.

## Style rules

- American English, present tense, second person sparingly.
- No emoji.
- Code fences must specify a language.
- Links to files in this repo use repo-relative paths (no absolute filesystem paths, no `blob/main/...` URLs).
- Avoid hedging phrases ("you can", "you may want to"); prefer direct statements.
- Don't fabricate CLI flags, file paths, or filenames. If you can't confirm a specific path or flag from a source file or the "Known facts" section below, describe the shape qualitatively rather than guessing a literal value.
- URLs should come from one of: a file in the bundle, the "Known facts" section below, or a stable RFC reference already cited in the spec prose.

## Known facts (authoritative even if not in the bundle)

Some facts about this project don't live in any single source file in the bundle (or live in files the bundle script doesn't capture). Treat the following as authoritative — you can quote them directly without further verification:

- **Continuous-build IG preview**: `https://build.fhir.org/ig/jmandel/smart-permission-tickets-wip/` is where the in-progress build of this IG is published. It's the right link for "see the rendered draft."
- **Build pipeline shape**: the local end-to-end build is `bun install` (root) → `(cd scripts && bun install)` → `./_genonce.sh`. `_genonce.sh` runs `(cd scripts && bun run sync-spec-snippets)` (regenerates JSON snippets in the prose from the canonical TypeScript schema), then `(cd scripts && bun run generate)` (refreshes the signed example tickets and published includes), then `sushi .`, then `./_updatePublisher.sh` (fetches/refreshes the FHIR IG Publisher jar into `input-cache/`), then `java -jar input-cache/publisher.jar -ig .`.
- **CI / publishing**: `.github/workflows/build-and-deploy.yml` builds the IG on every push to `main` and publishes it to GitHub Pages. The workflow needs Java 17, Node 20, Ruby 3.3 + `jekyll` (for the IG template), `fsh-sushi`, and the FHIR IG Publisher jar.
- **Status**: draft (pre-ballot). The `sushi-config.yaml` `status:` field is the canonical source for this and should always agree.

If any of these facts conflict with what you find in the bundle, trust the bundle and flag the conflict in your report — the "Known facts" list may have drifted.

## Verification checklist before writing

Before producing the final README, run these checks. If a claim can't be verified against either a source file or the "Known facts" section, revise it (soften it, describe the shape, or drop it) rather than keeping an unverified specific.

- [ ] The one-sentence pitch matches the Introduction / Scope in `input/pagecontent/index.md`.
- [ ] Every directory named in the repository-structure section actually exists in the bundle.
- [ ] The count of ticket types (if mentioned) matches `scripts/use_case_catalog.ts`.
- [ ] Presenter binding / transport claims match current spec prose, not the old README.
- [ ] Build commands match either the bundle, a script the bundle references, or the "Known facts" build pipeline shape.
- [ ] Any linked file path resolves to an actual file in the bundle.
- [ ] URLs are either from the bundle, the "Known facts" section, or stable RFC references already cited in the spec.

## Output

Write the README to `README.md` at the repo root, replacing the existing file. Do not write anything else. Do not include a "generated by" footer.
