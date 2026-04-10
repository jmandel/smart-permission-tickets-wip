const title = document.querySelector('#demo-title');
const subtitle = document.querySelector('#demo-subtitle');
const mount = document.querySelector('#ticket-view');

try {
  const [ticket, annotationDoc] = await Promise.all([
    fetchJson('./ticket.json'),
    fetchJson('./ticket-annotations.json'),
  ]);

  title.textContent = annotationDoc.title ?? 'Annotated Permission Ticket';
  subtitle.textContent = annotationDoc.subtitle ?? '';

  // Build lookup maps
  const sectionByPointer = new Map();   // pointer → section annotation
  const firstPointerBySection = new Map();
  const fieldHints = new Map();         // pointer → short hint string

  for (const ann of annotationDoc.annotations ?? []) {
    if (!Array.isArray(ann.pointers) || ann.pointers.length === 0) continue;
    firstPointerBySection.set(ann.id, ann.pointers[0]);
    for (const p of ann.pointers) sectionByPointer.set(p, ann);
    if (ann.fields) {
      for (const [fp, hint] of Object.entries(ann.fields)) {
        fieldHints.set(fp, hint);
      }
    }
  }

  // Walk the JSON and produce line descriptors
  const lines = [];
  walkValue({
    value: ticket, pointer: '', indent: 0, key: null, isLast: true,
    lines, inheritedSection: null, sectionByPointer, firstPointerBySection, fieldHints,
  });

  // Render
  for (const line of lines) {
    mount.append(buildLine(line));
  }
} catch (error) {
  console.error(error);
  mount.append(buildErrorCard(error instanceof Error ? error.message : String(error)));
}

// ── Data fetching ──

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load ${url}: ${response.status}`);
  return response.json();
}

// ── JSON walker ──

function walkValue({ value, pointer, indent, key, isLast, lines,
  inheritedSection, sectionByPointer, firstPointerBySection, fieldHints }) {

  const directSection = sectionByPointer.get(pointer) ?? null;
  const section = directSection ?? inheritedSection;
  const sectionId = section?.id ?? null;
  const firstPtr = section ? firstPointerBySection.get(section.id) : null;
  const isSectionStart = section && pointer === firstPtr;
  const hint = fieldHints.get(pointer) ?? null;

  const ctx = { lines, inheritedSection: section, sectionByPointer, firstPointerBySection, fieldHints };

  if (Array.isArray(value)) {
    lines.push({ code: `${lead(indent, key)}[`, sectionId, hint, sectionHeader: isSectionStart ? section : null });
    value.forEach((item, i) => {
      walkValue({ value: item, pointer: `${pointer}/${i}`, indent: indent + 1,
        key: null, isLast: i === value.length - 1, ...ctx });
    });
    lines.push({ code: `${ind(indent)}]${isLast ? '' : ','}`, sectionId, hint: null, sectionHeader: null });
    return;
  }

  if (value && typeof value === 'object') {
    lines.push({ code: `${lead(indent, key)}{`, sectionId, hint, sectionHeader: isSectionStart ? section : null });
    const entries = Object.entries(value);
    entries.forEach(([ck, cv], i) => {
      walkValue({ value: cv, pointer: `${pointer}/${escPtr(ck)}`, indent: indent + 1,
        key: ck, isLast: i === entries.length - 1, ...ctx });
    });
    lines.push({ code: `${ind(indent)}}${isLast ? '' : ','}`, sectionId, hint: null, sectionHeader: null });
    return;
  }

  lines.push({
    code: `${lead(indent, key)}${fmtPrimitive(value)}${isLast ? '' : ','}`,
    sectionId, hint, sectionHeader: isSectionStart ? section : null,
  });
}

// ── DOM builders ──

function buildLine(descriptor) {
  const { code, sectionId, hint, sectionHeader } = descriptor;
  const frag = document.createDocumentFragment();

  // Section header banner
  if (sectionHeader) {
    const banner = document.createElement('div');
    banner.className = `section-banner section-banner--${sectionHeader.id}`;
    const h = document.createElement('span');
    h.className = 'section-banner__title';
    h.textContent = sectionHeader.title;
    banner.append(h);
    const desc = document.createElement('span');
    desc.className = 'section-banner__body';
    desc.textContent = sectionHeader.body;
    banner.append(desc);
    frag.append(banner);
  }

  // Hint as a comment line above the code
  if (hint) {
    const hintRow = document.createElement('div');
    hintRow.className = 'json-row json-hint-row' + (sectionId ? ` json-row--${sectionId}` : '');
    // Match the indentation of the code line
    const indent = code.match(/^(\s*)/)?.[1] ?? '';
    hintRow.innerHTML = `<code class="json-hint">${escapeHtml(indent)}// ${escapeHtml(hint)}</code>`;
    frag.append(hintRow);
  }

  const row = document.createElement('div');
  row.className = 'json-row' + (sectionId ? ` json-row--${sectionId}` : '');

  const codeEl = document.createElement('code');
  codeEl.className = 'json-code';
  codeEl.innerHTML = colorize(code);
  row.append(codeEl);

  frag.append(row);
  return frag;
}

function buildErrorCard(message) {
  const card = document.createElement('div');
  card.className = 'error-card';
  const h = document.createElement('h2');
  h.textContent = 'Renderer error';
  card.append(h);
  const p = document.createElement('p');
  p.textContent = message;
  card.append(p);
  return card;
}

// ── Helpers ──

function lead(indent, key) {
  return `${ind(indent)}${key === null ? '' : `"${key}": `}`;
}

function ind(n) {
  return '  '.repeat(n);
}

function fmtPrimitive(v) {
  if (typeof v === 'string') return JSON.stringify(v);
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  return 'null';
}

function escPtr(v) {
  return v.replaceAll('~', '~0').replaceAll('/', '~1');
}

function colorize(line) {
  const html = escapeHtml(line);
  const tokens = [];
  const re = /(\s+)|(&quot;[^&]*&quot;)|(\btrue\b|\bfalse\b)|(\bnull\b)|(-?\d+(?:\.\d+)?)|([{}\[\],:])/g;
  let last = 0;
  let isFirst = true;
  let expectValue = false;

  for (const m of html.matchAll(re)) {
    if (m.index > last) tokens.push(html.slice(last, m.index));
    const [match, ws, str, bool, nul, num, punct] = m;

    if (ws) {
      tokens.push(isFirst ? `<span class="json-indent">${ws}</span>` : ws);
      isFirst = false;
    } else if (str) {
      if (expectValue) {
        tokens.push(`<span class="json-string">${str}</span>`);
        expectValue = false;
      } else {
        const after = html.slice(m.index + match.length, m.index + match.length + 2);
        if (after === ': ') {
          tokens.push(`<span class="json-key">${str}</span>`);
          expectValue = true;
        } else {
          tokens.push(`<span class="json-string">${str}</span>`);
        }
      }
    } else if (bool) {
      tokens.push(`<span class="json-boolean">${bool}</span>`);
    } else if (nul) {
      tokens.push(`<span class="json-null">${nul}</span>`);
    } else if (num) {
      tokens.push(`<span class="json-number">${num}</span>`);
    } else if (punct) {
      tokens.push(`<span class="json-punct">${punct}</span>`);
      if (punct === ':') expectValue = false;
    }

    last = m.index + match.length;
  }
  if (last < html.length) tokens.push(html.slice(last));
  return tokens.join('');
}

function escapeHtml(v) {
  return v.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}
