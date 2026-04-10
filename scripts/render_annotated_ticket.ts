import * as fs from "fs";

type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export type JsonObject = { [key: string]: JsonValue };
export type JsonArray = JsonValue[];

export interface AnnotatedTicketSection {
  id: string;
  title: string;
  body: string;
  pointers: string[];
  fields?: Record<string, string>;
}

export interface AnnotatedTicketDocument {
  title?: string;
  subtitle?: string;
  annotations: AnnotatedTicketSection[];
}

interface LineDescriptor {
  code: string;
  sectionId: string | null;
  hint: string | null;
  sectionHeader: AnnotatedTicketSection | null;
}

interface WalkContext {
  lines: LineDescriptor[];
  inheritedSection: AnnotatedTicketSection | null;
  sectionByPointer: Map<string, AnnotatedTicketSection>;
  firstPointerBySection: Map<string, string>;
  fieldHints: Map<string, string>;
}

export function readJsonFile<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
}

export function renderAnnotatedTicketHtml(
  ticket: JsonValue,
  annotationDoc: AnnotatedTicketDocument
): string {
  const { sectionByPointer, firstPointerBySection, fieldHints } = buildIndexes(annotationDoc);
  const lines: LineDescriptor[] = [];

  walkValue({
    value: ticket,
    pointer: "",
    indent: 0,
    key: null,
    isLast: true,
    lines,
    inheritedSection: null,
    sectionByPointer,
    firstPointerBySection,
    fieldHints,
  });

  const renderedLines = lines.map((line) => renderLine(line)).join("\n");
  const label = escapeAttribute(annotationDoc.title ?? "Annotated permission ticket example");

  return [
    `<div class="annotated-ticket-example" role="figure" aria-label="${label}">`,
    "  <style>",
    indentBlock(renderAnnotatedTicketStyles(), 4),
    "  </style>",
    '  <div class="annotated-ticket-example__view">',
    indentBlock(renderedLines, 4),
    "  </div>",
    "</div>",
  ].join("\n");
}

function buildIndexes(annotationDoc: AnnotatedTicketDocument) {
  const sectionByPointer = new Map<string, AnnotatedTicketSection>();
  const firstPointerBySection = new Map<string, string>();
  const fieldHints = new Map<string, string>();

  for (const annotation of annotationDoc.annotations ?? []) {
    if (!Array.isArray(annotation.pointers) || annotation.pointers.length === 0) {
      continue;
    }

    firstPointerBySection.set(annotation.id, annotation.pointers[0]);
    for (const pointer of annotation.pointers) {
      sectionByPointer.set(pointer, annotation);
    }

    if (annotation.fields) {
      for (const [pointer, hint] of Object.entries(annotation.fields)) {
        fieldHints.set(pointer, hint);
      }
    }
  }

  return { sectionByPointer, firstPointerBySection, fieldHints };
}

function walkValue({
  value,
  pointer,
  indent,
  key,
  isLast,
  lines,
  inheritedSection,
  sectionByPointer,
  firstPointerBySection,
  fieldHints,
}: {
  value: JsonValue;
  pointer: string;
  indent: number;
  key: string | null;
  isLast: boolean;
} & WalkContext): void {
  const directSection = sectionByPointer.get(pointer) ?? null;
  const section = directSection ?? inheritedSection;
  const sectionId = section?.id ?? null;
  const firstPointer = section ? firstPointerBySection.get(section.id) : null;
  const isSectionStart = section !== null && pointer === firstPointer;
  const hint = fieldHints.get(pointer) ?? null;

  const nextContext: WalkContext = {
    lines,
    inheritedSection: section,
    sectionByPointer,
    firstPointerBySection,
    fieldHints,
  };

  if (Array.isArray(value)) {
    lines.push({
      code: `${renderLead(indent, key)}[`,
      sectionId,
      hint,
      sectionHeader: isSectionStart ? section : null,
    });

    value.forEach((item, index) => {
      walkValue({
        value: item,
        pointer: `${pointer}/${index}`,
        indent: indent + 1,
        key: null,
        isLast: index === value.length - 1,
        ...nextContext,
      });
    });

    lines.push({
      code: `${renderIndent(indent)}]${isLast ? "" : ","}`,
      sectionId,
      hint: null,
      sectionHeader: null,
    });
    return;
  }

  if (value !== null && typeof value === "object") {
    lines.push({
      code: `${renderLead(indent, key)}{`,
      sectionId,
      hint,
      sectionHeader: isSectionStart ? section : null,
    });

    const entries = Object.entries(value);
    entries.forEach(([childKey, childValue], index) => {
      walkValue({
        value: childValue,
        pointer: `${pointer}/${escapeJsonPointer(childKey)}`,
        indent: indent + 1,
        key: childKey,
        isLast: index === entries.length - 1,
        ...nextContext,
      });
    });

    lines.push({
      code: `${renderIndent(indent)}}${isLast ? "" : ","}`,
      sectionId,
      hint: null,
      sectionHeader: null,
    });
    return;
  }

  lines.push({
    code: `${renderLead(indent, key)}${formatPrimitive(value)}${isLast ? "" : ","}`,
    sectionId,
    hint,
    sectionHeader: isSectionStart ? section : null,
  });
}

function renderLine(line: LineDescriptor): string {
  const parts: string[] = [];

  if (line.sectionHeader) {
    parts.push(renderSectionBanner(line.sectionHeader));
  }

  if (line.hint) {
    const indent = line.code.match(/^(\s*)/)?.[1] ?? "";
    parts.push(
      [
        `<div class="annotated-ticket-example__row${rowSectionClass(line.sectionId)} annotated-ticket-example__hint-row">`,
        `  <code class="annotated-ticket-example__hint">${escapeHtml(indent)}// ${escapeHtml(line.hint)}</code>`,
        "</div>",
      ].join("\n")
    );
  }

  parts.push(
    [
      `<div class="annotated-ticket-example__row${rowSectionClass(line.sectionId)}">`,
      `  <code class="annotated-ticket-example__code">${colorize(line.code)}</code>`,
      "</div>",
    ].join("\n")
  );

  return parts.join("\n");
}

function renderSectionBanner(section: AnnotatedTicketSection): string {
  return [
    `<div class="annotated-ticket-example__banner annotated-ticket-example__banner--${escapeAttribute(section.id)}">`,
    `  <span class="annotated-ticket-example__banner-title">${escapeHtml(section.title)}</span>`,
    `  <span class="annotated-ticket-example__banner-body">${escapeHtml(section.body)}</span>`,
    "</div>",
  ].join("\n");
}

function renderAnnotatedTicketStyles(): string {
  return `
.annotated-ticket-example {
  margin: 1rem 0;
}

.annotated-ticket-example__view {
  background: #fbf8f2;
  border: 1px solid rgba(120, 100, 82, 0.2);
  border-radius: 8px;
  padding: 16px 0;
  overflow-x: auto;
}

.annotated-ticket-example__banner {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 8px 0 2px;
  padding: 8px 20px 8px 17px;
  border-left: 3px solid transparent;
  background: rgba(0, 0, 0, 0.025);
}

.annotated-ticket-example__banner:first-child {
  margin-top: 0;
}

.annotated-ticket-example__banner--envelope { border-left-color: #cc6b2c; }
.annotated-ticket-example__banner--binding  { border-left-color: #2063b8; }
.annotated-ticket-example__banner--subject  { border-left-color: #2c8a57; }
.annotated-ticket-example__banner--access   { border-left-color: #8e3d52; }

.annotated-ticket-example__banner-title {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
}

.annotated-ticket-example__banner--envelope .annotated-ticket-example__banner-title { color: #cc6b2c; }
.annotated-ticket-example__banner--binding  .annotated-ticket-example__banner-title { color: #2063b8; }
.annotated-ticket-example__banner--subject  .annotated-ticket-example__banner-title { color: #2c8a57; }
.annotated-ticket-example__banner--access   .annotated-ticket-example__banner-title { color: #8e3d52; }

.annotated-ticket-example__banner-body {
  font-size: 0.76rem;
  line-height: 1.45;
  color: #6f6257;
  font-style: italic;
}

.annotated-ticket-example__row {
  padding: 0 20px;
  min-height: 1.7em;
}

.annotated-ticket-example__row--envelope,
.annotated-ticket-example__row--binding,
.annotated-ticket-example__row--subject,
.annotated-ticket-example__row--access {
  border-left: 3px solid transparent;
  padding-left: 17px;
}

.annotated-ticket-example__row--envelope { border-left-color: #cc6b2c; }
.annotated-ticket-example__row--binding  { border-left-color: #2063b8; }
.annotated-ticket-example__row--subject  { border-left-color: #2c8a57; }
.annotated-ticket-example__row--access   { border-left-color: #8e3d52; }

.annotated-ticket-example__code,
.annotated-ticket-example__hint {
  font-family: "Berkeley Mono", "Cascadia Code", "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
}

.annotated-ticket-example__code {
  white-space: pre;
  font-size: 0.88rem;
  line-height: 1.7;
  color: #241c15;
}

.annotated-ticket-example__hint-row {
  min-height: auto;
}

.annotated-ticket-example__hint {
  white-space: pre;
  font-size: 0.82rem;
  line-height: 1.5;
  color: #6f6257;
}

.annotated-ticket-example__indent,
.annotated-ticket-example__punct { color: #8a7e72; }
.annotated-ticket-example__key { color: #6844b8; }
.annotated-ticket-example__string { color: #b5440a; }
.annotated-ticket-example__number { color: #1860b8; }
.annotated-ticket-example__boolean,
.annotated-ticket-example__null { color: #258050; }

@media (max-width: 700px) {
  .annotated-ticket-example__row {
    padding: 0 12px;
  }

  .annotated-ticket-example__row--envelope,
  .annotated-ticket-example__row--binding,
  .annotated-ticket-example__row--subject,
  .annotated-ticket-example__row--access {
    padding-left: 9px;
  }

  .annotated-ticket-example__banner {
    padding-left: 9px;
  }
}
`.trim();
}

function rowSectionClass(sectionId: string | null): string {
  return sectionId === null ? "" : ` annotated-ticket-example__row--${escapeAttribute(sectionId)}`;
}

function indentBlock(value: string, spaces: number): string {
  const prefix = " ".repeat(spaces);
  return value
    .split("\n")
    .map((line) => `${prefix}${line}`)
    .join("\n");
}

function renderLead(indent: number, key: string | null): string {
  return `${renderIndent(indent)}${key === null ? "" : `"${key}": `}`;
}

function renderIndent(indent: number): string {
  return "  ".repeat(indent);
}

function formatPrimitive(value: JsonPrimitive): string {
  if (typeof value === "string") {
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    return String(value);
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  return "null";
}

function escapeJsonPointer(value: string): string {
  return value.replaceAll("~", "~0").replaceAll("/", "~1");
}

function colorize(line: string): string {
  const html = escapeHtml(line);
  const tokens: string[] = [];
  const regex = /(\s+)|(&quot;[^&]*&quot;)|(\btrue\b|\bfalse\b)|(\bnull\b)|(-?\d+(?:\.\d+)?)|([{}\[\],:])/g;
  let lastIndex = 0;
  let isFirstToken = true;
  let expectValue = false;

  for (const match of html.matchAll(regex)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      tokens.push(html.slice(lastIndex, index));
    }

    const [full, whitespace, stringToken, booleanToken, nullToken, numberToken, punctuation] = match;

    if (whitespace !== undefined) {
      tokens.push(
        isFirstToken
          ? `<span class="annotated-ticket-example__indent">${whitespace}</span>`
          : whitespace
      );
      isFirstToken = false;
    } else if (stringToken !== undefined) {
      if (expectValue) {
        tokens.push(`<span class="annotated-ticket-example__string">${stringToken}</span>`);
        expectValue = false;
      } else {
        const after = html.slice(index + full.length, index + full.length + 2);
        if (after === ": ") {
          tokens.push(`<span class="annotated-ticket-example__key">${stringToken}</span>`);
          expectValue = true;
        } else {
          tokens.push(`<span class="annotated-ticket-example__string">${stringToken}</span>`);
        }
      }
    } else if (booleanToken !== undefined) {
      tokens.push(`<span class="annotated-ticket-example__boolean">${booleanToken}</span>`);
    } else if (nullToken !== undefined) {
      tokens.push(`<span class="annotated-ticket-example__null">${nullToken}</span>`);
    } else if (numberToken !== undefined) {
      tokens.push(`<span class="annotated-ticket-example__number">${numberToken}</span>`);
    } else if (punctuation !== undefined) {
      tokens.push(`<span class="annotated-ticket-example__punct">${punctuation}</span>`);
      if (punctuation === ":") {
        expectValue = false;
      }
    }

    lastIndex = index + full.length;
  }

  if (lastIndex < html.length) {
    tokens.push(html.slice(lastIndex));
  }

  return tokens.join("");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replaceAll("'", "&#39;");
}
