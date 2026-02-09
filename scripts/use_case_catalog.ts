export type UseCaseCatalogEntry = {
  id: string;
  label: string;
  profileUri: string;
  ticketTypeUri: string;
};

export const USE_CASE_CATALOG: UseCaseCatalogEntry[] = [
  {
    id: "uc1",
    label: "Use Case 1: Network-Mediated Patient Access",
    profileUri: "https://smarthealthit.org/permission-ticket-profile/network-patient-access-v1",
    ticketTypeUri: "https://smarthealthit.org/permission-ticket-type/network-patient-access-v1"
  },
  {
    id: "uc2",
    label: "Use Case 2: Authorized Representative (Proxy)",
    profileUri:
      "https://smarthealthit.org/permission-ticket-profile/authorized-representative-v1",
    ticketTypeUri:
      "https://smarthealthit.org/permission-ticket-type/authorized-representative-v1"
  },
  {
    id: "uc3",
    label: "Use Case 3: Public Health Investigation",
    profileUri:
      "https://smarthealthit.org/permission-ticket-profile/public-health-investigation-v1",
    ticketTypeUri:
      "https://smarthealthit.org/permission-ticket-type/public-health-investigation-v1"
  },
  {
    id: "uc4",
    label: "Use Case 4: Social Care (CBO) Referral",
    profileUri: "https://smarthealthit.org/permission-ticket-profile/social-care-referral-v1",
    ticketTypeUri: "https://smarthealthit.org/permission-ticket-type/social-care-referral-v1"
  },
  {
    id: "uc5",
    label: "Use Case 5: Payer Claims Adjudication",
    profileUri:
      "https://smarthealthit.org/permission-ticket-profile/payer-claims-adjudication-v1",
    ticketTypeUri:
      "https://smarthealthit.org/permission-ticket-type/payer-claims-adjudication-v1"
  },
  {
    id: "uc6",
    label: "Use Case 6: Research Study",
    profileUri: "https://smarthealthit.org/permission-ticket-profile/research-study-v1",
    ticketTypeUri: "https://smarthealthit.org/permission-ticket-type/research-study-v1"
  },
  {
    id: "uc7",
    label: "Use Case 7: Provider-to-Provider Consult",
    profileUri: "https://smarthealthit.org/permission-ticket-profile/provider-consult-v1",
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
