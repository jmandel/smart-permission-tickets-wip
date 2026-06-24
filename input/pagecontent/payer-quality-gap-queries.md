{% include callouts.html %}

This page defines one Permission Ticket type. The overview of all types is the [Use Case Catalog](use-case-catalog.html); constraint definitions live on [Access Constraints](access-constraints.html).

**Status:** Modeled

### Purpose

*A payer or value-based care organization retrieves the structured evidence a named quality measure needs — an HbA1c result, a mammogram report, a blood-pressure reading.*

CMS's [Interoperability Framework](https://www.cms.gov/health-technology-ecosystem/interoperability-framework) names this flow among its criteria: "Payers, including CMS, and other Value-based care organizations may query for specific quality data elements (e.g., HbA1c, mammograms, colonoscopies, blood pressure, BMI, depression screening) necessary for payment or health care operations."

Today this need is met by chart retrieval at scale — HEDIS season runs February through May, with thousands of record requests per provider organization, and broad pulls are exactly what providers resist. An element-scoped ticket is the narrow alternative: the wire artifact says precisely which elements, for which measure, over which period, and nothing else is authorized.

This type covers structured evidence: laboratory results, vital signs, procedures, reports, immunizations. Some measures accept evidence that lives only in clinical notes; retrieving notes is document retrieval, not an element query, and it is outside this type — the same boundary as chart retrieval.

### Typical Flow

A ticket is minted per member and measure, naming the payer as requester and the measure as a profile claim → the payer's system presents the ticket at the provider's endpoint → the provider issues an access token limited to the named elements over the measurement period. One ticket serves one measure; a member's open gaps for the season are multiple tickets, not one union ticket whose purpose and audit trail blur.

How tickets get minted is deliberately open — see the open question below. Unlike claims adjudication, no submission event anchors issuance; candidate issuers include the provider's system working from an attribution list, or network infrastructure operating under a participation agreement. The ticket artifact is the same under any of them, which is why it can be defined now.

### Required Claims

* **Subject:** `Patient`, with `subject.recipient_record` SHOULD when the issuer is the Data Holder.
* **Requester:** `Organization` (the payer or value-based care entity), identified well enough to match a coverage or contract relationship.
* **Profile claim:** `measure` (CodeableConcept, required) — which quality measure the query serves. A fact, not a limit: it tells the Data Holder which of its policies applies and gives both sides the audit and re-association anchor, while `smart_scopes` carries the actual limit.
* **Presenter binding:** Optional (B2B), as in [claims adjudication](payer-claims-adjudication.html): the Data Holder confirms the redeeming client acts for the requester, whether through binding, registration, or a trust-framework relationship.
* **Expiration:** `exp` SHOULD cover the reporting window the query serves.

### Constraints

Draws from the [constraint catalog](access-constraints.html), nothing new defined:

* **`smart_scopes`** (required) — the elements, one scope per element: `patient/Observation.rs?code=http://loinc.org|4548-4` is an HbA1c query. Every scope carries a granular `?category` or `?code` narrowing, so the ticket authorizes specific elements rather than whole record types.
* **`data_period`** (required) — the measurement or lookback period from the measure specification; without it a quality query is unbounded history. When a measure's elements carry different lookbacks — a ten-year colonoscopy window beside a one-year FIT window — mint one ticket per lookback; one wide window would over-expose the short-lookback elements.

The constraint set for this type is exactly these two. `claim_linkage` is not part of it (there is no claim), and `data_holder_filter` is not part of it (the audience is a single named Data Holder). Cross-cutting constraints such as `sensitivity_withhold` MAY be added; servers that do not enforce them reject the ticket.

### Policy Selection Inputs

| Input | Ticket field | Selects among |
|-------|--------------|---------------|
| Requesting organization | `requester` (Organization identifiers) | Whether a coverage or value-based contract relationship exists for this member |
| Measure | `measure` | Whether the requested elements are consistent with the named measure; any per-program arrangements |

### Data Holder Processing

* Verify issuer trust for this ticket type — trusting an issuer for claims adjudication tickets does not imply trusting it for recurring quality queries.
* The Data Holder MAY narrow release to entries it judges consistent with the named measure.
* Records restricted from disclosure to the payer are excluded silently, exactly as in claims adjudication — and the restriction matters more here, because no claim event implies the payer was party to the underlying care. The HIPAA self-pay restriction ([45 CFR 164.522(a)(1)(vi)](https://www.ecfr.gov/current/title-45/section-164.522)) is the leading case.
* The issuer attests the member attribution behind the query; trust frameworks decide what stands behind that attestation, and the Data Holder may check the relationship against its own coverage records.

### Open Questions

> **Open Question (OQ-QUALITY-GAP): Issuance topology.** Claims-based access anchors minting, scope, and expiry to a submission the provider just made. Quality gap queries have no such event. Three candidates: the provider's system mints from a payer's gap list (strongest provider control — the Data Holder mints exactly what it will honor); the payer mints under trust-framework accountability (the public-health pattern — the authority is the contract and the permitted purpose, and the ticket standardizes a verifiable request); or network infrastructure mints, attesting member attribution for both sides. Which of these, against what relationship record, and for what lifetime?
{: .callout .callout-open-question #oq-quality-gap}

### Example

{% include generated/signed-tickets/payer-quality-gap-ticket.html %}
