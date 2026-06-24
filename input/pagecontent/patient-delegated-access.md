{% include callouts.html %}

This page defines one Permission Ticket type. The overview of all types is the [Use Case Catalog](use-case-catalog.html); constraint definitions live on [Access Constraints](access-constraints.html).

**Status:** Modeled

### Purpose

*An adult daughter accesses her elderly mother's records. The relationship is verified by a Trusted Issuer, not the Hospital.*

Health systems maintain many distinct proxy policies: adult-to-adult delegation, parents of minors, parents of adolescents, guardians, agents under healthcare power of attorney, and more. The ticket's job is to carry enough verified facts for the Data Holder to pick the right one — even for a requester it has never seen.

### Typical Flow

Requester completes identity verification with the issuer → issuer verifies the requester's authority for access → issuer mints a presenter-bound ticket naming both subject and requester → the requester's app presents the ticket → the Data Holder resolves the patient, evaluates the requester facts against its local proxy-access policies, and issues a scoped token.

### Required Claims

* **Subject:** `Patient` (matched by demographics or identifier), with `subject_identity_evidence` SHOULD.
* **Requester:** `RelatedPerson` (required) with exactly one relationship coding: the requester's authority. `requester_identity_evidence` SHOULD.
* **Presenter binding:** Required.

Both evidence slots apply here because a proper issuer verifies both people: the delegate's identity (they are who they claim to be) and the patient's identity and wishes (they actually granted this access). Embedding both tokens lets the Data Holder check each independently.

### Constraints

Draws from the [constraint catalog](access-constraints.html). The authorizing party is the patient — or the instrument that confers authority — not the delegate who presents the ticket, so the issuer presents each definition's authorizing-party language during the delegation ceremony. The Data Holder's proxy policy narrows below the ticket: a granted scope never overrides what local policy lets this class of requester see.

* **`smart_scopes`** (required) — the ceiling the patient set when granting the delegation.
* **`data_period`** (optional) — a time bound set at the same ceremony.
* **`data_holder_filter`** (optional) — the organizations or regions the patient selected when delegating.

The two individual-access types draw the same constraints; only the ceremony that sets the values differs.

### Requester and Authority

`requester.relationship` SHALL contain **exactly one coding**: the requester's authority — why they are permitted to ask. Family relationship (daughter, spouse) is left out: proxy policies turn on the authority type and the patient's age, not kinship, and the requester's `name` covers display.

The authority coding comes from a closed value set of existing [v3-RoleCode](https://terminology.hl7.org/CodeSystem-v3-RoleCode.html) concepts, covering the mutually exclusive sources of authority:

| Source of authority | Code(s) | Meaning |
|---------------------|---------|---------|
| Patient-granted, informal | `DELEGATEE` | The patient (delegator) granted this person access through the issuer's verified workflow |
| Patient-granted, formal instrument | `HPOWATT`, `DPOWATT`, `POWATT`, `SPOWATT` | The patient executed a power-of-attorney-class instrument |
| Law- or court-conferred | `GUARD` | Natural (parental), appointed, or court-ordered guardianship or custody |

The ticket SHALL expire (`exp`) no later than the requester's verified authority ends. If the authority ends early, the issuer revokes the ticket. `RelatedPerson.period` MAY record the authority's validity dates for audit; Data Holders do not need to check it separately.

### Issuer Verification Obligations

Before asserting an authority coding, the issuer SHALL have completed the corresponding verification:

| Authority coding | The issuer verified that… |
|------------------|---------------------------|
| `DELEGATEE` | The patient was authenticated and competent at grant time and designated this requester through the issuer's delegation workflow |
| `HPOWATT` / `DPOWATT` / `POWATT` / `SPOWATT` | A power-of-attorney-class instrument of the corresponding type was examined and covers the requested access |
| `GUARD` | Guardianship, parental authority, or court-ordered custody/access was verified — including, for parental assertions over a minor, that no known order restricts the requester's access |

The issuer keeps the source documents (POA instruments, delegation records, court orders). If a dispute arises later, the ticket's `jti` lets auditors pull the issuer's records for that grant. Trust frameworks may audit issuer compliance with these obligations.

### Policy Selection Inputs

| Input | Ticket field | Selects among |
|-------|--------------|---------------|
| Subject age and demographics | `subject.patient` | Policies for minors vs. adolescents vs. adults |
| Authority | `requester.relationship` | Policies for delegates vs. guardians vs. POA agents |

### Data Holder Processing

* Resolve the subject as in patient self access.
* Evaluate requester facts against local proxy-access policies. The Data Holder relies on the issuer's verification of identity and authority per its configured trust policy; it applies its own rules for what each requester class may see.
* Local sensitivity and adolescent-privacy rules continue to apply below the ticket.

### Open Questions

> **Open Question (OQ-UC2-VERIFY): Per-Ticket Verification Class.** Should each ticket also say *how* the issuer verified the authority (portal delegation record, examined instrument, court order)? Or is it enough that each code carries defined issuer obligations, audited through the trust framework? The working group plans to review this with health-system authorization and release-of-information experts.
{: .callout .callout-open-question #oq-verification-class}

### Example

{% include generated/signed-tickets/uc2-ticket.html %}
