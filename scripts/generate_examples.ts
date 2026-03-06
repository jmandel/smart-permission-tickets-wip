import * as jose from 'jose';
import * as fs from 'fs';
import * as path from 'path';
import { PermissionTicket, ClientAssertion } from './types';
import { USE_CASE_BY_ID } from './use_case_catalog';
import Ajv from 'ajv';

const ajv = new Ajv();

import * as TJS from "ts-json-schema-generator";

// Generate schema from TypeScript types
const config: TJS.Config = {
    path: path.join(__dirname, "types.ts"),
    tsconfig: path.join(__dirname, "tsconfig.json"),
    type: "PermissionTicket",
};

const schema = TJS.createGenerator(config).createSchema(config.type);
const validate = ajv.compile(schema);

const OUTPUT_DIR = path.join(__dirname, '../input/examples/signed-tickets');
const INCLUDES_DIR = path.join(__dirname, '../input/includes/generated/signed-tickets');
const KEYS_DIR = path.join(__dirname, 'keys');
const DEFAULT_EXP = Math.floor(Date.now() / 1000) + 3600;

// Load client public key and compute JWK Thumbprint (RFC 7638) at startup
const clientPublicJwk = JSON.parse(fs.readFileSync(path.join(KEYS_DIR, 'client.public.json'), 'utf-8'));
const clientJktPromise = jose.calculateJwkThumbprint(clientPublicJwk);

// Ensure output directories exist
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(INCLUDES_DIR)) {
    fs.mkdirSync(INCLUDES_DIR, { recursive: true });
}

async function loadKey(filename: string): Promise<jose.KeyLike & { kid?: string }> {
    const keyPath = path.join(KEYS_DIR, filename);
    if (!fs.existsSync(keyPath)) {
        throw new Error(`Key file not found: ${keyPath}. Run generate_keys.ts first.`);
    }
    const jwk = JSON.parse(fs.readFileSync(keyPath, 'utf-8'));
    const key = (await jose.importJWK(jwk)) as jose.KeyLike & { kid?: string };
    key.kid = jwk.kid;
    return key;
}

async function signTicket(payload: PermissionTicket, key: jose.KeyLike & { kid?: string }) {
    const jwt = new jose.SignJWT(payload as any)
        .setProtectedHeader({ alg: 'ES256', kid: key.kid });
    if (!payload.iat) {
        jwt.setIssuedAt();
    }
    return jwt.sign(key);
}

async function signClientAssertion(payload: ClientAssertion, key: jose.KeyLike & { kid?: string }, trust_chain?: string[]) {
    return new jose.SignJWT(payload as any)
        .setProtectedHeader({
            alg: 'ES256',
            kid: key.kid,
            trust_chain
        })
        .sign(key);
}

// Use Case 1: Network Patient Access
const uc1_payload: PermissionTicket = {
    iss: "https://trusted-issuer.org",
    sub: "grant-uc1-patient-access",
    aud: "https://network.org",
    exp: DEFAULT_EXP,
    ticket_type: USE_CASE_BY_ID.uc1.ticketTypeUri,
    cnf: { jkt: "" },
    authorization: {
        subject: {
            type: "match",
            traits: {
                resourceType: "Patient",
                name: [{ family: "Smith", given: ["John"] }],
                birthDate: "1980-01-01"
            }
        },
        access: {
            scopes: ["patient/Immunization.rs", "patient/AllergyIntolerance.rs"]
        }
    }
};

// Use Case 2: Authorized Representative
const uc2_payload: PermissionTicket = {
    iss: "https://trusted-issuer.org",
    sub: "grant-uc2-representative",
    aud: "https://network.org",
    exp: DEFAULT_EXP,
    ticket_type: USE_CASE_BY_ID.uc2.ticketTypeUri,
    cnf: { jkt: "" },
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
            relationship: [{
                coding: [{
                    system: "http://terminology.hl7.org/CodeSystem/v3-RoleCode",
                    code: "DAU",
                    display: "Daughter"
                }]
            }]
        },
        access: {
            scopes: ["patient/*.rs"]
        }
    }
};

// Use Case 3: Public Health Investigation
const uc3_payload: PermissionTicket = {
    iss: "https://hospital-a.com",
    sub: "grant-uc3-pubhealth-case999",
    aud: "https://hospital-a.com",
    exp: DEFAULT_EXP,
    ticket_type: USE_CASE_BY_ID.uc3.ticketTypeUri,
    cnf: { jkt: "" },
    authorization: {
        subject: {
            type: "reference",
            resourceType: "Patient",
            id: "local-patient-123"
        },
        requester: {
            resourceType: "Organization",
            name: "State Dept of Health",
            identifier: [{ system: "urn:ietf:rfc:3986", value: "https://doh.state.gov" }],
            type: [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/organization-type", code: "govt" }] }]
        },
        access: {
            scopes: ["patient/*.rs"],
            periods: [{ start: "2025-01-01", end: "2026-01-01" }]
        }
    },
    details: {
        condition: { system: "http://snomed.info/sct", code: "56717001", display: "Tuberculosis" },
        case: {
            identifier: { system: "https://doh.wa.gov/cases", value: "CASE-2024-999" },
            display: "TB investigation, Case 2024-999"
        }
    }
};

// Use Case 4: Social Care (CBO) Referral
const uc4_payload: PermissionTicket = {
    iss: "https://referring-ehr.org",
    sub: "grant-uc4-referral-555",
    aud: "https://referring-ehr.org",
    exp: DEFAULT_EXP,
    ticket_type: USE_CASE_BY_ID.uc4.ticketTypeUri,
    cnf: { jkt: "" },
    authorization: {
        subject: { type: "reference", resourceType: "Patient", reference: "Patient/123" },
        requester: {
            resourceType: "PractitionerRole",
            contained: [
                {
                    resourceType: "Practitioner",
                    id: "p1",
                    name: [{ family: "Volunteer", given: ["Alice"] }],
                    telecom: [{ system: "email", value: "alice@foodbank.org" }]
                },
                {
                    resourceType: "Organization",
                    id: "o1",
                    name: "Downtown Food Bank"
                }
            ],
            practitioner: { reference: "#p1" },
            organization: { reference: "#o1" }
        },
        access: {
            scopes: ["patient/ServiceRequest.rsu", "patient/Task.rsu"]
        }
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

// Use Case 5: Payer Claims Adjudication
const uc5_payload: PermissionTicket = {
    iss: "https://provider.com",
    sub: "grant-uc5-claim-xyz",
    aud: "https://provider.com",
    exp: DEFAULT_EXP,
    ticket_type: USE_CASE_BY_ID.uc5.ticketTypeUri,
    cnf: { jkt: "" },
    authorization: {
        subject: { type: "reference", resourceType: "Patient", reference: "Patient/456" },
        requester: {
            resourceType: "Organization",
            identifier: [{ system: "http://hl7.org/fhir/sid/us-npi", value: "9876543210" }],
            name: "Blue Payer Inc"
        },
        access: {
            scopes: ["patient/DocumentReference.rs", "patient/Procedure.rs"]
        }
    },
    details: {
        service: { system: "http://snomed.info/sct", code: "80146002", display: "Appendectomy" },
        claim: {
            identifier: { system: "http://payer.com/claims", value: "CLAIM-2024-XYZ" },
            display: "Appendectomy claim"
        }
    }
};

// Use Case 6: Research Study
const uc6_payload: PermissionTicket = {
    iss: "https://consent-platform.org",
    sub: "grant-uc6-study-proto22",
    aud: "https://hospital.com",
    exp: DEFAULT_EXP,
    ticket_type: USE_CASE_BY_ID.uc6.ticketTypeUri,
    cnf: { jkt: "" },
    authorization: {
        subject: { type: "identifier", resourceType: "Patient", identifier: [{ value: "MRN-123" }] },
        requester: {
            resourceType: "Organization",
            name: "Oncology Research Institute",
            identifier: [{ value: "research-org-id" }]
        },
        access: {
            scopes: ["patient/*.rs"],
            periods: [{ start: "2020-01-01", end: "2025-01-01" }]
        }
    },
    details: {
        condition: { system: "http://snomed.info/sct", code: "363358000", display: "Malignant tumor of lung" },
        study: {
            identifier: { system: "https://clinicaltrials.gov", value: "NCT-12345" },
            display: "Lung cancer immunotherapy trial"
        }
    }
};

// Use Case 7: Provider-to-Provider Consult
const uc7_payload: PermissionTicket = {
    iss: "https://referring-ehr.org",
    sub: "grant-uc7-consult-req111",
    aud: "https://referring-ehr.org",
    exp: DEFAULT_EXP,
    ticket_type: USE_CASE_BY_ID.uc7.ticketTypeUri,
    cnf: { jkt: "" },
    authorization: {
        subject: { type: "reference", resourceType: "Patient", reference: "Patient/999" },
        requester: {
            resourceType: "Practitioner",
            identifier: [{ system: "http://hl7.org/fhir/sid/us-npi", value: "1112223333" }],
            name: [{ family: "Heart", given: ["A."] }]
        },
        access: {
            scopes: ["patient/*.rs"]
        }
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

async function generate() {
    console.log("Generating signed examples...");

    const ISSUER_KEY = await loadKey('issuer.private.json');
    const clientJkt = await clientJktPromise;

    // Populate computed JWK Thumbprint into all payloads
    for (const payload of [uc1_payload, uc2_payload, uc3_payload, uc4_payload, uc5_payload, uc6_payload, uc7_payload]) {
        payload.cnf.jkt = clientJkt;
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
        if (!validate(t.payload)) {
            console.error(`Validation failed for ${t.name}:`, validate.errors);
            throw new Error(`Schema validation failed for ${t.name}`);
        }
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

    const clientJkt = await clientJktPromise;
    const ticketPayload: PermissionTicket = {
        iss: "https://trusted-issuer.org",
        sub: "grant-example-patient-access",
        aud: "https://network.org",
        exp: DEFAULT_EXP,
        ticket_type: USE_CASE_BY_ID.uc1.ticketTypeUri,
        cnf: { jkt: clientJkt },
        authorization: {
            subject: { type: "reference", resourceType: "Patient", id: "123" },
            access: { scopes: ["patient/*.rs"] }
        }
    };
    const signedTicket = await signTicket(ticketPayload, issuerKey);

    const now = Math.floor(Date.now() / 1000);
    const assertionPayload: ClientAssertion = {
        iss: "https://app.client.id",
        sub: "https://app.client.id",
        aud: "https://network.org/token",
        jti: "assertion-jti-123",
        iat: now,
        exp: now + 300,
        permission_ticket_profile: USE_CASE_BY_ID.uc1.profileUri,
        permission_tickets: [signedTicket]
    };

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
