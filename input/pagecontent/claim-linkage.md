{% include callouts.html %}

This page defines one access constraint. The constraint model, template, and algebra are on [Access Constraints](access-constraints.html); the ticket types that draw this constraint are in the [Use Case Catalog](use-case-catalog.html).

Introduced by the [Payer Claims Adjudication](payer-claims-adjudication.html) ticket type, where it is the required bound on release. The linkage is anchored on the encounters the claim covers — always available at submission because the issuer is the Data Holder, minting references into its own records. Enforcement is defined against those records, which confines this constraint to self-issued tickets today.

**Shape and validity.** `encounter` (required) is a non-empty array of references to the encounter records the claim covers, using the issuer's own resource URLs. `claim` (optional) is a single reference that re-associates the ticket with the submission it accompanies; its `identifier` carries the **provider's own submission-time control number** — the identifier the provider assigned when submitting (in US X12 claims, the 837 `CLM01`, echoed back in the 835) — never a payer-assigned claim number (in the US, ICN / DCN / CCN), which does not exist when the ticket is minted.

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

**For the authorizing party.** The constraint records what the provider organization decided to make eligible for disclosure: the records it associates with the encounters this claim covers — including current problems, medications, and allergies, which may carry no literal encounter link — for this adjudication, and nothing else. Eligible is not guaranteed: the Data Holder may always release less. This is how the ticket carries HIPAA's minimum-necessary standard.

**For the client.** The payer learns which encounters the ticket covers and, when present, the handle for re-associating the ticket with its submission: the provider's submission control number, the same value returned in the 835. What to expect from redemption: records the provider associates with those encounters. The response may be lawfully incomplete; absence of a record is not a representation that it does not exist.

**For the Data Holder.** Release only records you associate with the linked encounters. That association defines the authorized universe, and it is deliberately wider than literal encounter links: it includes current problems, medications, and allergies — what adjudication relies on most, and what typically links to no encounter at all. "Current" means current as your own systems judge it at redemption time, not a snapshot from minting. Naming these categories keeps them inside the ceiling; it does not oblige their release. Releasing less is always allowed, per the base constraint rules. The association is your own — you minted the ticket against your own records — so enforcement is determinate. A Data Holder with no association knowledge for the linkage cannot enforce this constraint and rejects the ticket. That is the correct outcome, and it confines this ticket type to self-issued tickets today.
