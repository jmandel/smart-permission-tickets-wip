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

export const PermissionTicketTypeValues = [
  PATIENT_SELF_ACCESS_TICKET_TYPE,
  PATIENT_DELEGATED_ACCESS_TICKET_TYPE,
  PUBLIC_HEALTH_INVESTIGATION_TICKET_TYPE,
  SOCIAL_CARE_REFERRAL_TICKET_TYPE,
  PAYER_CLAIMS_ADJUDICATION_TICKET_TYPE,
  RESEARCH_STUDY_ACCESS_TICKET_TYPE,
  PROVIDER_CONSULT_TICKET_TYPE,
] as const;

export const PermissionTicketTypeSchema = z.enum(PermissionTicketTypeValues);

export const RestInteractionValues = [
  "read",
  "search",
  "history",
  "create",
  "update",
  "patch",
  "delete",
] as const;

export const RestInteractionSchema = z.enum(RestInteractionValues);
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
  recipient_record: FHIRReferenceSchema.extend({
    type: z.literal("Patient").optional(),
  }).optional(),
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

export const DataPermissionSchema = z.object({
  kind: z.literal("data"),
  resource_type: NonEmptyStringSchema,
  interactions: z.array(RestInteractionSchema).min(1),
  category_any_of: z.array(FHIRCodingSchema).min(1).optional(),
  code_any_of: z.array(FHIRCodingSchema).min(1).optional(),
}).strict();

export const OperationPermissionSchema = z.object({
  kind: z.literal("operation"),
  name: NonEmptyStringSchema,
  target: FHIRReferenceSchema.optional(),
}).strict();

export const PermissionRuleSchema = z.discriminatedUnion("kind", [
  DataPermissionSchema,
  OperationPermissionSchema,
]);

export const JurisdictionFilterSchema = z.object({
  kind: z.literal("jurisdiction"),
  address: FHIRAddressSchema,
}).strict();

export const OrganizationFilterSchema = z.object({
  kind: z.literal("organization"),
  organization: OrganizationSchema,
}).strict();

export const DataHolderFilterSchema = z.discriminatedUnion("kind", [
  JurisdictionFilterSchema,
  OrganizationFilterSchema,
]);

export const AccessGrantSchema = z.object({
  permissions: z.array(PermissionRuleSchema).min(1),
  data_period: FHIRPeriodSchema.optional(),
  data_holder_filter: z.array(DataHolderFilterSchema).min(1).optional(),
}).strict();

const EmptyContextSchema = z.object({}).strict();

const MinimalServiceRequestSchema = z.object({
  resourceType: z.literal("ServiceRequest"),
  identifier: z.array(FHIRIdentifierSchema).optional(),
  status: NonEmptyStringSchema,
  intent: NonEmptyStringSchema,
}).catchall(z.unknown());

const MinimalClaimSchema = z.object({
  resourceType: z.literal("Claim"),
  identifier: z.array(FHIRIdentifierSchema).optional(),
  status: NonEmptyStringSchema,
  use: NonEmptyStringSchema,
}).catchall(z.unknown());

const MinimalResearchStudySchema = z.object({
  resourceType: z.literal("ResearchStudy"),
  identifier: z.array(FHIRIdentifierSchema).optional(),
  status: NonEmptyStringSchema,
  title: z.string().optional(),
}).catchall(z.unknown());

export const PatientAccessContextSchema = EmptyContextSchema;

export const PublicHealthContextSchema = z.object({
  reportable_condition: FHIRCodeableConceptSchema,
}).strict();

export const SocialCareReferralContextSchema = z.object({
  concern: FHIRCodeableConceptSchema,
  referral: MinimalServiceRequestSchema,
}).strict();

export const PayerClaimsContextSchema = z.object({
  service: FHIRCodeableConceptSchema,
  claim: MinimalClaimSchema,
}).strict();

export const ResearchContextSchema = z.object({
  study: MinimalResearchStudySchema,
}).strict();

export const ProviderConsultContextSchema = z.object({
  reason: FHIRCodeableConceptSchema,
  consult_request: MinimalServiceRequestSchema,
}).strict();

export const TicketContextSchema = z.union([
  PatientAccessContextSchema,
  PublicHealthContextSchema,
  SocialCareReferralContextSchema,
  PayerClaimsContextSchema,
  ResearchContextSchema,
  ProviderConsultContextSchema,
]);

const BaseKernelTopLevelClaimNames = new Set([
  "iss",
  "aud",
  "exp",
  "iat",
  "jti",
  "ticket_type",
  "aud_type",
  "presenter_binding",
  "subject_identity_evidence",
  "requester_identity_evidence",
  "revocation",
  "must_understand",
  "subject",
  "requester",
  "access",
  "context",
]);

const MustUnderstandClaimNameSchema = z.string().regex(/^[a-z][a-z0-9_]*$/);

const TicketBaseSchema = z.object({
  iss: UriSchema,
  aud: JwtAudienceSchema,
  aud_type: TicketAudienceTypeSchema.optional(),
  exp: z.number().int(),
  iat: z.number().int().optional(),
  jti: NonEmptyStringSchema,
  presenter_binding: PresenterBindingSchema.optional(),
  subject_identity_evidence: IdentityEvidenceSchema.optional(),
  requester_identity_evidence: IdentityEvidenceSchema.optional(),
  revocation: RevocationSchema.optional(),
  must_understand: z.array(MustUnderstandClaimNameSchema).min(1).optional(),
  subject: SubjectSchema.optional(),
  requester: RequesterSchema.optional(),
  access: AccessGrantSchema,
}).catchall(z.unknown());

export const PatientSelfAccessTicketSchema = TicketBaseSchema.extend({
  ticket_type: z.literal(PATIENT_SELF_ACCESS_TICKET_TYPE),
  requester: z.never().optional(),
  context: EmptyContextSchema.optional(),
});

export const PatientDelegatedAccessTicketSchema = TicketBaseSchema.extend({
  ticket_type: z.literal(PATIENT_DELEGATED_ACCESS_TICKET_TYPE),
  requester: RelatedPersonSchema,
  context: EmptyContextSchema.optional(),
});

export const PublicHealthTicketSchema = TicketBaseSchema.extend({
  ticket_type: z.literal(PUBLIC_HEALTH_INVESTIGATION_TICKET_TYPE),
  requester: OrganizationSchema,
  context: PublicHealthContextSchema,
});

export const SocialCareReferralTicketSchema = TicketBaseSchema.extend({
  ticket_type: z.literal(SOCIAL_CARE_REFERRAL_TICKET_TYPE),
  requester: OrganizationSchema,
  context: SocialCareReferralContextSchema,
});

export const PayerClaimsTicketSchema = TicketBaseSchema.extend({
  ticket_type: z.literal(PAYER_CLAIMS_ADJUDICATION_TICKET_TYPE),
  requester: OrganizationSchema,
  context: PayerClaimsContextSchema,
});

export const ResearchStudyTicketSchema = TicketBaseSchema.extend({
  ticket_type: z.literal(RESEARCH_STUDY_ACCESS_TICKET_TYPE),
  requester: OrganizationSchema,
  context: ResearchContextSchema,
});

export const ProviderConsultTicketSchema = TicketBaseSchema.extend({
  ticket_type: z.literal(PROVIDER_CONSULT_TICKET_TYPE),
  requester: PractitionerRoleSchema,
  context: ProviderConsultContextSchema,
});

export const PermissionTicketSchema = z.discriminatedUnion("ticket_type", [
  PatientSelfAccessTicketSchema,
  PatientDelegatedAccessTicketSchema,
  PublicHealthTicketSchema,
  SocialCareReferralTicketSchema,
  PayerClaimsTicketSchema,
  ResearchStudyTicketSchema,
  ProviderConsultTicketSchema,
]).superRefine((ticket, ctx) => {
  if (!ticket.subject && !ticket.subject_identity_evidence) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Permission Ticket must include either subject or subject_identity_evidence.",
      path: ["subject"],
    });
  }

  if (!ticket.must_understand) return;

  const duplicates = new Set<string>();
  for (const claimName of ticket.must_understand) {
    if (duplicates.has(claimName)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `must_understand contains duplicate entry ${claimName}.`,
        path: ["must_understand"],
      });
    }
    duplicates.add(claimName);

    if (BaseKernelTopLevelClaimNames.has(claimName)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${claimName} is a base claim and must not be listed in must_understand.`,
        path: ["must_understand"],
      });
    }

    if (!(claimName in ticket)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `must_understand entry ${claimName} does not match a top-level ticket claim.`,
        path: ["must_understand"],
      });
    }
  }
});

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
export type Subject = z.infer<typeof SubjectSchema>;
export type Requester = z.infer<typeof RequesterSchema>;
export type RestInteraction = z.infer<typeof RestInteractionSchema>;
export type DataPermission = z.infer<typeof DataPermissionSchema>;
export type OperationPermission = z.infer<typeof OperationPermissionSchema>;
export type PermissionRule = z.infer<typeof PermissionRuleSchema>;
export type JurisdictionFilter = z.infer<typeof JurisdictionFilterSchema>;
export type OrganizationFilter = z.infer<typeof OrganizationFilterSchema>;
export type DataHolderFilter = z.infer<typeof DataHolderFilterSchema>;
export type TicketAudienceType = z.infer<typeof TicketAudienceTypeSchema>;
export type AccessGrant = z.infer<typeof AccessGrantSchema>;
export type TicketContext = z.infer<typeof TicketContextSchema>;
export type PatientSelfAccessTicket = z.infer<typeof PatientSelfAccessTicketSchema>;
export type PatientDelegatedAccessTicket = z.infer<typeof PatientDelegatedAccessTicketSchema>;
export type PublicHealthTicket = z.infer<typeof PublicHealthTicketSchema>;
export type SocialCareReferralTicket = z.infer<typeof SocialCareReferralTicketSchema>;
export type PayerClaimsTicket = z.infer<typeof PayerClaimsTicketSchema>;
export type ResearchStudyTicket = z.infer<typeof ResearchStudyTicketSchema>;
export type ProviderConsultTicket = z.infer<typeof ProviderConsultTicketSchema>;
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
