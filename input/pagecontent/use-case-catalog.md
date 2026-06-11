{% include callouts.html %}

This page is the registry of Permission Ticket use cases. Each use case maps to a single `ticket_type` URI that identifies the ticket's schema and processing rules. The base protocol — transport, validation pipeline, access calculation — is defined on the [main specification page](index.html); this page defines what each ticket type requires and how a Data Holder processes it.

This specification currently defines three ticket types:

{% include generated/spec-snippets/index/use-case-profile-map.md %}

Use-case numbers are stable identifiers, not an ordering. UC3 (Public Health Investigation) is fully modeled and lives on [Future Use Cases](future-use-cases.html) since June 2026, alongside the other candidates; the near-term catalog holds the flows implementers on the project are ready to exercise.

### Status

| Status | Meaning |
|--------|---------|
| **Ready** | The underlying workflow is real today; ready for first implementations. |
| **Modeled** | Fields and processing rules are drafted in detail, but no real-world deployments exercise this flow yet. |

| Use Case | Status |
|----------|--------|
| UC1: Patient Self Access | Ready |
| UC2: Patient-Delegated Access | Modeled |
| UC5: Payer Claims Adjudication | Modeled |

### Per-Profile Constraints

The table below summarizes required and optional fields for each ticket type. Each profile pulls in the [access constraints](index.html#access-constraints) it needs; a Constraints section in each profile states how the [constraint template](index.html#constraint-template)'s sections land for that use case.

| Use Case | `presenter_binding` | Requester | Identity Evidence | Access Constraints |
|----------|---------------------|-----------|-------------------|--------------------|
| UC1: Patient Self Access | Required | — | `subject_identity_evidence` SHOULD | `permissions` required; `data_period`, `data_holder_filter` optional |
| UC2: Patient-Delegated Access | Required | `RelatedPerson` (required) | `subject_identity_evidence` SHOULD; `requester_identity_evidence` SHOULD | `permissions` required; `data_period` optional |
| UC5: Payer Claims Adjudication | Required | `Organization` (required) | — (requester is an organization) | `permissions`, `claim_linkage` required; `data_period` recommended |

**Identity evidence principle.** Identity evidence SHOULD accompany each individual natural person whose verified identity is the basis of the grant. For UC1 that is the patient (`subject_identity_evidence`; the patient is also the requester, so it is recorded once). For UC2 that is both the delegate and the patient: the issuer verifies the delegate's identity and the patient's identity and wishes, so both evidence slots SHOULD be populated. B2B ticket types name an organization as requester; organizational trust is institutional and the evidence slots do not apply. Trust frameworks may strengthen SHOULD to SHALL.

Each use case section below follows a common template, including **Policy Selection Inputs**. `ticket_type` tells the Data Holder what kind of request this is (self-access, proxy access, claims review, …); the inputs listed per use case are the ticket fields that help it pick the right one of its own internal policies for this specific request. Tickets help the Data Holder pick a policy; they do not create new policies or override existing ones.

---

### Use Case 1: Patient Self Access

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

The authorizing party is the patient, making sharing choices on the issuer's authorization screen. Each constraint carries one of those choices:

* **`permissions`** (required). The record types the patient chose to share, carried as resource types with optional category and code filters. The screen lists kinds of records ("immunizations," "lab results"); the app receives at most what the patient picked.
* **`data_period`** (optional). The time limit the patient set ("records since 2021"). The screen presents it as bounding clinical dates, with currently relevant items such as active allergies possibly included regardless — that caveat is part of the promise, not fine print discovered later.
* **`data_holder_filter`** (optional). The organizations or regions the patient selected. The screen must not promise more than the filter delivers: it gates which Data Holders may answer, and an answering Data Holder typically returns the combined record it holds (see the [implementation note](index.html#data_holder_filter) on shared systems).

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

### Use Case 2: Patient-Delegated Access

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

The authorizing party is the patient — or the instrument that confers authority — not the delegate who presents the ticket. The sharing decision is captured during the delegation ceremony, so that ceremony is where each constraint's explanation is owed:

* **`permissions`** (required). The ceiling on what the delegate's app may receive, set when the patient granted the delegation ("my daughter may see my conditions, medications, and immunizations"). The Data Holder's proxy policy narrows further: a granted scope never overrides what local policy lets this class of requester see, and adolescent-privacy and sensitivity rules continue to apply below the ticket.
* **`data_period`** (optional). A time bound the patient set when delegating, with the same clinical-dates semantics and currently-relevant caveat as UC1.

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

* Resolve the subject as in UC1.
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

### Use Case 5: Payer Claims Adjudication

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

This profile pulls in `permissions` and `data_period` from the base set and defines one new constraint, `claim_linkage`. The authorizing party is the provider organization, disclosing under HIPAA's payment and operations permission — there is no patient authorization ceremony, but the patient's standing restriction rights bind (see Restricted Data).

* **`permissions`** (required). The resource types adjudication legitimately needs. Likely broader than US Core for some claim types — see the open question below.
* **`data_period`** (recommended). A hard outer bound on clinical dates, typically the claim's service period with margin. No association judgment under `claim_linkage` may release anything outside it.
* **`claim_linkage`** (required). Defined below.

#### `claim_linkage`

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

**For the authorizing party.** The constraint records what the provider organization decided to disclose: records tied to this claim, for this adjudication, and nothing else. It is the ticket-shaped form of minimum necessary.

**For the client.** The payer learns which claim or prior authorization the ticket belongs to — the re-association that document workflows carry in tracking numbers — and what to expect from redemption: records the provider associates with that claim. The response may be lawfully incomplete; absence of a record is not a representation that it does not exist.

**For the Data Holder.** Release only records you associate with the referenced claim: at minimum the records linked to the named encounters, plus current problems, medications, and allergies; never beyond `data_period` when present. The association is your own — you minted the ticket against your own claim — so enforcement is determinate against your own records. A Data Holder with no association knowledge for the referenced claim cannot enforce this constraint and rejects the ticket. That is the correct outcome, and it is what confines this ticket type to self-issued tickets today.

The enforcement floor names patient-level categories explicitly because encounter linkage in FHIR data is incomplete: the records adjudication needs most — problem list, medications, allergies — typically link to no encounter at all.

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

> **Open Question (OQ-UC5-DATA): Resource types for adjudication.** What does claims review need beyond US Core resource types? Claim, Coverage, and documentation resources are candidates; payer implementers should name the list before this profile advances.
{: .callout .callout-open-question #oq-uc5-data}

> **Open Question (OQ-UC5-TRANSPORT): How the ticket travels with the claim.** In an X12 275 attachment, in a CDex Task, or by reference from the claim itself? This profile defines the artifact, not the transport; early adopters should converge on one carriage pattern.
{: .callout .callout-open-question #oq-uc5-transport}

#### Example

{% include generated/signed-tickets/uc5-ticket.html %}
