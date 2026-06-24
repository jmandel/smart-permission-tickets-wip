{% include callouts.html %}

This page defines one access constraint. The constraint model, template, and algebra are on [Access Constraints](access-constraints.html); the ticket types that draw this constraint are in the [Use Case Catalog](use-case-catalog.html).

Introduced by the [Payer Claims Adjudication](payer-claims-adjudication.html) ticket type, where it is the positive grant. The linkage is anchored on the encounters the claim covers — always available at submission because the issuer is the Data Holder, minting references into its own records. Enforcement is defined against those records, which confines this constraint to self-issued tickets today.

**Shape and validity.** `encounter` (required) is a non-empty array of references to the encounter records the claim covers, using the issuer's own resource URLs. `claim` (optional) is a single reference that re-associates the ticket with the submission it accompanies; its `identifier` carries the **provider's own submission-time control number** — the X12 837 `CLM01`, echoed back to the provider in the 835 — never a payer-assigned claim number (ICN / DCN / CCN), which does not exist when the ticket is minted.

```json
"claim_linkage": {
  "encounter": [
    { "reference": "https://provider.example.org/Encounter/enc-2026-0117" }
  ],
  "claim": {
    "type": "Claim",
    "identifier": { "system": "https://provider.example.org/claims", "value": "CLM-2026-0042" },
    "display": "Submitted claim CLM-2026-0042"
  }
}
```

**For the authorizing party.** The constraint records what the provider organization decided to disclose: records tied to the encounters this claim covers, for this adjudication, and nothing else. This is how the ticket carries HIPAA's minimum-necessary standard.

**For the client.** The payer learns which encounters the ticket covers and, when present, its own re-association handle (the provider's submission control number, the same value returned in the 835) — the re-association that document workflows carry in tracking numbers. What to expect from redemption: records the provider associates with those encounters. The response may be lawfully incomplete; absence of a record is not a representation that it does not exist.

**For the Data Holder.** Release only records you associate with the linked encounters: at minimum the records linked to the named `encounter` references, plus current problems, medications, and allergies. The association is your own — you minted the ticket against your own records — so enforcement is determinate. A Data Holder with no association knowledge for the linkage cannot enforce this constraint and rejects the ticket. That is the correct outcome, and it is what confines this ticket type to self-issued tickets today.

The enforcement floor names patient-level categories explicitly because encounter linkage in FHIR data is incomplete: the records adjudication needs most — problem list, medications, allergies — typically link to no encounter at all.
