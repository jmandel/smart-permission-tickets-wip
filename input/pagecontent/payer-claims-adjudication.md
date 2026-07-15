{% include callouts.html %}

This page defines one Permission Ticket type. The overview of all types is the [Use Case Catalog](use-case-catalog.html); constraint definitions live on [Access Constraints](access-constraints.html).

**Status:** Modeled

### Purpose

*A provider's system submits a claim and attaches a Permission Ticket. The payer presents the ticket back at the provider's own FHIR endpoint to read clinical data tied to the claim.*

When a payer needs more than the claim itself — medical-necessity review, a request for additional information, post-submission documentation — today's path is document exchange: the payer guesses a document code, the provider assembles and pushes attachments. A ticket attached to the claim replaces that follow-up loop with a scoped read. The provider knows at submission time exactly which patient, which encounters, and which period the claim concerns, so it can mint the grant itself.

Why a per-claim ticket rather than standing network access? A trust framework authenticates the payer; it does not say which records this adjudication may touch. Standing B2B access leaves minimum-necessary to the requester's discretion; the ticket pins release to one submission's encounters and leaves both sides a signed record of exactly what was authorized and why.

The issuer and the Data Holder are the same party. This is the ticket type with the fewest moving parts — one system mints tickets and later accepts them back — and trust validation is correspondingly simple. The signature still matters: the ticket travels through the payer's claims pipeline, and only an authenticated client the provider accepts as acting for the requester can redeem it.

CMS's [Interoperability Framework](https://www.cms.gov/health-technology-ecosystem/interoperability-framework) names this flow among its criteria for aligned networks: "Payers, including CMS, can query for relevant data tied to a claim submitted in the last 60 days and receive clinical data for that encounter." The criterion names the goal and leaves the mechanism open; this profile is a candidate mechanism.

### Typical Flow

Provider's system submits a claim (or prior authorization) → mints a ticket naming the payer as requester and linking the claim → the ticket travels with the submission (in an X12 275 attachment, a CDex Task, or by reference — tickets are a capability other exchange flows carry, and this profile does not pick the vehicle) → during adjudication, the payer's system presents the ticket at the provider's token endpoint → the provider validates its own signature, checks presenter binding, and issues an access token limited to records associated with the claim.

### Required Claims

* **Subject:** `Patient`, with `subject.recipient_record` SHOULD — the issuer is the Data Holder, so it knows its own record identifier and the direct-target hint always resolves.
* **Requester:** `Organization` (the payer), identified well enough for the provider to match it to the claim's payer.
* **Presenter binding:** Optional (B2B): `aud` plus client authentication provide the trust boundary. `requester` identifies the principal, not necessarily the presenter — a contractor adjudicating on the payer's behalf may redeem with its own registered client when the delegation is tracked through registration or expressed in the trust framework (OpenID Federation can carry it explicitly). See [the base specification](index.html#relationship-between-presenter_binding-and-requester) on this distinction.
* **Expiration:** `exp` SHOULD cover the payer's documented additional-information window for the linked claim. Sixty days from submission matches the CMS criterion; the operational windows underneath run 45–75 days (Medicare ADR, PERM, commercial record-request periods), so the length is a deployment parameter, not a fixed rule.

### Constraints

Draws from the [constraint catalog](access-constraints.html). The authorizing party is the provider organization, disclosing under HIPAA's payment and operations permission — there is no patient authorization ceremony, but the patient's standing restriction rights bind (see Restricted Data).

* **[`claim_linkage`](claim-linkage.html)** (required) — this profile's required bound on release: the encounters the submitted claim or prior authorization covers, optionally re-associated to the submission by the provider's own claim control number. The Data Holder releases the records it associates with those encounters.

This type carries only `claim_linkage` — it scopes one adjudication, never bulk retrieval; element-specific quality queries are [Payer Quality Gap Queries](payer-quality-gap-queries.html), and chart-scale retrieval is out of scope for both. There is no `smart_scopes` ceiling: the linked encounters are the bound, and the Data Holder releases the resource types adjudication needs against them. That set is likely broader than US Core for some claim types — Claim, Coverage, and the resources carrying the linked encounters' notes and documentation (DocumentReference, Binary) are typical candidates — and which types to release is the Data Holder's release-policy decision, not a scope list in the ticket. `data_period` is not part of this type, and issuers SHALL NOT include it: the encounters are this type's time anchor — they bound event records, and the patient-level categories in the authorized universe are deliberately current-state — so any `data_period` value is either redundant (inside the encounter bounds) or contradictory (cutting current medications out of the universe). `data_holder_filter` is likewise not part of this type: the audience is the single issuing Data Holder. Cross-cutting constraints defined elsewhere in the catalog, such as `sensitivity_withhold`, MAY be added, with the standard consequence for servers that do not enforce them.

### Restricted Data

* Records restricted from disclosure to the payer are excluded silently. The base rule already covers this — a valid ticket does not override local rules — and the issuer is the Data Holder, which holds its own restriction flags. The leading case is the HIPAA right to restrict ([45 CFR 164.522(a)(1)(vi)](https://www.ecfr.gov/current/title-45/section-164.522)): a provider must honor a patient's request not to disclose to a health plan information about items or services paid out of pocket in full.
* The payer is told the response may be lawfully incomplete (see the [`claim_linkage`](claim-linkage.html) constraint's "For the client" note). The payer must not treat a filtered response as the complete record.
* When the patient has authorized disclosure of restricted items to the plan, the ticket says so explicitly: a `sensitivity_release_authorized` claim per [Proposal 005](proposal-005-sensitive-data-modeling.html), using the v3-ActCode `HIPAASelfPay` security label policy code — never a silent widening of the default.

### Policy Selection Inputs

| Input | Ticket field | Selects among |
|-------|--------------|---------------|
| Requesting payer | `requester` (Organization identifiers) | Whether this is the linked claim's payer; participation arrangements |
| Linked encounters | `access.claim_linkage.encounter` (optionally `.claim`) | Which encounters the request covers; which adjudication it belongs to; whether it is still open |

### Data Holder Processing

* Verify the ticket signature against this system's own issuing keys — the issuer is the Data Holder.
* Confirm the redeeming client acts for the requester — by presenter binding when present, or by the client's registration or trust-framework relationship to the named payer.
* Resolve the subject; `recipient_record` resolves directly, since the issuer assigned it.
* Enforce `claim_linkage` against the records you associate with the linked encounters; apply restriction flags before release.

### Example

{% include generated/signed-tickets/uc5-ticket.html %}
