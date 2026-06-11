import * as fs from "fs";
import * as path from "path";
import {
  clientAssertionJsonSchema,
  permissionTicketJsonSchema,
  tokenExchangeRequestJsonSchema,
} from "./permission-ticket-schema";
import { USE_CASE_CATALOG } from "./use_case_catalog";

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

const ROOT = path.join(__dirname, "..");
const INCLUDE_ROOT = path.join(ROOT, "input/includes/generated/spec-snippets");
const JSON_SCHEMA_ROOT = path.join(ROOT, "input/includes/generated/json-schema");
const TYPESCRIPT_ROOT = path.join(ROOT, "input/includes/generated/typescript");
const PUBLISHED_ARTIFACT_ROOT = path.join(ROOT, "input/images/generated");

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function writeInclude(relativePath: string, content: string): void {
  const fullPath = path.join(INCLUDE_ROOT, relativePath);
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, `${content}\n`);
}

function writeJsonSchema(relativePath: string, value: JsonValue): void {
  const fullPath = path.join(JSON_SCHEMA_ROOT, relativePath);
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, `${JSON.stringify(value, null, 2)}\n`);
}

function writeTypeScript(relativePath: string, content: string): void {
  const fullPath = path.join(TYPESCRIPT_ROOT, relativePath);
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, `${content}\n`);
}

function writePublishedJson(relativePath: string, value: JsonValue): void {
  const fullPath = path.join(PUBLISHED_ARTIFACT_ROOT, relativePath);
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, `${JSON.stringify(value, null, 2)}\n`);
}

function writePublishedText(relativePath: string, content: string): void {
  const fullPath = path.join(PUBLISHED_ARTIFACT_ROOT, relativePath);
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, `${content}\n`);
}

function renderJsonFence(value: JsonValue): string {
  return `\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``;
}

function renderJsValue(value: JsonValue, continuationIndent: string): string {
  return JSON.stringify(value, null, 2)
    .split("\n")
    .map((line, index) => (index === 0 ? line : `${continuationIndent}${line}`))
    .join("\n");
}

function renderArtifactExampleJs(ticket: JsonObject): string {
  return [
    "```js",
    "{",
    "  // Standard JWT envelope: who minted the ticket, who may redeem it, and when it expires.",
    `  "iss": ${JSON.stringify(ticket.iss)},`,
    `  "aud": ${JSON.stringify(ticket.aud)},`,
    `  "aud_type": ${JSON.stringify(ticket.aud_type)},`,
    `  "exp": ${JSON.stringify(ticket.exp)},`,
    `  "iat": ${JSON.stringify(ticket.iat)},`,
    `  "jti": ${JSON.stringify(ticket.jti)},`,
    "",
    "  // Profile selector: tells the Data Holder which validation and access rules apply.",
    `  "ticket_type": ${JSON.stringify(ticket.ticket_type)},`,
    "",
    "  // Presenter binding: redemption is limited to the client holding this key thumbprint.",
    `  "presenter_binding": ${renderJsValue(ticket.presenter_binding as JsonValue, "  ")},`,
    "",
    "  // Subject: identifies whose data this ticket is about.",
    `  "subject": ${renderJsValue(ticket.subject as JsonValue, "  ")},`,
    "",
    "  // Access: defines what the client may read or search once the ticket is redeemed.",
    `  "access": ${renderJsValue(ticket.access as JsonValue, "  ")}`,
    "}",
    "```",
  ].join("\n");
}

function renderUseCaseProfileRegistryTable(future: boolean): string {
  const rows = USE_CASE_CATALOG.filter((entry) => Boolean(entry.future) === future)
    .map(
      (entry) =>
        `  <tr><td>${entry.page ? `<a href="${entry.page}">${entry.label}</a>` : entry.label}</td><td><code>${entry.ticketTypeUri}</code></td></tr>`
    )
    .join("\n");
  return [
    "<table>",
    "  <thead>",
    "    <tr><th>Use Case</th><th><code>ticket_type</code> URI</th></tr>",
    "  </thead>",
    "  <tbody>",
    rows,
    "  </tbody>",
    "</table>",
  ].join("\n");
}

function renderPerProfileConstraintsTable(): string {
  const rows = USE_CASE_CATALOG.filter((entry) => entry.profile)
    .map((entry) => {
      const label = entry.page ? `<a href="${entry.page}">${entry.label}</a>` : entry.label;
      const profile = entry.profile!;
      return `  <tr><td>${label}</td><td>${profile.presenterBinding}</td><td>${profile.requester}</td><td>${profile.identityEvidence}</td><td>${profile.accessConstraints}</td></tr>`;
    })
    .join("\n");
  return [
    "<table>",
    "  <thead>",
    "    <tr><th>Use Case</th><th><code>presenter_binding</code></th><th>Requester</th><th>Identity Evidence</th><th>Access Constraints</th></tr>",
    "  </thead>",
    "  <tbody>",
    rows,
    "  </tbody>",
    "</table>",
  ].join("\n");
}

function buildIndexSnippets(): void {
  const artifactExample: JsonObject = {
    iss: "https://trusted-issuer.org",
    aud: "https://network.org",
    aud_type: "trust_framework",
    exp: 1735689600,
    iat: 1735686000,
    jti: "ticket-example-001",
    ticket_type: "https://smarthealthit.org/permission-ticket-type/patient-self-access-v1",
    presenter_binding: {
      method: "jkt",
      jkt: "0ZcOCORZNYy-DWpqq30jZyJGHTN0d2HglBV3uiguA4I",
    },
    subject: {
      patient: {
        resourceType: "Patient",
        name: [{ family: "Smith", given: ["John"] }],
        birthDate: "1980-01-01",
        identifier: [{ system: "http://hospital.example.org/mrn", value: "A12345" }],
      },
    },
    access: {
      fhir_resources: [
        { type: "Immunization", interactions: ["read", "search"] },
        {
          type: "AllergyIntolerance",
          interactions: ["read", "search"],
        },
      ],
    },
  };

  const accessExample: JsonObject = {
    access: {
      fhir_resources: [
        {
          type: "Observation",
          interactions: ["read", "search"],
          category: {
            system: "http://terminology.hl7.org/CodeSystem/observation-category",
            code: "laboratory",
          },
        },
        {
          type: "Observation",
          interactions: ["read", "search"],
          code: { system: "http://loinc.org", code: "4548-4" },
        },
        { type: "Condition", interactions: ["read", "search"] },
      ],
      data_period: { start: "2023-01-01", end: "2024-12-31" },
    },
  };

  const revocationTicketExample: JsonObject = {
    iss: "https://trusted-issuer.org",
    aud: "https://tefca.hhs.gov",
    aud_type: "trust_framework",
    exp: 1735689600,
    iat: 1735686000,
    jti: "ticket-unique-id",
    ticket_type: "https://smarthealthit.org/permission-ticket-type/patient-self-access-v1",
    presenter_binding: {
      method: "jkt",
      jkt: "0ZcOCORZNYy-DWpqq30jZyJGHTN0d2HglBV3uiguA4I",
    },
    revocation: {
      url: "https://trusted-issuer.org/.well-known/status/patient-access",
      index: 4722,
    },
    subject: {
      patient: { resourceType: "Patient" },
    },
    access: {
      fhir_resources: [{ type: "*", interactions: ["read", "search"] }],
    },
  };

  const revocationListExample: JsonObject = {
    kid: "issuer-signing-key-id",
    bits: "H4sIAAAAAAAA/2NgYGBgBGIOAwA+T46LBQAAAA",
  };

  writeInclude("index/artifact-ticket.js.md", renderArtifactExampleJs(artifactExample));
  writeInclude("index/artifact-ticket.json.md", renderJsonFence(artifactExample));
  writeInclude("index/access-example.json.md", renderJsonFence(accessExample));
  writeInclude(
    "index/aud-enumerated.json.md",
    `\`\`\`json\n{ "aud": "https://fhir.hospital.com", "aud_type": "data_holder_url" }\n// or\n{ "aud": ["https://fhir.hospital-a.com", "https://fhir.hospital-b.com"], "aud_type": "data_holder_url" }\n\`\`\``
  );
  writeInclude(
    "index/aud-framework.json.md",
    `\`\`\`json\n{ "aud": "https://tefca.hhs.gov", "aud_type": "trust_framework" }\n\`\`\``
  );
  writeInclude("index/revocation-ticket.json.md", renderJsonFence(revocationTicketExample));
  writeInclude("index/revocation-list.json.md", renderJsonFence(revocationListExample));
  writeInclude("index/use-case-profile-map.md", renderUseCaseProfileRegistryTable(false));
  writeInclude("index/future-use-case-map.md", renderUseCaseProfileRegistryTable(true));
  writeInclude("index/per-profile-constraints.md", renderPerProfileConstraintsTable());
  writeInclude(
    "index/permission-ticket.schema.json.md",
    renderJsonFence(permissionTicketJsonSchema as JsonValue)
  );
  writeInclude(
    "index/client-assertion.schema.json.md",
    renderJsonFence(clientAssertionJsonSchema as JsonValue)
  );
  writeInclude(
    "index/token-exchange-request.schema.json.md",
    renderJsonFence(tokenExchangeRequestJsonSchema as JsonValue)
  );
  writeTypeScript(
    "permission-ticket-types.ts",
    fs.readFileSync(path.join(__dirname, "permission-ticket-types.ts"), "utf-8").trimEnd()
  );

  writeJsonSchema("permission-ticket.schema.json", permissionTicketJsonSchema as JsonValue);
  writeJsonSchema("client-assertion.schema.json", clientAssertionJsonSchema as JsonValue);
  writeJsonSchema("token-exchange-request.schema.json", tokenExchangeRequestJsonSchema as JsonValue);
  writePublishedJson(
    "json-schema/permission-ticket.schema.json",
    permissionTicketJsonSchema as JsonValue
  );
  writePublishedJson(
    "json-schema/client-assertion.schema.json",
    clientAssertionJsonSchema as JsonValue
  );
  writePublishedJson(
    "json-schema/token-exchange-request.schema.json",
    tokenExchangeRequestJsonSchema as JsonValue
  );
  writePublishedText(
    "typescript/permission-ticket-types.ts",
    fs.readFileSync(path.join(__dirname, "permission-ticket-types.ts"), "utf-8").trimEnd()
  );
}

function main(): void {
  buildIndexSnippets();
  console.log("Synced generated spec snippets, schemas, and copied TypeScript definitions");
}

main();
