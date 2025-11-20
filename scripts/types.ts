export interface PermissionTicket {
    iss: string;
    sub: string;
    aud: string;
    exp?: number;         // Expiration Timestamp
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
            [key: string]: any; // Allow other FHIR Patient properties
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
            [key: string]: any; // Allow other FHIR properties
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
    "https://smarthealthit.org/permission_tickets": string[]; // Array of Signed Ticket Strings
}
