import * as jose from 'jose';
import * as fs from 'fs';
import * as path from 'path';
import { PermissionTicket, ClientAssertion } from './types';
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

const OUTPUT_DIR = path.join(__dirname, '../input/images/signed-tickets');
const INCLUDES_DIR = path.join(__dirname, '../input/includes/signed-tickets');
const KEYS_DIR = path.join(__dirname, 'keys');

// Ensure output directories exist
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(INCLUDES_DIR)) {
    fs.mkdirSync(INCLUDES_DIR, { recursive: true });
}

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
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
    return new jose.SignJWT(payload as any) // Cast to any for jose compatibility
        .setProtectedHeader({ alg: 'ES256', kid: key.kid })
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(key);
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
    iss: "https://trust-broker.org",
    sub: "https://client-app.example.com/123",
    aud: "https://network.org",
    ticket_context: {
        subject: {
            type: "match",
            traits: {
                resourceType: "Patient",
                name: [{ family: "Smith", given: ["John"] }],
                birthDate: "1980-01-01"
            }
        },
        capability: {
            scopes: ["patient/Immunization.read", "patient/AllergyIntolerance.read"]
        }
    }
};

// Use Case 2: Authorized Representative
const uc2_payload: PermissionTicket = {
    iss: "https://trust-broker.org",
    sub: "https://client-app.example.com/456",
    aud: "https://network.org",
    ticket_context: {
        subject: {
            resourceType: "Patient",
            identifier: [{ system: "https://national-mpi.net", value: "pt-555" }]
        },
        actor: {
            resourceType: "RelatedPerson",
            name: [{ family: "Doe", given: ["Jane"] }],
            telecom: [{ system: "email", value: "jane.doe@example.com" }],
            relationship: [{
                coding: [{
                    system: "http://terminology.hl7.org/CodeSystem/v3-RoleCode",
                    code: "DAU", // Corrected from GRPRN based on text description
                    display: "Daughter"
                }]
            }]
        },
        capability: {
            scopes: ["patient/*.read", "patient/*.search"]
        }
    }
};

// Use Case 3: Public Health Investigation
const uc3_payload: PermissionTicket = {
    iss: "https://hospital-a.com",
    sub: "https://pha.gov/apps/report-client",
    aud: "https://hospital-a.com",
    ticket_context: {
        subject: {
            resourceType: "Patient",
            id: "local-patient-123"
        },
        actor: {
            resourceType: "Organization",
            name: "State Dept of Health",
            identifier: [{ system: "urn:ietf:rfc:3986", value: "https://doh.state.gov" }],
            type: [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/organization-type", code: "govt" }] }]
        },
        context: {
            type: { system: "http://terminology.hl7.org/CodeSystem/v3-ActReason", code: "PUBHLTH", display: "Public Health" },
            focus: { system: "http://snomed.info/sct", code: "56717001", display: "Tuberculosis" },
            identifier: [{ system: "https://doh.wa.gov/cases", value: "CASE-2024-999" }]
        },
        capability: {
            scopes: ["patient/*.read"],
            periods: [{
                start: "2025-01-01",
                end: "2026-01-01"
            }]
        }
    }
};

// Use Case 4: Social Care (CBO) Referral
const uc4_payload: PermissionTicket = {
    iss: "https://referring-ehr.org",
    sub: "https://foodbank.org/apps/intake",
    aud: "https://referring-ehr.org",
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
                {
                    resourceType: "Organization",
                    id: "o1",
                    name: "Downtown Food Bank"
                }
            ],
            practitioner: { reference: "#p1" },
            organization: { reference: "#o1" }
        },
        context: {
            type: { system: "http://terminology.hl7.org/CodeSystem/v3-ActReason", code: "REFER", display: "Referral" },
            focus: { system: "http://snomed.info/sct", code: "733423003", display: "Food insecurity" }
        },
        capability: {
            scopes: ["patient/ServiceRequest.read", "patient/ServiceRequest.write", "patient/Task.read", "patient/Task.write"]
        }
    }
};

// Use Case 5: Payer Claims Adjudication
const uc5_payload: PermissionTicket = {
    iss: "https://provider.com",
    sub: "https://payer.com/apps/claims-processor",
    aud: "https://provider.com",
    ticket_context: {
        subject: { resourceType: "Patient", reference: "Patient/456" },
        actor: {
            resourceType: "Organization",
            identifier: [{ system: "http://hl7.org/fhir/sid/us-npi", value: "9876543210" }],
            name: "Blue Payer Inc"
        },
        context: {
            type: { system: "http://terminology.hl7.org/CodeSystem/v3-ActReason", code: "CLMATTCH", display: "Claim Attachment" },
            focus: { system: "http://snomed.info/sct", code: "80146002", display: "Appendectomy" }
        },
        capability: {
            scopes: ["patient/DocumentReference.read", "patient/Procedure.read"]
        }
    }
};

// Use Case 6: Research Study
const uc6_payload: PermissionTicket = {
    iss: "https://consent-platform.org",
    sub: "https://research.org/studies/lung-cancer/app",
    aud: "https://hospital.com",
    ticket_context: {
        subject: { resourceType: "Patient", identifier: [{ value: "MRN-123" }] },
        actor: {
            resourceType: "Organization",
            name: "Oncology Research Institute",
            identifier: [{ value: "research-org-id" }]
        },
        context: {
            type: { system: "http://terminology.hl7.org/CodeSystem/v3-ActReason", code: "RESCH", display: "Biomedical Research" },
            focus: { system: "http://snomed.info/sct", code: "363358000", display: "Malignant tumor of lung" }
        },
        capability: {
            scopes: ["patient/*.read"],
            periods: [{
                start: "2020-01-01",
                end: "2025-01-01"
            }]
        }
    }
};

// Use Case 7: Provider-to-Provider Consult
const uc7_payload: PermissionTicket = {
    iss: "https://referring-ehr.org",
    sub: "https://specialist-clinic.org/apps/referral-viewer",
    aud: "https://referring-ehr.org",
    ticket_context: {
        subject: { resourceType: "Patient", reference: "Patient/999" },
        actor: {
            resourceType: "Practitioner",
            identifier: [{ system: "http://hl7.org/fhir/sid/us-npi", value: "1112223333" }],
            name: [{ family: "Heart", given: ["A."] }]
        },
        context: {
            type: { system: "http://terminology.hl7.org/CodeSystem/v3-ActReason", code: "REFER", display: "Referral" },
            focus: { system: "http://snomed.info/sct", code: "49436004", display: "Atrial fibrillation" }
        },
        capability: {
            scopes: ["patient/*.read"]
        }
    }
};

async function generate() {
    console.log("Generating signed examples...");

    const ISSUER_KEY = await loadKey('issuer.private.json');
    // const CLIENT_KEY = await loadKey('client.private.json'); // Not used for simple ticket generation in this batch

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

    // Create a mock ticket to embed
    const ticketPayload: PermissionTicket = {
        iss: "https://trust-broker.org",
        sub: "https://app.client.id",
        aud: "https://network.org",
        ticket_context: {
            subject: { resourceType: "Patient", id: "123" },
            capability: {
                scopes: ["patient/*.read"]
            }
        }
    };
    const signedTicket = await signTicket(ticketPayload, issuerKey);

    // Create the client assertion
    // Create the client assertion
    // Note: The order of properties here determines the order in the generated JSON.
    // We want standard claims (iss, sub, aud, jti) first, then iat/exp (added by sign), then the extension.
    // However, jose.SignJWT adds iat/exp at the end by default. 
    // To force the order, we'll rely on the fact that we can't easily control iat/exp position added by the library 
    // unless we add them manually. But the user just wants extension_tickets LAST.
    // Actually, jose library might respect the order if we pass them in.
    // Let's try adding iat/exp manually to control order, or just put the extension last in our object 
    // and hope the library appends iat/exp before it? No, library usually appends.
    // The user wants: iss, sub, aud, jti, iat, exp, extension_tickets.

    // To achieve this specific order with jose, we might need to construct the payload fully manually 
    // including iat/exp, and then sign it.

    const now = Math.floor(Date.now() / 1000);
    const assertionPayload: ClientAssertion = {
        iss: "https://app.client.id",
        sub: "https://app.client.id",
        aud: "https://network.org/token",
        jti: "assertion-jti-123",
        iat: now,
        exp: now + 300,
        "https://smarthealthit.org/permission_tickets": [signedTicket]
    };

    const trust_chain = [
        "eyJhbGciOiJFUzI1NiIs... (Signed Entity Statement for Client)",
        "eyJhbGciOiJFUzI1NiIs... (Signed Entity Statement for Intermediate)",
        "eyJhbGciOiJFUzI1NiIs... (Signed Entity Statement for Trust Anchor)"
    ];

    // Sign with a client key (using issuer key here for simplicity as it's just an example)
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

    const decoded = {
        header,
        payload,
        signature: parts[2]
    };

    const jsonPath = jwtPath.replace('.jwt', '.decoded.json');
    fs.writeFileSync(jsonPath, JSON.stringify(decoded, null, 2));
    console.log(`Saved decoded JSON: ${path.basename(jsonPath)}`);

    // Also generate static HTML viewer
    const template = fs.readFileSync(path.join(__dirname, '../input/includes/static-jwt-viewer.html'), 'utf-8');
    const html = template
        .replace('{{title}}', title)
        .replace('{{header-json}}', JSON.stringify(header, null, 2))
        .replace('{{payload-json}}', JSON.stringify(payload, null, 2))
        .replace('{{raw-jwt}}', jwt);

    const htmlPath = path.join(INCLUDES_DIR, path.basename(jwtPath).replace('.jwt', '.html'));
    fs.writeFileSync(htmlPath, html);
    console.log(`Saved static HTML: ${path.basename(htmlPath)}`);
}

generate().catch(console.error);
