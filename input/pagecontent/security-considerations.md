{% include callouts.html %}

> This page was seeded by a structured adversarial review (June 2026; eight threat lenses, each finding independently challenged before inclusion) and has not yet had external security review. Treat it as a working list, not an assurance. Findings that produced normative changes are marked **(addressed)** with a link; the rest are residual risks that implementers and trust frameworks own.
{: .callout .callout-info}

### Ticket Theft and Replay

* Tickets are multi-use by design and Data Holders may not reject on previously-seen `jti`. A ticket without `presenter_binding` whose `aud` is a trust framework is a bearer credential redeemable by every authenticated client in that framework — including a Data Holder that received it and turns around to query its peers. Client authentication makes each redemption attributable, but does not prevent it. Issuers should prefer presenter binding, a narrow `aud`, or short `exp` for B2B tickets carrying sensitive scope; binding is already required for UC1/UC2.
* A ticket minted without a `revocation` claim has no kill switch before `exp`. Long lifetimes belong only on tickets that carry both revocation and presenter binding.
* Well-known JWKS binding is rooted in continued control of `entity_uri`. A lapsed or hijacked domain can publish a substitute JWKS and satisfy the binding. Data Holders should re-confirm the entity's current trust-framework recognition at redemption, not just resolve the JWKS. See [Proposal 006](proposal-006-well-known-client-identity.html#trust-considerations).

### Identity Evidence

* **(addressed)** Evidence demographics must be consistent with the party in the slot and with the resolved record; mismatch is grounds for rejection. Without this check, a verified identity for one person lends false assurance to a request about another. ([Subject Resolution](index.html#subject-resolution), [Identity Evidence](index.html#identity-evidence))
* The evidence `aud` rule prevents harvesting: a token is only accepted if it was issued to the ticket issuer or the presenting client, proving the sign-in happened as part of this ticket's issuance — not lifted from some other application's session. When evidence `aud` is multi-valued, Data Holders should require `azp` naming the ticket issuer or presenting client.
* Evidence freshness is anchored to the issuer-asserted `iat`, and `iat` is the issuer's own word. A compromised issuer can backdate it to revive old evidence. Profiles and trust frameworks should bound evidence age relative to redemption time for high-assurance deployments.

### Issuer Compromise

* A compromised ticket-signing key can mint tickets for arbitrary subjects, and forged tickets can simply omit `revocation`. Recovery depends on key removal propagating through Data Holder JWKS caches; deployments should bound JWKS cache lifetime and trust frameworks should define compromise notification. [Proposal 007](proposal-007-issuer-accountability.html) covers key management and continuity expectations.
* For self-access, the base relies on issuer attestation of subject identity unless evidence is present — which is why evidence is SHOULD for UC1/UC2 and why trust frameworks may make it SHALL. A careless issuer trusted for a ticket type can target any patient in its audience; identity evidence is the independent check.
* The revocation status list is a plain JSON file protected only by TLS. An attacker who controls the hosting origin or poisons a cache can clear bits and silently un-revoke tickets without touching the signing key. A signed status list (for example, the IETF Token Status List work) would let Data Holders verify integrity independently; candidate for a future revision.

### Subject Resolution

* **(addressed)** `recipient_record` is a resolution hint, never a verification shortcut: a record reached through it must still be consistent with `subject.patient` demographics and any verified evidence. ([Subject Resolution](index.html#subject-resolution))
* The dangerous failure is not ambiguity (rejected by rule) but a confident, wrong, unique match on thin demographics. Matching confidence policy belongs to the Data Holder and its trust framework; identity evidence exists to strengthen it.

### Interactive Fallback (Proposal 001)

* **(addressed)** Launch values are bearer references to pre-authorized tickets traveling in front-channel URLs: unguessable, single-use, short-lived, bound to the receiving client, with presenter binding re-verified at code exchange. ([Proposal 001](proposal-001-authz-code-fallback.html))
* The fallback's abuse case is institutional, not cryptographic: using `interaction_required` to re-impose per-site authorization screens. The single-trigger rule and monitorable fallback rates are the controls.

### Continuation (Proposal 004)

* **(addressed)** Derived refresh tokens must not outlive the issuer's ability to revoke: continuation past `exp` requires a `revocation` claim with checking required for the derived credential's full lifetime. ([Proposal 004](proposal-004-continuation-credentials.html))

### Privacy and Correlation

* Status-list fetches go to an issuer-hosted URL, so the issuer can learn where a ticket is being redeemed from network metadata. Coarse shared status lists (never per-ticket URLs) blunt this; the base text already requires grouping for this reason.
* A ticket's full contents are visible to every Data Holder it is presented to. An enumerated multi-entry `aud` or `data_holder_filter` tells each recipient where else the patient receives care. When the target list would map a patient's care relationships, issuers should mint separate single-target tickets or use a trust-framework `aud` without per-organization filters.
* Error responses can disclose by existing: a Data Holder may use a general `error_description` when a specific one would reveal withheld data or confidential policy (already in the base error rules; the same concern drives [Proposal 005](proposal-005-sensitive-data-modeling.html)'s OQ-5A).
