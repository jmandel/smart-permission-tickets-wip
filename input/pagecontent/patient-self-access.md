{% include callouts.html %}

This page defines one Permission Ticket type. The overview of all types is the [Use Case Catalog](use-case-catalog.html); constraint definitions live on [Access Constraints](access-constraints.html).

**Status:** Ready

### Purpose

*A patient uses a high-assurance Digital ID wallet to authorize an app to fetch their data from multiple hospitals.*

The patient authorizes once, with the issuer, and the ticket carries that authorization to many Data Holders — including Data Holders where the patient has never created a portal account. This is the simplest ticket type: no third-party requester and no profile claims.

### Typical Flow

Patient completes identity verification and authorization with the issuer → issuer mints a presenter-bound ticket → the patient's app presents the ticket at each Data Holder via token exchange → each Data Holder resolves the patient locally and issues a scoped access token.

### Required Claims

* **Subject:** `Patient` (matched by demographics: name, DOB, identifiers), with `subject_identity_evidence` SHOULD — an embedded identity token the Data Holder can verify itself.
* **Requester:** None (self-access). The absence of `requester` is what marks the ticket as self-access. The patient is the requester, so identity is recorded once, on the subject side.
* **Presenter binding:** Required. Individual-access tickets must be bound to the presenting client.

### Constraints

Draws from the [constraint catalog](access-constraints.html). The authorizing party is the patient at the issuer's authorization screen; each definition's authorizing-party language is what that screen says.

* **`fhir_resources`** (required) — the record types the patient chose, one entry per choice.
* **`data_period`** (optional) — the time limit the patient set.
* **`data_holder_filter`** (optional) — the organizations or regions the patient selected.

### Identity Evidence

The patient's verified identity is the basis of this grant, so the ticket SHOULD carry `subject_identity_evidence`: the high-assurance identity token (for example, an IAL2 ID token) from the verification step — whether the issuer signed the patient in as its own relying party or the app performed the sign-in and passed the token to the issuer during issuance. Embedding the token lets the Data Holder check the identity claims itself instead of taking the issuer's word for them. The [base specification](index.html#identity-evidence) defines how issuers and Data Holders verify who the embedded ID token was issued to; this profile expects IAL2-grade assurance and enough demographics to match the patient. Trust frameworks MAY require the embedded token; `subject.patient` is present either way.

### Policy Selection Inputs

One policy applies here: the Data Holder's patient self-access policy — the patient sees what they would see through the Data Holder's own patient-facing access. The only question the ticket fields answer is whether the Data Holder can confidently match the patient (`subject.patient`, strengthened by `subject_identity_evidence` when present).

### Data Holder Processing

* Resolve the subject to a local patient record; reject with `invalid_grant` on zero or ambiguous matches. Deployments that support an interactive fallback for subject disambiguation may use [Proposal 001](proposal-001-authz-code-fallback.html).
* A valid ticket does not override local rules such as result-release holds or portal access restrictions, and it does not establish that the patient has ever received care here — zero matches is a normal outcome, not an error in the ticket.
* Grant access scoped by the intersection rules of the base specification.

### Example

{% include generated/signed-tickets/uc1-ticket.html %}

### Variant: with identity evidence

The same ticket carrying `subject_identity_evidence`. The embedded ID token's demographics match `subject.patient`, and its `aud` identifies the ticket issuer's OIDC client at the evidence issuer. A token from the app's own sign-in would carry the app's OIDC client identifier instead, and the issuer would verify that mapping before embedding it:

{% include generated/signed-tickets/uc1-evidence-ticket.html %}

The embedded ID token decodes to:

{% include generated/signed-tickets/uc1-evidence-id-token.html %}
