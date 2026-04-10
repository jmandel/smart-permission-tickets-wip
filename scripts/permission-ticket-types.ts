// Human-readable TypeScript definitions for the specification.
// These are maintained alongside permission-ticket-schema.ts on purpose.
// They intentionally use lightweight FHIR aliases instead of recursively
// expanding every nested FHIR element into the published spec.

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

export type FHIRCoding = {
  system?: Uri;
  code?: string;
  display?: string;
};

export type FHIRCodeableConcept = {
  coding?: FHIRCoding[];
  text?: string;
};

export type FHIRIdentifier = {
  system?: Uri;
  value?: string;
  type?: FHIRCodeableConcept;
};

export type FHIRHumanName = {
  family?: string;
  given?: string[];
  prefix?: string[];
  suffix?: string[];
};

export type FHIRPeriod = {
  start?: string;
  end?: string;
};

export type FHIRReference = {
  reference?: string;
  identifier?: FHIRIdentifier;
  type?: string;
  display?: string;
};

export type FHIRAddress = {
  country?: string;
  state?: string;
};

export type FHIRResource = {
  resourceType: string;
  [key: string]: unknown;
};

export type FHIRPatient = FHIRResource & {
  resourceType: "Patient";
  identifier?: FHIRIdentifier[];
  name?: FHIRHumanName[];
  birthDate?: string;
  gender?: string;
};

export type FHIRRelatedPerson = FHIRResource & {
  resourceType: "RelatedPerson";
  relationship?: FHIRCodeableConcept[];
  name?: FHIRHumanName[];
  identifier?: FHIRIdentifier[];
};

export type FHIRPractitioner = FHIRResource & {
  resourceType: "Practitioner";
  name?: FHIRHumanName[];
  identifier?: FHIRIdentifier[];
};

export type FHIRPractitionerRole = FHIRResource & {
  resourceType: "PractitionerRole";
  code?: FHIRCodeableConcept[];
  identifier?: FHIRIdentifier[];
};

export type FHIROrganization = FHIRResource & {
  resourceType: "Organization";
  name?: string;
  identifier?: FHIRIdentifier[];
};

export type FHIRServiceRequest = FHIRResource & {
  resourceType: "ServiceRequest";
  identifier?: FHIRIdentifier[];
  status: string;
  intent: string;
};

export type FHIRClaim = FHIRResource & {
  resourceType: "Claim";
  identifier?: FHIRIdentifier[];
  status: string;
  use: string;
};

export type FHIRResearchStudy = FHIRResource & {
  resourceType: "ResearchStudy";
  identifier?: FHIRIdentifier[];
  status: string;
  title?: string;
};

export type Subject = {
  patient: FHIRPatient;
  recipient_record?: FHIRReference & { type?: "Patient" };
};

export type Requester =
  | FHIRRelatedPerson
  | FHIRPractitioner
  | FHIRPractitionerRole
  | FHIROrganization;

export type KeyBinding = {
  method: "jkt";
  jkt: string;
};

export type FrameworkClientBinding = {
  method: "framework_client";
  framework: Uri;
  framework_type: FrameworkType;
  entity_uri: Uri;
};

export type PresenterBinding = KeyBinding | FrameworkClientBinding;

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
  organization: FHIROrganization;
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
  referral: FHIRServiceRequest;
};

export type PayerClaimsContext = {
  service: FHIRCodeableConcept;
  claim: FHIRClaim;
};

export type ResearchContext = {
  study: FHIRResearchStudy;
};

export type ProviderConsultContext = {
  reason: FHIRCodeableConcept;
  consult_request: FHIRServiceRequest;
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
  requester: FHIRRelatedPerson;
  context?: PatientAccessContext;
};

export type PublicHealthTicket = PermissionTicketBase & {
  ticket_type: "https://smarthealthit.org/permission-ticket-type/public-health-investigation-v1";
  requester: FHIROrganization;
  context: PublicHealthContext;
};

export type SocialCareReferralTicket = PermissionTicketBase & {
  ticket_type: "https://smarthealthit.org/permission-ticket-type/social-care-referral-v1";
  requester: FHIROrganization;
  context: SocialCareReferralContext;
};

export type PayerClaimsTicket = PermissionTicketBase & {
  ticket_type: "https://smarthealthit.org/permission-ticket-type/payer-claims-adjudication-v1";
  requester: FHIROrganization;
  context: PayerClaimsContext;
};

export type ResearchStudyTicket = PermissionTicketBase & {
  ticket_type: "https://smarthealthit.org/permission-ticket-type/research-study-access-v1";
  requester: FHIROrganization;
  context: ResearchContext;
};

export type ProviderConsultTicket = PermissionTicketBase & {
  ticket_type: "https://smarthealthit.org/permission-ticket-type/provider-consult-v1";
  requester: FHIRPractitionerRole;
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
