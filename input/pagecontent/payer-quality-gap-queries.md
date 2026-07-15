{% include callouts.html %}

This page defines one Permission Ticket type. The overview of all types is the [Use Case Catalog](use-case-catalog.html); constraint definitions live on [Access Constraints](access-constraints.html).

**Status:** Modeled

### Purpose

*A payer or value-based care organization retrieves the structured evidence a named quality measure needs — an HbA1c result, a mammogram report, a blood-pressure reading — for a member attributed to it.*

CMS's [Interoperability Framework](https://www.cms.gov/health-technology-ecosystem/interoperability-framework) names this flow among its criteria: "Payers, including CMS, and other Value-based care organizations may query for specific quality data elements (e.g., HbA1c, mammograms, colonoscopies, blood pressure, BMI, depression screening) necessary for payment or health care operations."

Today this evidence is gathered by chart retrieval at scale — during the HEDIS reporting season a provider organization fields thousands of record requests. A quality gap ticket is the element-scoped form of the same request for a single member: the signed artifact says precisely which elements, for which measure, over which period, and authorizes nothing else. The provider gets a verifiable, auditable record of exactly what was asked and why.

The ticket authorizes data only for quality measurement of the named measure. Using the ticket, or the data it returns, for another purpose — risk adjustment, underwriting — is outside the grant, and the trust framework the issuer operates under backs that limit. Evidence that lives only in clinical notes is document retrieval, not an element query, and is outside this type.

### Typical Flow

A ticket is minted per member and measure, naming the payer as requester and the measure it serves → the payer's system presents the ticket at the provider's endpoint → the provider issues an access token limited to the named elements over the measurement period. One ticket serves one measure; a member's open gaps for the season are several tickets, each with its own purpose and audit trail, not one blurred union.

The payer mints the ticket itself, within a trust relationship it already has with the provider — a network, a value-based care contract, or a coverage relationship. The ticket does not establish that relationship; it carries a signed, scoped, single-purpose assertion that the provider can enforce uniformly and log. A provider may instead mint tickets from a payer's gap list; the artifact is identical either way.

### Required Claims

* **Subject:** `Patient`, with `subject.recipient_record` SHOULD when the issuer is the Data Holder.
* **Requester:** `Organization` (the payer or value-based care entity), identified well enough to match a coverage or contract relationship.
* **Profile claim:** `measure` (CodeableConcept, required) — the quality measure the query serves. The requester names the data it needs in `smart_scopes`; `measure` says why, selecting the Data Holder's applicable policy and anchoring the audit and re-association trail.
* **Presenter binding:** Optional (B2B), as in [claims adjudication](payer-claims-adjudication.html): the Data Holder confirms the redeeming client acts for the requester, whether through binding, registration, or a trust-framework relationship.
* **Expiration:** `exp` SHOULD cover the reporting window the query serves.

### Constraints

Draws from the [constraint catalog](access-constraints.html), nothing new defined:

* **`smart_scopes`** (required) — the elements, one scope per element: `patient/Observation.rs?code=http://loinc.org|4548-4` is an HbA1c query. Every scope carries a granular `?category` or `?code` narrowing, so the ticket authorizes specific elements rather than whole record types. This is the enforced limit.
* **`data_period`** (required) — the measurement or lookback period from the measure specification; without it a quality query is unbounded history. When a measure's elements carry different lookbacks — a ten-year colonoscopy window beside a one-year FIT window — mint one ticket per lookback; one wide window would over-expose the short-lookback elements.

This type carries just `smart_scopes` and `data_period`. `claim_linkage` is not part of it (there is no claim), and `data_holder_filter` is not part of it (the audience is a single named Data Holder). Cross-cutting constraints such as `sensitivity_withhold` MAY be added; servers that do not enforce them reject the ticket.

### Policy Selection Inputs

| Input | Ticket field | Selects among |
|-------|--------------|---------------|
| Requesting organization | `requester` (Organization identifiers) | Whether a coverage or value-based contract relationship exists for this member |
| Measure | `measure` | Whether the requested elements are consistent with the named measure; any per-program arrangements |

### Data Holder Processing

* Verify issuer trust for this ticket type — trusting an issuer for claims adjudication tickets does not imply trusting it for recurring quality queries.
* Confirm the requester's coverage or contract relationship to the member against the Data Holder's own records. The issuer attests the attribution behind the query, but releasing data to a payer is the provider's disclosure to make, so the relationship check is not delegated away.
* The Data Holder MAY narrow release to entries it judges consistent with the named measure.
* Records restricted from disclosure to the payer are excluded silently, exactly as in claims adjudication. The restriction matters here because no claim event implies the payer was party to the underlying care; the HIPAA self-pay restriction ([45 CFR 164.522(a)(1)(vi)](https://www.ecfr.gov/current/title-45/section-164.522)) is the leading case.

### Open Questions

> **Open Question (OQ-QUALITY-GAP): Attribution record and lifetime.** A payer-minted ticket rests on a member-attribution attestation. Against what relationship record does a Data Holder check it — coverage and eligibility, a value-based contract panel, a network attribution list — and how stale may that attestation be? And over what lifetime should a recurring quality query's ticket remain valid?
{: .callout .callout-open-question #oq-quality-gap}

### Example

This example shows the payer-minted case — the flow the CMS criterion names. The payer signs as issuer and addresses the provider's endpoint; the member is identified by demographics and member identifier, with no `recipient_record`, so the Data Holder resolves the subject by matching and checks the attribution relationship against its own records (see Data Holder Processing and the open question above). A provider-minted ticket is identical in shape, with `iss` equal to `aud` and a resolvable `recipient_record`.

{% include generated/signed-tickets/payer-quality-gap-ticket.html %}
