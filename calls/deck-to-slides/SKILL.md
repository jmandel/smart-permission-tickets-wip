---
name: deck-to-slides
description: Generate presentation slide images from a markdown deck file using AI image generation (Gemini via OpenRouter). Use this skill when the user wants to turn a markdown deck, slide outline, or presentation brief into actual slide images, or when they mention generating slides, creating a slide deck from text, or image generation for presentations. Also use when the user references OpenRouter, Gemini image generation, or wants to create visual slides from written content.
---

# Deck-to-Slides: AI Image Generation for Presentation Decks

Turn a markdown deck file into a set of AI-generated presentation slide images using Google's Gemini image model via OpenRouter.

## Output Layout

Unless the user specifies otherwise, all outputs go **side-by-side with the input deck file**. For a deck at `project/deck.md`, the result looks like:

```
project/
  deck.md          ← input
  deck.pptx        ← PowerPoint export
  deck.html        ← HTML presentation export
  slides/          ← individual slide images
    slide-1.png
    slide-2.jpg
    ...
```

Intermediate/working files (prompts, bootstrap variants, exemplar) use a temp directory and are cleaned up after export, unless the user wants to keep them.

## Setup

Before first use, install script dependencies:

```bash
cd <skill-path>/scripts && bun install
```

The scripts need `OPENROUTER_API_KEY` available — checked in this order:
1. Environment variable (e.g., set in Claude Code settings via `~/.claude/settings.json` `"env"` block)
2. `.env` file in the working directory

If the key isn't found in either place, ask the user for their OpenRouter API key and create a `.env` file.

## How It Works

Four phases: **Parse**, **Bootstrap**, **Generate**, **Export**. All scripts take explicit input/output paths.

### Phase 1: Parse the Deck (Claude does this)

Read the user's deck markdown file and write two things into a working `prompts/` directory:

1. **`prompts/brief.md`** — artistic brief / visual system applying to ALL slides (colors with hex values, typography, layout rules, what NOT to do, recurring elements like footers and quote cards)
2. **`prompts/slide-N.md`** — one file per slide, self-contained image generation prompt

### Phase 2: Bootstrap (3 variants, pick best)

```bash
bun run <skill-path>/scripts/bootstrap.ts <slide-number> <prompts-dir> <out-dir>
```

Example — bootstrap slide 1, writing variants next to the deck:
```bash
bun run <skill-path>/scripts/bootstrap.ts 1 ./prompts ./bootstrap
```

Show all 3 variants to the user. They pick the best. Then:

```bash
bun run <skill-path>/scripts/select.ts ./bootstrap/variant-2.png ./exemplar.png
```

### Phase 3: Generate All Slides

```bash
bun run <skill-path>/scripts/generate.ts <prompts-dir> <slides-out-dir> [exemplar-path] [slide-numbers...]
```

Examples:
```bash
# All slides, with one-shot exemplar, output beside the deck
bun run <skill-path>/scripts/generate.ts ./prompts ./slides ./exemplar.png

# Just slides 3 and 5
bun run <skill-path>/scripts/generate.ts ./prompts ./slides ./exemplar.png 3 5

# Without exemplar (zero-shot)
bun run <skill-path>/scripts/generate.ts ./prompts ./slides
```

### Phase 4: Export

```bash
bun run <skill-path>/scripts/export-pptx.ts <slides-dir> <out.pptx>
bun run <skill-path>/scripts/export-html.ts <slides-dir> <out.html>
```

Example:
```bash
bun run <skill-path>/scripts/export-pptx.ts ./slides ./deck.pptx
bun run <skill-path>/scripts/export-html.ts ./slides ./deck.html
```

Then clean up working files:
```bash
rm -rf ./prompts ./bootstrap ./exemplar.png
```

## Writing Good Briefs

The artistic brief is the most important input. A good brief:

- **States the aesthetic in concrete terms** — name reference artists, publications, or design styles
- **Specifies exact colors** with hex values and strict role assignments
- **Defines typography modes** — what font style for titles vs body vs accents
- **Describes what it is NOT** — explicitly forbid common AI failure modes (wobbly lines, fake textures, clip art, corporate gradients)
- **Limits decorative elements** — specify a percentage of visual surface area (e.g., "~15%, not 80%")
- **Defines recurring elements** — footer format, quote card format, any branded objects

## Writing Good Slide Prompts

Each slide prompt should:

- Start with the slide title and a one-sentence role description
- Specify layout zones (e.g., "left 55%, right 40%")
- List all text content verbatim — the model renders exactly what you write
- Describe accent elements specifically for this slide
- End with "key notes" about what matters most visually

## Troubleshooting

- **"No image found in response"** — The model returned text-only. Try shortening the slide prompt.
- **Inconsistent style** — Re-bootstrap and pick a stronger exemplar.
- **Wrong aspect ratio** — Scripts default to 16:9. Edit `api.ts` to change `aspect_ratio`.
