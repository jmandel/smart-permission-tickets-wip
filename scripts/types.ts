export interface PermissionTicket {
    iss: string;
    sub: string;          // Issuer-defined subject of the authorization grant (issuer-local, not a cross-party client identifier)
    aud: string | string[]; // Audience: recipient URL(s) or network / trust framework identifier
    exp: number;          // Expiration Timestamp
    ticket_type: string;  // Ticket type URI identifying the ticket schema and processing rules
    cnf: {
        jkt: string; // JWK Thumbprint (RFC 7638) of the authorized client key
    };
    iat?: number;         // Issued-At Timestamp
    jti?: string;         // Unique Ticket ID
    revocation?: {
        url: string;      // CRL URL
        rid: string;      // Revocation ID
    };
    ticket_context: {
        subject: {
            type: "match" | "identifier" | "reference"; // Subject resolution mode
            resourceType?: string; // Resource Type (e.g. Patient)
            id?: string; // Local resource ID
            identifier?: any[]; // Business identifier(s)
            traits?: {
                resourceType: "Patient";
                name?: { family?: string; given?: string[] }[];
                birthDate?: string;
                identifier?: any[];
                [key: string]: any;
            };
            reference?: string; // Local resource reference (e.g. Patient/123)
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
            identifier?: any[]; // Issuer-specific identifiers (Case ID, etc)
        };
        capability: {
            scopes?: string[];
            periods?: {
                start?: string;
                end?: string;
            }[];
            jurisdictions?: FHIRAddress[];
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
    iss: string;
    sub: string;
    aud: string;
    jti: string;
    iat?: number;
    exp?: number;
    permission_ticket_profile?: string; // Required for multi-ticket; optional for single-ticket
    permission_tickets: string[]; // Array of signed ticket strings
}
