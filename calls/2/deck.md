# SMART Permission Tickets — Image Generation Prompts
## Argonaut Working Group Slide Deck (7 Slides)

---

## Visual System — READ FIRST

### Aesthetic Direction: "Designer's Working Wall"

Think: A brilliant information designer's studio wall — typeset content pinned up alongside hand-drawn diagrams, with a few confident pen marks connecting ideas. The polish of a Pentagram strategy deck, but with the warmth and energy of someone who thinks with a pen in their hand. Like the best pages from a Giorgia Lupi data visualization book, or the sketchbooks of an architect who draws beautifully.

The key distinction: **hand-drawn elements are decorative accents and structural marks, not the primary content delivery.** All text that needs to be read is typeset. The hand-drawn layer adds personality, warmth, and visual energy — arrows, underlines, circles, small marginal sketches, bracket marks — but never carries critical information that would be lost if the marks were removed.

**Reference touchstones:**
- Giorgia Lupi / Stefanie Posavec ("Dear Data" visual style — precise hand-drawn marks with real information structure)
- Architectural presentation boards where clean type sits alongside confident pen drawings
- The visual essays in Works That Work magazine
- A senior designer's annotated printout — clean layout with a few purposeful marks added by hand

**What this is NOT:**
- Not the AI "sketch filter" look — no wobbly uncertain lines, no fake pencil texture, no graph paper
- Not a whiteboard photo — no dry-erase marker aesthetic, no smudgy casual feel
- Not corporate PowerPoint — no gradients, shadows, stock images
- Not cluttered — the hand-drawn marks are sparse and intentional, like 15% of the visual surface area, not 80%

### Background

Off-white (#FAF9F6) — very slightly warm, like good paper. NOT pure white (too clinical) and NOT cream/yellow (too nostalgic). No texture overlay, no grid, no pattern. Just a flat, warm white.

### Typography — Three Modes

1. **Display / Titles:** A warm, characterful serif — Freight Display, Tiempos Headline, Canela, or Noe Display. Large. Bold or semibold. Near-black (#1A1A1A). Used for slide titles only.

2. **Body / Labels / Attributions:** A clean geometric sans-serif — Söhne, Founders Grotesk, GT America, or Neue Haas Grotesk. Various weights (light for attributions, regular for body, medium for labels). NOT Inter, NOT Roboto, NOT system fonts.

3. **Hand-lettered accents:** Confident, clean, upright hand-printing — like an architect's or engineer's lettering. NOT a script. NOT cursive. NOT wobbly. Think: the kind of precise hand-printing you see on a well-made blueprint label or a museum exhibit caption written by the designer. Used SELECTIVELY for:
   - Short emphasis phrases (2-5 words)
   - Callout annotations in margins
   - The "so what" summary line on each slide
   - Small labels on hand-drawn diagram elements

   This hand-lettering is always legible, always confident, always sparse. If more than ~20% of the text on a slide is hand-lettered, there's too much.

   **Tone:** Hand-lettered annotations should feel like quiet margin notes from a thoughtful researcher — not taglines or sound bites. They observe, they don't announce. "strongest signal" not "STRONGEST SIGNAL →". Think pencil-in-the-margin, not movie poster.

### Color Palette — 5 colors, strict roles

| Color | Hex | Role | Where it appears |
|-------|-----|------|-----------------|
| Near-black | #1A1A1A | Primary text, titles | Everywhere |
| Medium gray | #8C8C8C | Secondary text, attributions | Speaker names, notes |
| Light gray | #D4D4D4 | Structural lines, dividers | Rules, quote borders for system builders |
| Teal | #1A8A7D | The Permission Ticket + key accents | Ticket object, emphasis, key labels |
| Warm amber | #D4932A | Patient/caregiver voice | Left borders on patient/caregiver quotes |

Hand-drawn marks (arrows, circles, brackets, underlines) are rendered in near-black (#1A1A1A) or teal (#1A8A7D), never in other colors. They should look like they were drawn with a fine-tip felt pen — clean, confident, 1-2px line weight with natural but controlled variation.

### The Hand-Drawn Layer — Rules of Engagement

Hand-drawn elements ADD to the typeset content. They never replace it. Specific allowed uses:

- **Arrows** connecting related elements (straight or gently curved, with a simple open arrowhead — not chunky, not ornate)
- **Circles or ovals** loosely drawn around a key word or number to emphasize it (like circling something on a printout)
- **Underlines** beneath key phrases (slightly wavy but controlled — a real person's underline, not a sine wave)
- **Brackets** grouping related items in the margin
- **Small marginal sketches** — only where specifically called for in a slide brief. Simple geometric: a tiny envelope for "data arrives," a tiny lock for "access control." No more than 2-3 per slide. These are 20-30px, barely there — accents, not illustrations.
- **Connector lines** between elements — but sparingly, and only when the connection isn't obvious from layout alone. Thin, straight or gently curved, with a small arrowhead or dot at the end.

**Never:** Decorative swirls, random marks, hatching, cross-hatching, doodles, squiggly borders, fake eraser marks, pencil shading, stippling. If it doesn't carry meaning or provide emphasis, it doesn't exist.

### The Permission Ticket Object

A small rounded rectangle, teal fill (#1A8A7D), white text inside reading "Permission Ticket" in sans-serif small caps. This is ALWAYS typeset, never hand-drawn — it's the one element that must look precise and official, because it represents a cryptographic artifact.

However, when the ticket appears in a diagram, hand-drawn arrows or connector lines may point to or from it, creating a nice contrast between the precise ticket object and the human marks around it.

### Quote Card Format

- Thin vertical left line (2px): amber (#D4932A) for patients/caregivers, light gray (#D4D4D4) for everyone else
- Quote text in sans-serif regular, #1A1A1A, comfortable line-height
- Speaker name and role in sans-serif light, #8C8C8C, smaller
- NO background fills, NO boxes, NO rounded corners on quote cards
- Generous whitespace around each card

The color coding is explained on the title slide so individual slides don't need legends.

### Slide Dimensions & Footer

16:9 landscape (1920×1080 proportions). Consistent margins: ~120px left/right, ~80px top, ~60px bottom.

Footer on every slide — MUST be identical in positioning, size, and font across all slides:
- A thin horizontal rule in #D4D4D4 at the same vertical position on every slide
- Left-aligned: "SMART Permission Tickets · Argonaut Working Group" in sans-serif light, #8C8C8C, 11pt equivalent
- Right-aligned: slide number in the same font
- Title area must also be consistent: same vertical position, same serif font at the same size, same subtitle positioning below it

---

## SLIDE 0: Title Slide

### Image Generation Prompt

A presentation slide, 16:9 landscape, off-white background (#FAF9F6). This is the title and reading-key slide — it sets up the deck's topic and teaches the viewer how to read the visual language used on subsequent slides.

**Upper half:**
Large serif headline, near-black, centered or left-aligned: "SMART Permission Tickets"
Below, sans-serif subtitle, medium gray: "What we heard from 18 stakeholder interviews"
Below that, sans-serif, smaller, #8C8C8C: "Argonaut Working Group · March 2026"

**Lower half — "How to read these slides" section:**

A clean, compact visual key with the heading "Reading this deck" in sans-serif medium, near-black, small.

Three items, each showing the visual element alongside a brief label:

1. A short amber (#D4932A) vertical line followed by the label: "patient or caregiver voice"
2. A short light gray (#D4D4D4) vertical line followed by the label: "system builder voice (EHR vendor, app developer, payer, consultant)"
3. A small teal (#1A8A7D) rounded rectangle with white text "Permission Ticket" followed by the label: "the cryptographic artifact at the center of the spec"

Below those, a brief note in sans-serif light, #8C8C8C: "Hand-drawn marks are the presenter's annotations — emphasis, connections, and editorial notes added to typeset content."

The visual key should feel like a natural part of the slide's design, not a dense legend block. Use generous whitespace and the same typography system as the rest of the deck.

**Footer:** Standard footer, no slide number (or "0").

**Key rendering notes:**
- This slide is clean and spacious — mostly whitespace with the title and visual key
- The visual key teaches the color coding so subsequent slides don't need per-slide legends
- The teal ticket object appears here so it's introduced before Slide 3

---

## SLIDE 1: "What We Heard"

### Image Generation Prompt

A presentation slide, 16:9 landscape, off-white background (#FAF9F6). This slide functions as a "listening wall" — showing the working group that their interview feedback was captured and organized.

**Title area (top-left):**
Large serif headline in near-black: "What We Heard"
Below, sans-serif subtitle in medium gray: "Themes from 18 stakeholder interviews across the ecosystem."

**Main content: Six theme clusters arranged in a 3×2 grid with generous gutters.**

Each cluster is a vertical group containing:
- A theme name in sans-serif medium weight, near-black, moderately large
- Two quote cards stacked beneath it (left accent line + text + attribution)
- A count in sans-serif light, small, medium gray: "n of 18"

The clusters are defined by spatial grouping and whitespace alone — no boxes, no borders.

**HAND-DRAWN LAYER for this slide:**
- A hand-drawn circle (confident, slightly imperfect, in near-black) loosely rings the count "12 of 18" in the Login Wall cluster — the highest count, worth emphasizing
- Thin hand-drawn arrows (2-3 total, in light gray or near-black) connect across clusters where themes relate: one arrow from "The Login Wall" toward "The Human Cost," and one from "All-or-Nothing Access" toward "Data Arrives ≠ Data Used." These are subtle, crossing the gutter space — not heavy, not distracting
- In the bottom margin, a small hand-lettered note in teal: "strongest signals →" with an arrow pointing generally toward the top-left cluster (Login Wall, highest count)

**Grid content:**

Row 1, Column 1 — **The Login Wall**
Quote 1 (amber left line): "I didn't even bother to log into the portals because it was too much work." — Brett Marquard, Patient
Quote 2 (gray left line): "This is the part with the largest drop-off, since users may not have or may not remember credentials." — Pascal Pfiffner, Apple Health
Count: 12 of 18 ← hand-drawn circle around this

Row 1, Column 2 — **No Middle Ground on Access**
Quote 1 (gray left line): "It's all or nothing access. If the client doesn't like a scope, they won't authorize the payer at all — they can't pick and choose." — Mohit, Veradigm
Quote 2 (gray left line): "Payer access via FHIR REST APIs is very problematic. There aren't any built-in ways to filter self-pay data." — Cooper Thompson, Epic
Count: 9 of 18

Row 1, Column 3 — **Trust Is About Incentives**
Quote 1 (amber left line): "I trust organizations whose incentives are to take care of me. Anybody whose incentives are to use my data to sell makes me pause." — Brett Marquard, Patient
Quote 2 (gray left line): "They'd need to participate in governance activities or have implemented highly audited standards." — Joshua Kelly, Flexpa
Count: 11 of 18

Row 2, Column 1 — **Data Arrives ≠ Data Used**
Quote 1 (amber left line): "I'm nervous receivers aren't sure how to integrate it to make it useful to the provider." — Brett Marquard, Patient
Quote 2 (gray left line): "Clinical documentation arrives mostly as txt, pdf, docx, png, jpg — requiring manual review." — William Laolagi, IEHP
Count: 7 of 18

Row 2, Column 2 — **The Long Tail**
Quote 1 (gray left line): "Smaller EHR vendors have been watching on the sidelines for five or six years — sitting out due to operating cost." — Ron Wilson, Consultant
Quote 2 (gray left line): "I am essentially a one-man shop for the technical FHIR implementation." — William Laolagi, IEHP
Count: 6 of 18

Row 2, Column 3 — **The Human Cost**
Quote 1 (amber left line): "The amount of time and energy it takes to access and share records is another layer of stress on top of the personal care, the financial toll, and the emotional toll." — Carmen Smiley, Caregiver
Quote 2 (amber left line): "I think that people are dying because we aren't doing this today." — Aaron Seib, Goldbelt
Count: 5 of 18

**Footer:** "18 interviews · 4 patients/caregivers · 5 app developers · 4 EHR vendors · 2 payers · 3 consultants/other" left, "1" right.

**Key rendering notes:**
- The hand-drawn elements (circle, 2-3 arrows, marginal note) should total maybe 5% of the visual surface area. They add warmth and editorial judgment without cluttering.
- All quote text is typeset and fully legible. Hand-drawn marks are accent only.
- The circled "12 of 18" is the single strongest visual emphasis on the slide — it says "this is the thing most people talked about."

---

## SLIDE 2: "The Patient Journey Today"

### Image Generation Prompt

A presentation slide, 16:9 landscape, off-white background (#FAF9F6). This slide makes the fragmentation problem visceral through a stage-by-stage journey.

**Title area (top-left):**
Large serif headline: "The Patient Journey Today"
Sans-serif subtitle, medium gray: "What it actually takes to connect your health data across providers."

**Main content: Five stages arranged left to right across the slide.**

Each stage is a vertical column. The five columns are separated by generous whitespace (not by vertical lines). At the top of each column: a stage label. Below: 1-2 quote cards. At the bottom: a short failure annotation.

**The key visual device — a hand-drawn attrition line:**
Running horizontally across the top of all five columns, a single hand-drawn line in near-black starts thick/confident on the left (~3px) and gradually thins and fades as it moves right, until it's barely a wisp at Stage 5. This line is drawn with the character of a confident pen stroke — it doesn't wobble or jitter, but it does taper naturally like a real pen line losing pressure. This is the ONLY visual metaphor for attrition. It's elegant, minimal, and immediately readable.

At each stage transition along this line, small hand-drawn tick marks (like hash marks on a tally) in light gray indicate drop-off — 2 marks after Stage 1, 4 marks after Stage 2 (the worst), 3 marks after Stage 3, 2 after Stage 4. These are tiny, like marks someone scratched in the margin. At the far left, a small typeset label in #8C8C8C reads "each mark ≈ users lost" so the tick marks are self-explanatory.

**Stage 1 — FIND THE PORTAL** (far left)
Stage label (sans-serif, medium, small caps, near-black): FIND THE PORTAL
Quote A (gray left line): "We have about 14,000 institutions. The user may not find theirs." — Pascal Pfiffner, Apple Health
Quote B (amber left line): "Most patients don't even create the accounts in the first place." — Eugene Vestel, FHIR IQ
Failure note (hand-lettered, teal, small): Many never start.

**Stage 2 — LOG IN** (left-center)
Stage label: LOG IN
Quote A (amber left line): "I had a specialist on one EHR, a primary care on another, and a lab on a different EHR. I didn't even bother — it was too much work." — Brett Marquard, Patient
Quote B (gray left line): "The largest drop-off. Users may not have or may not remember credentials." — Pascal Pfiffner, Apple Health
Failure note (hand-lettered, teal, slightly larger than others to signal this is the worst stage): Biggest drop-off. ~80% ceiling.
A small hand-drawn bracket in the margin groups Stage 1 and 2 with a hand-lettered note: "most people lost here"

**Stage 3 — REPEAT × N** (center)
Stage label: REPEAT × N
Quote A (gray left line): "Many users struggle to manage passwords, MFAs, and just give up." — Gino Canessa, App Developer
Quote B (amber left line): "There have been times when I just give up." — Carmen Smiley, Caregiver
Failure note (hand-lettered, teal): Each login = another chance to lose them.

**Stage 4 — DATA ARRIVES** (right-center)
Stage label: DATA ARRIVES
Quote A (amber left line): "I'm nervous receivers aren't sure how to integrate it to make it useful." — Brett Marquard, Patient
Quote B (gray left line): "Clinical documentation arrives mostly as txt, pdf, docx, png, jpg." — William Laolagi, IEHP
Failure note (hand-lettered, teal): Arrives ≠ useful.

**Stage 5 — STAY CONNECTED** (far right)
Stage label: STAY CONNECTED
Quote A (gray left line): "Some drop-off when users get logged out because the refresh token expires." — Pascal Pfiffner, Apple Health
Quote B (gray left line): "The more disconnects happen, the less likely users are to manually reconnect." — Pascal Pfiffner, Apple Health
Failure note (hand-lettered, teal): tokens expire, users don't come back

**Spanning bottom quote** (below all five columns, full width):
A quote card with a thicker amber left line (4px):
"The amount of time and energy it takes to access and share records is another layer of stress that caregivers experience in addition to the personal care, the financial toll, and the emotional toll of a loved one's suffering." — Carmen Smiley, Caregiver

**Footer:** Standard, slide number 2.

**Key rendering notes:**
- The tapering hand-drawn attrition line is the hero element. It should feel like a single confident pen stroke — beautiful in its simplicity. Not a wavering line, not a dotted line, not a gradient fill. A real pen stroke that thins naturally.
- The failure notes at each stage are hand-lettered (mode 3 from the type system) — this is where the hand-drawn personality lives in the text. They should feel like a designer's annotations added to a typeset layout.
- No mention of Permission Tickets anywhere on this slide.
- Stage labels are typeset. Quotes are typeset. Only the failure annotations and the marginal bracket note are hand-lettered.

---

## SLIDE 3: "Where Permission Tickets Fit"

### Image Generation Prompt

A presentation slide, 16:9 landscape, off-white background (#FAF9F6). This slide shows that the Permission Ticket is one layer in a multi-layer access control stack — it adds context without overriding existing controls.

**Title area (top-left):**
Large serif headline: "Where Permission Tickets Fit"
Sans-serif subtitle, medium gray: "One new layer in an existing access control stack."

**Main content — left zone (~55%): The access control stack.**

Five layers stacked vertically, top to bottom. Each layer is a horizontal row containing a label and description. The layers are connected by thin hand-drawn downward arrows between them — simple, straight, with small open arrowheads. These arrows are the hand-drawn element on this slide.

**The key visual device — narrowing brackets:**
On the left margin of the stack, a series of hand-drawn square brackets (like [ marks) get progressively shorter from top to bottom, visually showing the narrowing scope. The top bracket spans the full height of Layer 1, the next is slightly shorter, and so on. At the very bottom, the smallest bracket contains just the Access Token output. These brackets are drawn in near-black, with the Permission Ticket bracket drawn in teal.

**Layer 1: App Registration**
Sans-serif, medium weight: "App Registration"
Sans-serif, regular, #8C8C8C: "Client is known and credentialed."

↓ (hand-drawn arrow)

**Layer 2: Permission Ticket** ← hero layer
Sans-serif, medium weight, TEAL: "Permission Ticket"
The teal rounded-rectangle ticket object appears inline.
Sans-serif, regular, #8C8C8C: "Who can access · what data · what purpose · how long"
The left-margin bracket for this layer is drawn in teal, making it pop.

↓ (hand-drawn arrow)

**Layer 3: Request-Time SMART Scopes**
Sans-serif, medium weight: "Request-Time Scopes"
Sans-serif, regular, #8C8C8C: "What the app actually asks for in this request."

↓ (hand-drawn arrow)

**Layer 4: Local Policies**
Sans-serif, medium weight: "Local Policies"
Sans-serif, regular, #8C8C8C: "Consent rules · DS4P segmentation · self-pay filtering."

↓ (hand-drawn arrow)

**Layer 5: Jurisdictional Rules**
Sans-serif, medium weight: "Jurisdictional Rules"
Sans-serif, regular, #8C8C8C: "State and federal privacy requirements."

↓ (hand-drawn arrow, slightly bolder)

**Output: Access Token Issued**
Sans-serif, medium weight, near-black: "Access Token Issued"
A hand-lettered annotation below, in teal: "the intersection of everything above"

**Right zone (~40%): Three quote cards, vertically arranged.**

Quote 1 (gray left line):
"We need to update all of our APIs to factor in the permissions — that's the significant work."
— Cooper Thompson, Epic

Quote 2 (gray left line):
"All rules must be considered together with jurisdictional privacy rules."
— Hans Buitendijk, Oracle Health

Quote 3 (gray left line):
"External tickets need to address consent to share."
— Emma Jones, Veradigm

Below the quotes, in hand-lettered teal, slightly larger:
"The ticket doesn't override anything. It adds a new input to an existing decision."

**A small hand-drawn arrow** connects from the quote about "consent to share" across to Layer 4 (Local Policies) — showing where that concern lives in the stack.

**Footer:** Standard, slide number 3.

**Key rendering notes:**
- The narrowing brackets on the left margin are the main hand-drawn structural element. They should be confident and precise — like brackets drawn with a ruler but with slight natural pen variation.
- The teal bracket for the Permission Ticket layer is the visual anchor — it pops because it's the only colored bracket.
- The hand-drawn arrows between layers are simple and uniform — they just show "this feeds into the next."
- The cross-connecting arrow from the Emma Jones quote to Layer 4 is the one editorial annotation — it shows design thinking, not just layout.
- The Permission Ticket object (teal rounded rectangle) should look crisp and precise, contrasting with the hand-drawn elements around it.

---

## SLIDE 4: "Seven Use Cases, Many Possible Issuers"

### Image Generation Prompt

A presentation slide, 16:9 landscape, off-white background (#FAF9F6). This slide maps use cases to potential issuers, showing that the spec is deliberately agnostic but the landscape has real candidates.

**Title area (top-left):**
Large serif headline: "Seven Use Cases, Many Possible Issuers"
Sans-serif subtitle, medium gray: "The spec defines the ticket format — not who issues it. But viable candidates exist."

**Main content: A clean matrix/table taking ~60-65% of the canvas.**

**Column headers** (sans-serif, medium, small caps, tracked, #8C8C8C):
(blank first column) | DATA HOLDER | HEALTH PLAN | PH AUTHORITY | NETWORK / QHIN | IDENTITY SVC | PATIENT APP

**Seven rows**, alternating #FAF9F6 and #F5F4F0 (barely perceptible alternation):

1. Patient Access
2. Authorized Representative
3. Public Health Investigation
4. Social Care Referral
5. Payer Claims
6. Research
7. Provider Consult

**Cell markers:** Plausible pairings marked with a small teal filled circle (●, ~8px). Clean, precise, not hand-drawn.

Suggested marks:
- Patient Access: Health Plan ●, Network/QHIN ●, Identity Svc ●, Patient App ●
- Authorized Representative: Health Plan ●, Identity Svc ●
- Public Health Investigation: Data Holder ●, PH Authority ●, Network/QHIN ●
- Social Care Referral: Data Holder ●, Network/QHIN ●
- Payer Claims: Health Plan ●, Network/QHIN ●
- Research: Data Holder ●, Network/QHIN ●
- Provider Consult: Data Holder ●, Network/QHIN ●

**Visual emphasis on rows:** Rows 1, 3, and 5 (Patient Access, Public Health, Payer Claims) have their labels in sans-serif medium weight — subtly bolder. Rows 6 and 7 have labels in medium gray — lighter, less prominent.

**HAND-DRAWN LAYER for this slide:**

- Small superscript reference numbers (①②③④) hand-lettered in teal next to specific cells that have interview evidence
- Hand-drawn bracket in the right margin grouping rows 6-7, with a small hand-lettered note: "less interview coverage — still in scope"
- A hand-drawn underline beneath the "Patient Access" row label — the row with most energy
- Small hand-drawn circles around the ● marks in cells that have the strongest interview advocacy (Public Health / Data Holder, Patient Access / Patient App)

**Right margin / below table: Four compact annotation cards** tied to the reference numbers:

① (gray left line): "The data holder issues the ticket when it reports a case." — Cooper Thompson, Epic
② (gray left line): "I'd expect some app developers would seek to become trusted entities." — Joshua Kelly, Flexpa
③ (amber left line): "I trust my health insurance provider and my primary care provider the most." — Brett Marquard, Patient
④ (gray left line): "The PHA could present the ticket to other hospitals in the region." — Cooper Thompson, Epic

**Legend (below table, clearly visible):**
Sans-serif, regular, #8C8C8C, in a single line with visual examples:
"● plausible issuer · ◉ strongest advocacy · blank = not a natural fit"
This legend must be prominent enough to read at a glance — it's essential for understanding the table without narration.

Below the legend, in sans-serif regular, #8C8C8C, smaller: "The spec defines format and validation. Issuer governance is a deployment decision."

**Footer:** Standard, slide number 4.

**Key rendering notes:**
- The table itself is precise and typeset. The hand-drawn marks (circles around key cells, bracket, underline, reference numbers) add editorial voice on top of clean data.
- This is a slide where "designer's annotations on a printed table" is literally the right metaphor — it should look like someone printed the matrix and then marked it up with a pen.
- The teal circles around key cells should be loose but not sloppy — confident ovals, not perfect circles.
- Don't let the annotations crowd the table. The table should breathe.

---

## SLIDE 5: "The Convergence"

### Image Generation Prompt

A presentation slide, 16:9 landscape, off-white background (#FAF9F6). This slide highlights where different stakeholder types independently identified the same problem — the strongest signals from the interviews.

**Title area (top-left):**
Large serif headline: "The Convergence"
Sans-serif subtitle, medium gray: "Where different stakeholders independently said the same thing."

**Main content: Four convergence blocks in a 2×2 grid.**

Each block contains:
- Theme name (sans-serif, medium weight, near-black)
- A short framing line (sans-serif, regular, #8C8C8C)
- 2-3 quote cards with their respective left accent lines

No boxes or borders around blocks — defined by spatial grouping.

**HAND-DRAWN LAYER for this slide:**
The signature hand-drawn element here is a **bridging mark** between quotes within each block. Between the two primary quotes in each block, a small hand-drawn mark — like a simple "=" sign or a pair of short horizontal lines — signals "these people said the same thing." Not a connecting line, not an arc, not an arrow. Just a small equivalence mark drawn between them, in near-black. Subtle. Confident. Like a researcher's margin annotation noting agreement.

Additionally, each theme name gets a short hand-drawn underline in teal — just beneath the theme text, not spanning the full width. Maybe 40-60% of the text width. A gesture of emphasis.

**Block 1 (top-left) — "No Tools for Scoped Access"**
Framing: Two EHR vendors independently describe the same gap — no middle ground between full access and no access for B2B exchange.

Quote A (gray left line):
"It's all or nothing. If the client doesn't like a scope, they won't authorize the payer at all — they can't pick and choose."
— Mohit, Veradigm

≈ (hand-drawn equivalence mark)

Quote B (gray left line):
"Payer access via FHIR REST APIs is very problematic. There aren't any built-in ways to filter self-pay data."
— Cooper Thompson, Epic

Quote C (gray left line, slightly smaller):
"I'm suspicious that self-pay data is actually being shared with payers inappropriately."
— Cooper Thompson, Epic

**Block 2 (top-right) — "The Front Door"**
Framing: Builders measure the drop-off. Patients and caregivers live it.

Quote A (gray left line):
"This is the part with the largest drop-off."
— Pascal Pfiffner, Apple Health

≈ (hand-drawn equivalence mark)

Quote B (amber left line):
"There have been times when I just give up."
— Carmen Smiley, Caregiver

Quote C (gray left line, slightly smaller):
"Most patients don't even create the accounts in the first place."
— Eugene Vestel, FHIR IQ

**Block 3 (bottom-left) — "Standardize, Don't Underspecify"**
Framing: Vendors who've been burned by vague specs agree on the quality bar.

Quote A (gray left line):
"They all have small variances due to underspecification."
— Joshua Kelly, Flexpa

≈ (hand-drawn equivalence mark)

Quote B (gray left line):
"I want to make sure we don't invent a new solution for a problem already solved."
— Jason Vogt, MEDITECH

Quote C (gray left line, slightly smaller):
"The core rules expression should be the same, using FHIR as the common terminology."
— Hans Buitendijk, Oracle Health

**Block 4 (bottom-right) — "The Long Tail"**
Framing: The gap between where mandates assume the industry is and where it actually is.

Quote A (gray left line):
"Smaller EHR vendors have been watching on the sidelines for five or six years."
— Ron Wilson, Consultant

≈ (hand-drawn equivalence mark)

Quote B (gray left line):
"I am essentially a one-man shop for the technical FHIR implementation."
— William Laolagi, IEHP

**Bottom, centered:**
Hand-lettered, teal: "When different stakeholders independently describe the same problem — that's the strongest signal."

**Footer:** Standard, slide number 5.

**Key rendering notes:**
- The hand-drawn equivalence marks (≈) between paired quotes are the unique element on this slide. They should be small, centered between the two quotes, and drawn with confidence — two short parallel strokes, like a researcher's shorthand for "these match."
- Blocks 1, 3, and 4 are all gray left lines (all system builders). Block 2 mixes amber and gray — it's the one that crosses stakeholder lines (builder measurement + patient/caregiver lived experience). This pattern is intentional and informative.
- Quote C in blocks 1, 2, and 3 is supporting evidence — slightly smaller text to signal it's reinforcing, not primary.

---

## SLIDE 6: "Open Questions"

### Image Generation Prompt

A presentation slide, 16:9 landscape, off-white background (#FAF9F6). This slide surfaces three genuine tensions from the interviews that the working group needs to discuss.

**Title area (top-left):**
Large serif headline: "Open Questions"
Sans-serif subtitle, medium gray: "Genuine tensions from the interviews — not things with obvious answers."

**Main content: Three columns, each containing one tension.**

Each column contains:
- Tension label (sans-serif, medium weight, near-black)
- A central question in teal (sans-serif, medium weight) — the visual anchor
- 2-3 quote cards representing different positions
- Small position labels above each quote (sans-serif, small caps, #8C8C8C, tracked)

**HAND-DRAWN LAYER for this slide:**
- Each central question (in teal) gets a hand-drawn box around it — a simple rectangle, slightly imperfect, drawn in teal. Not a rounded rectangle, not a heavy border. A single-line box, like someone put a pen frame around the key question. This is the visual signal: "this is what we need to discuss."
- Between the position labels within each column, small hand-drawn double-headed arrows (↔) in light gray suggest the spectrum without drawing a formal scale. These are tiny — just spatial cues between positions.
- No hand-lettered annotation in the margin. The slide speaks for itself.

**Column 1 — "Granularity"**

Tension label: How Granular in v1?

Central question (teal, in hand-drawn teal box): Where's the line between ambition and what the ecosystem can deliver?

Position: START PRACTICAL
Quote (gray left line): "Start with what EHRs can actually enforce today — broad categories, date ranges, resource types." — Carol Robinson, Midato Health

↔ (small hand-drawn double arrow in light gray)

Position: KEEP FLEXIBLE
Quote (gray left line): "Start broad and add detail later. Leave scoping decisions out of scope." — Gino Canessa, App Developer

↔

Position: GO SPECIFIC
Quote (gray left line): "The query may be limited to only data that the payer has paid for." — Cooper Thompson, Epic

**Column 2 — "Adoption Path"**

Tension label: Mandate or Market?

Central question (teal, in hand-drawn teal box): Does the spec need to work under both theories?

Position: REQUIRE IT
Quote (gray left line): "It has to be made so easy that it is invisible, or it has to be federally required." — William Laolagi, IEHP

↔

Position: BOTH
Quote (gray left line): "There needs to be both sticks and carrots. Having CMS as a partner would be critical." — Aaron Seib, Goldbelt

↔

Position: LET DEMAND DRIVE IT
Quote (gray left line): "Patient demand will have market forces that drive adoption by the data holders." — Aaron Seib, Goldbelt

**Column 3 — "Architecture"**

Tension label: Reform or Rethink?

Central question (teal, in hand-drawn teal box): Can the spec be a practical step and leave room for a larger rethinking?

Position: WORK WITHIN THE MODEL
Quote (gray left line): "Trust establishment will start local — precoordinated with exchange partners, evolving." — Cooper Thompson, Epic

↔

Position: QUESTION THE MODEL
Quote (amber left line): "Permission Tickets may solve a specific problem. But the more interesting question is whether AI creates an opening to rethink the architecture." — Tom Munnecke, Patient

↔

Position: RETHINK THE FOUNDATION
Quote (amber left line): "Security should travel with the data as a property of the information object." — Tom Munnecke, Patient

**Footer:** Standard, slide number 6.

**Key rendering notes:**
- The hand-drawn teal boxes around the central questions are the hero element on this slide. They should feel like someone deliberately framed the key question — not like a UI component, but like a purposeful pen mark. Slightly imperfect corners. Single-line. Teal ink.
- The small double arrows (↔) between positions are subtle — they indicate a range, not a scale. Drawn in light gray so they don't compete with the quotes.
- Column 3 uses amber left lines for Tom Munnecke's quotes (patient voice) — the only amber on this slide. It subtly signals that the "rethink" position comes from the patient perspective.
- No resolution to any tension. These are genuinely open.

---

## SLIDE 7: "Where Do We Focus?"

### Image Generation Prompt

A presentation slide, 16:9 landscape, off-white background (#FAF9F6). This slide invites the working group to prioritize among seven use cases, with evidence supporting a natural starting point.

**Title area (top-left):**
Large serif headline: "Where Do We Focus?"
Sans-serif subtitle, medium gray: "Helping the group narrow from seven use cases to an initial priority."

**Main content: A ranked list of seven use cases, ordered by interview energy.**

The top 3 are visually prominent. The bottom 4 are lighter and more compact. A thin horizontal rule separates the tiers.

**HAND-DRAWN LAYER for this slide:**
- A hand-drawn bracket on the left margin groups the top 3 entries, with a hand-lettered label: "most interview energy"
- The number "14" in "14 of 18" for Patient Access gets a hand-drawn circle in teal — the highest number, worth calling out
- Next to "Research" and "Provider Consult," small hand-drawn asterisks (*) with a marginal note: "less explored ≠ less important"

**Top tier:**

**1. Patient Access**
Name: sans-serif, medium weight, near-black, larger
Detail (sans-serif, regular, #8C8C8C): Raised by 14 of 18 interviewees. The login wall is the most cited pain point. Even partial adoption helps — apps use tickets where available, portal login elsewhere.
Right annotation (teal, small): Every patient, caregiver, and app developer raised this.

**2. Public Health Investigation**
Detail: Raised by 6 of 18, with detailed implementation scenarios. Cooper Thompson described a data-holder-issued ticket model that could work today.
Right annotation (teal, small): Most concrete technical scenarios in interviews.

**3. Payer Claims**
Detail: Raised by 5 of 18. Self-pay data filtering is a concrete harm happening now. Laolagi described the manual RFI loop tickets could streamline.
Right annotation (teal, small): Active harm identified — self-pay data leaking.

— thin horizontal rule (#D4D4D4) —

**Lower tier** (labels in medium gray, smaller text):

**4. Social Care Referral**
"Write-back needed but not mature. Referral response today limited to 360X, Direct, or fax."

**5. Authorized Representative**
"Carmen Smiley's caregiver experience was vivid. Proxy auth is complex but governance challenges are real."

**6. Research**
"Not deeply explored in interviews. Important but less defined."

**7. Provider Consult**
"Limited coverage. Relates to CDS Hooks opportunity Jason Vogt raised."

**Below the list, with whitespace:**
Sans-serif, medium weight, teal: "Where should we start?"

**Footer:** Standard, slide number 7.

**Key rendering notes:**
- The hand-drawn bracket grouping the top 3 is the main structural annotation. It should be confident — a clean bracket with slight pen character, not a mechanical shape.
- The circled "14" echoes the circled "12 of 18" on Slide 1 — same technique, creating continuity across the deck. A designer's consistent habit of circling the stand-out numbers.
- This is the simplest slide in the deck, and that's intentional. After 6 slides of evidence and framing, the group is ready for a clear question. The hand-drawn marks here are minimal — they add warmth but don't compete with the content.
- The note "less explored ≠ less important" is essential. It prevents anyone from feeling their use case was killed.

---

## Deck Summary

| # | Title | Role | Hand-drawn signature element |
|---|-------|------|------------------------------|
| 1 | What We Heard | Mirror | Circled count, sparse connector arrows |
| 2 | The Patient Journey Today | Problem | Tapering pen-stroke attrition line |
| 3 | Where Permission Tickets Fit | Mechanism | Narrowing brackets, inter-layer arrows |
| 4 | Seven Use Cases, Many Issuers | Landscape | Annotated matrix — circles and bracket on printed table |
| 5 | The Convergence | Agreement | Equivalence marks (≈) between paired quotes |
| 6 | Open Questions | Tensions | Hand-drawn teal boxes framing key questions |
| 7 | Where Do We Focus? | Prioritization | Bracket grouping top 3, circled standout number |

**Preferred 5-slide set:** 1, 3, 4, 6, 7
**Full 7-slide set:** Add 2 and 5 for deeper problem-framing and convergence evidence.

### Visual consistency across the deck

- Teal (#1A8A7D) always means "Permission Ticket" or "key emphasis"
- Amber (#D4932A) always means "patient/caregiver voice"
- Hand-drawn circles around numbers appear on slides 1 and 7 (bookend technique)
- Quote card format (left accent line + typeset text) is identical everywhere
- Hand-drawn marks are always sparse, confident, in near-black or teal
- The Permission Ticket object (teal rounded rectangle) appears only on slides 3 and 4
- Off-white background (#FAF9F6) is consistent throughout
- Footer format is identical on every slide
