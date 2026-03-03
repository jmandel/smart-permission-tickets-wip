# Proposed Changes to Permission Tickets Spec

## 1. Client Binding: Key Thumbprint Instead of Key Set

**Was:** Tickets bind to a client via `client_binding.jwks_uri` or `client_binding.jwks` — a full JWK Set.

**Now:** Tickets bind to a client via `cnf.jkt` — a single JWK Thumbprint (RFC 7800 + RFC 7638).

**Why:** Client IDs are not stable across systems. A client registered via UDAP at one Data Holder may have a completely different identifier than at another, or than what the ticket issuer knows. The client's public key is the one stable anchor. A JWK Thumbprint is simpler than a full JWKS (one string vs. a nested object with URI-or-inline semantics), and `cnf` is an existing RFC 7800 pattern already used in DPoP and other token binding specs.

**Impact:** The `client_binding` object in the ticket is replaced by `cnf.jkt`. Validation changes from "is the client_assertion signing key a member of this key set?" to "does the thumbprint of the client_assertion signing key match this string?"

## 2. Signed Presentation: Tickets Stay Inside Client Assertion

**Was:** Already the case — tickets embedded in `permission_tickets` claim inside the signed `client_assertion`.

**Now:** Same, but with explicit rationale documented.

**Why:** Embedding tickets inside the signed client_assertion creates an explicit, signed statement: "I am client X and I intend to present *these specific tickets* in *this specific request*." A separate parameter would allow tickets to be swapped or replayed without the client's signature covering them. Not a critical attack vector (tickets are already key-bound), but it's an unnecessary degree of freedom.

## 3. Trust Establishment: Explicitly Pluggable

**Was:** Spec leaned toward OIDC Federation, with `trust_chain` in the JWT header and client IDs required to be URL Entity Identifiers.

**Now:** Trust establishment is framed as out of scope, with three co-equal options documented: manual JWKS configuration, UDAP, and OIDC Federation. No preference is expressed; each has documented tradeoffs. The requirement for URL-based client IDs is removed (since binding is by key, not by ID).

**Why:** OIDC Federation is not widely deployed in US healthcare. Requiring it (or even favoring it) limits near-term adoption. Key-based binding makes the spec genuinely agnostic to registration model — a single ticket works regardless of how the client is registered at each Data Holder.

## 4. FHIR Representation: Logical Model Only, No Basic Profile

**Was:** A `Basic` resource profile with extensions for subject, actor, context, capability, plus code systems and value sets to support those extensions.

**Now:** A FHIR Logical Model that formally defines the JWT payload structure. No runtime FHIR resource. The Basic profile, its four supporting extensions, three code systems, and three value sets are removed.

**Why:** The ticket is a JWT protocol artifact. Representing it as a FHIR resource added substantial complexity (profiles, extensions, code systems, value sets, examples) for something that is never actually exchanged as a FHIR resource. The Logical Model gives the same formal documentation and tooling benefits without implying a runtime representation.

## 5. Capability Model: Noted Divergence

**The `-wip` spec uses SMART scopes directly** in `capability.scopes`, plus `periods`, `locations`, and `organizations` as additional constraint dimensions. This is a good design that we discussed but went a different direction on.

**Our rewrite used a custom capability model** with `mode` (read/write), `resources` (with category filters), and `temporal_window`. The rationale was that SMART scopes can't express high-level assertions like "all data from Texas" or temporal windows — but the `-wip` spec already solves this by keeping scopes for the resource-type dimension and adding separate fields for periods/locations/organizations.

**Recommendation:** The `-wip` approach of "SMART scopes + orthogonal constraint dimensions" is likely better than our custom capability model. It avoids inventing a parallel resource-type language and makes the scope-to-access-token mapping trivial. Consider keeping the `-wip` capability model.

## 6. Multi-Ticket Profiles: Not Addressed

**Was:** The `-wip` spec has a `permission_ticket_profile` claim in the client assertion and `ticket_type` in tickets, supporting multi-ticket composition (e.g., identity ticket + authorization ticket).

**Now:** Our rewrite didn't address multi-ticket scenarios.

**Recommendation:** Keep the multi-ticket profile mechanism from the `-wip` spec. It's a genuine requirement for use cases like "Identity + Designated Representative."

## 7. Revocation: Simplified

**Was:** Detailed CRL mechanism with `revocation.url`, `revocation.rid`, timestamp suffixes, `ctr` counters, and specific generation algorithms.

**Now:** Brief mention of three approaches (JTI-based revocation lists, status endpoints, push revocation) without detailed protocol.

**Recommendation:** The `-wip` revocation mechanism is well-designed and concrete. Consider keeping it.

## 8. Audience Validation: Simplified

**Was:** Two modes — enumerated recipients (specific URLs) and trust framework (broad identifier like a TEFCA framework URL).

**Now:** Single mode — `aud` is the Data Holder's FHIR base URL.

**Recommendation:** The trust-framework audience mode is useful for network-wide tickets. Consider keeping both modes.

## Summary of What to Port Back

Changes worth applying to the `-wip` main branch:

1. **Replace `client_binding` with `cnf.jkt`** — simpler, standards-based, decouples from client ID stability
2. **Frame trust establishment as pluggable** — document manual/UDAP/OIDF as equals, remove hard dependency on OIDF trust_chain
3. **Add the "mental model" diagram** — the two-box ASCII showing ticket structure + client_assertion structure with binding check, placed prominently for reader orientation
4. **Document why tickets are inside the client_assertion** — explicit rationale for signed presentation

Changes to reconsider / keep from `-wip`:

5. **Keep the `-wip` capability model** (SMART scopes + periods/locations/organizations) rather than the custom model from our rewrite
6. **Keep multi-ticket profiles** (`permission_ticket_profile`, `ticket_type`)
7. **Keep the detailed revocation mechanism** (`revocation.url`, `revocation.rid`, CRL format)
8. **Keep dual audience modes** (enumerated + trust framework)
