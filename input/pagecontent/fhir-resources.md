{% include callouts.html %}

This page defines one access constraint. The constraint model, template, and algebra are on [Access Constraints](access-constraints.html); the ticket types that draw this constraint are in the [Use Case Catalog](use-case-catalog.html).

**Shape and validity.** Required. An array of one or more entries. Each entry carries a FHIR resource `type`, one or more `interactions` (`create`, `read`, `update`, `delete`, `search`), and optionally one narrowing `category` coding and one narrowing `code` coding. An entry is a single conjunction: a resource matches it by being of the `type` and matching the `category` and `code` when present. There are no value lists inside an entry — a grant covering several categories or codes carries several entries. The issuer derives entries from the authorizing party's sharing decision or from the scope of access the ticket type defines. By omitting a type, the issuer keeps an entire record type out of automated release — clinical notes routed through human review, for example.

**For the authorizing party.** Each entry is one kind of record being shared — immunizations, lab results, conditions. One screen choice, one entry. An entry without `category` or `code` means all records of that type.

**For the client.** `fhir_resources` is the ceiling on what scopes can be granted. Request SMART scopes within it. The `category` and `code` narrowings apply even though they never appear in scope strings: a granted scope does not mean unfiltered data.

**For the Data Holder.** Enforce resource types and interactions through SMART scope projection (below). Enforce `category` and `code` narrowings from the ticket itself — at the token endpoint, the resource server, or both.

### SMART Scope Projection

The `access.fhir_resources` array is the normative authorization model. Each entry maps to SMART v2 scopes as follows:

* `type` maps to the SMART resource type (e.g., `Observation`, `Condition`, or `*` for all resources)
* `interactions` map to SMART CRUDS suffixes: `create` = `c`, `read` = `r`, `update` = `u`, `delete` = `d`, `search` = `s`

For example, an entry `{ type: "Observation", interactions: ["read", "search"] }` projects to a SMART scope such as `patient/Observation.rs` or `system/Observation.rs`, depending on the applicable ticket profile and client mode.

The `category` and `code` narrowings do not project into scope strings. The OAuth scope surface carries the resource-type and interaction grain only; the Data Holder enforces the narrowings from the ticket itself, at the token endpoint, the resource server, or both.

FHIR operations (e.g., `$everything`, `$export`) are not modeled in the base kernel. A future profile may add operation-level permissions when a use case requires them.

> **Open Question (OQ-2): Do future non-patient subjects need an explicit ticket-level scope mode?** The current base kernel always identifies a single patient through `subject.patient`, so current tickets naturally project to patient-level semantics even when redeemed by backend clients. If future use cases introduce a different subject shape (for example, `Group`) or no subject at all, the working group may need an explicit ticket-level scope mode (for example, `patient` vs `system`) or a profile rule that changes SMART scope projection. This question is only relevant if future use cases require non-individual or subjectless tickets.
{: .callout .callout-open-question #oq-2}
