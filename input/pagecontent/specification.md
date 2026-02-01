## Technical Specification

### A. Transport: SMART Backend Services Profile
This architecture is a strict profile of **[SMART Backend Services](https://build.fhir.org/ig/HL7/smart-app-launch/backend-services.html)** (which itself profiles **RFC 7523**).

The key difference is the payload of the `client_assertion`. In standard SMART Backend Services, the assertion proves the client's identity. In this architecture, the assertion **also carries the Permission Tickets** in a dedicated `https://smarthealthit.org/permission_tickets` claim.

**The Request:**
```http
POST /token HTTP/1.1
Host: fhir.hospital.com
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
&client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer
&client_assertion=eyJhbGciOiJ... (Signed JWT containing tickets)
&scope=system/Patient.r
```

### B. Server-Side Validation
The Data Holder must perform a two-layer validation:

1.  **Layer 1: Client Authentication (Standard SMART)**
    *   Verify the `client_assertion` signature using the Client's registered public key (JWK).
    *   Ensure the client is registered and active.

2.  **Layer 2: Ticket Validation (Permission Ticket Specific)**
    *   Extract the `https://smarthealthit.org/permission_tickets` array from the assertion.
    *   For each ticket:
        *   **Verify Signature:** Use the `iss` (Trust Broker) public key.
        *   **Verify Trust:** Is this `iss` in the Data Holder's trusted list?
        *   **Verify Binding:** Does `ticket.sub` match `assertion.sub` (Client ID)?
    *   **Grant Access:** If valid, grant the requested scopes *constrained* by the ticket's `ticket_context.capability` rules.

For detailed algorithms and TypeScript definitions, see the [Developer Documentation](developer.html).

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
    "subject": { "resourceType": "Patient", ... },

    // WHO is requesting it? (Uses FHIR Practitioner/Role/Org shapes)
    // Optional: If missing, implies the App Client is the sole actor.
    "actor": { "resourceType": "PractitionerRole", ... },

    // WHY is this allowed? (Trigger Context)
    "context": { 
      "type": { "system": "http://terminology.hl7.org/CodeSystem/v3-ActReason", "code": "REFER" },
      "focus": { "system": "http://snomed.info/sct", "code": "49436004", "display": "Atrial fibrillation" },
      "identifier": [
        { "system": "https://issuer.org/cases", "value": "CASE-123" }
      ]
    },

    // WHAT data is allowed?
    "capability": { "scopes": ["patient/Immunization.read", "patient/Condition.read"] }
  }
}
```

See the [Logical Model](StructureDefinition-PermissionTicket.html) for formal definitions.

### C. Access Calculation

The Data Holder calculates granted access through the **intersection** of:

1. **Requested Scopes**: The `scope` parameter in the token request
2. **Ticket Capability**: Constraints from `ticket_context.capability`
3. **Client Registration**: Scopes the client is permitted to request

If the intersection yields no valid access, return `invalid_scope` error.

#### Capability Constraints

The `capability` object defines what access the ticket authorizes:

| Field | Type | Description |
|-------|------|-------------|
| `scopes` | string[] | SMART scopes (e.g., `patient/*.read`). Wildcard scopes expand to match specific requests. |
| `periods` | Period[] | Time restrictions. Data Holder SHOULD filter results to resources with relevant dates within these periods. |
| `locations` | Address[] | Jurisdictional restrictions at **state granularity**. If present, Data Holder SHOULD limit results to data from matching jurisdictions. |
| `organizations` | Organization[] | Source restrictions. If present, Data Holder SHOULD limit results to data from matching organizations (by identifier or name). |

**Constraint Semantics:**
- All present constraints are **conjunctive** (AND): data must satisfy all constraints
- Empty or absent constraint means "no restriction" for that dimension
- Data Holders that cannot enforce a constraint MUST reject the ticket with `invalid_grant` and `error_description` indicating the unsupported constraint

**Example Capability:**
```json
{
  "capability": {
    "scopes": ["patient/Condition.read", "patient/Procedure.read"],
    "periods": [{ "start": "2023-01-01", "end": "2024-12-31" }],
    "locations": [{ "state": "CA" }, { "state": "NY" }],
    "organizations": [{ "identifier": [{ "system": "http://hl7.org/fhir/sid/us-npi", "value": "1234567890" }] }]
  }
}
```
This ticket authorizes read access to Conditions and Procedures, but only for data:
- With dates in 2023-2024
- From California or New York
- From the organization with NPI 1234567890

### D. Multiple Tickets

A client MAY present multiple tickets in the `permission_tickets` array to compose authorization from multiple sources.

#### Use Case Profiles

Multi-ticket scenarios are defined by **use case profiles**. Each profile specifies:
- The expected set of tickets (by issuer type or purpose)
- How tickets are evaluated jointly
- Which ticket provides which claims (subject, actor, capability, etc.)

This specification does not define generic combination semantics. Instead, trust frameworks and implementation guides define specific profiles for their use cases.

#### Example Profiles

**Profile: Identity + Designated Representative**

Two tickets are required:
1. **Identity Ticket** (from Identity Provider): Contains verified `actor` identity
2. **Authorization Ticket** (from Trust Broker): Contains `subject`, `capability`, and a reference linking to the actor

```
Ticket 1 (Identity Provider - e.g., Clear):
{
  "iss": "https://clear.me",
  "sub": "https://health-app.example.com",
  "ticket_context": {
    "actor": {
      "resourceType": "RelatedPerson",
      "identifier": [{ "system": "https://clear.me/id", "value": "CLR-789" }],
      "name": [{ "family": "Smith", "given": ["Jane"] }]
    }
  }
}

Ticket 2 (Trust Broker):
{
  "iss": "https://trust-broker.org",
  "sub": "https://health-app.example.com",
  "ticket_context": {
    "subject": { "type": "match", "traits": { ... } },
    "context": {
      "type": { "code": "DPOA" },
      "actor_reference": "https://clear.me/id|CLR-789"
    },
    "capability": { "scopes": ["patient/*.read"] }
  }
}
```

The Data Holder, implementing this profile:
1. Validates both tickets independently
2. Confirms the `actor_reference` in Ticket 2 matches the `actor.identifier` in Ticket 1
3. Uses actor from Ticket 1, subject and capability from Ticket 2

**Profile: Base + Sensitive Category**

A network-level ticket provides baseline access; an additional ticket from a specialized authority grants access to sensitive categories (e.g., behavioral health, substance use).

#### Common Rules

Regardless of profile, these rules always apply:
- All tickets MUST have identical `sub` (bound to the same client)
- All tickets MUST be valid for the Data Holder (per audience rules)
- All issuers MUST be trusted by the Data Holder

### E. Audience (`aud`) Validation

The `aud` claim specifies where the ticket is valid. Two modes are supported:

#### Mode 1: Enumerated Recipients

The `aud` is a specific URL or array of URLs:

```json
{ "aud": "https://fhir.hospital.com" }
// or
{ "aud": ["https://fhir.hospital-a.com", "https://fhir.hospital-b.com"] }
```

**Validation:** The Data Holder's base URL MUST exactly match one of the enumerated values.

#### Mode 2: Trust Framework

The `aud` references a trust framework identifier:

```json
{ "aud": "https://tefca.hhs.gov" }
```

**Validation:** The Data Holder MUST be a verified participant in the referenced trust framework. Verification mechanisms are trust-framework-specific (e.g., the Data Holder's Entity ID appears in the framework's federation).

#### Recommendations

| Scenario | Recommended `aud` |
|----------|-------------------|
| Ticket for known single recipient | Specific Data Holder URL |
| Ticket valid across a network | Trust framework identifier |
| Ticket for multiple known recipients | Array of Data Holder URLs |

Data Holders MUST reject tickets where `aud` validation fails with error `invalid_grant` and `error_description`: "Ticket audience mismatch".
