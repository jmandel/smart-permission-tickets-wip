import * as fs from "fs";
import * as path from "path";
import { USE_CASE_CATALOG } from "./use_case_catalog";

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

const ROOT = path.join(__dirname, "..");
const INCLUDE_ROOT = path.join(ROOT, "input/includes/generated/spec-snippets");

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
  const artifactExample: JsonObject = {
    iss: "https://trusted-issuer.org",
    sub: "grant-example-patient-access",
    aud: "https://network.org",
    exp: 1735689600,
    ticket_type: "https://smarthealthit.org/permission-ticket-type/network-patient-access-v1",
    cnf: { jkt: "0ZcOCORZNYy-DWpqq30jZyJGHTN0d2HglBV3uiguA4I" },
    authorization: {
      subject: {
        type: "match",
        traits: {
          resourceType: "Patient",
          name: [{ family: "Smith", given: ["John"] }],
          birthDate: "1980-01-01",
          identifier: [{ system: "urn:oid:2.16.840.1.113883.4.1", value: "***-**-1234" }],
          telecom: [{ system: "phone", value: "555-867-5309" }],
          address: [{ state: "IL" }]
        }
      },
      access: { scopes: ["patient/Immunization.rs", "patient/AllergyIntolerance.rs"] }
    }
  };

  const accessExample: JsonObject = {
    access: {
      scopes: ["patient/Condition.rs", "patient/Procedure.rs"],
      periods: [{ start: "2023-01-01", end: "2024-12-31" }],
      jurisdictions: [{ state: "CA" }, { state: "NY" }],
      organizations: [
        { identifier: [{ system: "http://hl7.org/fhir/sid/us-npi", value: "1234567890" }] }
      ]
    }
  };

  const revocationTicketExample: JsonObject = {
    iss: "https://trusted-issuer.org",
    sub: "grant-revocable-example",
    aud: "https://tefca.hhs.gov",
    exp: 1735689600,
    ticket_type: "https://smarthealthit.org/permission-ticket-type/network-patient-access-v1",
    cnf: { jkt: "0ZcOCORZNYy-DWpqq30jZyJGHTN0d2HglBV3uiguA4I" },
    jti: "ticket-unique-id",
    revocation: {
      url: "https://trusted-issuer.org/.well-known/crl/patient-access.json",
      rid: "abc123xyz"
    },
    authorization: {
      subject: { type: "match", resourceType: "Patient" },
      access: { scopes: ["patient/*.rs"] }
    }
  };

  const revocationListExample: JsonObject = {
    kid: "issuer-signing-key-id",
    method: "rid",
    ctr: 42,
    rids: ["abc123xyz", "def456uvw.1710460800"]
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
}

function buildStartSnippets(): void {
  const artifactExample: JsonObject = {
    iss: "https://trusted-issuer.org",
    sub: "grant-example-patient-access",
    aud: "https://network.org",
    exp: 1735689600,
    ticket_type: "https://smarthealthit.org/permission-ticket-type/network-patient-access-v1",
    cnf: { jkt: "0ZcOCORZNYy-DWpqq30jZyJGHTN0d2HglBV3uiguA4I" },
    authorization: {
      subject: {
        type: "match",
        traits: {
          resourceType: "Patient",
          name: [{ family: "Smith", given: ["John"] }],
          birthDate: "1980-01-01",
          identifier: [{ system: "urn:oid:2.16.840.1.113883.4.1", value: "***-**-1234" }],
          telecom: [{ system: "phone", value: "555-867-5309" }],
          address: [{ state: "IL" }]
        }
      },
      access: { scopes: ["patient/Immunization.rs", "patient/AllergyIntolerance.rs"] }
    }
  };

  const uc1: JsonObject = {
    authorization: {
      subject: {
        type: "match",
        traits: {
          resourceType: "Patient",
          name: [{ family: "Smith", given: ["John"] }],
          birthDate: "1980-01-01",
          identifier: [{ system: "urn:oid:2.16.840.1.113883.4.1", value: "000-00-0000" }]
        }
      },
      access: { scopes: ["patient/Immunization.rs", "patient/AllergyIntolerance.rs"] }
    }
  };

  const uc2: JsonObject = {
    authorization: {
      subject: {
        type: "identifier",
        resourceType: "Patient",
        identifier: [{ system: "https://national-mpi.net", value: "pt-555" }]
      },
      requester: {
        resourceType: "RelatedPerson",
        name: [{ family: "Doe", given: ["Jane"] }],
        telecom: [{ system: "email", value: "jane.doe@example.com" }],
        relationship: [
          { coding: [{ system: "http://terminology.hl7.org/CodeSystem/v3-RoleCode", code: "DAU", display: "Daughter" }] }
        ]
      },
      access: { scopes: ["patient/*.rs"] }
    },
    details: {
      basis: "patient-designated",
      verifiedAt: "2026-03-06T15:04:05Z",
      jurisdiction: [{ state: "IL" }]
    }
  };

  const uc3: JsonObject = {
    authorization: {
      subject: { type: "reference", resourceType: "Patient", id: "local-patient-123" },
      requester: {
        resourceType: "Organization",
        name: "State Dept of Health",
        identifier: [{ system: "urn:ietf:rfc:3986", value: "https://doh.state.gov" }],
        type: [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/organization-type", code: "govt" }] }]
      },
      access: { scopes: ["patient/*.rs"], periods: [{ start: "2025-01-01", end: "2026-01-01" }] }
    },
    details: {
      condition: { system: "http://snomed.info/sct", code: "56717001", display: "Tuberculosis" },
      case: {
        identifier: { system: "https://doh.wa.gov/cases", value: "CASE-2024-999" },
        display: "TB investigation, Case 2024-999"
      }
    }
  };

  const uc4: JsonObject = {
    authorization: {
      subject: { type: "reference", resourceType: "Patient", reference: "Patient/123" },
      requester: {
        resourceType: "PractitionerRole",
        contained: [
          {
            resourceType: "Practitioner", id: "p1",
            name: [{ family: "Volunteer", given: ["Alice"] }],
            telecom: [{ system: "email", value: "alice@foodbank.org" }]
          },
          { resourceType: "Organization", id: "o1", name: "Downtown Food Bank" }
        ],
        practitioner: { reference: "#p1" },
        organization: { reference: "#o1" }
      },
      access: { scopes: ["patient/ServiceRequest.rsu", "patient/Task.rsu"] }
    },
    details: {
      concern: { system: "http://snomed.info/sct", code: "733423003", display: "Food insecurity" },
      referral: {
        reference: "ServiceRequest/555",
        identifier: { system: "https://referring-ehr.org/referrals", value: "REF-555" },
        display: "Food insecurity referral"
      }
    }
  };

  const uc5: JsonObject = {
    authorization: {
      subject: { type: "reference", resourceType: "Patient", reference: "Patient/456" },
      requester: {
        resourceType: "Organization",
        identifier: [{ system: "http://hl7.org/fhir/sid/us-npi", value: "9876543210" }],
        name: "Blue Payer Inc"
      },
      access: { scopes: ["patient/DocumentReference.rs", "patient/Procedure.rs"] }
    },
    details: {
      service: { system: "http://snomed.info/sct", code: "80146002", display: "Appendectomy" },
      claim: {
        identifier: { system: "http://payer.com/claims", value: "CLAIM-2024-XYZ" },
        display: "Appendectomy claim"
      }
    }
  };

  const uc6: JsonObject = {
    authorization: {
      subject: { type: "identifier", resourceType: "Patient", identifier: [{ value: "MRN-123" }] },
      requester: {
        resourceType: "Organization",
        name: "Oncology Research Institute",
        identifier: [{ value: "research-org-id" }]
      },
      access: { scopes: ["patient/*.rs"], periods: [{ start: "2020-01-01", end: "2025-01-01" }] }
    },
    details: {
      condition: { system: "http://snomed.info/sct", code: "363358000", display: "Malignant tumor of lung" },
      study: {
        identifier: { system: "https://clinicaltrials.gov", value: "NCT-12345" },
        display: "Lung cancer immunotherapy trial"
      }
    }
  };

  const uc7: JsonObject = {
    authorization: {
      subject: { type: "reference", resourceType: "Patient", reference: "Patient/999" },
      requester: {
        resourceType: "Practitioner",
        identifier: [{ system: "http://hl7.org/fhir/sid/us-npi", value: "1112223333" }],
        name: [{ family: "Heart", given: ["A."] }]
      },
      access: { scopes: ["patient/*.rs"] }
    },
    details: {
      reason: { system: "http://snomed.info/sct", code: "49436004", display: "Atrial fibrillation" },
      request: {
        reference: "ServiceRequest/ref-req-111",
        identifier: { system: "https://referring-ehr.org/requests", value: "ref-req-111" },
        display: "Cardiology consult for atrial fibrillation"
      }
    }
  };

  writeInclude("start/artifact-ticket.json.md", renderJsonFence(artifactExample));
  writeInclude("start/uc1-ticket.json.md", renderJsonFence(uc1));
  writeInclude("start/uc2-ticket.json.md", renderJsonFence(uc2));
  writeInclude("start/uc3-ticket.json.md", renderJsonFence(uc3));
  writeInclude("start/uc4-ticket.json.md", renderJsonFence(uc4));
  writeInclude("start/uc5-ticket.json.md", renderJsonFence(uc5));
  writeInclude("start/uc6-ticket.json.md", renderJsonFence(uc6));
  writeInclude("start/uc7-ticket.json.md", renderJsonFence(uc7));
}

function main(): void {
  buildIndexSnippets();
  buildStartSnippets();
  console.log("Synced generated snippet includes under input/includes/generated/spec-snippets");
}

main();
