{% include callouts.html %}

This page is the registry of Permission Ticket use cases. Each use case maps to a single `ticket_type` URI that identifies the ticket's schema and processing rules. The base protocol — transport, validation pipeline, access calculation — is defined on the [main specification page](index.html); this page defines what each ticket type requires and how a Data Holder processes it.

{% include generated/spec-snippets/index/use-case-profile-map.md %}

### Status Tiers

Use cases carry an explicit maturity status so implementers know which profiles the working group believes are ready to build against and which are still being mapped out:

| Status | Meaning |
|--------|---------|
| **Core early candidate** | The workflow, required fields, and Data Holder decision model are well understood. Targeted for first implementations. |
| **Narrow-profile candidate** | Viable when scoped to a concrete, narrow request pattern; broader variants are not yet modeled. |
| **Profile-specific** | Viable where the governing workflow is concrete and verifiable; otherwise experimental. |
| **Experimental** | Recorded to map the design space. Not ready for implementation; expect material change. |

| Use Case | Status |
|----------|--------|
| UC1: Patient Self Access | Core early candidate |
| UC2: Patient-Delegated Access | Core early candidate |
| UC3: Public Health Investigation | Core early candidate (B2B) |
| UC4: Social Care (CBO) Referral | Experimental |
| UC5: Payer Claims Adjudication | Narrow-profile candidate |
| UC6: Research Study | Profile-specific |
| UC7: Provider-to-Provider Consult | Core early candidate (B2B) |

### Per-Profile Constraints

The table below summarizes required and optional fields for each ticket type:

| Use Case | `presenter_binding` | Requester | Context Fields | Access Dimensions |
|----------|---------------------|-----------|----------------|-------------------|
| UC1: Patient Self Access | Required | — | *(none)* | `permissions` (required) |
| UC2: Patient-Delegated Access | Required | `RelatedPerson` (required) | *(none)* | `permissions` (required) |
| UC3: Public Health | Optional | `Organization` (required) | `reportable_condition` | `permissions`, `data_period`, `data_holder_filter` |
| UC4: Social Care | Optional | `Organization` (required) | `concern`, `referral` | `permissions` |
| UC5: Payer Claims | Optional | `Organization` (required) | `service`, `claim` | `permissions`, `data_period`, `data_holder_filter` |
| UC6: Research | Optional | `Organization` (required) | `study` | `permissions`, `data_period` |
| UC7: Provider Consult | Optional | `PractitionerRole` (required) | `reason`, `consult_request` | `permissions` |

Each use case section below follows a common template, including a **Policy Selection Inputs** table: the ticket fields a Data Holder uses to select among its existing internal access policies. Permission Tickets supply policy-selection inputs; they do not rewrite or replace the Data Holder's policies.

---

### Use Case 1: Patient Self Access

**Status:** Core early candidate

#### Purpose

*A patient uses a high-assurance Digital ID wallet to authorize an app to fetch their data from multiple hospitals.*

The patient authorizes once, with the issuer, and the ticket carries that authorization to many Data Holders — including Data Holders where the patient has never created a portal account. This is the simplest ticket type: no third-party requester, no context fields, and the most direct Data Holder decision.

#### Typical Flow

Patient completes identity verification and authorization with the issuer → issuer mints a presenter-bound ticket → the patient's app presents the ticket at each Data Holder via token exchange → each Data Holder resolves the patient locally and issues a scoped access token.

#### Required Claims

* **Subject:** `Patient` (matched by demographics: name, DOB, identifiers), or profile-permitted `subject_identity_evidence` when an embedded identity token carries the patient-resolution facts.
* **Requester:** None (self-access). The absence of `requester` is what marks the ticket as self-access.
* **Context:** *(none; `context` may be omitted or empty)*
* **Access:** `permissions` with specific resource types and interactions.
* **Presenter binding:** Required. Individual-access tickets must be bound to the presenting client.

#### Identity Evidence

This is the ticket type where `subject_identity_evidence` matters most: an issuer that relied on a high-assurance identity token (for example, an IAL2 ID token) can embed it so the Data Holder can verify the evidence directly. When the embedded token carries the patient-resolution facts, the profile permits omitting `subject.patient` rather than duplicating them. The Data Holder verifies the evidence issuer, signature, assurance level, and freshness according to its configured trust policy for this profile.

#### Policy Selection Inputs

| Input | Ticket field | Selects among |
|-------|--------------|---------------|
| Ticket type | `ticket_type` | Self-access policy class (vs. proxy or B2B classes) |
| Subject identity and assurance | `subject` / `subject_identity_evidence` | Match confidence handling; new-patient vs. known-portal-user paths |

This list is deliberately short: self-access is the simplest policy-routing case. The Data Holder's target behavior is that the patient sees what they would see through the Data Holder's own patient-facing access.

#### Data Holder Processing

* Resolve the subject to a local patient record; reject with `invalid_grant` on zero or ambiguous matches. Deployments that support an interactive fallback for subject disambiguation may use [Proposal 001](proposal-001-authz-code-fallback.html).
* Local policies continue to apply below the ticket: result-release holds, portal access restrictions, and similar internal rules are not overridden by a valid ticket.
* Grant access scoped by the intersection rules of the base specification.

#### What This Ticket Does Not Prove

* That the patient has (or ever had) an account or care relationship at the Data Holder.
* That every requested data category is releasable under the Data Holder's local policy and applicable law.

#### Example

{% include generated/signed-tickets/uc1-ticket.html %}

---

### Use Case 2: Patient-Delegated Access

**Status:** Core early candidate

#### Purpose

*An adult daughter accesses her elderly mother's records. The relationship is verified by a Trusted Issuer, not the Hospital.*

Delegated access is where Data Holder policy routing is richest: organizations maintain distinct policy classes for adult-to-adult delegation, parents of minors, parents of adolescents, guardians, agents under healthcare power of attorney, and more. The ticket's job is to carry enough verified facts to select the right class — even for a requester the Data Holder has never seen.

#### Typical Flow

Requester completes identity verification with the issuer → issuer verifies the relationship and the authority basis for access → issuer mints a presenter-bound ticket naming both subject and requester → the requester's app presents the ticket → the Data Holder resolves the patient, evaluates the requester facts against its local proxy-access policies, and issues a scoped token.

#### Required Claims

* **Subject:** `Patient` (matched by demographics or identifier).
* **Requester:** `RelatedPerson` (required) with relationship codings expressing both the personal relationship and the legal authority type.
* **Context:** *(none — delegation is expressed by the presence and type of `requester`)*
* **Access:** `permissions` with specific resource types and interactions.
* **Presenter binding:** Required.

#### Requester and Authority

The `requester.relationship` codings carry two distinct layers of fact (see [Delegation and RelatedPerson.relationship](index.html#delegation-and-relatedpersonrelationship) in the base specification):

* **Familial/personal codings** (for example `DAU`, `MTH`, `SPS`) — who the requester is to the patient. Useful for display, audit, and policy routing alongside subject demographics (for example, distinguishing parent-of-minor from parent-of-adolescent policy classes). Zero or more may appear.
* **Authority coding** — why the requester is permitted to ask. **Exactly one** SHALL appear, from the closed authority value set: `DELEGATEE`, `HPOWATT`, `DPOWATT`, `POWATT`, `SPOWATT`, `GUARD` (all from [v3-RoleCode](https://terminology.hl7.org/CodeSystem-v3-RoleCode.html)).

`RelatedPerson.period`, when present, bounds the validity of the relationship and authority. Data Holders SHALL treat an expired `period.end` as invalidating the authority assertion regardless of the ticket's `exp`.

##### Issuer Verification Obligations

Before asserting an authority coding, the issuer SHALL have completed the corresponding verification:

| Authority coding | The issuer verified that… |
|------------------|---------------------------|
| `DELEGATEE` | The patient was authenticated and competent at grant time and designated this requester through the issuer's delegation workflow |
| `HPOWATT` / `DPOWATT` / `POWATT` / `SPOWATT` | A power-of-attorney-class instrument of the corresponding type was examined and covers the requested access |
| `GUARD` | Guardianship, parental authority, or court-ordered custody/access was verified — including, for parental assertions over a minor, that no known order restricts the requester's access |

The underlying source documents and verification records stay with the issuer; the ticket `jti` anchors audit and dispute reconstruction from issuer records. Trust frameworks may audit issuer compliance with these obligations.

#### Policy Selection Inputs

| Input | Ticket field | Selects among |
|-------|--------------|---------------|
| Ticket type | `ticket_type` | Proxy/delegated-access policy classes (vs. self-access) |
| Subject age and demographics | `subject.patient` | Minor vs. adolescent vs. adult subject policy classes |
| Personal relationship | `requester.relationship` (familial codings) | Parent / spouse / other-adult routing |
| Authority | `requester.relationship` (authority coding) | Patient-delegate vs. guardianship vs. power-of-attorney policy buckets |
| Authority validity | `requester.period` | Whether the authority assertion is current |

#### Data Holder Processing

* Resolve the subject as in UC1.
* Evaluate requester facts against local proxy-access policies. The Data Holder relies on the issuer's verification of identity and relationship per its configured trust policy; it applies its own rules for what each requester class may see.
* Local sensitivity and adolescent-privacy rules continue to apply below the ticket.

#### What This Ticket Does Not Prove

* That the requester's authority extends to every category of the subject's data; local policy governs category-level release for each requester class.
* That the relationship remains valid indefinitely; the ticket's validity window and revocation status bound reliance.

#### Open Questions

See the [per-ticket verification class open question](index.html#oq-verification-class) in the base specification: whether Data Holders need a per-ticket signal of how the issuer verified the authority, beyond the per-code obligations above. Planned for review with health-system authorization and release-of-information experts.

#### Example

{% include generated/signed-tickets/uc2-ticket.html %}

---

### Use Case 3: Public Health Investigation

**Status:** Core early candidate (B2B)

#### Purpose

*A Hospital creates a Case Report. The Public Health Agency (PHA) uses a ticket to query for follow-up data.*

Public health follow-up is a strong early B2B profile: the requester is an organization, the request is tied to a concrete triggering event (a reportable condition), and the Data Holder decision can be profile-driven rather than user-driven.

#### Typical Flow

A reportable event triggers case reporting → the issuer (which may be the reporting system or network infrastructure) mints a ticket naming the public health agency as requester, with the reportable condition as context → the agency's system presents the ticket during follow-up → the Data Holder evaluates the request against its public-health disclosure policies.

#### Required Claims

* **Subject:** `Patient` (matched by demographics or identifier).
* **Requester:** `Organization` (public health agency), identified well enough for directory matching (name, identifiers).
* **Context:** `reportable_condition` (coded condition) — establishes what investigation the request belongs to and bounds its scope.
* **Access:** `permissions`; optional `data_period` and `data_holder_filter`.
* **Presenter binding:** Optional (B2B; `aud` + client authentication generally suffice).

#### Policy Selection Inputs

| Input | Ticket field | Selects among |
|-------|--------------|---------------|
| Ticket type | `ticket_type` | Public-health disclosure policy class |
| Requesting agency | `requester` (Organization identifiers) | Known-agency directory matching; per-agency arrangements |
| Reportable condition | `context.reportable_condition` | Scope of the investigation; which data classes are responsive |
| Time and place bounds | `access.data_period`, `access.data_holder_filter` | How much history, which holders answer |

#### Data Holder Processing

* Verify issuer trust for this ticket type — trusting an issuer for patient self-access does not imply trusting it for public health tickets.
* Match the requesting organization against directory or trust-framework information.
* Apply local public-health disclosure policy; narrow or reject where the request exceeds what the condition context supports.

#### What This Ticket Does Not Prove

* The detailed legal mandate behind the investigation. This specification is jurisdiction-neutral; the legal basis for public-health disclosure lives in applicable law, the trust framework, and the Data Holder's policy — not in the base ticket.
* That every data class is responsive to the named condition; the Data Holder may narrow.

#### Example

{% include generated/signed-tickets/uc3-ticket.html %}

---

### Use Case 4: Social Care (CBO) Referral

**Status:** Experimental

#### Purpose

*A community-based organization needs to access referral-related data. A Food Bank volunteer needs to update a referral status.*

This use case is recorded to map the design space. It is the least mature profile: community-based organizations vary widely in technical capability and trust-framework participation, and the write-access pattern (updating referral status) raises questions no other profile raises.

#### Required Claims

* **Subject:** `Patient` (matched by demographics or identifier).
* **Requester:** `Organization` (social care hub or CBO).
* **Context:** `concern` (coded concern), `referral` (ServiceRequest).
* **Access:** `permissions` with specific resource types and interactions — potentially including `create`/`update` interactions for referral status.
* **Presenter binding:** Optional.

#### Policy Selection Inputs

| Input | Ticket field | Selects among |
|-------|--------------|---------------|
| Ticket type | `ticket_type` | Social-care disclosure policy class |
| Requesting organization | `requester` | Known-partner vs. unknown-CBO handling |
| Referral context | `context.referral`, `context.concern` | Scope-of-referral narrowing |

#### What This Ticket Does Not Prove

* That the requesting organization is authorized for anything beyond the referenced referral.

#### Open Questions

> **Open Question: Social Care Write Access.** Should write access (for example, updating referral status) be modeled in this profile at all, or split into a separate, narrower ticket type? Write semantics interact with local clinical-data governance in ways read-only profiles do not.
{: .callout .callout-open-question #oq-uc4-write}

#### Example

{% include generated/signed-tickets/uc4-ticket.html %}

---

### Use Case 5: Payer Claims Adjudication

**Status:** Narrow-profile candidate

#### Purpose

*A Payer requests clinical documents to support a specific claim.*

This profile is viable when scoped to a concrete claim or service: the context identifies the claim, the access constraints narrow to the relevant records and period, and the Data Holder can evaluate the request against its payer-disclosure policies. Broad payer access not tied to a concrete request is intentionally out of scope.

#### Required Claims

* **Subject:** `Patient` (matched by demographics or identifier).
* **Requester:** `Organization` (payer).
* **Context:** `service` (coded service), `claim` (Claim resource) — ties the request to a specific adjudication.
* **Access:** `permissions`; optional `data_period` and `data_holder_filter`, typically narrow.
* **Presenter binding:** Optional.

#### Policy Selection Inputs

| Input | Ticket field | Selects among |
|-------|--------------|---------------|
| Ticket type | `ticket_type` | Payer-disclosure policy class |
| Requesting payer | `requester` | Trading-partner recognition; per-payer arrangements |
| Claim context | `context.claim`, `context.service` | Which records are responsive to the adjudication |
| Period bound | `access.data_period` | Service-date-relevant history |

#### What This Ticket Does Not Prove

* Coverage, payment obligation, or the merits of the claim — only that the issuer verified the request context.
* Authority for population-level or ongoing access; this profile is per-request.

#### Example

{% include generated/signed-tickets/uc5-ticket.html %}

---

### Use Case 6: Research Study

**Status:** Profile-specific

#### Purpose

*A research organization retrieves records for a study participant without the researcher becoming a "user" at the hospital.*

The ticket carries issuer-verified study access details: the study identity, the requesting organization, and profile-defined verification that the required study workflow was completed. Whether that workflow is participant consent, an approved waiver, or another governance path is defined by the specific profile and the trust framework — the base ticket does not define a universal research authorization model. This use case is a candidate where study governance is concrete and verifiable; otherwise it should be treated as experimental.

#### Required Claims

* **Subject:** `Patient` (matched by demographics or identifier).
* **Requester:** `Organization` (research institute).
* **Context:** `study` (ResearchStudy resource) — identifies the governing study.
* **Access:** `permissions`; optional `data_period`, typically bounded by the protocol.
* **Presenter binding:** Optional (issuers may use binding, but the base model does not require it).

#### Policy Selection Inputs

| Input | Ticket field | Selects among |
|-------|--------------|---------------|
| Ticket type | `ticket_type` | Research-disclosure policy class |
| Requesting organization | `requester` | Known research partner handling |
| Study identity | `context.study` | Study-specific arrangements, data-use agreements |

#### What This Ticket Does Not Prove

* A universal consent status. The ticket attests that the issuer verified the profile-defined study workflow; what that workflow legally establishes is profile- and framework-specific.
* That the subject remains an active participant at redemption time, unless the profile defines a freshness rule.

#### Example

{% include generated/signed-tickets/uc6-ticket.html %}

---

### Use Case 7: Provider-to-Provider Consult

**Status:** Core early candidate (B2B)

#### Purpose

*A Specialist (Practitioner) requests data from a Referring Provider.*

A strong early B2B profile: the care relationship is concrete and recent (the referral), the context is operationally meaningful (the consult request), and even without key binding the ticket is strictly better than status-quo ad hoc exchange.

#### Typical Flow

A referral or consult request is created → the issuer mints a ticket naming the consulting practitioner role and referencing the consult request → the specialist's system presents the ticket at the referring provider's Data Holder → the Data Holder evaluates the request against its treatment/consult disclosure policies.

#### Required Claims

* **Subject:** `Patient` (matched by demographics or identifier).
* **Requester:** `PractitionerRole` (specialist role, including the practitioner's organization).
* **Context:** `reason` (coded reason), `consult_request` (ServiceRequest) — the referral that establishes the care relationship.
* **Access:** `permissions` with specific resource types and interactions.
* **Presenter binding:** Optional.

#### Requester and Authority

No separate authority coding is needed for this profile: the care relationship *is* the authority basis, and it is evidenced by `context.consult_request`. The issuer attests that the consult request is genuine and current.

#### Policy Selection Inputs

| Input | Ticket field | Selects among |
|-------|--------------|---------------|
| Ticket type | `ticket_type` | Treatment/consult disclosure policy class |
| Requesting role and organization | `requester` | Known-partner vs. unknown-requester handling; audit identity |
| Consult context | `context.consult_request`, `context.reason` | Scope-of-consult narrowing; review triggers |

#### What This Ticket Does Not Prove

* An ongoing treatment relationship beyond the referenced consult.
* Authority to access data unrelated to the referral reason.

#### Open Questions

> **Open Question: Organization-Level Consult Requesters.** Referral handoffs are often made to an organization rather than a named practitioner. Should this profile also permit an `Organization` requester when the receiving practitioner is not known at issuance time?
{: .callout .callout-open-question #oq-uc7-org-requester}

#### Example

{% include generated/signed-tickets/uc7-ticket.html %}
