{% include callouts.html %}

Every open design question in this specification is listed here with a stable ID. Questions live as callouts on the page where they matter; this registry exists so you can see them all, reference them in discussion ("OQ-5B"), and track what got decided. To weigh in, raise a question on an Argonaut call, in the [Zulip stream](https://chat.fhir.org), or as a GitHub issue, citing the ID.

### Open

| ID | Question | Where |
|----|----------|-------|
| OQ-UC2-VERIFY | Should each delegated-access ticket say *how* the issuer verified the authority, or are per-code issuer obligations plus framework audit enough? | [Use Case Catalog](patient-delegated-access.html#oq-verification-class) |
| OQ-PAYER-DATA | What resource types does claims adjudication need beyond US Core? | [Use Case Catalog](payer-claims-adjudication.html#oq-payer-data) |
| OQ-QUALITY-GAP | Who issues quality-gap-query tickets, against what relationship record, and for what lifetime? | [Use Case Catalog](payer-quality-gap-queries.html#oq-quality-gap) |
| OQ-5D | What must be true (authorization UX, classification precision, framework rules) before a Data Holder honors `release_authorized` for a restricted category? | [Proposal 005](proposal-005-sensitive-data-modeling.html#oq-5d) |

### Resolved

| ID | Question | Decision |
|----|----------|----------|
| RQ-CNF | Use standard `cnf.jkt` (RFC 7800) or a unified `presenter_binding` claim? | Keep `presenter_binding`: one discriminated union covers both binding modes; key-binding semantics are identical to `cnf.jkt`, so thumbprint code is reusable. (June 2026) |
| RQ-DISCOVERY | Should Data Holders advertise which access constraints they can enforce? | No discovery field. Constraint enforcement is defined on existing server machinery; a Data Holder that advertises a ticket type enforces the constraints the type declares, and tickets carrying constraints it does not enforce are rejected. (June 2026) |
| RQ-DATA-PERIOD | What does `data_period` enforcement mean concretely? | Designated date search parameters (the standard `date` parameter, with a short exception table) define the filter where they exist; elsewhere Data Holders filter as well as they can or release, and currently relevant records may flow regardless. The approximation is part of what the authorizing party agrees to. See [Data Period Enforcement](data-period.html#data-period-enforcement). (June 2026, rev.) |
| RQ-CONSTRAINT-MODEL | How do access constraints extend beyond the base three? | Every member of `access` is a named constraint defined by a four-part template (shape and validity, authorizing party, client, Data Holder); a Data Holder rejects any member it does not recognize and enforce. See [Access Constraints](access-constraints.html). (June 2026) |
| RQ-CONSTRAINT-NAMES | How do independently defined constraints avoid name collisions? | Bare member names are reserved for constraints this specification defines; a constraint from another implementation guide uses its canonical URL as the member name. (June 2026) |
| RQ-CONTEXT | Does the ticket need a separate `context` object? | No. Dropped: facts a ticket type needs are top-level profile claims selected by `ticket_type`; limits are access constraints. the public-health profile's `reportable_condition` moved to the top level. See [Profile Claims](index.html#profile-claims). (June 2026) |
| RQ-UC-PRIORITY | Which use cases stay in the near-term catalog? | Payer claims adjudication promoted to the catalog; public health moved to Future Use Cases with its profile intact. Decided on the June 10, 2026 call. |
| RQ-MUST-UNDERSTAND | Does the ticket need a `must_understand` claim? | No. Removed: the constraint border makes it redundant. A field that must not be ignored is a limit and lives in `access`, where rejection of unrecognized members is automatic; facts are safe to ignore. See [Field Handling and Extensions](index.html#field-handling-and-extensions). (June 2026) |
| RQ-SENSITIVITY-SHAPE | Where does sensitivity handling live? | Split along the constraint border: `sensitivity_withhold` is an access constraint (fails closed); `sensitivity_release_authorized` is a top-level issuer-attested claim (degrades gracefully). Withhold-beats-release is the constraint algebra, not a special rule. See [Proposal 005](proposal-005-sensitive-data-modeling.html). (June 2026) |
| RQ-FALLBACK | Which gaps justify the interactive fallback in Proposal 001? | Exactly one: subject resolution failure. Returning `interaction_required` after successful resolution is prohibited. (June 2026) |
| RQ-SENSITIVE-BASE | Should the base ticket carry a sensitive-data flag? | No. Removed from the base kernel; sensitivity handling lives in the Proposal 005 profile, which models both withholding and release authorization. (May 27, 2026 call) |
| RQ-BEARER | Are access tokens issued after redemption sender-constrained? | No. They are ordinary OAuth 2.0 bearer tokens; presenter binding constrains ticket redemption only. Deployments may add DPoP or mutual-TLS. (June 2026) |
| RQ-FILTER-PROJECTION | Do `category`/`code` narrowings project into SMART scope strings? | No. The scope surface carries resource-type and interaction grain only; Data Holders enforce the narrowings from the ticket. (June 2026) |
