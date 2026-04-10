import * as fs from "fs";
import * as path from "path";
import {
  ClientAssertionSchema,
  clientAssertionJsonSchema,
  permissionTicketJsonSchema,
  tokenExchangeRequestJsonSchema,
} from "./permission-ticket-schema";
import {
  AnnotatedTicketDocument,
  JsonObject,
  JsonValue,
  readJsonFile,
  renderAnnotatedTicketHtml,
} from "./render_annotated_ticket";
import { USE_CASE_CATALOG } from "./use_case_catalog";

type JsonArray = JsonValue[];

const ROOT = path.join(__dirname, "..");
const INCLUDE_ROOT = path.join(ROOT, "input/includes/generated/spec-snippets");
const JSON_SCHEMA_ROOT = path.join(ROOT, "input/includes/generated/json-schema");
const TYPESCRIPT_ROOT = path.join(ROOT, "input/includes/generated/typescript");
const PUBLISHED_ARTIFACT_ROOT = path.join(ROOT, "input/images/generated");
const ANNOTATED_TICKET_ROOT = path.join(__dirname, "annotated-ticket-source");

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

function renderUseCaseProfileRegistryTable(): string {
  const rows = USE_CASE_CATALOG.map(
    (entry) =>
      `  <tr><td>${entry.label}</td><td><code>${entry.ticketTypeUri}</code></td></tr>`
  ).join("\n");
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

function buildIndexSnippets(): void {
  const artifactExample = readJsonFile<JsonObject>(
    path.join(ANNOTATED_TICKET_ROOT, "ticket.json")
  );
  const artifactAnnotations = readJsonFile<AnnotatedTicketDocument>(
    path.join(ANNOTATED_TICKET_ROOT, "ticket-annotations.json")
  );

  const accessExample: JsonObject = {
    access: {
      permissions: [
        {
          kind: "data",
          resource_type: "Observation",
          interactions: ["read", "search"],
          category_any_of: [
            {
              system: "http://terminology.hl7.org/CodeSystem/observation-category",
              code: "laboratory",
            },
            {
              system: "http://terminology.hl7.org/CodeSystem/observation-category",
              code: "vital-signs",
            },
          ],
          code_any_of: [
            { system: "http://loinc.org", code: "718-7" },
            { system: "http://loinc.org", code: "4548-4" },
          ],
        },
        { kind: "data", resource_type: "Condition", interactions: ["read", "search"] },
      ],
      data_period: { start: "2023-01-01", end: "2024-12-31" },
      data_holder_filter: [
        { kind: "jurisdiction", address: { country: "US", state: "CA" } },
        { kind: "jurisdiction", address: { country: "US", state: "NY" } },
        {
          kind: "organization",
          organization: {
            resourceType: "Organization",
            identifier: [{ system: "http://hl7.org/fhir/sid/us-npi", value: "123" }],
          },
        },
      ],
      sensitive_data: "exclude",
    },
  };

  const revocationTicketExample: JsonObject = {
    iss: "https://trusted-issuer.org",
    aud: "https://tefca.hhs.gov",
    exp: 1735689600,
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
      permissions: [{ kind: "data", resource_type: "*", interactions: ["read", "search"] }],
    },
  };

  const revocationListExample: JsonObject = {
    kid: "issuer-signing-key-id",
    bits: "H4sIAAAAAAAA/2NgYGBgBGIOAwA+T46LBQAAAA",
  };

  writeInclude("index/artifact-ticket.json.md", renderJsonFence(artifactExample));
  writeInclude(
    "index/artifact-ticket.annotated.html",
    renderAnnotatedTicketHtml(artifactExample, artifactAnnotations)
  );
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
  writeInclude("index/use-case-profile-map.md", renderUseCaseProfileRegistryTable());
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
