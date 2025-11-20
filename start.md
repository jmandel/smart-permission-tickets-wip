# The Permission Ticket Architecture
**Enabling Granular, Context-Aware Authorization in Health Networks**

## 1. Executive Summary

Current interoperability standards (SMART on FHIR, TEFCA) face a "granularity gap." Authorization flows effectively force a choice between two extremes:
1.  **User-Centric friction:** Relying on patients to manually log in to **N** different portals to authorize a single app.
2.  **System-Centric rigidity:** Relying on backend configurations where trusted nodes get broad, "super-user" access because defining granular rules per-patient is administratively impossible.

**Permission Tickets** solve this by introducing a **Capability-Based Access Control** model to OAuth. Instead of the Data Holder asking, "Who are you and what is your pre-configured role?", it asks, "What proof do you hold that authorizes this specific request?"

A Permission Ticket is a portable, cryptographically signed artifact. It uses standard **FHIR Resources** as data models to describe the *Subject* (Patient), the *Actor* (Requesting Agent), and the *Context* (Trigger Event), enabling precise access control without requiring realtime user interaction at the data source.

---

## 2. The Problem Space

### A. The "N Portals" Bottleneck (Consumer Access)
In standard SMART flows, if a patient wants to aggregate their data from five different hospitals into a personal health app, they must locate five different portals, remember five usernames/passwords, and click "Approve" five times. This friction destroys adoption. Furthermore, the scopes are coarse; a user can usually only say "Yes" to everything or "No" to everything.

### B. The "All-or-Nothing" Network (Backend Services)
In B2B flows (like TEFCA Treatment or Payer exchange), Client Apps authenticate via certificates. Because it is too hard to configure specific permissions for every patient and every external partner, Data Holders often default to binary trust: if the partner is a "Trusted Node," they get access to the firehose. This is unacceptable for sensitive use cases like Research, Public Health, or Social Care.

---

## 3. The Solution: Permission Tickets

A **Permission Ticket** is a JWT minted by a Trusted Issuer. It acts as a self-contained authorization grant.

### Core Principles
1.  **Issuer-Signed:** The ticket is minted by an entity the Data Holder trusts (e.g., a Trust Broker, an Identity Verifier, or the Data Holder itself).
2.  **Client-Bound:** The ticket is cryptographically bound to the Client ID of the requesting application.
3.  **FHIR-Native:** The payload uses strict FHIR Resource structures (`Patient`, `PractitionerRole`, `Organization`) to define identities, making integration with existing EHR logic seamless.
4.  **Zero-Interaction:** The Data Holder validates the ticket signature and grants access immediately. No user login page is presented.

---

## 4. Technical Specification

### A. Transport: The "Ticket-Carrying" Assertion
We use **RFC 7523 (OAuth 2.0 Client Authentication)**. The client embeds the tickets inside the JWT used to authenticate to the token endpoint.

**The Request:**
```http
POST /token HTTP/1.1
Host: fhir.hospital.com
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
&client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer
&client_assertion=eyJhbGciOiJ... (Signed JWT containing tickets)
```

### B. The Artifact: Ticket Structure
The ticket payload wraps standard FHIR JSON objects.

```javascript
{
  "iss": "https://trust-broker.org",  // Who vouches for this?
  "sub": "https://app.client.id",     // Which App can use this?
  "aud": "https://network.org",       // Where is it valid?
  "exp": 1710000000,
  
  "ticket_context": {
    // WHO is the data about? (Uses FHIR Patient shape)
    "subject": { "resourceType": "Patient", ... }, // Patient can be matched traits or direct reference

    // WHO is requesting it? (Uses FHIR Practitioner/Role/Org shapes)
    // Optional: If missing, implies the App Client is the sole actor.
    "actor": { "resourceType": "PractitionerRole", ... },

    // WHY is this allowed? (Trigger Context)
    "context": { 
      "type": { "system": "http://terminology.hl7.org/CodeSystem/v3-ActReason", "code": "REFER" },
      "focus": { "system": "http://snomed.info/sct", "code": "49436004", "display": "Atrial fibrillation" },
      "identifier": [ { "system": "https://issuer.org/cases", "value": "CASE-123" } ]
    },

    // WHAT data is allowed?
    "capability": { "scopes": ["patient/Immunization.read", "patient/Condition.read"] }
  }
}
```

---

## 5. Detailed Use Case Catalog

Here are seven scenarios demonstrating how FHIR resources are used to model diverse authorization needs.

### Use Case 1: Network-Mediated Patient Access
*A patient uses a high-assurance Digital ID wallet to authorize an app to fetch their data from multiple hospitals.*

*   **Subject:** The Patient (Matched by Demographics).
*   **Actor:** (Implicitly the App/Patient).
*   **Constraint:** Granular scope (Immunizations only).

```json
// Ticket Payload
{
  "ticket_context": {
    "subject": {
      "type": "match",
      "traits": {
        "resourceType": "Patient",
        "name": [{ "family": "Smith", "given": ["John"] }],
        "birthDate": "1980-01-01",
        "identifier": [{ 
          "system": "urn:oid:2.16.840.1.113883.4.1", 
          "value": "000-00-0000" 
        }]
      }
    },
    "capability": {
      "scopes": ["patient/Immunization.read", "patient/AllergyIntolerance.read"]
    }
  }
}
```

### Use Case 2: Authorized Representative (Proxy)
*An adult daughter accesses her elderly mother's records. The relationship is verified by a Trust Broker, not the Hospital.*

*   **Subject:** The Mother (`Patient`).
*   **Actor:** The Daughter (`RelatedPerson`).

```json
// Ticket Payload
{
  "ticket_context": {
    "subject": {
      "resourceType": "Patient",
      "identifier": [{ "system": "https://national-mpi.net", "value": "pt-555" }]
    },
    "actor": {
      "resourceType": "RelatedPerson",
      "name": [{ "family": "Doe", "given": ["Jane"] }],
      "telecom": [{ "system": "email", "value": "jane.doe@example.com" }],
      "relationship": [{
        "coding": [{ 
          "system": "http://terminology.hl7.org/CodeSystem/v3-RoleCode", 
          "code": "DAU", 
          "display": "Daughter"
        }]
      }]
    },
    "capability": { "scopes": ["patient/*.read", "patient/*.search"] }
  }
}
```

### Use Case 3: Public Health Investigation
*A Hospital creates a Case Report. The Public Health Agency (PHA) uses the report as a ticket to query for follow-up data.*

*   **Subject:** The Patient.
*   **Actor:** The Public Health Agency (`Organization`).
*   **Context:** The specific Case ID.

```json
// Ticket Payload
{
  "ticket_context": {
    "subject": {
      "resourceType": "Patient",
      "id": "local-patient-123" // Hospital knows its own ID
    },
    "actor": {
      "resourceType": "Organization",
      "name": "State Dept of Health",
      "identifier": [{ "system": "urn:ietf:rfc:3986", "value": "https://doh.state.gov" }],
      "type": [{ "coding": [{ "system": "http://terminology.hl7.org/CodeSystem/organization-type", "code": "govt" }] }]
    },
    "context": {
      "type": { "system": "http://terminology.hl7.org/CodeSystem/v3-ActReason", "code": "PUBHLTH", "display": "Public Health" },
      "focus": { "system": "http://snomed.info/sct", "code": "56717001", "display": "Tuberculosis" },
      "identifier": [{ "system": "https://doh.wa.gov/cases", "value": "CASE-2024-999" }]
    },
    "capability": {
      "scopes": ["patient/*.read"],
      "periods": [{ "start": "2025-01-01", "end": "2026-01-01" }]
    }
  }
}
```

### Use Case 4: Social Care (CBO) Referral
*A transactional/ad-hoc user. A Food Bank volunteer needs to update a referral status. She does not have an NPI or a user account.*

*   **Subject:** The Patient.
*   **Actor:** A Volunteer (`PractitionerRole`) with identity embedded via **FHIR `contained`**.

```json
// Ticket Payload
{
  "ticket_context": {
    "subject": { "resourceType": "Patient", "reference": "Patient/123" },
    "actor": {
      "resourceType": "PractitionerRole",
      "contained": [
        {
          "resourceType": "Practitioner",
          "id": "p1",
          "name": [{ "family": "Volunteer", "given": ["Alice"] }],
          "telecom": [{ "system": "email", "value": "alice@foodbank.org" }]
        },
        {
          "resourceType": "Organization",
          "id": "o1",
          "name": "Downtown Food Bank"
        }
      ],
      "practitioner": { "reference": "#p1" },
      "organization": { "reference": "#o1" }
    },
    "context": {
      "type": { "system": "http://terminology.hl7.org/CodeSystem/v3-ActReason", "code": "REFER", "display": "Referral" },
      "focus": { "system": "http://snomed.info/sct", "code": "733423003", "display": "Food insecurity" },
      "identifier": [{ "system": "https://referring-ehr.org/referrals", "value": "REF-555" }]
    },
    "capability": {
      "scopes": ["patient/ServiceRequest.read", "patient/ServiceRequest.write", "patient/Task.read", "patient/Task.write"]
    }
  }
}
```

### Use Case 5: Payer Claims Adjudication
*A Payer requests clinical documents to support a specific claim.*

*   **Actor:** The Payer (`Organization`).
*   **Context:** The Claim ID.

```json
// Ticket Payload
{
  "ticket_context": {
    "subject": { "resourceType": "Patient", "reference": "Patient/456" },
    "actor": {
      "resourceType": "Organization",
      "identifier": [{ "system": "http://hl7.org/fhir/sid/us-npi", "value": "9876543210" }], // Payer NPI
      "name": "Blue Payer Inc"
    },
    "context": {
      "type": { "system": "http://terminology.hl7.org/CodeSystem/v3-ActReason", "code": "CLMATTCH", "display": "Claim Attachment" },
      "focus": { "system": "http://snomed.info/sct", "code": "80146002", "display": "Appendectomy" },
      "identifier": [{ "system": "http://provider.com/claims", "value": "CLAIM-2024-XYZ" }]
    },
    "capability": {
      "scopes": ["patient/DocumentReference.read", "patient/Procedure.read"]
    }
  }
}
```

### Use Case 6: Research Study
*A patient consents to a study. The ticket proves consent exists without requiring the researcher to be a "user" at the hospital.*

*   **Actor:** The Research Institute (`Organization`).
*   **Context:** Research Study + Consent Evidence.

```json
// Ticket Payload
{
  "ticket_context": {
    "subject": { "resourceType": "Patient", "identifier": [{ "value": "MRN-123" }] },
    "actor": {
      "resourceType": "Organization",
      "name": "Oncology Research Institute",
      "identifier": [{ "value": "research-org-id" }]
    },
    "context": {
      "type": { "system": "http://terminology.hl7.org/CodeSystem/v3-ActReason", "code": "RESCH", "display": "Biomedical Research" },
      "focus": { "system": "http://snomed.info/sct", "code": "363358000", "display": "Malignant tumor of lung" },
      "identifier": [{ "system": "https://consent-service.org/studies", "value": "STUDY-PROTO-22" }]
    },
    "capability": {
      "scopes": ["patient/*.read"],
      "periods": [{ "start": "2020-01-01", "end": "2025-01-01" }]
    }
  }
}
```

### Use Case 7: Provider-to-Provider Consult
*A Specialist (Practitioner) requests data from a Referring Provider.*

*   **Actor:** The Specialist (`Practitioner`).

```json
// Ticket Payload
{
  "ticket_context": {
    "subject": { "resourceType": "Patient", "reference": "Patient/999" },
    "actor": {
      "resourceType": "Practitioner",
      "identifier": [{ "system": "http://hl7.org/fhir/sid/us-npi", "value": "1112223333" }], // Specialist NPI
      "name": [{ "family": "Heart", "given": ["A."] }]
    },
    "context": {
      "type": { "system": "http://terminology.hl7.org/CodeSystem/v3-ActReason", "code": "REFER", "display": "Referral" },
      "focus": { "system": "http://snomed.info/sct", "code": "49436004", "display": "Atrial fibrillation" },
      "identifier": [{ "system": "https://referring-ehr.org/requests", "value": "ref-req-111" }]
    },
    "capability": { "scopes": ["patient/*.read"] }
  }
}
```

---

## 6. Operational Roles

To make this work, we rely on **OIDC Federation** principles.

1.  **Trust Broker / Identity Issuer:**
    *   Responsible for verifying the "Trigger" (e.g., checking the User's ID, verifying the Legal Guardian relationship).
    *   Mints the ticket.
    *   *Examples:* TEFCA QHIN, State HIE, Specialized Credential Service Provider (CSP).

2.  **The Ticket Holder (Client App):**
    *   The entity that wants data.
    *   Must have a registered Client ID (public key) in the federation.
    *   Stores the ticket and presents it when calling the Data Holder.

3.  **The Data Holder (Server):**
    *   Receives the request.
    *   **Verifies:**
        *   Is the Issuer trusted?
        *   Is the Ticket bound to this Client?
    *   **Logs:** Writes the specific `actor` from the ticket (e.g., "Alice @ FoodBank") into the Audit Log.
    *   **Enforces:** Limits the Access Token scopes based on the `capability` block.

## 7. Relationship to FHIR Standards

*   **We DO use FHIR Data Models:** The ticket payload uses `Patient`, `Practitioner`, `Identifier`, and `Coding` structures. This ensures that when a hospital parses a ticket, the data maps 1:1 to their internal systems.
*   **The ticket is not itself a FHIR Resource instance:** Instead of sending a raw `Consent` or `Permission` resource, the ticket is a transient, lightweight **capability** carried in JWT claims for high-speed OAuth processing.
*   **Context identifiers live in the issuer's namespace:** When a provider issues a ticket to public health, the identifier(s) in `ticket_context.context.identifier` are the provider's own case/referral IDs so the recipient can query back with that local handle.
