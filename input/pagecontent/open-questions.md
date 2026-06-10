{% include callouts.html %}

Every open design question in this specification is listed here with a stable ID. Questions live as callouts on the page where they matter; this registry exists so you can see them all, reference them in discussion ("OQ-5B"), and track what got decided. To weigh in, raise a question on an Argonaut call, in the [Zulip stream](https://chat.fhir.org), or as a GitHub issue, citing the ID.

### Open

| ID | Question | Where |
|----|----------|-------|
| OQ-2 | Do future non-patient subjects (Group, subjectless) need an explicit ticket-level scope mode? | [Architecture](index.html#oq-2) |
| OQ-3 | Should the sensitivity-withholding profile be incorporated into specific ticket types, and which vocabularies first? | [Architecture](index.html#oq-3) |
| OQ-CUSTODIAN | Should `data_holder_filter` gain an enforce-or-reject custodian-scoped form once vendors can attribute records to custodian organizations? | [Architecture](index.html#oq-custodian-targeting) |
| OQ-UC2-VERIFY | Should each UC2 ticket say *how* the issuer verified the delegation authority, or are per-code issuer obligations plus framework audit enough? | [Use Case Catalog](use-case-catalog.html#oq-verification-class) |
| OQ-3A | Is the marker-scope plus CRUDS-scopes approach expressive enough for requesting tickets at issuance, or is a structured parameter needed? | [Proposal 003](proposal-003-smart-launch-issuance.html#oq-3a) |
| OQ-3B | Should issuance endpoint hints reuse the SMART Brands `Endpoint` format instead of a custom shape? | [Proposal 003](proposal-003-smart-launch-issuance.html#oq-3b) |
| OQ-3C | What is the issuer-issued access token in the issuance flow actually for? | [Proposal 003](proposal-003-smart-launch-issuance.html#oq-3c) |
| OQ-P4A | Should the `continuation` claim be promoted into the base claims set once implementations validate it? | [Proposal 004](proposal-004-continuation-credentials.html#oq-p4a) |
| OQ-5A | How does a Data Holder withhold without revealing that withheld data exists? | [Proposal 005](proposal-005-sensitive-data-modeling.html#oq-5a) |
| OQ-5B | Which sensitivity vocabularies should early implementations support? | [Proposal 005](proposal-005-sensitive-data-modeling.html#oq-5b) |
| OQ-5C | Does unknown sensitivity classification need explicit behavior beyond conservative withholding? | [Proposal 005](proposal-005-sensitive-data-modeling.html#oq-5c) |
| OQ-UC4-WRITE | Should social-care write access be modeled at all, or split into a narrower ticket type? | [Future Use Cases](future-use-cases.html#oq-uc4-write) |

### Resolved

| ID | Question | Decision |
|----|----------|----------|
| RQ-CNF | Use standard `cnf.jkt` (RFC 7800) or a unified `presenter_binding` claim? | Keep `presenter_binding`: one discriminated union covers both binding modes; key-binding semantics are identical to `cnf.jkt`, so thumbprint code is reusable. (June 2026) |
| RQ-DISCOVERY | Should Data Holders advertise which access constraints they can enforce? | No discovery field. All three `access` dimensions are defined so enforcement uses existing server machinery, and conforming Data Holders support all of them. (June 2026) |
| RQ-DATA-PERIOD | What does `data_period` enforcement mean concretely? | Each resource type has a designated standard date search parameter; servers behave as if every search carried the corresponding `ge`/`le` constraints. See [Data Period Enforcement](index.html#data-period-enforcement). (June 2026) |
| RQ-FALLBACK | Which gaps justify the interactive fallback in Proposal 001? | Exactly one: subject resolution failure. Returning `interaction_required` after successful resolution is prohibited. (June 2026) |
| RQ-SENSITIVE-BASE | Should the base ticket carry a sensitive-data flag? | No. Removed from the base kernel; sensitivity handling lives in the Proposal 005 withholding profile. (May 27, 2026 call) |

### Parked

| ID | Question | Status |
|----|----------|--------|
| PQ-UC7 | Provider-to-provider consult ticket type | Parked: the natural issuer is the same system the specialist would query, so the value of a signed artifact is unclear. See [Future Use Cases](future-use-cases.html#oq-uc7-design). |
| PQ-RELEASE-AUTHORIZED | Affirmative release authorization for sensitive categories | Parked until authorization workflows for sensitive categories are standardized and classification supports precise (not conservative) enforcement. See [Proposal 005](proposal-005-sensitive-data-modeling.html). |
