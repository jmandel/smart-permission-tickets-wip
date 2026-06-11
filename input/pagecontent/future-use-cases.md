{% include callouts.html %}

These use cases are not part of the near-term implementable catalog. Most are sketches: their `ticket_type` URIs are reserved, their field lists are unsettled, and each has unresolved questions. Public Health Investigation is the exception — fully modeled and deferred, not unfinished. They are kept here so the work is not lost, and to keep the [Use Case Catalog](use-case-catalog.html) focused on what implementers on the project are ready to build.

{% include generated/spec-snippets/index/future-use-case-map.md %}

### Public Health Investigation

**Status:** Modeled — moved here from the active catalog in June 2026 to keep near-term focus on the flows implementers on the project are ready to exercise. The profile below is complete; a worked tuberculosis follow-up example for review with the public health work group is in progress.

#### Purpose

*A Hospital creates a Case Report. The Public Health Agency (PHA) uses a ticket to query for follow-up data.*

Public health follow-up is well suited to ticket-based exchange: the requester is an organization, the request is tied to a concrete triggering event (a reportable condition), and the Data Holder can decide from the ticket alone — no user needs to sign in.

In many jurisdictions, law already requires providers to respond to these queries. A ticket does not add a new gate on top of that obligation, and its absence does not create a right to refuse a legally mandated query. The ticket's job is to make an automated yes cheaper: it gives the responding system a verifiable, well-scoped request it can act on without a phone call.

#### Typical Flow

A reportable event triggers case reporting → the issuer (which may be the reporting system or network infrastructure) mints a ticket naming the public health agency as requester, with the reportable condition as a profile claim → the agency's system presents the ticket during follow-up → the Data Holder evaluates the request against its public-health disclosure policies.

#### Required Claims

* **Subject:** `Patient` (matched by demographics or identifier).
* **Requester:** `Organization` (public health agency), identified well enough for directory matching (name, identifiers).
* **Profile claims:** `reportable_condition` (coded condition), a top-level claim — says which investigation the request belongs to.
* **Access:** `fhir_resources` required; `data_period` and `data_holder_filter` typical.
* **Presenter binding:** Optional (B2B; `aud` + client authentication generally suffice).

#### Policy Selection Inputs

| Input | Ticket field | Selects among |
|-------|--------------|---------------|
| Requesting agency | `requester` (Organization identifiers) | Whether the agency is known (directory match); any per-agency arrangements |
| Reportable condition | `reportable_condition` | What the investigation covers; which kinds of data to release |

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

### Social Care (CBO) Referral

*A community-based organization accesses referral-related data; a food bank volunteer updates a referral status.*

Sketch: requester is an `Organization` (social care hub or CBO); profile claims carry the coded `concern` and the `referral` (ServiceRequest); access could include `create`/`update` interactions for referral status.

> **Open Question (OQ-UC4-WRITE): Social Care Write Access.** Should write access (for example, updating referral status) be modeled in this profile at all, or split into a separate, narrower ticket type? Letting an outside organization write into the record raises governance questions that read-only access does not.
{: .callout .callout-open-question #oq-uc4-write}

### Research Study

*A research organization retrieves records for a study participant without the researcher becoming a user at the hospital.*

Sketch: requester is an `Organization` (research institute); a `study` profile claim identifies the governing ResearchStudy. The ticket would say which study this is and that the issuer verified the study's required workflow — participant consent, an approved waiver, or whatever the study and trust framework require. The base ticket does not try to model research authorization in general; this becomes viable where study governance is concrete and verifiable.

### Provider-to-Provider Consult — parked

*A specialist requests data from a referring provider.*

Parked, not just immature: the natural issuer here is the referring provider's system — the same system the specialist would query — and a system that can mint a ticket for itself can simply grant access directly. Until someone shows where a signed, portable artifact adds value in this flow, this use case is on hold.

> **Open Question (OQ-UC7-DESIGN): Core UC7 Design.** Three basics are unsettled. **Who is the requester?** Referrals usually go to an organization, and nobody knows which specialist will pick up the consult when the ticket would be minted. **Who mints the ticket?** The obvious issuer is the referring provider's system — but that is the same system the specialist will query. **Can EHRs apply the right policy?** An outside specialist has no user account at the referring system, and vendors say they treat that case as generic B2B trust today.
{: .callout .callout-open-question #oq-uc7-design}
