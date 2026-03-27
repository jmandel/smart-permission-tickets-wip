export type UseCaseCatalogEntry = {
  id: string;
  label: string;
  ticketTypeUri: string;
};

export const USE_CASE_CATALOG: UseCaseCatalogEntry[] = [
  {
    id: "uc1",
    label: "Use Case 1: Network-Mediated Patient Access",
    ticketTypeUri: "https://smarthealthit.org/permission-ticket-type/network-patient-access-v1"
  },
  {
    id: "uc2",
    label: "Use Case 2: Authorized Representative (Proxy)",
    ticketTypeUri:
      "https://smarthealthit.org/permission-ticket-type/authorized-representative-v1"
  },
  {
    id: "uc3",
    label: "Use Case 3: Public Health Investigation",
    ticketTypeUri:
      "https://smarthealthit.org/permission-ticket-type/public-health-investigation-v1"
  },
  {
    id: "uc4",
    label: "Use Case 4: Social Care (CBO) Referral",
    ticketTypeUri: "https://smarthealthit.org/permission-ticket-type/social-care-referral-v1"
  },
  {
    id: "uc5",
    label: "Use Case 5: Payer Claims Adjudication",
    ticketTypeUri:
      "https://smarthealthit.org/permission-ticket-type/payer-claims-adjudication-v1"
  },
  {
    id: "uc6",
    label: "Use Case 6: Research Study",
    ticketTypeUri: "https://smarthealthit.org/permission-ticket-type/research-study-v1"
  },
  {
    id: "uc7",
    label: "Use Case 7: Provider-to-Provider Consult",
    ticketTypeUri: "https://smarthealthit.org/permission-ticket-type/provider-consult-v1"
  }
];

export const USE_CASE_BY_ID: Record<string, UseCaseCatalogEntry> = USE_CASE_CATALOG.reduce(
  (acc, entry) => {
    acc[entry.id] = entry;
    return acc;
  },
  {} as Record<string, UseCaseCatalogEntry>
);
