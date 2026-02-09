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

function renderProfileTicketsBlock(ticket1: JsonValue, ticket2: JsonValue): string {
  return [
    "```",
    "Ticket 1 (Identity Provider - e.g., Clear):",
    JSON.stringify(ticket1, null, 2),
    "",
    "Ticket 2 (Trust Broker):",
    JSON.stringify(ticket2, null, 2),
    "```"
  ].join("\n");
}

function renderUseCaseProfileRegistryTable(): string {
  const rows = USE_CASE_CATALOG.map(
    (entry) =>
      `  <tr><td>${entry.label}</td><td><code>${entry.profileUri}</code></td><td><code>${entry.ticketTypeUri}</code></td></tr>`
  ).join("\n");
  return [
    "<table>",
    "  <thead>",
    "    <tr><th>Use Case</th><th>Profile URI</th><th>Canonical <code>ticket_type</code> URI</th></tr>",
    "  </thead>",
    "  <tbody>",
    rows,
    "  </tbody>",
    "</table>"
  ].join("\n");
}

function buildIndexSnippets(): void {
  const artifactExample: JsonObject = {
    iss: "https://trust-broker.org",
    sub: "issuer-defined-subject",
    aud: "https://network.org",
    exp: 1735689600,
    ticket_type: "https://smarthealthit.org/permission-ticket-type/proxy-v1",
    client_binding: {
      jwks_uri: "https://app.client.id/jwks.json"
    },
    ticket_context: {
      subject: { resourceType: "Patient" },
      actor: { resourceType: "PractitionerRole" },
      context: {
        type: {
          system: "http://terminology.hl7.org/CodeSystem/v3-ActReason",
          code: "REFER"
        },
        focus: {
          system: "http://snomed.info/sct",
          code: "49436004",
          display: "Atrial fibrillation"
        },
        identifier: [{ system: "https://issuer.org/cases", value: "CASE-123" }]
      },
      capability: { scopes: ["patient/*.rs"] }
    }
  };

  const capabilityExample: JsonObject = {
    capability: {
      scopes: ["patient/Condition.rs", "patient/Procedure.rs"],
      periods: [{ start: "2023-01-01", end: "2024-12-31" }],
      locations: [{ state: "CA" }, { state: "NY" }],
      organizations: [
        {
          identifier: [{ system: "http://hl7.org/fhir/sid/us-npi", value: "1234567890" }]
        }
      ]
    }
  };

  const profileClaimExample: JsonObject = {
    "https://smarthealthit.org/permission_ticket_profile":
      "https://smarthealthit.org/permission-ticket-profile/proxy-v1"
  };

  const profileIdentityTicket: JsonObject = {
    iss: "https://clear.me",
    sub: "clear-subject-789",
    aud: "https://tefca.hhs.gov",
    exp: 1735689600,
    ticket_type: "https://smarthealthit.org/permission-ticket-type/identity-v1",
    client_binding: { jwks_uri: "https://health-app.example.com/jwks.json" },
    ticket_context: {
      actor: {
        resourceType: "RelatedPerson",
        identifier: [{ system: "https://clear.me/id", value: "CLR-789" }],
        name: [{ family: "Smith", given: ["Jane"] }]
      }
    }
  };

  const profileAuthorizationTicket: JsonObject = {
    iss: "https://trust-broker.org",
    sub: "trust-subject-456",
    aud: "https://tefca.hhs.gov",
    exp: 1735689600,
    ticket_type: "https://smarthealthit.org/permission-ticket-type/authorization-v1",
    client_binding: { jwks_uri: "https://health-app.example.com/jwks.json" },
    ticket_context: {
      subject: { type: "match", traits: { resourceType: "Patient" } },
      context: {
        type: { code: "DPOA" },
        actor_reference: "https://clear.me/id|CLR-789"
      },
      capability: { scopes: ["patient/*.rs"] }
    }
  };

  const revocationTicketExample: JsonObject = {
    iss: "https://trust-broker.org",
    sub: "issuer-defined-subject",
    aud: "https://tefca.hhs.gov",
    exp: 1735689600,
    ticket_type: "https://smarthealthit.org/permission-ticket-type/proxy-v1",
    client_binding: { jwks_uri: "https://app.example.com/jwks.json" },
    jti: "ticket-unique-id",
    revocation: {
      url: "https://trust-broker.org/.well-known/crl/patient-access.json",
      rid: "abc123xyz"
    },
    ticket_context: {
      subject: { resourceType: "Patient" },
      capability: { scopes: ["patient/*.rs"] }
    }
  };

  const revocationListExample: JsonObject = {
    kid: "issuer-signing-key-id",
    method: "rid",
    ctr: 42,
    rids: ["abc123xyz", "def456uvw.1710460800"]
  };

  writeInclude("index/artifact-ticket.json.md", renderJsonFence(artifactExample));
  writeInclude("index/capability-example.json.md", renderJsonFence(capabilityExample));
  writeInclude("index/profile-claim.json.md", renderJsonFence(profileClaimExample));
  writeInclude(
    "index/profile-identity-authorization.md",
    renderProfileTicketsBlock(profileIdentityTicket, profileAuthorizationTicket)
  );
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
    iss: "https://trust-broker.org",
    sub: "issuer-defined-subject",
    aud: "https://network.org",
    exp: 1735689600,
    ticket_type: "https://smarthealthit.org/permission-ticket-type/single-patient-v1",
    client_binding: {
      jwks_uri: "https://app.client.id/jwks.json"
    },
    ticket_context: {
      subject: { resourceType: "Patient" },
      actor: { resourceType: "PractitionerRole" },
      context: {
        type: {
          system: "http://terminology.hl7.org/CodeSystem/v3-ActReason",
          code: "REFER"
        },
        focus: {
          system: "http://snomed.info/sct",
          code: "49436004",
          display: "Atrial fibrillation"
        },
        identifier: [{ system: "https://issuer.org/cases", value: "CASE-123" }]
      },
      capability: { scopes: ["patient/*.rs"] }
    }
  };

  const uc1: JsonObject = {
    ticket_context: {
      subject: {
        type: "match",
        traits: {
          resourceType: "Patient",
          name: [{ family: "Smith", given: ["John"] }],
          birthDate: "1980-01-01",
          identifier: [{ system: "urn:oid:2.16.840.1.113883.4.1", value: "000-00-0000" }]
        }
      },
      capability: { scopes: ["patient/Immunization.rs", "patient/AllergyIntolerance.rs"] }
    }
  };

  const uc2: JsonObject = {
    ticket_context: {
      subject: {
        resourceType: "Patient",
        identifier: [{ system: "https://national-mpi.net", value: "pt-555" }]
      },
      actor: {
        resourceType: "RelatedPerson",
        name: [{ family: "Doe", given: ["Jane"] }],
        telecom: [{ system: "email", value: "jane.doe@example.com" }],
        relationship: [
          {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/v3-RoleCode",
                code: "DAU",
                display: "Daughter"
              }
            ]
          }
        ]
      },
      capability: { scopes: ["patient/*.rs"] }
    }
  };

  const uc3: JsonObject = {
    ticket_context: {
      subject: { resourceType: "Patient", id: "local-patient-123" },
      actor: {
        resourceType: "Organization",
        name: "State Dept of Health",
        identifier: [{ system: "urn:ietf:rfc:3986", value: "https://doh.state.gov" }],
        type: [
          {
            coding: [
              { system: "http://terminology.hl7.org/CodeSystem/organization-type", code: "govt" }
            ]
          }
        ]
      },
      context: {
        type: {
          system: "http://terminology.hl7.org/CodeSystem/v3-ActReason",
          code: "PUBHLTH",
          display: "Public Health"
        },
        focus: {
          system: "http://snomed.info/sct",
          code: "56717001",
          display: "Tuberculosis"
        },
        identifier: [{ system: "https://doh.wa.gov/cases", value: "CASE-2024-999" }]
      },
      capability: { scopes: ["patient/*.rs"], periods: [{ start: "2025-01-01", end: "2026-01-01" }] }
    }
  };

  const uc4: JsonObject = {
    ticket_context: {
      subject: { resourceType: "Patient", reference: "Patient/123" },
      actor: {
        resourceType: "PractitionerRole",
        contained: [
          {
            resourceType: "Practitioner",
            id: "p1",
            name: [{ family: "Volunteer", given: ["Alice"] }],
            telecom: [{ system: "email", value: "alice@foodbank.org" }]
          },
          { resourceType: "Organization", id: "o1", name: "Downtown Food Bank" }
        ],
        practitioner: { reference: "#p1" },
        organization: { reference: "#o1" }
      },
      context: {
        type: {
          system: "http://terminology.hl7.org/CodeSystem/v3-ActReason",
          code: "REFER",
          display: "Referral"
        },
        focus: {
          system: "http://snomed.info/sct",
          code: "733423003",
          display: "Food insecurity"
        },
        identifier: [{ system: "https://referring-ehr.org/referrals", value: "REF-555" }]
      },
      capability: { scopes: ["patient/ServiceRequest.rsu", "patient/Task.rsu"] }
    }
  };

  const uc5: JsonObject = {
    ticket_context: {
      subject: { resourceType: "Patient", reference: "Patient/456" },
      actor: {
        resourceType: "Organization",
        identifier: [{ system: "http://hl7.org/fhir/sid/us-npi", value: "9876543210" }],
        name: "Blue Payer Inc"
      },
      context: {
        type: {
          system: "http://terminology.hl7.org/CodeSystem/v3-ActReason",
          code: "CLMATTCH",
          display: "Claim Attachment"
        },
        focus: {
          system: "http://snomed.info/sct",
          code: "80146002",
          display: "Appendectomy"
        },
        identifier: [{ system: "http://provider.com/claims", value: "CLAIM-2024-XYZ" }]
      },
      capability: { scopes: ["patient/DocumentReference.rs", "patient/Procedure.rs"] }
    }
  };

  const uc6: JsonObject = {
    ticket_context: {
      subject: { resourceType: "Patient", identifier: [{ value: "MRN-123" }] },
      actor: {
        resourceType: "Organization",
        name: "Oncology Research Institute",
        identifier: [{ value: "research-org-id" }]
      },
      context: {
        type: {
          system: "http://terminology.hl7.org/CodeSystem/v3-ActReason",
          code: "RESCH",
          display: "Biomedical Research"
        },
        focus: {
          system: "http://snomed.info/sct",
          code: "363358000",
          display: "Malignant tumor of lung"
        },
        identifier: [{ system: "https://consent-service.org/studies", value: "STUDY-PROTO-22" }]
      },
      capability: { scopes: ["patient/*.rs"], periods: [{ start: "2020-01-01", end: "2025-01-01" }] }
    }
  };

  const uc7: JsonObject = {
    ticket_context: {
      subject: { resourceType: "Patient", reference: "Patient/999" },
      actor: {
        resourceType: "Practitioner",
        identifier: [{ system: "http://hl7.org/fhir/sid/us-npi", value: "1112223333" }],
        name: [{ family: "Heart", given: ["A."] }]
      },
      context: {
        type: {
          system: "http://terminology.hl7.org/CodeSystem/v3-ActReason",
          code: "REFER",
          display: "Referral"
        },
        focus: {
          system: "http://snomed.info/sct",
          code: "49436004",
          display: "Atrial fibrillation"
        },
        identifier: [{ system: "https://referring-ehr.org/requests", value: "ref-req-111" }]
      },
      capability: { scopes: ["patient/*.rs"] }
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
