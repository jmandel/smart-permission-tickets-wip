# Developer Documentation

This guide provides technical details for developers implementing the Permission Ticket Architecture, including strict schema definitions, signing algorithms, and validation logic.

## TypeScript Interfaces

The following TypeScript interfaces define the structure of the Permission Ticket and the Client Assertion. These can be used for strict type checking in your implementation.

```typescript
export interface PermissionTicket {
    iss: string;          // Issuer URL (Trust Broker)
    sub: string;          // Client ID (App)
    aud: string;          // Audience (Network/Data Holder)
    exp?: number;         // Expiration Timestamp
    jti?: string;         // Unique Ticket ID
    ticket_context: {
        subject: {
            type?: "match" | "reference"; 
            resourceType?: string; 
            id?: string; 
            identifier?: any[]; 
            traits?: {
                resourceType: "Patient";
                name?: { family?: string; given?: string[] }[];
                birthDate?: string;
                identifier?: any[];
                [key: string]: any;
            };
            reference?: string;
        };
        actor?: {
            resourceType: "PractitionerRole" | "RelatedPerson" | "Organization" | "Practitioner";
            name?: any;
            identifier?: any[];
            telecom?: any[];
            type?: any[];
            relationship?: any[];
            contained?: any[];
            practitioner?: { reference: string };
            organization?: { reference: string };
        };
        context?: {
            type: {
                system?: string;
                code?: string;
                display?: string;
            };
            focus?: {
                system?: string;
                code?: string;
                display?: string;
            };
            identifier?: {
                system?: string;
                value: string;
            }[];
        };
        capability: {
            scopes?: string[];
            periods?: {
                start?: string;
                end?: string;
            }[];
            locations?: FHIRAddress[];
            organizations?: FHIROrganization[];
        };
    };
}

export interface FHIRAddress {
    use?: string;
    type?: string;
    text?: string;
    line?: string[];
    city?: string;
    district?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    period?: { start?: string; end?: string };
    [key: string]: any;
}

export interface FHIROrganization {
    resourceType: "Organization";
    identifier?: any[];
    name?: string;
    [key: string]: any;
}

export interface ClientAssertion {
    iss: string;          // Client ID
    sub: string;          // Client ID
    aud: string;          // Token Endpoint URL
    jti: string;          // Unique Assertion ID
    iat?: number;         // Issued-at Timestamp
    exp?: number;         // Expiration Timestamp
    "https://smarthealthit.org/permission_tickets": string[]; // Array of Signed Ticket Strings
}
```

## Signing and Validation

### Signing Algorithm
*   **Algorithm:** ES256 (ECDSA using P-256 and SHA-256) is RECOMMENDED. RS256 is also supported.
*   **Keys:**
    *   **Issuer:** Signs the `PermissionTicket`. Public keys must be exposed via a JWK Set URL (e.g., `https://trust-broker.org/.well-known/jwks.json`).
    *   **Client:** Signs the `ClientAssertion`. Public keys must be registered with the Data Holder or exposed via JWKS.

### Server-Side Validation Steps
When a Data Holder receives a token request with a `client_assertion`, it must perform the following checks:

1.  **Validate Client Assertion:**
    *   Verify the signature using the Client's public key.
    *   Check `iss` == `sub` == Client ID.
    *   Check `aud` matches the Token Endpoint URL.
    *   Check `exp` is in the future.

2.  **Extract Tickets:**
    *   Parse the `https://smarthealthit.org/permission_tickets` array.

3.  **Validate Each Ticket:**
    *   **Signature:** Verify the signature using the Issuer's public key (fetched from `iss` JWKS).
    *   **Trust:** Verify the `iss` is a trusted Trust Broker.
    *   **Binding:** Verify `sub` matches the Client ID from the Client Assertion.
    *   **Expiration:** Check `exp` is in the future.

4.  **Enforce Permissions:**
    *   Map `ticket_context.capability` to OAuth Scopes.
    *   Log `ticket_context.actor` and `ticket_context.context` for audit purposes.
    *   Issue an Access Token with the calculated scopes.

## Error Responses

When ticket validation fails, the Data Holder MUST return an OAuth 2.0 error response per RFC 6749.

| Scenario | `error` | `error_description` |
|----------|---------|---------------------|
| No tickets in assertion | `invalid_request` | "No permission tickets provided" |
| Malformed ticket (not valid JWT) | `invalid_grant` | "Malformed permission ticket" |
| Ticket signature invalid | `invalid_grant` | "Ticket signature verification failed" |
| Issuer not trusted | `invalid_grant` | "Ticket issuer not trusted: {iss}" |
| Issuer JWKS unavailable | `invalid_grant` | "Unable to retrieve issuer keys" |
| Ticket expired | `invalid_grant` | "Ticket expired" |
| `sub` mismatch | `invalid_grant` | "Ticket not bound to this client" |
| `aud` mismatch | `invalid_grant` | "Ticket not valid for this server" |
| Subject not resolvable | `invalid_grant` | "Unable to resolve ticket subject" |
| Ticket revoked | `invalid_grant` | "Ticket has been revoked" |
| Unsupported constraint | `invalid_grant` | "Unsupported capability constraint: {field}" |
| No valid scopes after intersection | `invalid_scope` | "No authorized scopes" |
| Multi-ticket profile violation | `invalid_grant` | "Tickets do not satisfy use case profile" |

**Response Format:**
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "error": "invalid_grant",
  "error_description": "Ticket issuer not trusted: https://unknown.example.com"
}
```
