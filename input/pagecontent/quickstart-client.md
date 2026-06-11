{% include callouts.html %}

This page tells you what to build for one role. It is non-normative; the [specification](index.html) governs. Read it to scope the work, then implement against the normative sections it links to.

1. **Get a ticket** from an issuer (out of band, or via [Proposal 003](proposal-003-smart-launch-issuance.html)).
2. **Check support** in each Data Holder's `.well-known/smart-configuration` (`grant_types_supported`, `smart_permission_ticket_types_supported`).
3. **Present the ticket** at the token endpoint: one POST with your client assertion and the ticket as `subject_token`, requesting SMART v2 scopes within what the ticket allows. ([Request](index.html#transport-token-exchange-rfc-8693))
4. **Use the access token** for FHIR reads as usual. Re-present the ticket when the token expires; get a fresh ticket from the issuer when the ticket expires.
5. **Handle `interaction_required`** if you can: it means the Data Holder could not match the patient and wants one interactive disambiguation. Background clients can treat it as an error and move on. ([Proposal 001](proposal-001-authz-code-fallback.html))

The signing and verification code in the [source bundle](downloads.html) generates all the worked examples and is a working reference for each role.
