import {
  type PermissionTicketType,
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
};

export const USE_CASE_CATALOG: UseCaseCatalogEntry[] = [
  {
    id: "uc1",
    label: "Use Case 1: Patient Self Access",
    ticketTypeUri: PATIENT_SELF_ACCESS_TICKET_TYPE
  },
  {
    id: "uc2",
    label: "Use Case 2: Patient-Delegated Access",
    ticketTypeUri: PATIENT_DELEGATED_ACCESS_TICKET_TYPE
  },
  {
    id: "uc3",
    label: "Use Case 3: Public Health Investigation",
    ticketTypeUri: PUBLIC_HEALTH_INVESTIGATION_TICKET_TYPE
  },
  {
    id: "uc4",
    label: "Use Case 4: Social Care (CBO) Referral",
    ticketTypeUri: SOCIAL_CARE_REFERRAL_TICKET_TYPE
  },
  {
    id: "uc5",
    label: "Use Case 5: Payer Claims Adjudication",
    ticketTypeUri: PAYER_CLAIMS_ADJUDICATION_TICKET_TYPE
  },
  {
    id: "uc6",
    label: "Use Case 6: Research Study",
    ticketTypeUri: RESEARCH_STUDY_ACCESS_TICKET_TYPE
  },
  {
    id: "uc7",
    label: "Use Case 7: Provider-to-Provider Consult",
    ticketTypeUri: PROVIDER_CONSULT_TICKET_TYPE
  }
];

export const USE_CASE_BY_ID: Record<string, UseCaseCatalogEntry> = USE_CASE_CATALOG.reduce(
  (acc, entry) => {
    acc[entry.id] = entry;
    return acc;
  },
  {} as Record<string, UseCaseCatalogEntry>
);
