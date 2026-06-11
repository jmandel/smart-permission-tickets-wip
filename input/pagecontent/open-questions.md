{% include callouts.html %}

Every open design question in this specification is listed here with a stable ID. Questions live as callouts on the page where they matter; this registry exists so you can see them all and reference them in discussion. To weigh in, raise a question on an Argonaut call, in the [Zulip stream](https://chat.fhir.org), or as a GitHub issue, citing the ID. Settled design decisions are stated in the specification text where they apply, not tracked here.


| ID | Question | Where |
|----|----------|-------|
| OQ-UC2-VERIFY | Should each delegated-access ticket say *how* the issuer verified the authority, or are per-code issuer obligations plus framework audit enough? | [Use Case Catalog](patient-delegated-access.html#oq-verification-class) |
| OQ-PAYER-DATA | What resource types does claims adjudication need beyond US Core? | [Use Case Catalog](payer-claims-adjudication.html#oq-payer-data) |
| OQ-QUALITY-GAP | Who issues quality-gap-query tickets, against what relationship record, and for what lifetime? | [Use Case Catalog](payer-quality-gap-queries.html#oq-quality-gap) |
| OQ-5D | What must be true (authorization UX, classification precision, framework rules) before a Data Holder honors `release_authorized` for a restricted category? | [Proposal 005](proposal-005-sensitive-data-modeling.html#oq-5d) |
