import type * as fhir4 from "fhir/r4";

export type Uri = string;
export type NumericDate = number;
export type NonEmptyArray<T> = [T, ...T[]];
export type JwtAudience = Uri | NonEmptyArray<Uri>;

export type PermissionTicketType =
  | "https://smarthealthit.org/permission-ticket-type/patient-self-access-v1"
  | "https://smarthealthit.org/permission-ticket-type/patient-delegated-access-v1"
  | "https://smarthealthit.org/permission-ticket-type/public-health-investigation-v1"
  | "https://smarthealthit.org/permission-ticket-type/social-care-referral-v1"
  | "https://smarthealthit.org/permission-ticket-type/payer-claims-adjudication-v1"
  | "https://smarthealthit.org/permission-ticket-type/research-study-access-v1"
  | "https://smarthealthit.org/permission-ticket-type/provider-consult-v1"
  | "https://smarthealthit.org/permission-ticket-type/payer-quality-gap-v1";

export type TicketAudienceType = "data_holder_url" | "trust_framework";
export type FrameworkType = "well-known" | "udap" | "oidf";

export type FHIRCoding = fhir4.Coding;
export type FHIRCodeableConcept = fhir4.CodeableConcept;
export type FHIRIdentifier = fhir4.Identifier;
export type FHIRHumanName = fhir4.HumanName;
export type FHIRPeriod = fhir4.Period;
export type FHIRReference = fhir4.Reference;
export type FHIRAddress = Pick<fhir4.Address, "country" | "state">;

export type Subject = {
  patient: fhir4.Patient;
  recipient_record?: FHIRReference & { type?: "Patient" };
};

export type Requester =
  | fhir4.RelatedPerson
  | fhir4.Practitioner
  | fhir4.PractitionerRole
  | fhir4.Organization;

export type KeyBinding = {
  method: "jkt";
  jkt: string;
};

export type TrustFrameworkClientBinding = {
  method: "trust_framework_client";
  trust_framework: Uri;
  framework_type: FrameworkType;
  entity_uri: Uri;
};

export type PresenterBinding = KeyBinding | TrustFrameworkClientBinding;

export type EmbeddedIdentityEvidence = {
  source: "embedded";
  token_type: "id_token";
  jwt: string;
};

export type IdentityEvidence = EmbeddedIdentityEvidence;

export type Revocation = {
  url: Uri;
  index: number;
};

// A single SMART v2 scope string, e.g. "patient/Observation.rs" or
// "patient/Observation.rs?code=http://loinc.org|4548-4".
export type SmartScope = string;

export type JurisdictionFilter = {
  kind: "jurisdiction";
  address: FHIRAddress;
};

export type OrganizationFilter = {
  kind: "organization";
  organization: fhir4.Organization;
};

export type DataHolderFilter = JurisdictionFilter | OrganizationFilter;

export type AccessConstraintExtension = Record<string, unknown>;

export type AccessGrant = {
  smart_scopes: NonEmptyArray<SmartScope>;
  data_period?: FHIRPeriod;
  data_holder_filter?: NonEmptyArray<DataHolderFilter>;
  [constraint: string]: unknown;
};

export type ClaimLinkage = {
  claim: fhir4.Claim;
  encounter?: NonEmptyArray<FHIRReference>;
};

export type PayerClaimsAccess = {
  smart_scopes: NonEmptyArray<SmartScope>;
  claim_linkage: ClaimLinkage;
  [constraint: string]: unknown;
};

export type QualityGapAccess = {
  smart_scopes: NonEmptyArray<SmartScope>;
  data_period: FHIRPeriod;
  [constraint: string]: unknown;
};

export type PermissionTicketBase = {
  iss: Uri;
  aud: JwtAudience;
  aud_type?: TicketAudienceType;
  exp: NumericDate;
  iat: NumericDate;
  jti: string;
  ticket_type: PermissionTicketType;
  presenter_binding?: PresenterBinding;
  subject_identity_evidence?: IdentityEvidence;
  requester_identity_evidence?: IdentityEvidence;
  revocation?: Revocation;
  subject: Subject;
  requester?: Requester;
  access: AccessGrant;
};

export type PatientSelfAccessTicket = PermissionTicketBase & {
  ticket_type: "https://smarthealthit.org/permission-ticket-type/patient-self-access-v1";
  requester?: never;
};

export type PatientDelegatedAccessTicket = PermissionTicketBase & {
  ticket_type: "https://smarthealthit.org/permission-ticket-type/patient-delegated-access-v1";
  requester: fhir4.RelatedPerson;
};

export type PublicHealthTicket = PermissionTicketBase & {
  ticket_type: "https://smarthealthit.org/permission-ticket-type/public-health-investigation-v1";
  requester: fhir4.Organization;
  reportable_condition: FHIRCodeableConcept;
};

export type SocialCareReferralTicket = PermissionTicketBase & {
  ticket_type: "https://smarthealthit.org/permission-ticket-type/social-care-referral-v1";
  requester: fhir4.Organization;
  concern: FHIRCodeableConcept;
  referral: fhir4.ServiceRequest;
};

export type PayerClaimsTicket = PermissionTicketBase & {
  ticket_type: "https://smarthealthit.org/permission-ticket-type/payer-claims-adjudication-v1";
  requester: fhir4.Organization;
  access: PayerClaimsAccess;
};

export type ResearchStudyTicket = PermissionTicketBase & {
  ticket_type: "https://smarthealthit.org/permission-ticket-type/research-study-access-v1";
  requester: fhir4.Organization;
  study: fhir4.ResearchStudy;
};

export type ProviderConsultTicket = PermissionTicketBase & {
  ticket_type: "https://smarthealthit.org/permission-ticket-type/provider-consult-v1";
  requester: fhir4.PractitionerRole;
  reason: FHIRCodeableConcept;
  consult_request: fhir4.ServiceRequest;
};

export type PayerQualityGapTicket = PermissionTicketBase & {
  ticket_type: "https://smarthealthit.org/permission-ticket-type/payer-quality-gap-v1";
  requester: fhir4.Organization;
  measure: FHIRCodeableConcept;
  access: QualityGapAccess;
};

export type PermissionTicket =
  | PatientSelfAccessTicket
  | PatientDelegatedAccessTicket
  | PublicHealthTicket
  | SocialCareReferralTicket
  | PayerClaimsTicket
  | ResearchStudyTicket
  | ProviderConsultTicket
  | PayerQualityGapTicket;

export type ClientAssertion = {
  iss: string;
  sub: string;
  aud: string;
  jti: string;
  iat?: NumericDate;
  exp?: NumericDate;
};

export type TokenExchangeRequest = {
  grant_type: "urn:ietf:params:oauth:grant-type:token-exchange";
  subject_token: string;
  subject_token_type: "https://smarthealthit.org/token-type/permission-ticket";
  scope?: string;
  client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer";
  client_assertion: string;
};
