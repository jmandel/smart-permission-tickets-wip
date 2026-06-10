{% include callouts.html %}

These use cases came up in working-group discussion and may become ticket types later. None is implementable today: their `ticket_type` URIs are reserved, their field lists are sketches, and each has unresolved questions. They are kept here so the discussion is not lost, and to keep the [Use Case Catalog](use-case-catalog.html) limited to what implementers can build.

{% include generated/spec-snippets/index/future-use-case-map.md %}

### Social Care (CBO) Referral

*A community-based organization accesses referral-related data; a food bank volunteer updates a referral status.*

Sketch: requester is an `Organization` (social care hub or CBO); context carries the coded `concern` and the `referral` (ServiceRequest); access could include `create`/`update` interactions for referral status.

> **Open Question (OQ-UC4-WRITE): Social Care Write Access.** Should write access (for example, updating referral status) be modeled in this profile at all, or split into a separate, narrower ticket type? Letting an outside organization write into the record raises governance questions that read-only access does not.
{: .callout .callout-open-question #oq-uc4-write}

### Payer Claims Adjudication

*A payer requests clinical documents to support a specific claim.*

Sketch: requester is an `Organization` (payer); context ties the request to one concrete adjudication via a coded `service` and a `claim` (Claim resource); access is typically narrow, with `data_period` bounding the episode. Broad payer access not tied to a concrete request is intentionally out of scope.

### Research Study

*A research organization retrieves records for a study participant without the researcher becoming a user at the hospital.*

Sketch: requester is an `Organization` (research institute); context identifies the governing `study` (ResearchStudy). The ticket would say which study this is and that the issuer verified the study's required workflow — participant consent, an approved waiver, or whatever the study and trust framework require. The base ticket does not try to model research authorization in general; this becomes viable where study governance is concrete and verifiable.

### Provider-to-Provider Consult — parked

*A specialist requests data from a referring provider.*

Parked, not just immature: the natural issuer here is the referring provider's system — the same system the specialist would query — and a system that can mint a ticket for itself can simply grant access directly. Until someone shows where a signed, portable artifact adds value in this flow, this use case is on hold.

> **Open Question (OQ-UC7-DESIGN): Core UC7 Design.** Three basics are unsettled. **Who is the requester?** Referrals usually go to an organization, and nobody knows which specialist will pick up the consult when the ticket would be minted. **Who mints the ticket?** The obvious issuer is the referring provider's system — but that is the same system the specialist will query. **Can EHRs apply the right policy?** An outside specialist has no user account at the referring system, and vendors say they treat that case as generic B2B trust today.
{: .callout .callout-open-question #oq-uc7-design}
