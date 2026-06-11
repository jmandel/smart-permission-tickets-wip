{% include callouts.html %}

This page defines one access constraint. The constraint model, template, and algebra are on [Access Constraints](access-constraints.html); the ticket types that draw this constraint are in the [Use Case Catalog](use-case-catalog.html).

Introduced by the [Payer Claims Adjudication](payer-claims-adjudication.html) ticket type. Enforcement is defined against the issuing Data Holder's own claim records, which confines its use to self-issued tickets today.

**Shape and validity.**

```json
"claim_linkage": {
  "claim": {
    "resourceType": "Claim",
    "identifier": [{ "system": "https://provider.example.org/claims", "value": "CLM-2026-0042" }],
    "status": "active",
    "use": "claim"
  },
  "encounter": [{ "reference": "Encounter/enc-2026-0117" }]
}
```

`claim` is a minimal FHIR Claim carrying the identifiers both sides use for re-association; `use` distinguishes a claim from a prior authorization. `encounter` optionally names the encounter records the claim covers, using the issuer's own resource references. The issuer mints these values from the claim it is submitting, so validity is checkable against its own records.

**For the authorizing party.** The constraint records what the provider organization decided to disclose: records tied to this claim, for this adjudication, and nothing else. This is how the ticket carries HIPAA's minimum-necessary standard.

**For the client.** The payer learns which claim or prior authorization the ticket belongs to — the re-association that document workflows carry in tracking numbers — and what to expect from redemption: records the provider associates with that claim. The response may be lawfully incomplete; absence of a record is not a representation that it does not exist.

**For the Data Holder.** Release only records you associate with the referenced claim: at minimum the records linked to the named encounters, plus current problems, medications, and allergies. The association is your own — you minted the ticket against your own claim — so enforcement is determinate against your own records. A Data Holder with no association knowledge for the referenced claim cannot enforce this constraint and rejects the ticket. That is the correct outcome, and it is what confines this ticket type to self-issued tickets today.

The enforcement floor names patient-level categories explicitly because encounter linkage in FHIR data is incomplete: the records adjudication needs most — problem list, medications, allergies — typically link to no encounter at all.
