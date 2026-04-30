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
  | "https://smarthealthit.org/permission-ticket-type/provider-consult-v1";

export type RestInteraction =
  | "read"
  | "search"
  | "history"
  | "create"
  | "update"
  | "patch"
  | "delete";

export type SensitiveDataPolicy = "exclude" | "include";
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

export type DataPermission = {
  kind: "data";
  resource_type: string;
  interactions: NonEmptyArray<RestInteraction>;
  category_any_of?: NonEmptyArray<FHIRCoding>;
  code_any_of?: NonEmptyArray<FHIRCoding>;
};

export type OperationPermission = {
  kind: "operation";
  name: string;
  target?: FHIRReference;
};

export type PermissionRule = DataPermission | OperationPermission;

export type JurisdictionFilter = {
  kind: "jurisdiction";
  address: FHIRAddress;
};

export type OrganizationFilter = {
  kind: "organization";
  organization: fhir4.Organization;
};

export type DataHolderFilter = JurisdictionFilter | OrganizationFilter;

export type AccessGrant = {
  permissions: NonEmptyArray<PermissionRule>;
  data_period?: FHIRPeriod;
  data_holder_filter?: NonEmptyArray<DataHolderFilter>;
  sensitive_data?: SensitiveDataPolicy;
};

export type PatientAccessContext = Record<string, never>;

export type PublicHealthContext = {
  reportable_condition: FHIRCodeableConcept;
};

export type SocialCareReferralContext = {
  concern: FHIRCodeableConcept;
  referral: fhir4.ServiceRequest;
};

export type PayerClaimsContext = {
  service: FHIRCodeableConcept;
  claim: fhir4.Claim;
};

export type ResearchContext = {
  study: fhir4.ResearchStudy;
};

export type ProviderConsultContext = {
  reason: FHIRCodeableConcept;
  consult_request: fhir4.ServiceRequest;
};

export type TicketContext =
  | PatientAccessContext
  | PublicHealthContext
  | SocialCareReferralContext
  | PayerClaimsContext
  | ResearchContext
  | ProviderConsultContext;

export type PermissionTicketBase = {
  iss: Uri;
  aud: JwtAudience;
  aud_type?: TicketAudienceType;
  exp: NumericDate;
  iat?: NumericDate;
  jti: string;
  ticket_type: PermissionTicketType;
  presenter_binding?: PresenterBinding;
  subject_identity_evidence?: IdentityEvidence;
  requester_identity_evidence?: IdentityEvidence;
  revocation?: Revocation;
  must_understand?: NonEmptyArray<string>;
  subject: Subject;
  requester?: Requester;
  access: AccessGrant;
  context?: TicketContext;
};

export type PatientSelfAccessTicket = PermissionTicketBase & {
  ticket_type: "https://smarthealthit.org/permission-ticket-type/patient-self-access-v1";
  requester?: never;
  context?: PatientAccessContext;
};

export type PatientDelegatedAccessTicket = PermissionTicketBase & {
  ticket_type: "https://smarthealthit.org/permission-ticket-type/patient-delegated-access-v1";
  requester: fhir4.RelatedPerson;
  context?: PatientAccessContext;
};

export type PublicHealthTicket = PermissionTicketBase & {
  ticket_type: "https://smarthealthit.org/permission-ticket-type/public-health-investigation-v1";
  requester: fhir4.Organization;
  context: PublicHealthContext;
};

export type SocialCareReferralTicket = PermissionTicketBase & {
  ticket_type: "https://smarthealthit.org/permission-ticket-type/social-care-referral-v1";
  requester: fhir4.Organization;
  context: SocialCareReferralContext;
};

export type PayerClaimsTicket = PermissionTicketBase & {
  ticket_type: "https://smarthealthit.org/permission-ticket-type/payer-claims-adjudication-v1";
  requester: fhir4.Organization;
  context: PayerClaimsContext;
};

export type ResearchStudyTicket = PermissionTicketBase & {
  ticket_type: "https://smarthealthit.org/permission-ticket-type/research-study-access-v1";
  requester: fhir4.Organization;
  context: ResearchContext;
};

export type ProviderConsultTicket = PermissionTicketBase & {
  ticket_type: "https://smarthealthit.org/permission-ticket-type/provider-consult-v1";
  requester: fhir4.PractitionerRole;
  context: ProviderConsultContext;
};

export type PermissionTicket =
  | PatientSelfAccessTicket
  | PatientDelegatedAccessTicket
  | PublicHealthTicket
  | SocialCareReferralTicket
  | PayerClaimsTicket
  | ResearchStudyTicket
  | ProviderConsultTicket;

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
