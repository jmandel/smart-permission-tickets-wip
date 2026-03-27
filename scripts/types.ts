export interface PermissionTicket {
    iss: string;
    sub: string;          // Issuer-defined subject of the authorization grant (issuer-local, not a cross-party client identifier)
    aud: string | string[]; // Audience: recipient URL(s) or network / trust framework identifier
    exp: number;          // Expiration Timestamp
    ticket_type: string;  // Ticket type URI identifying the ticket schema and processing rules
    cnf?: {
        jkt: string; // JWK Thumbprint (RFC 7638) of the authorized client key
    };
    iat?: number;         // Issued-At Timestamp
    jti?: string;         // Unique Ticket ID
    revocation?: {
        url: string;      // CRL URL
        rid: string;      // Revocation ID
    };
    authorization: {
        subject: {
            type: "match" | "identifier" | "reference"; // Subject resolution mode
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
        access: {
            scopes?: string[];
            periods?: { start?: string; end?: string }[];
            jurisdictions?: FHIRAddress[];
            organizations?: FHIROrganization[];
        };
        requester?: {
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
    };
    details?: Record<string, any>; // Schema defined by ticket_type
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
    sub: string;          // Client ID (same as iss)
    aud: string;          // Token Endpoint URL
    jti: string;          // Unique Assertion ID
    iat?: number;         // Issued-At Timestamp
    exp?: number;         // Expiration Timestamp
}

export interface TokenExchangeRequest {
    grant_type: "urn:ietf:params:oauth:grant-type:token-exchange";
    subject_token: string;  // Signed Permission Ticket JWT
    subject_token_type: "https://smarthealthit.org/token-type/permission-ticket";
    scope?: string;         // Requested SMART scopes
    client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer";
    client_assertion: string; // Signed Client Assertion JWT
}
