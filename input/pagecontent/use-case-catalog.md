{% include callouts.html %}

This page is the registry of Permission Ticket use cases. Each use case maps to a single `ticket_type` URI that identifies the ticket's schema and processing rules. The base protocol — transport, validation pipeline, access calculation — is defined on the [main specification page](index.html); this page defines what each ticket type requires and how a Data Holder processes it.

This specification currently defines three ticket types:

{% include generated/spec-snippets/index/use-case-profile-map.md %}

Additional candidates are tracked on [Future Use Cases](future-use-cases.html). They are not part of the implementable specification.

### Status

| Status | Meaning |
|--------|---------|
| **Ready** | The underlying workflow is real today; ready for first implementations. |
| **Modeled** | Fields and processing rules are drafted in detail, but no real-world deployments exercise this flow yet. |

| Use Case | Status |
|----------|--------|
| UC1: Patient Self Access | Ready |
| UC2: Patient-Delegated Access | Modeled |
| UC3: Public Health Investigation | Modeled |

### Per-Profile Constraints

The table below summarizes required and optional fields for each ticket type. All ticket types may use any `access` dimension (`permissions`, `data_period`, `data_holder_filter`); the table notes typical usage.

| Use Case | `presenter_binding` | Requester | Identity Evidence | Context Fields | Access |
|----------|---------------------|-----------|-------------------|----------------|--------|
| UC1: Patient Self Access | Required | — | `subject_identity_evidence` SHOULD | *(none)* | `permissions` required; `data_period` optional |
| UC2: Patient-Delegated Access | Required | `RelatedPerson` (required) | `subject_identity_evidence` SHOULD; `requester_identity_evidence` SHOULD | *(none)* | `permissions` required |
| UC3: Public Health | Optional | `Organization` (required) | — (requester is an organization) | `reportable_condition` | `permissions` required; `data_period`, `data_holder_filter` typical |

**Identity evidence principle.** Identity evidence SHOULD accompany each individual natural person whose verified identity is the basis of the grant. For UC1 that is the patient (`subject_identity_evidence`; the patient is also the requester, so it is recorded once). For UC2 that is both the delegate and the patient: the issuer verifies the delegate's identity and the patient's identity and wishes, so both evidence slots SHOULD be populated. B2B ticket types name an organization as requester; organizational trust is institutional and the evidence slots do not apply. Trust frameworks may strengthen SHOULD to SHALL.

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

* **Subject:** `Patient` (matched by demographics: name, DOB, identifiers), with `subject_identity_evidence` SHOULD — an embedded identity token the Data Holder can verify itself.
* **Requester:** None (self-access). The absence of `requester` is what marks the ticket as self-access. The patient is the requester, so identity is recorded once, on the subject side.
* **Context:** *(none; `context` may be omitted or empty)*
* **Access:** `permissions` with specific resource types and interactions; `data_period` optional.
* **Presenter binding:** Required. Individual-access tickets must be bound to the presenting client.

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
* **Context:** *(none — delegation is expressed by the presence and type of `requester`)*
* **Access:** `permissions` with specific resource types and interactions.
* **Presenter binding:** Required.

Both evidence slots apply here because a proper issuer verifies both people: the delegate's identity (they are who they claim) and the patient's identity and wishes (they actually granted this access). Embedding both tokens lets the Data Holder check each independently.

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

### Use Case 3: Public Health Investigation

**Status:** Modeled

#### Purpose

*A Hospital creates a Case Report. The Public Health Agency (PHA) uses a ticket to query for follow-up data.*

Public health follow-up is well suited to ticket-based exchange: the requester is an organization, the request is tied to a concrete triggering event (a reportable condition), and the Data Holder can decide from the ticket alone — no user needs to sign in.

In many jurisdictions, law already requires providers to respond to these queries. A ticket does not add a new gate on top of that obligation, and its absence does not create a right to refuse a legally mandated query. The ticket's job is to make an automated yes cheaper: it gives the responding system a verifiable, well-scoped request it can act on without a phone call.

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
