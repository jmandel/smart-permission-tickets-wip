import * as fs from "fs";
import * as path from "path";
import {
  clientAssertionJsonSchema,
  permissionTicketJsonSchema,
  tokenExchangeRequestJsonSchema,
} from "../reference-implementation/shared/permission-ticket-schema";
import { USE_CASE_CATALOG } from "./use_case_catalog";

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

const ROOT = path.join(__dirname, "..");
const INCLUDE_ROOT = path.join(ROOT, "input/includes/generated/spec-snippets");
const JSON_SCHEMA_ROOT = path.join(ROOT, "input/includes/generated/json-schema");

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
    "</table>"
  ].join("\n");
}

function buildIndexSnippets(): void {
  // Artifact example — minimal UC1-style ticket
  const artifactExample: JsonObject = {
    iss: "https://trusted-issuer.org",
    aud: "https://network.org",
    exp: 1735689600,
    jti: "ticket-example-001",
    ticket_type: "https://smarthealthit.org/permission-ticket-type/patient-self-access-v1",
    presenter_binding: {
      method: "jkt",
      jkt: "0ZcOCORZNYy-DWpqq30jZyJGHTN0d2HglBV3uiguA4I"
    },
    subject: {
      patient: {
        resourceType: "Patient",
        name: [{ family: "Smith", given: ["John"] }],
        birthDate: "1980-01-01",
        identifier: [{ system: "http://hospital.example.org/mrn", value: "A12345" }]
      }
    },
    access: {
      permissions: [
        { kind: "data", resource_type: "Immunization", interactions: ["read", "search"] },
        { kind: "data", resource_type: "AllergyIntolerance", interactions: ["read", "search"] }
      ]
    }
  };

  // Access constraints example
  const accessExample: JsonObject = {
    access: {
      permissions: [
        { kind: "data", resource_type: "Condition", interactions: ["read", "search"] },
        { kind: "data", resource_type: "Procedure", interactions: ["read", "search"] }
      ],
      data_period: { start: "2023-01-01", end: "2024-12-31" },
      responder_filter: [
        { kind: "jurisdiction", address: { country: "US", state: "CA" } },
        { kind: "jurisdiction", address: { country: "US", state: "NY" } },
        {
          kind: "organization",
          organization: {
            resourceType: "Organization",
            identifier: [{ system: "http://hl7.org/fhir/sid/us-npi", value: "1234567890" }],
            name: "General Hospital"
          }
        }
      ],
      sensitive_data: "exclude"
    }
  };

  // Revocation examples
  const revocationTicketExample: JsonObject = {
    iss: "https://trusted-issuer.org",
    aud: "https://tefca.hhs.gov",
    exp: 1735689600,
    jti: "ticket-unique-id",
    ticket_type: "https://smarthealthit.org/permission-ticket-type/patient-self-access-v1",
    presenter_binding: {
      method: "jkt",
      jkt: "0ZcOCORZNYy-DWpqq30jZyJGHTN0d2HglBV3uiguA4I"
    },
    revocation: {
      url: "https://trusted-issuer.org/.well-known/status/patient-access",
      index: 4722
    },
    subject: {
      patient: { resourceType: "Patient" }
    },
    access: {
      permissions: [
        { kind: "data", resource_type: "*", interactions: ["read", "search"] }
      ]
    }
  };

  const revocationListExample: JsonObject = {
    kid: "issuer-signing-key-id",
    bits: "H4sIAAAAAAAA/2NgYGBgBGIOAwA+T46LBQAAAA"
  };

  writeInclude("index/artifact-ticket.json.md", renderJsonFence(artifactExample));
  writeInclude("index/access-example.json.md", renderJsonFence(accessExample));
  writeInclude(
    "index/aud-enumerated.json.md",
    `\`\`\`json\n{ "aud": "https://fhir.hospital.com" }\n// or\n{ "aud": ["https://fhir.hospital-a.com", "https://fhir.hospital-b.com"] }\n\`\`\``
  );
  writeInclude("index/aud-framework.json.md", `\`\`\`json\n{ "aud": "https://tefca.hhs.gov" }\n\`\`\``);
  writeInclude("index/revocation-ticket.json.md", renderJsonFence(revocationTicketExample));
  writeInclude("index/revocation-list.json.md", renderJsonFence(revocationListExample));
  writeInclude("index/use-case-profile-map.md", renderUseCaseProfileRegistryTable());
  writeInclude("index/permission-ticket.schema.json.md", renderJsonFence(permissionTicketJsonSchema as JsonValue));
  writeInclude("index/client-assertion.schema.json.md", renderJsonFence(clientAssertionJsonSchema as JsonValue));
  writeInclude("index/token-exchange-request.schema.json.md", renderJsonFence(tokenExchangeRequestJsonSchema as JsonValue));

  writeJsonSchema("permission-ticket.schema.json", permissionTicketJsonSchema as JsonValue);
  writeJsonSchema("client-assertion.schema.json", clientAssertionJsonSchema as JsonValue);
  writeJsonSchema("token-exchange-request.schema.json", tokenExchangeRequestJsonSchema as JsonValue);
}

function main(): void {
  buildIndexSnippets();
  console.log("Synced generated snippet includes under input/includes/generated/spec-snippets");
}

main();
