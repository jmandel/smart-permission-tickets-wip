import {
  type PermissionTicketType,
  PAYER_QUALITY_GAP_TICKET_TYPE,
  PATIENT_DELEGATED_ACCESS_TICKET_TYPE,
  PATIENT_SELF_ACCESS_TICKET_TYPE,
  PAYER_CLAIMS_ADJUDICATION_TICKET_TYPE,
  PROVIDER_CONSULT_TICKET_TYPE,
  PUBLIC_HEALTH_INVESTIGATION_TICKET_TYPE,
  RESEARCH_STUDY_ACCESS_TICKET_TYPE,
  SOCIAL_CARE_REFERRAL_TICKET_TYPE,
} from "./permission-ticket-schema";

export type UseCaseCatalogEntry = {
  id: string;
  label: string;
  ticketTypeUri: PermissionTicketType;
  future?: boolean;
};

export const USE_CASE_CATALOG: UseCaseCatalogEntry[] = [
  {
    id: "uc1",
    label: "Patient Self Access",
    ticketTypeUri: PATIENT_SELF_ACCESS_TICKET_TYPE
  },
  {
    id: "uc2",
    label: "Patient-Delegated Access",
    ticketTypeUri: PATIENT_DELEGATED_ACCESS_TICKET_TYPE
  },
  {
    id: "uc3",
    label: "Public Health Investigation",
    ticketTypeUri: PUBLIC_HEALTH_INVESTIGATION_TICKET_TYPE,
    future: true
  },
  {
    id: "uc4",
    label: "Social Care (CBO) Referral",
    ticketTypeUri: SOCIAL_CARE_REFERRAL_TICKET_TYPE,
    future: true
  },
  {
    id: "uc5",
    label: "Payer Claims Adjudication",
    ticketTypeUri: PAYER_CLAIMS_ADJUDICATION_TICKET_TYPE
  },
  {
    id: "uc6",
    label: "Research Study",
    ticketTypeUri: RESEARCH_STUDY_ACCESS_TICKET_TYPE,
    future: true
  },
  {
    id: "payer-quality-gap",
    label: "Payer Quality Gap Queries",
    ticketTypeUri: PAYER_QUALITY_GAP_TICKET_TYPE,
    future: true
  },
  {
    id: "uc7",
    label: "Provider-to-Provider Consult",
    ticketTypeUri: PROVIDER_CONSULT_TICKET_TYPE,
    future: true
  }
];

export const USE_CASE_BY_ID: Record<string, UseCaseCatalogEntry> = USE_CASE_CATALOG.reduce(
  (acc, entry) => {
    acc[entry.id] = entry;
    return acc;
  },
  {} as Record<string, UseCaseCatalogEntry>
);
