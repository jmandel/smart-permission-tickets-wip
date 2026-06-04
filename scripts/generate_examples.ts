import * as jose from 'jose';
import * as fs from 'fs';
import * as path from 'path';
import {
    type ClientAssertion,
    ClientAssertionSchema,
    PATIENT_DELEGATED_ACCESS_TICKET_TYPE,
    PATIENT_SELF_ACCESS_TICKET_TYPE,
    PAYER_CLAIMS_ADJUDICATION_TICKET_TYPE,
    PROVIDER_CONSULT_TICKET_TYPE,
    PUBLIC_HEALTH_INVESTIGATION_TICKET_TYPE,
    RESEARCH_STUDY_ACCESS_TICKET_TYPE,
    SOCIAL_CARE_REFERRAL_TICKET_TYPE,
    type PermissionTicket,
    PermissionTicketSchema
} from './permission-ticket-schema';

const OUTPUT_DIR = path.join(__dirname, '../input/examples/signed-tickets');
const INCLUDES_DIR = path.join(__dirname, '../input/includes/generated/signed-tickets');
const KEYS_DIR = path.join(__dirname, 'keys');
const DEFAULT_EXP = Math.floor(Date.now() / 1000) + 3600;

// Load client public key and compute JWK Thumbprint (RFC 7638) at startup
const clientPublicJwk = JSON.parse(fs.readFileSync(path.join(KEYS_DIR, 'client.public.json'), 'utf-8'));
const clientJktPromise = jose.calculateJwkThumbprint(clientPublicJwk);

// Ensure output directories exist
for (const dir of [OUTPUT_DIR, INCLUDES_DIR]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function loadKey(filename: string): Promise<jose.KeyLike & { kid?: string }> {
    const keyPath = path.join(KEYS_DIR, filename);
    if (!fs.existsSync(keyPath)) {
        throw new Error(`Key file not found: ${keyPath}. Run generate_keys.ts first.`);
    }
    const jwk = JSON.parse(fs.readFileSync(keyPath, 'utf-8'));
    // The checked-in example JWKs do not all carry an explicit alg.
    // Use the key type to supply the signing algorithm expected by this script.
    const alg = jwk.alg ?? (jwk.kty === 'RSA' ? 'RS256' : 'ES256');
    const key = (await jose.importJWK(jwk, alg)) as jose.KeyLike & { kid?: string };
    key.kid = jwk.kid;
    return key;
}

async function signTicket(payload: PermissionTicket, key: jose.KeyLike & { kid?: string }) {
    const jwt = new jose.SignJWT(payload as any)
        .setProtectedHeader({ alg: 'ES256', kid: key.kid });
    if (!payload.iat) jwt.setIssuedAt();
    return jwt.sign(key);
}

async function signClientAssertion(payload: ClientAssertion, key: jose.KeyLike & { kid?: string }, trust_chain?: string[]) {
    return new jose.SignJWT(payload as any)
        .setProtectedHeader({ alg: 'ES256', kid: key.kid, trust_chain })
        .sign(key);
}

// ─── UC1: Patient Self Access ───────────────────────────────────────────────

const uc1_payload: PermissionTicket = {
    iss: "https://trusted-issuer.org",
    aud: "https://network.org",
    exp: DEFAULT_EXP,
    jti: "uc1-4b33cc1d-0f6b-44bf-bd33-80f6d7140f3e",
    ticket_type: PATIENT_SELF_ACCESS_TICKET_TYPE,
    presenter_binding: { method: "jkt", jkt: "" },
    subject: {
        patient: {
            resourceType: "Patient",
            identifier: [{ system: "http://hospital.example.org/mrn", value: "A12345" }],
            birthDate: "1989-09-14",
            name: [{ family: "Reyes", given: ["Elena"] }]
        }
    },
    access: {
        permissions: [
            { kind: "data", resource_type: "AllergyIntolerance", interactions: ["read", "search"] },
            { kind: "data", resource_type: "Condition", interactions: ["read", "search"] },
            { kind: "data", resource_type: "Observation", interactions: ["read", "search"] },
            { kind: "data", resource_type: "MedicationRequest", interactions: ["read", "search"] }
        ],
        data_period: { start: "2021-01-01", end: "2026-01-01" }
    }
};

// ─── UC2: Patient-Delegated Access ──────────────────────────────────────────

const uc2_payload: PermissionTicket = {
    iss: "https://trusted-issuer.org",
    aud: "https://network.org",
    exp: DEFAULT_EXP,
    jti: "uc2-8c6f4ec2-4fb6-4c42-9530-6bbd11c77e49",
    ticket_type: PATIENT_DELEGATED_ACCESS_TICKET_TYPE,
    presenter_binding: { method: "jkt", jkt: "" },
    subject: {
        patient: {
            resourceType: "Patient",
            identifier: [{ system: "https://national-mpi.net", value: "pt-555" }],
            birthDate: "1948-06-15",
            name: [{ family: "Reyes", given: ["Maria"] }]
        }
    },
    requester: {
        resourceType: "RelatedPerson",
        relationship: [
            { coding: [{ system: "http://terminology.hl7.org/CodeSystem/v3-RoleCode", code: "DAU", display: "daughter" }] },
            { coding: [{ system: "http://terminology.hl7.org/CodeSystem/v3-RoleCode", code: "HPOWATT", display: "healthcare power of attorney" }] }
        ],
        name: [{ family: "Reyes", given: ["Elena"] }]
    },
    access: {
        permissions: [
            { kind: "data", resource_type: "Condition", interactions: ["read", "search"] },
            { kind: "data", resource_type: "Immunization", interactions: ["read", "search"] },
            { kind: "data", resource_type: "MedicationRequest", interactions: ["read", "search"] }
        ]
    }
};

// ─── UC3: Public Health Investigation ────────────────────────────────────────

const uc3_payload: PermissionTicket = {
    iss: "https://issuer.state.example.gov",
    aud: "https://network.org",
    exp: DEFAULT_EXP,
    jti: "uc3-16ff62cf-2d2d-4b30-8c86-6a13d7ab7d16",
    ticket_type: PUBLIC_HEALTH_INVESTIGATION_TICKET_TYPE,
    presenter_binding: {
        method: "trust_framework_client",
        trust_framework: "https://state.example.gov/trust-framework/public-health",
        framework_type: "udap",
        entity_uri: "https://state.example.gov/organizations/epi-unit"
    },
    subject: {
        patient: {
            resourceType: "Patient",
            identifier: [{ system: "http://hospital.example.org/mrn", value: "M445566" }],
            birthDate: "1978-02-21",
            name: [{ family: "Carter", given: ["Monica"] }]
        }
    },
    requester: {
        resourceType: "Organization",
        identifier: [{ system: "urn:ietf:rfc:3986", value: "https://state.example.gov/organizations/epi-unit" }],
        name: "State Epidemiology Unit"
    },
    access: {
        permissions: [
            { kind: "data", resource_type: "Condition", interactions: ["read", "search"] },
            { kind: "data", resource_type: "Observation", interactions: ["read", "search"] },
            { kind: "data", resource_type: "DiagnosticReport", interactions: ["read", "search"] }
        ],
        data_period: { start: "2025-12-01", end: "2026-06-01" },
        data_holder_filter: [{ kind: "jurisdiction", address: { country: "US", state: "TX" } }]
    },
    context: {
        reportable_condition: {
            coding: [{ system: "http://snomed.info/sct", code: "840539006", display: "Disease caused by severe acute respiratory syndrome coronavirus 2 (disorder)" }]
        }
    }
};

// ─── UC4: Social Care Referral ──────────────────────────────────────────────

const uc4_payload: PermissionTicket = {
    iss: "https://issuer.example.org",
    aud: "https://network.org",
    exp: DEFAULT_EXP,
    jti: "uc4-0d0f7272-2d85-49ef-8c39-d4a8e8d8a7f2",
    ticket_type: SOCIAL_CARE_REFERRAL_TICKET_TYPE,
    presenter_binding: {
        method: "trust_framework_client",
        trust_framework: "https://smarthealthit.org/trust-frameworks/reference-demo-well-known",
        framework_type: "well-known",
        entity_uri: "https://aco.example.org/entities/social-care-hub"
    },
    subject: {
        patient: {
            resourceType: "Patient",
            identifier: [{ system: "http://hospital.example.org/mrn", value: "S778899" }],
            birthDate: "1963-11-03",
            name: [{ family: "Nguyen", given: ["Linh"] }]
        }
    },
    requester: {
        resourceType: "Organization",
        identifier: [{ system: "urn:ietf:rfc:3986", value: "https://aco.example.org/entities/social-care-hub" }],
        name: "Community Social Care Hub"
    },
    access: {
        permissions: [
            { kind: "data", resource_type: "ServiceRequest", interactions: ["read", "search"] },
            { kind: "data", resource_type: "Condition", interactions: ["read", "search"] },
            { kind: "data", resource_type: "Observation", interactions: ["read", "search"] }
        ]
    },
    context: {
        concern: {
            coding: [{ system: "http://snomed.info/sct", code: "733423003", display: "Food insecurity" }]
        },
        referral: {
            resourceType: "ServiceRequest",
            identifier: [{ system: "http://issuer.example.org/referrals", value: "REF-1001" }],
            status: "active",
            intent: "order"
        }
    }
};

// ─── UC5: Payer Claims Adjudication ─────────────────────────────────────────

const uc5_payload: PermissionTicket = {
    iss: "https://issuer.example.org",
    aud: "https://network.org",
    exp: DEFAULT_EXP,
    jti: "uc5-9096d8d2-3627-45ee-8ea2-5e5a0ab51b7b",
    ticket_type: PAYER_CLAIMS_ADJUDICATION_TICKET_TYPE,
    presenter_binding: {
        method: "trust_framework_client",
        trust_framework: "https://payer.example.org/trust-framework",
        framework_type: "udap",
        entity_uri: "https://payer.example.org/entities/claims-ops"
    },
    subject: {
        patient: {
            resourceType: "Patient",
            identifier: [{ system: "http://hospital.example.org/mrn", value: "C112233" }],
            birthDate: "1954-07-19",
            name: [{ family: "Johnson", given: ["Amelia"] }]
        }
    },
    requester: {
        resourceType: "Organization",
        identifier: [{ system: "urn:ietf:rfc:3986", value: "https://payer.example.org/entities/claims-ops" }],
        name: "Acme Health Plan Claims Operations"
    },
    access: {
        permissions: [
            { kind: "data", resource_type: "Claim", interactions: ["read", "search"] },
            { kind: "data", resource_type: "ExplanationOfBenefit", interactions: ["read", "search"] },
            { kind: "data", resource_type: "DocumentReference", interactions: ["read", "search"] }
        ],
        data_period: { start: "2025-01-01", end: "2025-12-31" },
        data_holder_filter: [{
            kind: "organization",
            organization: {
                resourceType: "Organization",
                identifier: [{ system: "http://hl7.org/fhir/sid/us-npi", value: "1234567893" }],
                name: "General Hospital"
            }
        }]
    },
    context: {
        service: {
            coding: [{ system: "http://www.ama-assn.org/go/cpt", code: "99214", display: "Office or other outpatient visit" }]
        },
        claim: {
            resourceType: "Claim",
            identifier: [{ system: "http://payer.example.org/claims", value: "CLM-884422" }],
            status: "active",
            use: "claim"
        }
    }
};

// ─── UC6: Research Study ────────────────────────────────────────────────────

const uc6_payload: PermissionTicket = {
    iss: "https://issuer.example.org",
    aud: "https://network.org",
    exp: DEFAULT_EXP,
    jti: "uc6-b5774e14-a020-46f2-94d3-2bb95b7ac4af",
    ticket_type: RESEARCH_STUDY_ACCESS_TICKET_TYPE,
    presenter_binding: {
        method: "trust_framework_client",
        trust_framework: "https://research.example.org/trust-framework",
        framework_type: "udap",
        entity_uri: "https://research.example.org/entities/study-team-204"
    },
    subject: {
        patient: {
            resourceType: "Patient",
            identifier: [{ system: "http://hospital.example.org/mrn", value: "R445500" }],
            birthDate: "1970-05-30",
            name: [{ family: "Lopez", given: ["Marina"] }]
        }
    },
    requester: {
        resourceType: "Organization",
        identifier: [{ system: "urn:ietf:rfc:3986", value: "https://research.example.org/entities/study-team-204" }],
        name: "Study Team 204"
    },
    access: {
        permissions: [
            { kind: "data", resource_type: "Condition", interactions: ["read", "search"] },
            { kind: "data", resource_type: "Observation", interactions: ["read", "search"] }
        ],
        data_period: { start: "2024-01-01", end: "2026-12-31" }
    },
    context: {
        study: {
            resourceType: "ResearchStudy",
            identifier: [{ system: "http://research.example.org/studies", value: "STUDY-204" }],
            status: "active",
            title: "Diabetes Outcomes Registry"
        }
    }
};

// ─── UC7: Provider-to-Provider Consult ──────────────────────────────────────

const uc7_payload: PermissionTicket = {
    iss: "https://issuer.example.org",
    aud: "https://network.org",
    exp: DEFAULT_EXP,
    jti: "uc7-d6927f7f-74c8-4b1b-a7a5-7f4e6d99390a",
    ticket_type: PROVIDER_CONSULT_TICKET_TYPE,
    presenter_binding: {
        method: "trust_framework_client",
        trust_framework: "https://smarthealthit.org/trust-frameworks/reference-demo-well-known",
        framework_type: "well-known",
        entity_uri: "https://hospital.example.org/entities/cardiology-group"
    },
    subject: {
        patient: {
            resourceType: "Patient",
            identifier: [{ system: "http://hospital.example.org/mrn", value: "K667788" }],
            birthDate: "1981-03-08",
            name: [{ family: "Thomas", given: ["Jared"] }]
        }
    },
    requester: {
        resourceType: "PractitionerRole",
        code: [{ coding: [{ system: "http://snomed.info/sct", code: "17561000", display: "Cardiologist" }] }]
    },
    access: {
        permissions: [
            { kind: "data", resource_type: "Condition", interactions: ["read", "search"] },
            { kind: "data", resource_type: "Observation", interactions: ["read", "search"] },
            { kind: "data", resource_type: "DiagnosticReport", interactions: ["read", "search"] }
        ]
    },
    context: {
        reason: {
            coding: [{ system: "http://snomed.info/sct", code: "53741008", display: "Coronary arteriosclerosis" }]
        },
        consult_request: {
            resourceType: "ServiceRequest",
            identifier: [{ system: "http://issuer.example.org/consults", value: "CONSULT-7788" }],
            status: "active",
            intent: "order"
        }
    }
};

// ─── Lightweight Invariant Validator ─────────────────────────────────────────

function validateTicketExample(name: string, payload: PermissionTicket): void {
    const result = PermissionTicketSchema.safeParse(payload);
    if (!result.success) {
        const issues = result.error.issues.map((issue) => {
            const issuePath = issue.path.length > 0 ? issue.path.join('.') : '(root)';
            return `${issuePath}: ${issue.message}`;
        });
        throw new Error(`Validation failed for ${name}:\n  - ${issues.join("\n  - ")}`);
    }
}

// ─── Generation ─────────────────────────────────────────────────────────────

async function generate() {
    console.log("Generating signed examples...");

    const ISSUER_KEY = await loadKey('issuer.private.json');
    const clientJkt = await clientJktPromise;

    // Populate computed JWK Thumbprint into key-bound payloads
    for (const payload of [uc1_payload, uc2_payload]) {
        if (payload.presenter_binding?.method !== "jkt") {
            throw new Error("Expected key-bound example payload");
        }
        payload.presenter_binding.jkt = clientJkt;
    }

    const tickets = [
        { name: 'uc1-ticket.jwt', payload: uc1_payload },
        { name: 'uc2-ticket.jwt', payload: uc2_payload },
        { name: 'uc3-ticket.jwt', payload: uc3_payload },
        { name: 'uc4-ticket.jwt', payload: uc4_payload },
        { name: 'uc5-ticket.jwt', payload: uc5_payload },
        { name: 'uc6-ticket.jwt', payload: uc6_payload },
        { name: 'uc7-ticket.jwt', payload: uc7_payload },
    ];

    for (const t of tickets) {
        validateTicketExample(t.name, t.payload);
        const jwt = await signTicket(t.payload, ISSUER_KEY);
        const jwtPath = path.join(OUTPUT_DIR, t.name);
        fs.writeFileSync(jwtPath, jwt);
        console.log(`Generated ${t.name}`);
        await saveDecodedJWT(jwtPath, "Permission Ticket Artifact");
    }

    await generateClientAssertionExample(ISSUER_KEY);
    await saveDecodedJWT(path.join(OUTPUT_DIR, 'example-client-assertion.jwt'), "Client Assertion");
}

async function generateClientAssertionExample(issuerKey: jose.KeyLike & { kid?: string }) {
    console.log("Generating client assertion example...");

    const now = Math.floor(Date.now() / 1000);
    const assertionPayload: ClientAssertion = {
        iss: "https://app.client.id",
        sub: "https://app.client.id",
        aud: "https://fhir.hospital.com/token",
        jti: "assertion-jti-123",
        iat: now,
        exp: now + 300
    };

    ClientAssertionSchema.parse(assertionPayload);

    const trust_chain = [
        "eyJhbGciOiJFUzI1NiIs... (Signed Entity Statement for Client)",
        "eyJhbGciOiJFUzI1NiIs... (Signed Entity Statement for Intermediate)",
        "eyJhbGciOiJFUzI1NiIs... (Signed Entity Statement for Trust Anchor)"
    ];

    const signedAssertion = await signClientAssertion(assertionPayload, issuerKey, trust_chain);
    fs.writeFileSync(path.join(OUTPUT_DIR, 'example-client-assertion.jwt'), signedAssertion);
    console.log(`Generated example-client-assertion.jwt`);
}

async function saveDecodedJWT(jwtPath: string, title: string) {
    const jwt = fs.readFileSync(jwtPath, 'utf-8');
    const parts = jwt.split('.');
    if (parts.length !== 3) {
        console.error(`Invalid JWT format: ${jwtPath}`);
        return;
    }
    const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());

    const template = fs.readFileSync(path.join(__dirname, '../input/includes/static-jwt-viewer.html'), 'utf-8');
    const html = template
        .replace('{{title}}', title)
        .replace('{{header-json}}', JSON.stringify(header, null, 2))
        .replace('{{payload-json}}', JSON.stringify(payload, null, 2))
        .replace('{{raw-jwt}}', jwt);

    const htmlFilename = path.basename(jwtPath).replace('.jwt', '.html');
    const includeHtmlPath = path.join(INCLUDES_DIR, htmlFilename);
    fs.writeFileSync(includeHtmlPath, html);
    console.log(`Saved static HTML: ${path.basename(includeHtmlPath)}`);
}

generate().catch(console.error);
