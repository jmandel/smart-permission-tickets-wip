{% include callouts.html %}

This page is the registry of access constraints: the named members of `access`, each a limit on what a ticket releases. The protocol that carries and redeems tickets is defined on the [main specification page](index.html); ticket types and their constraint choices are in the [Use Case Catalog](use-case-catalog.html).

### Constraint Model

The `access` object holds the ticket's **access constraints**. Each member of `access` is a named constraint with a published definition, and every definition is one page, linked from the table below. (One experimental constraint, `sensitivity_withhold`, is staged in [Proposal 005](proposal-005-sensitive-data-modeling.html) until it graduates.) Other implementation guides MAY define additional constraints, which participate under the same rules.

Every constraint limits one thing and nothing else — which resource types, which dates, which Data Holders, which records. Leave one out and the ticket simply doesn't limit that thing; no constraint ever opens access up, it only cuts down what would otherwise be shared.

Four rules govern every constraint:

1. **Unrecognized means reject.** A Data Holder SHALL reject a ticket whose `access` contains a member it does not recognize and enforce, with `invalid_grant` and an `error_description` naming the unsupported constraint. There is no issuer opt-in and no capability negotiation: ignoring an access constraint always releases more than the issuer authorized, so unrecognized constraints fail closed.
2. **Constraints only narrow.** No constraint broadens what another constraint, the requested scopes, the client's eligibility, or the Data Holder's policy would allow. Constraints combine by intersection (see [Constraint Algebra](#constraint-algebra)).
3. **Limits live here.** Any field whose neglect would widen release belongs in `access`. Facts that inform the Data Holder's policy decision — who is asking, what event the request belongs to — are profile claims, not access constraints (see [Profile Claims](index.html#profile-claims)).
4. **One name, one meaning.** A constraint means the same thing in every ticket type. Profiles choose which constraints their tickets carry and set their values — nothing else. A use case that needs different semantics defines a new constraint under a new name. (A Data Holder declining to exercise a discretion its definition permits is not a semantic change; releasing less is always allowed.)

There is no tiered constraint vocabulary — just this catalog, assembled in different combinations per ticket type. The constraints currently defined:

| Constraint | Defined by | Summary |
|-------|------|-------------|
| [`smart_scopes`](smart-scopes.html) | This specification | **Bounds which resource types and interactions may be read** — an array of SMART v2 scope strings, optionally narrowed by SMART's granular search-parameter syntax. Most ticket types require it; Payer Claims Adjudication bounds release via `claim_linkage` instead. |
| [`data_period`](data-period.html) | This specification | One coarse clinical-date window, filtered through designated date search parameters. If disjoint windows are needed, mint separate tickets. |
| [`data_holder_filter`](data-holder-filter.html) | This specification | Which Data Holders may answer. Each entry is a jurisdiction filter (`{ kind: "jurisdiction", address }`) or an organization filter (`{ kind: "organization", organization }`); matching any entry suffices. |
| [`claim_linkage`](claim-linkage.html) | This specification, for [Payer Claims Adjudication](payer-claims-adjudication.html) | **Bounds release to** records the Data Holder associates with the linked encounters (and optionally a referenced claim or prior authorization). The required bound for that type. |
| `sensitivity_withhold` | [Proposal 005](proposal-005-sensitive-data-modeling.html) | Do not release data in the named sensitivity categories. |

Three of these constraints use machinery FHIR servers already have — `smart_scopes` *is* SMART scopes, `data_period` maps to standard date search parameters, and `data_holder_filter` to a one-time check of the Data Holder's own identity and jurisdiction.

Ticket-type profiles declare which constraints their tickets carry and may define new ones (see [Defining New Access Constraints](#defining-new-access-constraints)). A Data Holder that advertises a ticket type enforces every constraint the type declares, so any valid ticket of a supported type is accepted with no pre-coordination.

### Constraint Template

A constraint definition serves four parties; it is complete when it answers all four:

| Section | Serves | It states |
|---------|--------|-----------|
| **Shape and validity** | Issuer | The wire shape, what values are valid, and how the issuer determines the value from its workflow and records. |
| **For the authorizing party** | Authorizing party | What sharing decision the constraint encodes, in words an authorization screen can use truthfully. Where enforcement is approximate, the approximation is part of this statement. |
| **For the client** | Client | What the client can rely on and plan around, and what it must not assume. |
| **For the Data Holder** | Data Holder | Exactly what is enforced. Enforcement must be determinate: given the Data Holder's facts, two implementations reach the same answer. The facts may be the Data Holder's own — `data_holder_filter` works this way. Any discretion is stated here with its direction: narrowing release is always allowed; anything that widens release must be named and bounded. |

Each constraint page follows this template, and profiles defining new constraints SHALL cover the same four sections. Skip a section and the gap surfaces later as a mismatch between what an authorization screen promised and what a server enforced.

### Constraint Algebra

Constraints combine as follows:

- **Across constraints** (AND): returned data must satisfy every constraint present in `access`. An absent constraint imposes no restriction.
- **Within a `smart_scopes` entry** (AND): a resource must be of the scope's resource type and match any granular search-parameter narrowing the scope carries.
- **Across `smart_scopes` entries** (OR): a resource matching any single scope is authorized — the standard SMART v2 union of scopes.
- **Within `data_holder_filter`** (OR): a Data Holder may answer if it matches any listed entry.

### Example Walkthrough

{% include generated/spec-snippets/index/access-example.json.md %}

This example applies `smart_scopes`, `data_period`, and `data_holder_filter` together:

- **`data_holder_filter`** (OR): only a Data Holder operating in CA, in NY, or matching organization NPI `123` may answer at all.
- **`smart_scopes`** (OR across scopes): at a matching Data Holder, an Observation is authorized if it is a laboratory result or carries the HbA1c code `4548-4`. A Condition is authorized by the third scope with no narrowing.
- **`data_period`**: date filtering applies per the designated parameters — Observations by `date`, Conditions by `recorded-date` — limiting results to 2023–2024, with the stated allowances for currently relevant records.

Because constraints are ANDed: a matching Observation from a non-matching Data Holder is still not authorized, and date-filterable data outside the period is excluded even if it matches an entry. If disjoint time windows are needed, mint separate tickets.

### Defining New Access Constraints

Ticket-type profiles and other implementation guides MAY introduce additional access constraints. A new constraint is a new named member of `access`, defined by covering all four sections of the [constraint template](#constraint-template); constraints introduced by catalog ticket types get definition pages here, so this catalog stays the one place definitions live.

Bare member names are reserved for constraints this specification defines. A constraint defined in another implementation guide uses its canonical URL as the member name, the standard pattern for downstream extension, so independently defined constraints cannot collide and every name resolves to its definition. Enforcement may be defined against the Data Holder's own facts — as `data_holder_filter` already is — provided it stays determinate.

Discovery rides on ticket types. A `ticket_type` URI fixes the constraints its tickets require; changing the required set means minting a new URI. Data Holders advertise supported types, so a server that lists a type can enforce everything the type requires. A ticket MAY also carry constraints beyond its type's required set — a sensitivity withholding, for example — with the standard consequence: servers that do not enforce them reject the ticket, and issuers should expect that rejection wherever the extra constraint is unsupported.

For example, a profile that needs encounter-class scoping defines it as a constraint:

```json
"access": {
  "smart_scopes": [ "patient/Observation.rs" ],
  "https://example.org/permission-ticket/encounter-class-filter": {
    "include": [
      { "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode", "code": "AMB" }
    ]
  }
}
```

A Data Holder that recognizes the constraint releases only records tied to a matching encounter; one that does not recognize it rejects the ticket. The defining profile owes all four template sections.
