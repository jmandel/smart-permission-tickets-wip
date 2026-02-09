export interface PermissionTicket {
    iss: string;
    sub: string;          // Issuer-defined ticket subject (profile-specific)
    aud: string;          // Network / trust framework audience
    exp: number;          // Expiration Timestamp
    ticket_type?: string;  // Ticket type URI (required for multi-ticket profiles; optional for single-ticket profiles)
    client_binding: {
        jwks_uri?: string; // Exactly one of jwks_uri or jwks
        jwks?: { keys: any[] };
    };
    iat?: number;         // Issued-At Timestamp
    jti?: string;         // Unique Ticket ID
    ticket_context: {
        subject: {
            type?: "match" | "reference"; // Made optional as some use cases just have resourceType
            resourceType?: string; // Added for direct resource type usage
            id?: string; // Added for direct ID usage
            identifier?: any[]; // Added for identifier usage
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
            identifier?: any[]; // Issuer-specific identifiers (Case ID, etc)
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
    iss: string;
    sub: string;
    aud: string;
    jti: string;
    iat?: number;
    exp?: number;
    permission_ticket_profile: string; // Primary processing selector
    permission_tickets: string[]; // Array of signed ticket strings
}
