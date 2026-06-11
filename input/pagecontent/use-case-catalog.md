{% include callouts.html %}

This page is the registry of Permission Ticket use cases. Each use case maps to a single `ticket_type` URI that identifies the ticket's schema and processing rules. The base protocol — transport, validation pipeline, access calculation — is defined on the [main specification page](index.html); this page defines what each ticket type requires and how a Data Holder processes it.

This specification currently defines four ticket types:

{% include generated/spec-snippets/index/use-case-profile-map.md %}

Ticket types are identified by their `ticket_type` URIs and referred to by name. Public Health Investigation is fully modeled and lives on [Future Use Cases](future-use-cases.html) since June 2026, alongside the other candidates; the near-term catalog holds the flows implementers on the project are ready to exercise.

### Status

| Status | Meaning |
|--------|---------|
| **Ready** | The underlying workflow is real today; ready for first implementations. |
| **Modeled** | Fields and processing rules are drafted in detail, but no real-world deployments exercise this flow yet. |

| Use Case | Status |
|----------|--------|
| Patient Self Access | Ready |
| Patient-Delegated Access | Modeled |
| Payer Claims Adjudication | Modeled |
| Payer Quality Gap Queries | Modeled |

### Per-Profile Constraints

The table below summarizes required and optional fields for each ticket type. Each profile pulls in the [access constraints](access-constraints.html) it needs; a Constraints section in each profile states how the [constraint template](access-constraints.html#constraint-template)'s sections land for that use case.

| Use Case | `presenter_binding` | Requester | Identity Evidence | Access Constraints |
|----------|---------------------|-----------|-------------------|--------------------|
| Patient Self Access | Required | — | `subject_identity_evidence` SHOULD | `fhir_resources` required; `data_period`, `data_holder_filter` optional |
| Patient-Delegated Access | Required | `RelatedPerson` (required) | `subject_identity_evidence` SHOULD; `requester_identity_evidence` SHOULD | `fhir_resources` required; `data_period` optional |
| Payer Claims Adjudication | Required | `Organization` (required) | — (requester is an organization) | `fhir_resources`, `claim_linkage` required |
| Payer Quality Gap Queries | Required | `Organization` (required) | — (requester is an organization) | `fhir_resources` (every entry narrowed), `data_period` required |

**Identity evidence principle.** Identity evidence SHOULD accompany each individual natural person whose verified identity is the basis of the grant. For patient self access that is the patient (`subject_identity_evidence`; the patient is also the requester, so it is recorded once). For delegated access that is both the delegate and the patient: the issuer verifies the delegate's identity and the patient's identity and wishes, so both evidence slots SHOULD be populated. B2B ticket types name an organization as requester; organizational trust is institutional and the evidence slots do not apply. Trust frameworks may strengthen SHOULD to SHALL.

Each use case section below follows a common template, including **Policy Selection Inputs**. `ticket_type` tells the Data Holder what kind of request this is (self-access, proxy access, claims review, …); the inputs listed per use case are the ticket fields that help it pick the right one of its own internal policies for this specific request. Tickets help the Data Holder pick a policy; they do not create new policies or override existing ones.

---

### Patient Self Access

**Status:** Ready

#### Purpose

*A patient uses a high-assurance Digital ID wallet to authorize an app to fetch their data from multiple hospitals.*

The patient authorizes once, with the issuer, and the ticket carries that authorization to many Data Holders — including Data Holders where the patient has never created a portal account. This is the simplest ticket type: no third-party requester and no profile claims.

#### Typical Flow

Patient completes identity verification and authorization with the issuer → issuer mints a presenter-bound ticket → the patient's app presents the ticket at each Data Holder via token exchange → each Data Holder resolves the patient locally and issues a scoped access token.

#### Required Claims

* **Subject:** `Patient` (matched by demographics: name, DOB, identifiers), with `subject_identity_evidence` SHOULD — an embedded identity token the Data Holder can verify itself.
* **Requester:** None (self-access). The absence of `requester` is what marks the ticket as self-access. The patient is the requester, so identity is recorded once, on the subject side.
* **Presenter binding:** Required. Individual-access tickets must be bound to the presenting client.

#### Constraints

Draws from the [constraint catalog](access-constraints.html). The authorizing party is the patient at the issuer's authorization screen; each definition's authorizing-party language is what that screen says.

* **`fhir_resources`** (required) — the record types the patient chose, one entry per choice.
* **`data_period`** (optional) — the time limit the patient set.
* **`data_holder_filter`** (optional) — the organizations or regions the patient selected.

#### Identity Evidence

The patient's verified identity is the basis of this grant, so the ticket SHOULD carry `subject_identity_evidence`: the high-assurance identity token (for example, an IAL2 ID token) from the verification step — whether the issuer signed the patient in as its own relying party or the app performed the sign-in and passed the token to the issuer during issuance. Embedding the token lets the Data Holder check the identity claims itself instead of taking the issuer's word for them. How to verify the embedded token is defined in the [base specification](index.html#identity-evidence); this profile expects IAL2-grade assurance and enough demographics to match the patient. Trust frameworks MAY require the embedded token; `subject.patient` is present either way.

#### Policy Selection Inputs

One policy applies here: the Data Holder's patient self-access policy — the patient sees what they would see through the Data Holder's own patient-facing access. The only question the ticket fields answer is whether the Data Holder can confidently match the patient (`subject.patient`, strengthened by `subject_identity_evidence` when present).

#### Data Holder Processing

* Resolve the subject to a local patient record; reject with `invalid_grant` on zero or ambiguous matches. Deployments that support an interactive fallback for subject disambiguation may use [Proposal 001](proposal-001-authz-code-fallback.html).
* A valid ticket does not override local rules such as result-release holds or portal access restrictions.
* Grant access scoped by the intersection rules of the base specification.

#### What This Ticket Does Not Prove

* That the patient has (or ever had) an account or care relationship at the Data Holder.
* That every requested data category is releasable under the Data Holder's local policy and applicable law.

#### Example

{% include generated/signed-tickets/uc1-ticket.html %}

##### Variant: with identity evidence

The same ticket carrying `subject_identity_evidence`. The embedded ID token's demographics match `subject.patient`, and its `aud` names the ticket issuer's client at the evidence issuer (the issuer-as-relying-party pattern; a token from the app's own sign-in would carry the app's client identifier instead):

{% include generated/signed-tickets/uc1-evidence-ticket.html %}

The embedded ID token decodes to:

{% include generated/signed-tickets/uc1-evidence-id-token.html %}

---

### Patient-Delegated Access

**Status:** Modeled

#### Purpose

*An adult daughter accesses her elderly mother's records. The relationship is verified by a Trusted Issuer, not the Hospital.*

Health systems maintain many distinct proxy policies: adult-to-adult delegation, parents of minors, parents of adolescents, guardians, agents under healthcare power of attorney, and more. The ticket's job is to carry enough verified facts for the Data Holder to pick the right one — even for a requester it has never seen.

#### Typical Flow

Requester completes identity verification with the issuer → issuer verifies the requester's authority for access → issuer mints a presenter-bound ticket naming both subject and requester → the requester's app presents the ticket → the Data Holder resolves the patient, evaluates the requester facts against its local proxy-access policies, and issues a scoped token.

#### Required Claims

* **Subject:** `Patient` (matched by demographics or identifier), with `subject_identity_evidence` SHOULD.
* **Requester:** `RelatedPerson` (required) with exactly one relationship coding: the requester's authority. `requester_identity_evidence` SHOULD.
* **Presenter binding:** Required.

Both evidence slots apply here because a proper issuer verifies both people: the delegate's identity (they are who they claim) and the patient's identity and wishes (they actually granted this access). Embedding both tokens lets the Data Holder check each independently.

#### Constraints

Draws from the [constraint catalog](access-constraints.html). The authorizing party is the patient — or the instrument that confers authority — not the delegate who presents the ticket, so each definition's authorizing-party language is owed during the delegation ceremony. The Data Holder's proxy policy narrows below the ticket: a granted scope never overrides what local policy lets this class of requester see.

* **`fhir_resources`** (required) — the ceiling the patient set when granting the delegation.
* **`data_period`** (optional) — a time bound set at the same ceremony.

#### Requester and Authority

`requester.relationship` SHALL contain **exactly one coding**: the requester's authority — why they are permitted to ask. Family relationship (daughter, spouse) is left out: proxy policies turn on the authority type and the patient's age, not kinship, and the requester's `name` covers display.

The authority coding comes from a closed value set of existing [v3-RoleCode](https://terminology.hl7.org/CodeSystem-v3-RoleCode.html) concepts, covering the mutually exclusive sources of authority:

| Source of authority | Code(s) | Meaning |
|---------------------|---------|---------|
| Patient-granted, informal | `DELEGATEE` | The patient (delegator) granted this person access through the issuer's verified workflow |
| Patient-granted, formal instrument | `HPOWATT`, `DPOWATT`, `POWATT`, `SPOWATT` | The patient executed a power-of-attorney-class instrument |
| Law- or court-conferred | `GUARD` | Natural (parental), appointed, or court-ordered guardianship or custody |

The ticket SHALL expire (`exp`) no later than the requester's verified authority ends. If the authority ends early, the issuer revokes the ticket. `RelatedPerson.period` MAY record the authority's validity dates for audit; Data Holders do not need to check it separately.

##### Issuer Verification Obligations

Before asserting an authority coding, the issuer SHALL have completed the corresponding verification:

| Authority coding | The issuer verified that… |
|------------------|---------------------------|
| `DELEGATEE` | The patient was authenticated and competent at grant time and designated this requester through the issuer's delegation workflow |
| `HPOWATT` / `DPOWATT` / `POWATT` / `SPOWATT` | A power-of-attorney-class instrument of the corresponding type was examined and covers the requested access |
| `GUARD` | Guardianship, parental authority, or court-ordered custody/access was verified — including, for parental assertions over a minor, that no known order restricts the requester's access |

The issuer keeps the source documents (POA instruments, delegation records, court orders). If a dispute arises later, the ticket's `jti` lets auditors pull the issuer's records for that grant. Trust frameworks may audit issuer compliance with these obligations.

#### Policy Selection Inputs

| Input | Ticket field | Selects among |
|-------|--------------|---------------|
| Subject age and demographics | `subject.patient` | Policies for minors vs. adolescents vs. adults |
| Authority | `requester.relationship` | Policies for delegates vs. guardians vs. POA agents |

#### Data Holder Processing

* Resolve the subject as in patient self access.
* Evaluate requester facts against local proxy-access policies. The Data Holder relies on the issuer's verification of identity and authority per its configured trust policy; it applies its own rules for what each requester class may see.
* Local sensitivity and adolescent-privacy rules continue to apply below the ticket.

#### What This Ticket Does Not Prove

* That the requester may see every category of the patient's data; local policy decides what each kind of proxy can see.
* That the authority remains valid indefinitely; the ticket's validity window and revocation status bound reliance.

#### Open Questions

> **Open Question: Per-Ticket Verification Class.** Should each ticket also say *how* the issuer verified the authority (portal delegation record, examined instrument, court order)? Or is it enough that each code carries defined issuer obligations, audited through the trust framework? The working group plans to review this with health-system authorization and release-of-information experts.
{: .callout .callout-open-question #oq-verification-class}

#### Example

{% include generated/signed-tickets/uc2-ticket.html %}

---

### Payer Claims Adjudication

**Status:** Modeled

#### Purpose

*A provider's system submits a claim and attaches a Permission Ticket. The payer presents the ticket back at the provider's own FHIR endpoint to read clinical data tied to the claim.*

When a payer needs more than the claim itself — medical-necessity review, a request for additional information, post-submission documentation — today's path is document exchange: the payer guesses a document code, the provider assembles and pushes attachments. A ticket attached to the claim replaces that follow-up loop with a scoped read. The provider knows at submission time exactly which patient, which encounters, and which period the claim concerns, so it can mint the grant itself.

The issuer and the Data Holder are the same party. This is the ticket type with the fewest moving parts — one system mints tickets and later accepts them back — and trust validation is correspondingly simple. The signature still matters: the ticket travels through the payer's claims pipeline, and presenter binding keeps anything else that handles the claim from redeeming it.

CMS's [Interoperability Framework](https://www.cms.gov/health-technology-ecosystem/interoperability-framework) names this flow among its criteria for aligned networks: "Payers, including CMS, can query for relevant data tied to a claim submitted in the last 60 days and receive clinical data for that encounter." The criterion names the goal and leaves the mechanism open; this profile is a candidate mechanism.

#### Typical Flow

Provider's system submits a claim (or prior authorization) → mints a ticket naming the payer as requester and linking the claim → the ticket travels with the submission → during adjudication, the payer's system presents the ticket at the provider's token endpoint → the provider validates its own signature, checks presenter binding, and issues an access token limited to records associated with the claim.

#### Required Claims

* **Subject:** `Patient`, with `subject.recipient_record` SHOULD — the issuer is the Data Holder, so it knows its own record identifier and the direct-target hint always resolves.
* **Requester:** `Organization` (the payer), identified well enough for the provider to match it to the claim's payer.
* **Presenter binding:** Required — `trust_framework_client` naming the payer organization, or `jkt`.
* **Expiration:** `exp` SHOULD cover the payer's documented additional-information window for the linked claim. Sixty days from submission matches the CMS criterion; the operational windows underneath run 45–75 days (Medicare ADR, PERM, commercial record-request periods), so the length is a deployment parameter, not a fixed rule.

#### Constraints

Draws from the [constraint catalog](access-constraints.html). The authorizing party is the provider organization, disclosing under HIPAA's payment and operations permission — there is no patient authorization ceremony, but the patient's standing restriction rights bind (see Restricted Data).

* **`fhir_resources`** (required) — the kind-level ceiling: the resource types adjudication needs, likely broader than US Core for some claim types (see the open question below). The record-level limit is `claim_linkage`.
* **[`claim_linkage`](access-constraints.html#claim_linkage)** (required) — introduced by this profile; valued from the claim or prior authorization being submitted and its encounters.

The constraint set for this type is exactly these two. `data_period` is not part of it, and issuers SHALL NOT include it: the claim is this type's time anchor — event records are bounded by their encounters through the claim association, and the patient-level floor is deliberately current-state — so any `data_period` value is either redundant (inside the encounter bounds) or contradictory (cutting current medications out of the floor). `data_holder_filter` is likewise not part of this type: the audience is the single issuing Data Holder. Cross-cutting constraints defined elsewhere in the catalog, such as `sensitivity_withhold`, MAY be added, with the standard consequence for servers that do not enforce them.

#### Restricted Data

* Records restricted from disclosure to the payer are excluded silently. The base rule already covers this — a valid ticket does not override local rules — and the issuer is the Data Holder, which holds its own restriction flags. The leading case is the HIPAA right to restrict ([45 CFR 164.522(a)(1)(vi)](https://www.ecfr.gov/current/title-45/section-164.522)): a provider must honor a patient's request not to disclose to a health plan information about items or services paid out of pocket in full.
* The payer is told the response may be lawfully incomplete (the client section above). Treating a filtered response as the complete record is the failure that sentence prevents.
* When the patient has authorized disclosure of restricted items to the plan, the ticket says so explicitly: a `sensitivity_release_authorized` claim per [Proposal 005](proposal-005-sensitive-data-modeling.html), using the v3-ActCode `HIPAASelfPay` security label policy code — never a silent widening of the default.

#### Policy Selection Inputs

| Input | Ticket field | Selects among |
|-------|--------------|---------------|
| Requesting payer | `requester` (Organization identifiers) | Whether this is the linked claim's payer; participation arrangements |
| Linked claim | `access.claim_linkage.claim` | Which adjudication the request belongs to; whether it is still open |

#### Data Holder Processing

* Verify the ticket signature against this system's own issuing keys — the issuer is the Data Holder.
* Verify presenter binding: the redeeming client is the payer the ticket names.
* Resolve the subject; `recipient_record` resolves directly, since the issuer assigned it.
* Enforce `claim_linkage` against the claim's association records; apply restriction flags before release.

#### What This Ticket Does Not Prove

* That the response is the complete record; restricted data is excluded without notice.
* That the payer may use the data for anything beyond adjudicating the linked claim; downstream obligations live in law and contract.
* That this ticket type covers bulk retrieval. Quality-measure and risk-adjustment chart retrieval are population-scale and not claim-linked; element-specific quality queries may become a separate ticket type, and broad chart-chase is out of scope.

#### Open Questions

> **Open Question (OQ-PAYER-DATA): Resource types for adjudication.** What does claims review need beyond US Core resource types? Claim, Coverage, and documentation resources are candidates; payer implementers should name the list before this profile advances.
{: .callout .callout-open-question #oq-payer-data}

> **Open Question (OQ-PAYER-TRANSPORT): How the ticket travels with the claim.** In an X12 275 attachment, in a CDex Task, or by reference from the claim itself? This profile defines the artifact, not the transport; early adopters should converge on one carriage pattern.
{: .callout .callout-open-question #oq-payer-transport}

#### Example

{% include generated/signed-tickets/uc5-ticket.html %}

---

### Payer Quality Gap Queries

**Status:** Modeled

#### Purpose

*A payer or value-based care organization retrieves the specific data elements that close a quality gap — an HbA1c result, a mammogram report, a blood-pressure reading — without pulling the chart.*

CMS's [Interoperability Framework](https://www.cms.gov/health-technology-ecosystem/interoperability-framework) names this flow among its criteria: "Payers, including CMS, and other Value-based care organizations may query for specific quality data elements (e.g., HbA1c, mammograms, colonoscopies, blood pressure, BMI, depression screening) necessary for payment or health care operations."

Today this need is met by chart retrieval at scale — HEDIS season runs February through May, with thousands of record requests per provider organization, and broad pulls are exactly what providers resist. An element-scoped ticket is the narrow alternative: the wire artifact says precisely which elements, for which measure, over which period, and nothing else is authorized.

#### Typical Flow

A ticket is minted per member and measure, naming the payer as requester and the measure as a profile claim → the payer's system presents the ticket at the provider's endpoint → the provider issues an access token limited to the named elements over the measurement period.

How tickets get minted is deliberately open — see the open question below. Unlike claims adjudication, no submission event anchors issuance; candidate issuers include the provider's system working from an attribution list, or network infrastructure operating under a participation agreement. The ticket artifact is the same under any of them, which is why it can be defined now.

#### Required Claims

* **Subject:** `Patient`, with `subject.recipient_record` SHOULD when the issuer is the Data Holder.
* **Requester:** `Organization` (the payer or value-based care entity), identified well enough to match a coverage or contract relationship.
* **Profile claim:** `measure` (CodeableConcept, required) — which quality measure the query serves. A fact, not a limit: it tells the Data Holder which of its policies applies and gives both sides the audit and re-association anchor, while `fhir_resources` carries the actual limit.
* **Presenter binding:** Required — `trust_framework_client` naming the requesting organization, or `jkt`.
* **Expiration:** `exp` SHOULD cover the reporting window the query serves.

#### Constraints

Draws from the [constraint catalog](access-constraints.html), nothing new defined:

* **`fhir_resources`** (required) — the elements, one entry per element: `{ "type": "Observation", "code": { "system": "http://loinc.org", "code": "4548-4" } }` is an HbA1c query. Every entry SHALL carry a `category` or `code` narrowing; an un-narrowed entry is a chart section, which is not what this type authorizes.
* **`data_period`** (required) — the measurement or lookback period from the measure specification; without it a quality query is unbounded history. When a measure's elements carry different lookbacks — a ten-year colonoscopy window beside a one-year FIT window — mint one ticket per lookback; one wide window would over-expose the short-lookback elements.

The constraint set for this type is exactly these two. `claim_linkage` is not part of it (there is no claim), and `data_holder_filter` is not part of it (the audience is a single named Data Holder). Cross-cutting constraints such as `sensitivity_withhold` MAY be added, with the standard consequence.

#### Policy Selection Inputs

| Input | Ticket field | Selects among |
|-------|--------------|---------------|
| Requesting organization | `requester` (Organization identifiers) | Whether a coverage or value-based contract relationship exists for this member |
| Measure | `measure` | Whether the requested elements are consistent with the named measure; any per-program arrangements |

#### Data Holder Processing

* Verify issuer trust for this ticket type — trusting an issuer for claims adjudication tickets does not imply trusting it for recurring quality queries.
* The Data Holder MAY narrow release to entries it judges consistent with the named measure.
* Records restricted from disclosure to the payer are excluded silently, exactly as in claims adjudication — and the restriction matters more here, because no claim event implies the payer was party to the underlying care. The HIPAA self-pay restriction ([45 CFR 164.522(a)(1)(vi)](https://www.ecfr.gov/current/title-45/section-164.522)) is the leading case.

#### What This Ticket Does Not Prove

* That the response is the complete record; restricted data is excluded without notice.
* That the member attribution behind the query is current; the issuer attests it, and trust frameworks decide what stands behind that attestation.
* That this ticket type supports chart retrieval. It authorizes named elements; a request shaped like a chart pull belongs to a different conversation.

#### Open Questions

> **Open Question (OQ-QUALITY-GAP): Issuance topology.** Claims-based access anchors minting, scope, and expiry to a submission the provider just made. Quality gap queries have no such event. Who issues the ticket, against what relationship record, and for what lifetime?
{: .callout .callout-open-question #oq-quality-gap}

> **Open Question (OQ-PANEL): Element panels.** Some measures need many codes; enumerating them as single-code entries is verbose. Should a future constraint reference a value set or measure definition instead of enumerating codes, and what would Data Holder enforcement of a value-set reference require?
{: .callout .callout-open-question #oq-panel}

#### Example

{% include generated/signed-tickets/payer-quality-gap-ticket.html %}
