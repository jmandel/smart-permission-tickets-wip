import * as jose from 'jose';
import * as fs from 'fs';
import * as path from 'path';
import {
    type ClientAssertion,
    ClientAssertionSchema,
    PATIENT_DELEGATED_ACCESS_TICKET_TYPE,
    PATIENT_SELF_ACCESS_TICKET_TYPE,
    PAYER_CLAIMS_ADJUDICATION_TICKET_TYPE,
    PAYER_QUALITY_GAP_TICKET_TYPE,
    PUBLIC_HEALTH_INVESTIGATION_TICKET_TYPE,
    type PermissionTicket,
    PermissionTicketSchema
} from './permission-ticket-schema';

const OUTPUT_DIR = path.join(__dirname, '../input/examples/signed-tickets');
const INCLUDES_DIR = path.join(__dirname, '../input/includes/generated/signed-tickets');
const KEYS_DIR = path.join(__dirname, 'keys');
const DEFAULT_IAT = Math.floor(Date.now() / 1000);
const DEFAULT_EXP = DEFAULT_IAT + 3600;

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
    aud_type: "trust_framework",
    exp: DEFAULT_EXP,
    iat: DEFAULT_IAT,
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
        smart_scopes: [
            "patient/AllergyIntolerance.rs",
            "patient/Condition.rs",
            "patient/Observation.rs",
            "patient/MedicationRequest.rs"
        ],
        data_period: { start: "2021-01-01", end: "2026-01-01" }
    }
};

// ─── UC1 variant: Patient Self Access with identity evidence ─────────────────
// The embedded id_token is minted at generation time (see generate()) and its
// demographics match subject.patient. The token's aud identifies the ticket
// issuer's OIDC client at the evidence issuer.

const uc1_evidence_payload: PermissionTicket = {
    ...uc1_payload,
    jti: "uc1-ev-9f1c2b6a-3a77-4d09-9c4e-5a0d2f81c3b7",
    presenter_binding: { method: "jkt", jkt: "" },
    subject_identity_evidence: { source: "embedded", token_type: "id_token", jwt: "(populated at generation time)" }
};

// ─── UC2: Patient-Delegated Access ──────────────────────────────────────────

const uc2_payload: PermissionTicket = {
    iss: "https://trusted-issuer.org",
    aud: "https://network.org",
    aud_type: "trust_framework",
    exp: DEFAULT_EXP,
    iat: DEFAULT_IAT,
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
            { coding: [{ system: "http://terminology.hl7.org/CodeSystem/v3-RoleCode", code: "DELEGATEE", display: "delegatee" }] }
        ],
        period: { end: "2026-12-31" },
        name: [{ family: "Reyes", given: ["Elena"] }]
    },
    access: {
        smart_scopes: [
            "patient/Condition.rs",
            "patient/Immunization.rs",
            "patient/MedicationRequest.rs"
        ]
    }
};

// ─── UC3: Public Health Investigation ────────────────────────────────────────

const uc3_payload: PermissionTicket = {
    iss: "https://issuer.state.example.gov",
    aud: "https://network.org",
    aud_type: "trust_framework",
    exp: DEFAULT_EXP,
    iat: DEFAULT_IAT,
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
        smart_scopes: [
            "patient/Condition.rs",
            "patient/Observation.rs",
            "patient/DiagnosticReport.rs"
        ],
        data_period: { start: "2025-12-01", end: "2026-06-01" },
        data_holder_filter: [{ kind: "jurisdiction", address: { country: "US", state: "TX" } }]
    },
    reportable_condition: {
        coding: [{ system: "http://snomed.info/sct", code: "840539006", display: "Disease caused by severe acute respiratory syndrome coronavirus 2 (disorder)" }]
    }
};

// ─── UC5: Payer Claims Adjudication ──────────────────────────────────────────
// Self-issued: the provider system that submits the claim mints the ticket and
// later accepts it back at its own token endpoint.

const uc5_payload: PermissionTicket = {
    iss: "https://fhir.provider.example.org",
    aud: "https://fhir.provider.example.org",
    aud_type: "data_holder_url",
    exp: DEFAULT_IAT + 60 * 86400,
    iat: DEFAULT_IAT,
    jti: "uc5-2f9a7c11-5d28-4e6b-9b54-3c1f8a02d977",
    ticket_type: PAYER_CLAIMS_ADJUDICATION_TICKET_TYPE,
    presenter_binding: {
        method: "trust_framework_client",
        trust_framework: "https://directory.example-network.org",
        framework_type: "udap",
        entity_uri: "https://payer.example.com/organizations/claims-review"
    },
    subject: {
        patient: {
            resourceType: "Patient",
            identifier: [{ system: "http://fhir.provider.example.org/mrn", value: "B77421" }],
            birthDate: "1962-03-09",
            name: [{ family: "Okafor", given: ["Daniel"] }]
        },
        recipient_record: { reference: "https://fhir.provider.example.org/Patient/B77421", type: "Patient" }
    },
    requester: {
        resourceType: "Organization",
        identifier: [{ system: "http://hl7.org/fhir/sid/us-npi", value: "1093817465" }],
        name: "Example Health Plan"
    },
    access: {
        claim_linkage: {
            // The linked encounters are the positive grant; the Data Holder
            // releases the records it associates with them. An optional provider
            // claim reference may also be carried — see claim-linkage.html.
            encounter: [{ reference: "https://fhir.provider.example.org/Encounter/enc-2026-0117" }]
        }
    }
};

// ─── Payer Quality Gap Queries ───────────────────────────────────────────────
// Element-scoped: the ticket authorizes exactly the data elements a quality
// measure needs, narrowed by code, over the measurement period.

const quality_gap_payload: PermissionTicket = {
    iss: "https://fhir.provider.example.org",
    aud: "https://fhir.provider.example.org",
    aud_type: "data_holder_url",
    exp: DEFAULT_IAT + 120 * 86400,
    iat: DEFAULT_IAT,
    jti: "qg-7b41d6e8-90af-4c33-8d12-64e07f5a21c9",
    ticket_type: PAYER_QUALITY_GAP_TICKET_TYPE,
    presenter_binding: {
        method: "trust_framework_client",
        trust_framework: "https://directory.example-network.org",
        framework_type: "udap",
        entity_uri: "https://payer.example.com/organizations/quality"
    },
    subject: {
        patient: {
            resourceType: "Patient",
            identifier: [{ system: "http://fhir.provider.example.org/mrn", value: "C10288" }],
            birthDate: "1957-11-02",
            name: [{ family: "Tran", given: ["Lien"] }]
        },
        recipient_record: { reference: "https://fhir.provider.example.org/Patient/C10288", type: "Patient" }
    },
    requester: {
        resourceType: "Organization",
        identifier: [{ system: "http://hl7.org/fhir/sid/us-npi", value: "1093817465" }],
        name: "Example Health Plan"
    },
    measure: {
        coding: [{ system: "https://www.cms.gov/medicare/quality/measures", code: "CMS122v12", display: "Diabetes: Glycemic Status Assessment Greater Than 9%" }],
        text: "Diabetes glycemic status (HbA1c)"
    },
    access: {
        smart_scopes: [
            "patient/Observation.rs?code=http://loinc.org|4548-4"
        ],
        data_period: { start: "2026-01-01", end: "2026-12-31" }
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
    const EVIDENCE_KEY = await loadKey('evidence-issuer.private.json');
    const clientJkt = await clientJktPromise;

    // Populate computed JWK Thumbprint into key-bound payloads
    for (const payload of [uc1_payload, uc1_evidence_payload, uc2_payload]) {
        if (payload.presenter_binding?.method !== "jkt") {
            throw new Error("Expected key-bound example payload");
        }
        payload.presenter_binding.jkt = clientJkt;
    }

    // Mint the embedded id_token for the UC1 evidence variant. Its demographics
    // match subject.patient; its aud is the ticket issuer's client at the
    // evidence issuer; the ticket's iat falls within the token's validity.
    const evidenceNow = Math.floor(Date.now() / 1000);
    const idToken = await new jose.SignJWT({
        iss: "https://id.example-csp.org",
        aud: "trusted-issuer-app",
        sub: "csp-user-7d2f0a44",
        given_name: "Elena",
        family_name: "Reyes",
        birthdate: "1989-09-14",
        acr: "https://id.example-csp.org/assurance/ial2",
        iat: evidenceNow,
        exp: evidenceNow + 300
    }).setProtectedHeader({ alg: 'ES256', kid: EVIDENCE_KEY.kid }).sign(EVIDENCE_KEY);
    uc1_evidence_payload.subject_identity_evidence = { source: "embedded", token_type: "id_token", jwt: idToken };
    uc1_evidence_payload.iat = evidenceNow;
    fs.writeFileSync(path.join(OUTPUT_DIR, 'uc1-evidence-id-token.jwt'), idToken);
    await saveDecodedJWT(path.join(OUTPUT_DIR, 'uc1-evidence-id-token.jwt'), "Embedded ID Token (identity evidence)");

    const tickets = [
        { name: 'uc1-ticket.jwt', payload: uc1_payload },
        { name: 'uc1-evidence-ticket.jwt', payload: uc1_evidence_payload },
        { name: 'uc2-ticket.jwt', payload: uc2_payload },
        { name: 'uc3-ticket.jwt', payload: uc3_payload },
        { name: 'uc5-ticket.jwt', payload: uc5_payload },
        { name: 'payer-quality-gap-ticket.jwt', payload: quality_gap_payload },
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
