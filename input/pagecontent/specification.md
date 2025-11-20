## Technical Specification

### A. Transport: SMART Backend Services Profile
This architecture is a strict profile of **[SMART Backend Services](https://build.fhir.org/ig/HL7/smart-app-launch/backend-services.html)** (which itself profiles **RFC 7523**).

The key difference is the payload of the `client_assertion`. In standard SMART Backend Services, the assertion proves the client's identity. In this architecture, the assertion **also carries the Permission Tickets** as an extension claim.

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
    *   Extract the `https://smarthealthit.org/extension_tickets` array from the assertion.
    *   For each ticket:
        *   **Verify Signature:** Use the `iss` (Trust Broker) public key.
        *   **Verify Trust:** Is this `iss` in the Data Holder's trusted list?
        *   **Verify Binding:** Does `ticket.sub` match `assertion.sub` (Client ID)?
    *   **Grant Access:** If valid, grant the requested scopes *constrained* by the ticket's `capability` rules.

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

See the [Logical Model](StructureDefinition-permission-ticket.html) for formal definitions.
