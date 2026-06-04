{% include callouts.html %}

This page is the registry of Permission Ticket use cases. Each use case maps to a single `ticket_type` URI that identifies the ticket's schema and processing rules. The base protocol — transport, validation pipeline, access calculation — is defined on the [main specification page](index.html); this page defines what each ticket type requires and how a Data Holder processes it.

{% include generated/spec-snippets/index/use-case-profile-map.md %}

### Status

Each use case carries one of three statuses:

| Status | Meaning |
|--------|---------|
| **Ready** | The underlying workflow is real today; ready for first implementations. |
| **Modeled** | Fields and processing rules are drafted in detail, but no real-world deployments exercise this flow yet. |
| **Needs development** | Not ready; expect material change before implementation. |

| Use Case | Status |
|----------|--------|
| UC1: Patient Self Access | Ready |
| UC2: Patient-Delegated Access | Modeled |
| UC3: Public Health Investigation | Modeled |
| UC4: Social Care (CBO) Referral | Needs development |
| UC5: Payer Claims Adjudication | Needs development |
| UC6: Research Study | Needs development |
| UC7: Provider-to-Provider Consult | Needs development |

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

Each use case section below follows a common template, including **Policy Selection Inputs**. `ticket_type` tells the Data Holder what kind of request this is (self-access, proxy access, public health, …); the inputs listed per use case are the ticket fields that help it pick the right one of its own internal policies for this specific request. Tickets help the Data Holder pick a policy; they do not create new policies or override existing ones.

---

### Use Case 1: Patient Self Access

**Status:** Ready

#### Purpose

*A patient uses a high-assurance Digital ID wallet to authorize an app to fetch their data from multiple hospitals.*

The patient authorizes once, with the issuer, and the ticket carries that authorization to many Data Holders — including Data Holders where the patient has never created a portal account. This is the simplest ticket type: no third-party requester and no context fields.

#### Typical Flow

Patient completes identity verification and authorization with the issuer → issuer mints a presenter-bound ticket → the patient's app presents the ticket at each Data Holder via token exchange → each Data Holder resolves the patient locally and issues a scoped access token.

#### Required Claims

* **Subject:** `Patient` (matched by demographics: name, DOB, identifiers), optionally accompanied by `subject_identity_evidence` — an embedded identity token the Data Holder can verify itself.
* **Requester:** None (self-access). The absence of `requester` is what marks the ticket as self-access.
* **Context:** *(none; `context` may be omitted or empty)*
* **Access:** `permissions` with specific resource types and interactions.
* **Presenter binding:** Required. Individual-access tickets must be bound to the presenting client.

#### Identity Evidence

If the issuer verified the patient with a high-assurance identity token (for example, an IAL2 ID token), it can embed that token in the ticket. The Data Holder can then check the identity claims itself instead of taking the issuer's word for them. How to verify the embedded token is defined in the [base specification](index.html#identity-evidence); this profile expects IAL2-grade assurance and enough demographics to match the patient. Deployments MAY require the embedded token; `subject.patient` is present either way.

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

The same ticket carrying `subject_identity_evidence`. The embedded ID token's demographics match `subject.patient`, its `aud` names the ticket issuer's client at the evidence issuer, and the ticket includes `iat` (required when evidence is present):

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

* **Subject:** `Patient` (matched by demographics or identifier).
* **Requester:** `RelatedPerson` (required) with exactly one relationship coding: the requester's authority.
* **Context:** *(none — delegation is expressed by the presence and type of `requester`)*
* **Access:** `permissions` with specific resource types and interactions.
* **Presenter binding:** Required.

#### Requester and Authority

`requester.relationship` SHALL contain **exactly one coding**: the requester's authority — why they are permitted to ask — from the closed value set `DELEGATEE`, `HPOWATT`, `DPOWATT`, `POWATT`, `SPOWATT`, `GUARD` (all from [v3-RoleCode](https://terminology.hl7.org/CodeSystem-v3-RoleCode.html); see [the base specification](index.html#delegation-and-relatedpersonrelationship)). Family relationship (daughter, spouse) is deliberately left out: proxy policies turn on the authority type and the patient's age, not kinship, and the requester's `name` covers display.

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

Should each ticket also say *how* the issuer verified the authority (portal delegation, examined instrument, court order), or is the per-code table above enough? See the [open question](index.html#oq-verification-class) in the base specification — planned for review with health-system authorization and release-of-information experts.

#### Example

{% include generated/signed-tickets/uc2-ticket.html %}

---

### Use Case 3: Public Health Investigation

**Status:** Modeled

#### Purpose

*A Hospital creates a Case Report. The Public Health Agency (PHA) uses a ticket to query for follow-up data.*

Public health follow-up is well suited to ticket-based exchange: the requester is an organization, the request is tied to a concrete triggering event (a reportable condition), and the Data Holder can decide from the ticket alone — no user needs to sign in.

#### Typical Flow

A reportable event triggers case reporting → the issuer (which may be the reporting system or network infrastructure) mints a ticket naming the public health agency as requester, with the reportable condition as context → the agency's system presents the ticket during follow-up → the Data Holder evaluates the request against its public-health disclosure policies.

#### Required Claims

* **Subject:** `Patient` (matched by demographics or identifier).
* **Requester:** `Organization` (public health agency), identified well enough for directory matching (name, identifiers).
* **Context:** `reportable_condition` (coded condition) — says which investigation the request belongs to and bounds it.
* **Access:** `permissions`; optional `data_period` and `data_holder_filter`.
* **Presenter binding:** Optional (B2B; `aud` + client authentication generally suffice).

#### Policy Selection Inputs

| Input | Ticket field | Selects among |
|-------|--------------|---------------|
| Requesting agency | `requester` (Organization identifiers) | Whether the agency is known (directory match); any per-agency arrangements |
| Reportable condition | `context.reportable_condition` | What the investigation covers; which kinds of data to release |

#### Data Holder Processing

* Verify issuer trust for this ticket type — trusting an issuer for patient self-access does not imply trusting it for public health tickets.
* Match the requesting organization against directory or trust-framework information.
* Apply local public-health disclosure policy; narrow or reject requests that go beyond the named condition.

#### What This Ticket Does Not Prove

* The detailed legal mandate behind the investigation. This specification is jurisdiction-neutral; the legal basis for public-health disclosure lives in applicable law, the trust framework, and the Data Holder's policy — not in the base ticket.
* That every data class is responsive to the named condition; the Data Holder may narrow.

#### Example

{% include generated/signed-tickets/uc3-ticket.html %}

---

### Use Case 4: Social Care (CBO) Referral

**Status:** Needs development

#### Purpose

*A community-based organization needs to access referral-related data. A Food Bank volunteer needs to update a referral status.*

This is the least mature profile: community-based organizations vary widely in technical capability and trust-framework participation, and the write-access pattern (updating referral status) raises questions no other profile does.

#### Required Claims

* **Subject:** `Patient` (matched by demographics or identifier).
* **Requester:** `Organization` (social care hub or CBO).
* **Context:** `concern` (coded concern), `referral` (ServiceRequest).
* **Access:** `permissions` with specific resource types and interactions — potentially including `create`/`update` interactions for referral status.
* **Presenter binding:** Optional.

#### Policy Selection Inputs

| Input | Ticket field | Selects among |
|-------|--------------|---------------|
| Requesting organization | `requester` | Whether the organization is a known partner |
| Referral context | `context.referral`, `context.concern` | Which data relate to this referral |

#### What This Ticket Does Not Prove

* That the requesting organization is authorized for anything beyond the referenced referral.

#### Open Questions

> **Open Question: Social Care Write Access.** Should write access (for example, updating referral status) be modeled in this profile at all, or split into a separate, narrower ticket type? Letting an outside organization write into the record raises governance questions that read-only access does not.
{: .callout .callout-open-question #oq-uc4-write}

#### Example

{% include generated/signed-tickets/uc4-ticket.html %}

---

### Use Case 5: Payer Claims Adjudication

**Status:** Needs development

#### Purpose

*A Payer requests clinical documents to support a specific claim.*

Each ticket covers one concrete claim or service: the context identifies the claim, and the access constraints narrow the request to the relevant records and period. Broad payer access not tied to a concrete request is intentionally out of scope.

#### Required Claims

* **Subject:** `Patient` (matched by demographics or identifier).
* **Requester:** `Organization` (payer).
* **Context:** `service` (coded service), `claim` (Claim resource) — ties the request to a specific adjudication.
* **Access:** `permissions`; optional `data_period` and `data_holder_filter`, typically narrow.
* **Presenter binding:** Optional.

#### Policy Selection Inputs

| Input | Ticket field | Selects among |
|-------|--------------|---------------|
| Requesting payer | `requester` | Whether the payer is a known trading partner; any per-payer arrangements |
| Claim context | `context.claim`, `context.service` | Which records relate to this claim |

#### What This Ticket Does Not Prove

* Coverage, payment obligation, or the merits of the claim — only that the issuer verified the request context.
* Ongoing or population-level access; each ticket covers one request.

#### Example

{% include generated/signed-tickets/uc5-ticket.html %}

---

### Use Case 6: Research Study

**Status:** Needs development

#### Purpose

*A research organization retrieves records for a study participant without the researcher becoming a "user" at the hospital.*

The ticket says which study this is, who is asking, and that the issuer verified the study's required workflow was completed. What that workflow is — participant consent, an approved waiver, something else — depends on the study and the trust framework. The base ticket does not try to model research authorization in general. This use case is most viable where study governance is concrete and verifiable.

#### Required Claims

* **Subject:** `Patient` (matched by demographics or identifier).
* **Requester:** `Organization` (research institute).
* **Context:** `study` (ResearchStudy resource) — identifies the governing study.
* **Access:** `permissions`; optional `data_period`, typically bounded by the protocol.
* **Presenter binding:** Optional (issuers may use binding, but the base model does not require it).

#### Policy Selection Inputs

| Input | Ticket field | Selects among |
|-------|--------------|---------------|
| Requesting organization | `requester` | Whether the organization is a known research partner |
| Study identity | `context.study` | Study-specific arrangements and data-use agreements |

#### What This Ticket Does Not Prove

* That the patient consented, in any general sense. The ticket says the issuer verified the study's workflow; what that means legally depends on the study and the framework.
* That the subject remains an active participant at redemption time, unless the profile defines a freshness rule.

#### Example

{% include generated/signed-tickets/uc6-ticket.html %}

---

### Use Case 7: Provider-to-Provider Consult

**Status:** Needs development

#### Purpose

*A Specialist (Practitioner) requests data from a Referring Provider.*

The care relationship here is concrete and recent (the referral), and the context is operationally meaningful (the consult request). Little design work has happened beyond this sketch — see the open questions below.

#### Required Claims

* **Subject:** `Patient` (matched by demographics or identifier).
* **Requester:** `PractitionerRole` (specialist role, including the practitioner's organization).
* **Context:** `reason` (coded reason), `consult_request` (ServiceRequest) — the referral that establishes the care relationship.
* **Access:** `permissions` with specific resource types and interactions.
* **Presenter binding:** Optional.

#### Requester and Authority

No authority coding is needed here: the referral itself is why the specialist may ask, and it is right there in `context.consult_request`. The issuer attests that the consult request is genuine and current.

#### Policy Selection Inputs

| Input | Ticket field | Selects among |
|-------|--------------|---------------|
| Requesting role and organization | `requester` | Whether the requester is a known partner; who to record in the audit log |
| Consult context | `context.consult_request`, `context.reason` | Which data relate to this consult; when to flag for manual review |

#### What This Ticket Does Not Prove

* An ongoing treatment relationship beyond the referenced consult.
* Authority to access data unrelated to the referral reason.

#### Open Questions

> **Open Question: Core UC7 Design.** Three basics are unsettled. **Who is the requester?** Referrals usually go to an organization, and nobody knows which specialist will pick up the consult at the time the ticket would be minted — so maybe the requester should be an `Organization`, not a `PractitionerRole`. **Who mints the ticket?** The obvious issuer is the referring provider's system — but that is the same system the specialist will query, and it could just grant access directly. It is not clear when a signed ticket adds value here. **Can EHRs apply the right policy?** An outside specialist has no user account at the referring system, and vendors say they treat that case as generic B2B trust today.
{: .callout .callout-open-question #oq-uc7-design}

#### Example

{% include generated/signed-tickets/uc7-ticket.html %}
