import { z } from "zod";

export const PATIENT_SELF_ACCESS_TICKET_TYPE =
  "https://smarthealthit.org/permission-ticket-type/patient-self-access-v1";
export const PATIENT_DELEGATED_ACCESS_TICKET_TYPE =
  "https://smarthealthit.org/permission-ticket-type/patient-delegated-access-v1";
export const PUBLIC_HEALTH_INVESTIGATION_TICKET_TYPE =
  "https://smarthealthit.org/permission-ticket-type/public-health-investigation-v1";
export const SOCIAL_CARE_REFERRAL_TICKET_TYPE =
  "https://smarthealthit.org/permission-ticket-type/social-care-referral-v1";
export const PAYER_CLAIMS_ADJUDICATION_TICKET_TYPE =
  "https://smarthealthit.org/permission-ticket-type/payer-claims-adjudication-v1";
export const RESEARCH_STUDY_ACCESS_TICKET_TYPE =
  "https://smarthealthit.org/permission-ticket-type/research-study-access-v1";
export const PROVIDER_CONSULT_TICKET_TYPE =
  "https://smarthealthit.org/permission-ticket-type/provider-consult-v1";
export const PAYER_QUALITY_GAP_TICKET_TYPE =
  "https://smarthealthit.org/permission-ticket-type/payer-quality-gap-v1";

export const PermissionTicketTypeValues = [
  PATIENT_SELF_ACCESS_TICKET_TYPE,
  PATIENT_DELEGATED_ACCESS_TICKET_TYPE,
  PUBLIC_HEALTH_INVESTIGATION_TICKET_TYPE,
  SOCIAL_CARE_REFERRAL_TICKET_TYPE,
  PAYER_CLAIMS_ADJUDICATION_TICKET_TYPE,
  RESEARCH_STUDY_ACCESS_TICKET_TYPE,
  PROVIDER_CONSULT_TICKET_TYPE,
  PAYER_QUALITY_GAP_TICKET_TYPE,
] as const;

export const PermissionTicketTypeSchema = z.enum(PermissionTicketTypeValues);

export const FrameworkTypeSchema = z.enum(["well-known", "udap", "oidf"]);

const NonEmptyStringSchema = z.string().min(1);
const UriSchema = NonEmptyStringSchema;
const JwtAudienceSchema = z.union([UriSchema, z.array(UriSchema).min(1)]);
export const TicketAudienceTypeSchema = z.enum(["data_holder_url", "trust_framework"]);

export const FHIRCodingSchema = z.object({
  system: z.string().optional(),
  code: z.string().optional(),
  display: z.string().optional(),
}).catchall(z.unknown());

export const FHIRCodeableConceptSchema = z.object({
  coding: z.array(FHIRCodingSchema).optional(),
  text: z.string().optional(),
}).catchall(z.unknown());

export const FHIRIdentifierSchema = z.object({
  system: z.string().optional(),
  value: z.string().optional(),
  type: FHIRCodeableConceptSchema.optional(),
}).catchall(z.unknown()).superRefine((identifier, ctx) => {
  if (!identifier.system && !identifier.value) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "FHIR Identifier must include at least system or value.",
      path: [],
    });
  }
});

export const FHIRHumanNameSchema = z.object({
  family: z.string().optional(),
  given: z.array(z.string()).optional(),
  prefix: z.array(z.string()).optional(),
  suffix: z.array(z.string()).optional(),
}).catchall(z.unknown());

export const FHIRPeriodSchema = z.object({
  start: z.string().optional(),
  end: z.string().optional(),
}).catchall(z.unknown());

export const FHIRReferenceSchema = z.object({
  reference: z.string().optional(),
  identifier: FHIRIdentifierSchema.optional(),
  type: z.string().optional(),
  display: z.string().optional(),
}).catchall(z.unknown());

export const FHIRAddressSchema = z.object({
  country: z.string().optional(),
  state: z.string().optional(),
}).superRefine((address, ctx) => {
  if (!address.country && !address.state) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Jurisdiction entries must include at least country or state.",
      path: [],
    });
  }
});

export const FHIRResourceSchema = z.object({
  resourceType: NonEmptyStringSchema,
}).catchall(z.unknown());

export const PatientSchema = z.object({
  resourceType: z.literal("Patient"),
  identifier: z.array(FHIRIdentifierSchema).optional(),
  name: z.array(FHIRHumanNameSchema).optional(),
  birthDate: z.string().optional(),
  gender: z.string().optional(),
}).catchall(z.unknown());

export const RelatedPersonSchema = z.object({
  resourceType: z.literal("RelatedPerson"),
  relationship: z.array(FHIRCodeableConceptSchema).optional(),
  name: z.array(FHIRHumanNameSchema).optional(),
  identifier: z.array(FHIRIdentifierSchema).optional(),
  period: FHIRPeriodSchema.optional(),
}).catchall(z.unknown());

export const PractitionerSchema = z.object({
  resourceType: z.literal("Practitioner"),
  name: z.array(FHIRHumanNameSchema).optional(),
  identifier: z.array(FHIRIdentifierSchema).optional(),
}).catchall(z.unknown());

export const PractitionerRoleSchema = z.object({
  resourceType: z.literal("PractitionerRole"),
  code: z.array(FHIRCodeableConceptSchema).optional(),
  identifier: z.array(FHIRIdentifierSchema).optional(),
}).catchall(z.unknown());

export const OrganizationSchema = z.object({
  resourceType: z.literal("Organization"),
  name: z.string().optional(),
  identifier: z.array(FHIRIdentifierSchema).optional(),
}).catchall(z.unknown());

export const RequesterSchema = z.discriminatedUnion("resourceType", [
  RelatedPersonSchema,
  PractitionerSchema,
  PractitionerRoleSchema,
  OrganizationSchema,
]);

export const SubjectSchema = z.object({
  patient: PatientSchema,
  patient_reference: UriSchema.optional(),
});

export const KeyBindingSchema = z.object({
  method: z.literal("jkt"),
  jkt: NonEmptyStringSchema,
}).strict();

export const TrustFrameworkClientBindingSchema = z.object({
  method: z.literal("trust_framework_client"),
  trust_framework: UriSchema,
  framework_type: FrameworkTypeSchema,
  entity_uri: UriSchema,
}).strict();

export const PresenterBindingSchema = z.discriminatedUnion("method", [
  KeyBindingSchema,
  TrustFrameworkClientBindingSchema,
]);

export const EmbeddedIdentityEvidenceSchema = z.object({
  source: z.literal("embedded"),
  token_type: z.literal("id_token"),
  jwt: NonEmptyStringSchema,
}).strict();

export const IdentityEvidenceSchema = EmbeddedIdentityEvidenceSchema;

export const RevocationSchema = z.object({
  url: UriSchema,
  index: z.number().int().nonnegative(),
}).strict();

export const ContinuationSchema = z.object({
  refresh_until: z.number().int(),
}).strict();

// A single SMART v2 scope string (SMART App Launch v2 scope grammar), e.g.
// "patient/Observation.rs" or, with granular search-parameter narrowing,
// "patient/Observation.rs?category=http://terminology.hl7.org/CodeSystem/observation-category|laboratory".
// Validation is intentionally light — structure only, not search-parameter semantics.
export const SmartScopeSchema = z.string().regex(
  /^(patient|user|system)\/(\*|[A-Za-z]+)\.[cruds]+(\?\S+)?$/,
  { message: "Must be a SMART v2 scope, e.g. patient/Observation.rs or patient/Observation.rs?code=http://loinc.org|4548-4" },
);

export const JurisdictionFilterSchema = z.object({
  kind: z.literal("jurisdiction"),
  address: FHIRAddressSchema,
}).strict();

export const OrganizationFilterSchema = z.object({
  kind: z.literal("organization"),
  // All allowed org-identifiers flattened into one reference array; a Data
  // Holder may answer if it matches any entry. Each reference carries an
  // identifier (and optional display) — not a full Organization resource,
  // since only the identifier is matched.
  organization: z.array(FHIRReferenceSchema).min(1),
}).strict();

export const DataHolderFilterSchema = z.discriminatedUnion("kind", [
  JurisdictionFilterSchema,
  OrganizationFilterSchema,
]);

export const AccessConstraintExtensionSchema = z.object({}).catchall(z.unknown());

export const AccessGrantSchema = z.object({
  smart_scopes: z.array(SmartScopeSchema).min(1),
  data_period: FHIRPeriodSchema.optional(),
  data_holder_filter: z.array(DataHolderFilterSchema).min(1).optional(),
}).catchall(AccessConstraintExtensionSchema);

const MinimalServiceRequestSchema = z.object({
  resourceType: z.literal("ServiceRequest"),
  identifier: z.array(FHIRIdentifierSchema).optional(),
  status: NonEmptyStringSchema,
  intent: NonEmptyStringSchema,
}).catchall(z.unknown());

const MinimalResearchStudySchema = z.object({
  resourceType: z.literal("ResearchStudy"),
  identifier: z.array(FHIRIdentifierSchema).optional(),
  status: NonEmptyStringSchema,
  title: z.string().optional(),
}).catchall(z.unknown());

// Profile-grown access constraint defined by Payer Claims Adjudication: release
// is limited to records the Data Holder associates with the linked encounters.
// The encounter array is the load-bearing, always-available linkage (issuer ==
// Data Holder mints its own Encounter refs). The optional claim is a Reference
// carrying only the provider's submission-time control number (837 CLM01 / 835
// CLP01) for re-association — never a payer-assigned ICN/DCN/CCN.
export const ClaimLinkageSchema = z.object({
  encounter: z.array(FHIRReferenceSchema).min(1),
  claim: FHIRReferenceSchema.optional(),
}).strict();

// Locked constraint set: claim_linkage only. The linked encounters are the
// positive grant — the Data Holder releases records tied to them. A kind-level
// scope ceiling would be inert here: the issuer is the Data Holder, and the
// payer learns the granted scopes at token exchange. data_period is prohibited:
// the encounters are the time anchor, so any window is redundant or contradicts
// the current-state floor.
export const PayerClaimsAccessSchema = z.object({
  claim_linkage: ClaimLinkageSchema,
}).catchall(AccessConstraintExtensionSchema);

// Locked constraint set: exactly smart_scopes + data_period (the measurement or
// lookback period). The profile additionally requires every scope to carry a
// granular search-parameter narrowing; that rule is stated in prose rather than
// enforced structurally here.
export const QualityGapAccessSchema = z.object({
  smart_scopes: z.array(SmartScopeSchema).min(1),
  data_period: FHIRPeriodSchema,
}).catchall(AccessConstraintExtensionSchema);

const TicketBaseSchema = z.object({
  iss: UriSchema,
  aud: JwtAudienceSchema,
  aud_type: TicketAudienceTypeSchema.optional(),
  exp: z.number().int(),
  iat: z.number().int(),
  jti: NonEmptyStringSchema,
  presenter_binding: PresenterBindingSchema.optional(),
  subject_identity_evidence: IdentityEvidenceSchema.optional(),
  requester_identity_evidence: IdentityEvidenceSchema.optional(),
  revocation: RevocationSchema.optional(),
  continuation: ContinuationSchema.optional(),
  subject: SubjectSchema,
  requester: RequesterSchema.optional(),
  access: AccessGrantSchema,
}).catchall(z.unknown());

export const PatientSelfAccessTicketSchema = TicketBaseSchema.extend({
  ticket_type: z.literal(PATIENT_SELF_ACCESS_TICKET_TYPE),
  requester: z.never().optional(),
});

export const PatientDelegatedAccessTicketSchema = TicketBaseSchema.extend({
  ticket_type: z.literal(PATIENT_DELEGATED_ACCESS_TICKET_TYPE),
  requester: RelatedPersonSchema,
});

export const PublicHealthTicketSchema = TicketBaseSchema.extend({
  ticket_type: z.literal(PUBLIC_HEALTH_INVESTIGATION_TICKET_TYPE),
  requester: OrganizationSchema,
  reportable_condition: FHIRCodeableConceptSchema,
});

export const SocialCareReferralTicketSchema = TicketBaseSchema.extend({
  ticket_type: z.literal(SOCIAL_CARE_REFERRAL_TICKET_TYPE),
  requester: OrganizationSchema,
  concern: FHIRCodeableConceptSchema,
  referral: MinimalServiceRequestSchema,
});

export const PayerClaimsTicketSchema = TicketBaseSchema.extend({
  ticket_type: z.literal(PAYER_CLAIMS_ADJUDICATION_TICKET_TYPE),
  requester: OrganizationSchema,
  access: PayerClaimsAccessSchema,
});

export const ResearchStudyTicketSchema = TicketBaseSchema.extend({
  ticket_type: z.literal(RESEARCH_STUDY_ACCESS_TICKET_TYPE),
  requester: OrganizationSchema,
  study: MinimalResearchStudySchema,
});

export const ProviderConsultTicketSchema = TicketBaseSchema.extend({
  ticket_type: z.literal(PROVIDER_CONSULT_TICKET_TYPE),
  requester: PractitionerRoleSchema,
  reason: FHIRCodeableConceptSchema,
  consult_request: MinimalServiceRequestSchema,
});

export const PayerQualityGapTicketSchema = TicketBaseSchema.extend({
  ticket_type: z.literal(PAYER_QUALITY_GAP_TICKET_TYPE),
  requester: OrganizationSchema,
  measure: FHIRCodeableConceptSchema,
  access: QualityGapAccessSchema,
});

export const PermissionTicketSchema = z.discriminatedUnion("ticket_type", [
  PatientSelfAccessTicketSchema,
  PatientDelegatedAccessTicketSchema,
  PublicHealthTicketSchema,
  SocialCareReferralTicketSchema,
  PayerClaimsTicketSchema,
  ResearchStudyTicketSchema,
  ProviderConsultTicketSchema,
  PayerQualityGapTicketSchema,
]);

export const ClientAssertionSchema = z.object({
  iss: NonEmptyStringSchema,
  sub: NonEmptyStringSchema,
  aud: NonEmptyStringSchema,
  jti: NonEmptyStringSchema,
  iat: z.number().int().optional(),
  exp: z.number().int().optional(),
});

export const TokenExchangeRequestSchema = z.object({
  grant_type: z.literal("urn:ietf:params:oauth:grant-type:token-exchange"),
  subject_token: NonEmptyStringSchema,
  subject_token_type: z.literal("https://smarthealthit.org/token-type/permission-ticket"),
  scope: z.string().optional(),
  client_assertion_type: z.literal("urn:ietf:params:oauth:client-assertion-type:jwt-bearer"),
  client_assertion: NonEmptyStringSchema,
});

export type PermissionTicket = z.infer<typeof PermissionTicketSchema>;
export type PermissionTicketType = z.infer<typeof PermissionTicketTypeSchema>;
export type FHIRCoding = z.infer<typeof FHIRCodingSchema>;
export type FHIRCodeableConcept = z.infer<typeof FHIRCodeableConceptSchema>;
export type FHIRIdentifier = z.infer<typeof FHIRIdentifierSchema>;
export type FHIRHumanName = z.infer<typeof FHIRHumanNameSchema>;
export type FHIRPeriod = z.infer<typeof FHIRPeriodSchema>;
export type FHIRReference = z.infer<typeof FHIRReferenceSchema>;
export type FHIRAddress = z.infer<typeof FHIRAddressSchema>;
export type FHIRResource = z.infer<typeof FHIRResourceSchema>;
export type KeyBinding = z.infer<typeof KeyBindingSchema>;
export type TrustFrameworkClientBinding = z.infer<typeof TrustFrameworkClientBindingSchema>;
export type PresenterBinding = z.infer<typeof PresenterBindingSchema>;
export type EmbeddedIdentityEvidence = z.infer<typeof EmbeddedIdentityEvidenceSchema>;
export type IdentityEvidence = z.infer<typeof IdentityEvidenceSchema>;
export type Revocation = z.infer<typeof RevocationSchema>;
export type Continuation = z.infer<typeof ContinuationSchema>;
export type Subject = z.infer<typeof SubjectSchema>;
export type Requester = z.infer<typeof RequesterSchema>;
export type SmartScope = z.infer<typeof SmartScopeSchema>;
export type JurisdictionFilter = z.infer<typeof JurisdictionFilterSchema>;
export type OrganizationFilter = z.infer<typeof OrganizationFilterSchema>;
export type DataHolderFilter = z.infer<typeof DataHolderFilterSchema>;
export type TicketAudienceType = z.infer<typeof TicketAudienceTypeSchema>;
export type AccessConstraintExtension = z.infer<typeof AccessConstraintExtensionSchema>;
export type AccessGrant = z.infer<typeof AccessGrantSchema>;
export type ClaimLinkage = z.infer<typeof ClaimLinkageSchema>;
export type PayerClaimsAccess = z.infer<typeof PayerClaimsAccessSchema>;
export type QualityGapAccess = z.infer<typeof QualityGapAccessSchema>;
export type PatientSelfAccessTicket = z.infer<typeof PatientSelfAccessTicketSchema>;
export type PatientDelegatedAccessTicket = z.infer<typeof PatientDelegatedAccessTicketSchema>;
export type PublicHealthTicket = z.infer<typeof PublicHealthTicketSchema>;
export type SocialCareReferralTicket = z.infer<typeof SocialCareReferralTicketSchema>;
export type PayerClaimsTicket = z.infer<typeof PayerClaimsTicketSchema>;
export type ResearchStudyTicket = z.infer<typeof ResearchStudyTicketSchema>;
export type ProviderConsultTicket = z.infer<typeof ProviderConsultTicketSchema>;
export type PayerQualityGapTicket = z.infer<typeof PayerQualityGapTicketSchema>;
export type ClientAssertion = z.infer<typeof ClientAssertionSchema>;
export type TokenExchangeRequest = z.infer<typeof TokenExchangeRequestSchema>;

export const permissionTicketJsonSchema = z.toJSONSchema(PermissionTicketSchema);
export const clientAssertionJsonSchema = z.toJSONSchema(ClientAssertionSchema);
export const tokenExchangeRequestJsonSchema = z.toJSONSchema(TokenExchangeRequestSchema);

export function parsePermissionTicket(input: unknown): PermissionTicket {
  return PermissionTicketSchema.parse(input);
}

export function isPermissionTicket(input: unknown): input is PermissionTicket {
  return PermissionTicketSchema.safeParse(input).success;
}
