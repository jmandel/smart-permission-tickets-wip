{% include callouts.html %}

This page is the registry of access constraints: the named members of `access`, each a limit on what a ticket releases. The protocol that carries and redeems tickets is defined on the [main specification page](index.html); ticket types and their constraint choices are in the [Use Case Catalog](use-case-catalog.html).

### Access Constraints

The `access` object holds the ticket's **access constraints**. Each member of `access` is a named constraint with a published definition — in this specification for the base constraints, or in a ticket-type profile for additional ones. Three rules govern every constraint:

1. **Unrecognized means reject.** A Data Holder SHALL reject a ticket whose `access` contains a member it does not recognize and enforce, with `invalid_grant` and an `error_description` naming the unsupported constraint. There is no issuer opt-in and no capability negotiation: ignoring an access constraint always releases more than the issuer authorized, so unrecognized constraints fail closed.
2. **Constraints only narrow.** No constraint broadens what another constraint, the requested scopes, the client's eligibility, or the Data Holder's policy would allow. Constraints combine by intersection (see [Constraint Algebra](#constraint-algebra)).
3. **Limits live here.** Any field whose neglect would widen release belongs in `access`. Facts that inform the Data Holder's policy decision — who is asking, what event the request belongs to — are profile claims, not access constraints (see [Profile Claims](index.html#profile-claims)).
4. **One name, one meaning.** A constraint means the same thing in every ticket type. Profiles choose which constraints their tickets carry and set their values — nothing else. A use case that needs different semantics defines a new constraint under a new name. (A Data Holder declining to exercise a discretion its definition permits is not a semantic change; releasing less is always allowed.)

There is no tiered constraint vocabulary — just this catalog, assembled in different combinations per ticket type. The constraints currently defined:

| Constraint | Defined by | Summary |
|-------|------|-------------|
| `fhir_resources` | This page | **Present in every ticket** — the positive grant. Each entry specifies a resource `type`, required `interactions`, and optionally one narrowing `category` and one narrowing `code`. |
| `data_period` | This page | One coarse clinical-date window, filtered through designated date search parameters. If disjoint windows are needed, mint separate tickets. |
| `data_holder_filter` | This page | Which Data Holders may answer. Each entry is a jurisdiction filter (`{ kind: "jurisdiction", address }`) or an organization filter (`{ kind: "organization", organization }`); matching any entry suffices. |
| `claim_linkage` | [Payer Claims Adjudication](use-case-catalog.html#payer-claims-adjudication) | Release limited to records the Data Holder associates with a referenced claim or prior authorization. |
| `sensitivity_withhold` | [Proposal 005](proposal-005-sensitive-data-modeling.html) | Do not release data in the named sensitivity categories. |

The three constraints defined on this page use machinery FHIR servers already have — `fhir_resources` projects to SMART scopes, `data_period` to standard date search parameters, and `data_holder_filter` to a one-time check of the Data Holder's own identity and jurisdiction.

Ticket-type profiles declare which constraints their tickets carry and may define new ones (see [Defining New Access Constraints](#defining-new-access-constraints)). A Data Holder that advertises a ticket type enforces every constraint the type declares, so any valid ticket of a supported type is accepted with no pre-coordination.

### Constraint Template

A constraint definition serves four parties, and it is complete when it answers all four:

| Section | Serves | It states |
|---------|--------|-----------|
| **Shape and validity** | Issuer | The wire shape, what values are valid, and how the issuer determines the value from its workflow and records. |
| **For the authorizing party** | Authorizing party | What sharing decision the constraint encodes, in words an authorization screen can use truthfully. Where enforcement is approximate, the approximation is part of this statement. |
| **For the client** | Client | What the client can rely on and plan around, and what it must not assume. |
| **For the Data Holder** | Data Holder | Exactly what is enforced. Enforcement must be determinate: given the Data Holder's facts, two implementations reach the same answer. The facts may be the Data Holder's own — `data_holder_filter` works this way. Any discretion is stated here with its direction: narrowing release is always allowed; anything that widens release must be named and bounded. |

The base constraint definitions below follow this template, and profiles defining new constraints SHALL cover the same four sections. A definition that skips a section surfaces the gap later as a mismatch between what an authorization screen promised and what a server enforced.

### `fhir_resources`

**Shape and validity.** Required. An array of one or more entries. Each entry carries a FHIR resource `type`, one or more `interactions` (`create`, `read`, `update`, `delete`, `search`), and optionally one narrowing `category` coding and one narrowing `code` coding. An entry is a single conjunction: a resource matches it by being of the `type` and matching the `category` and `code` when present. There are no value lists inside an entry — a grant covering several categories or codes carries several entries. The issuer derives entries from the authorizing party's sharing decision or from the scope of access the ticket type defines.

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

### `data_period`

**Shape and validity.** Optional. A FHIR Period with `start` and/or `end`. One coarse window per ticket; if the grant needs disjoint windows, the issuer mints separate tickets.

**For the authorizing party.** The window limits sharing to records from a period — by clinical dates, approximately. The approximation is part of what the person agrees to: records still relevant to current care (an active allergy recorded years ago), and kinds of records that cannot be filtered by date, may be shared regardless. Authorization screens SHALL present the period this way; a screen that presents it as a hard wall promises more than the constraint delivers.

**For the client.** Where date filtering applies, resources outside the window are excluded regardless of when they were created or last updated. The window shapes the response; it is not a guarantee in either direction: absence of a record is not evidence it does not exist, and an out-of-window record that is still clinically current is not an error.

**For the Data Holder.** Apply designated-parameter filtering (below) to every resource type that has a designated parameter. For resource types that have none, filter by the best available date attribution or release unfiltered — either is within the promise. Releasing records regardless of the window is also permitted when local policy treats them as currently relevant (active allergies, active problem-list items).

### Data Period Enforcement

Where date filtering applies, its meaning is defined by standard FHIR R4 date search parameters. A resource type's **designated parameter** is its standard `date` search parameter when the type defines one, except where the table below overrides the choice. For each covered type, the Data Holder SHALL behave **as if every search carried `&{param}=ge{start}&{param}=le{end}`** using the designated parameter, and SHALL apply the same comparison to the designated element on direct reads. FHIR date search semantics apply: period-valued elements match on overlap, and resources with no value in the designated element do not match. The designated parameter defines the semantics; a Data Holder may implement the filter internally by any equivalent means and does not need to expose the search parameter to clients.

| Resource type | Designated parameter | Element |
|---|---|---|
| Condition | `recorded-date` | `recordedDate` |
| Goal | `target-date` | `target.due (date)` |
| MedicationDispense | `whenhandedover` | `whenHandedOver` |
| MedicationRequest | `authoredon` | `authoredOn` |
| Provenance | `recorded` | `recorded` |
| QuestionnaireResponse | `authored` | `authored` |
| ServiceRequest | `authored` | `authoredOn` |
| Specimen | `collected` | `collection.collected[x]` |

**Exempt resource types** are not date-filtered: Patient, RelatedPerson, Practitioner, PractitionerRole, Organization, Location, Coverage, Device, Medication. These are identity, directory, or definitional resources without a clinical-event date.

The overrides favor reliably populated dates over clinically richer but sparse ones: `recorded-date` rather than `onset-date` for Condition (onset is a choice type, often absent or non-date), `authoredon` rather than `date` for MedicationRequest (the R4 `date` parameter binds to dosing-schedule timing, not order time). These dates reflect when content was recorded or performed: a condition recorded last month passes a recent window even if it began years ago.

### `data_holder_filter`

**Shape and validity.** Optional. An array of entries, each either `{ kind: "jurisdiction", address }` or `{ kind: "organization", organization }`. The issuer derives entries from the authorizing party's selections or the network the ticket is scoped to.

**For the authorizing party.** The filter decides which Data Holders may answer, not which records an answering Data Holder returns. A Data Holder that matches the filter typically returns the combined record it holds; see the implementation note below for what a site selection does and does not limit.

**For the client.** The filter tells the client which Data Holders are worth trying. A rejection for filter mismatch means this Data Holder is outside the ticket's scope, not that the ticket is invalid elsewhere.

**For the Data Holder.** Answer the question "do I match any listed entry?" once, when the ticket is presented. Matching is one-hop against the responding Data Holder, not a provenance chain, and gates the Data Holder as a whole, not individual clinical resources — the filter is not a promise that returned data can be split by facility, department, custodian, endpoint, or provenance. `aud` identifies the coarse intended audience; `data_holder_filter` narrows within it. Matching rules per entry kind follow.

<div class="callout callout-info" markdown="1">

**Implementation Note: Picking a clinic does not always limit data to that clinic.**

One Data Holder often serves many clinics, hospitals, and even legally separate organizations through a single shared system. Inside that system, allergies, problems, and medications live in one combined patient chart that cannot reliably be split apart by facility.

The organization filter decides whether the Data Holder *as a whole* may answer. A Data Holder that accepts the ticket will typically return the combined record it holds, subject to the ticket's other constraints. A site or clinic selection on an authorization screen does not guarantee the response is limited to that site's data.

Issuers SHOULD use directory or network information (published endpoint networks, trust-framework directories, SMART Brands data) to detect when a selected facility is served through a broader shared system, and tell the authorizing person so. When the issuer cannot tell, it should warn generically that more data may flow than the site label suggests. Future versions may define finer disclosure-boundary hints; this one does not.

</div>

### Jurisdiction Filters

* Jurisdiction filters are modeled with country/state-style values only.
* A Data Holder checks whether its own jurisdiction matches the listed address.
* A Data Holder operating in multiple jurisdictions SHOULD answer if any of its jurisdictions match the filter, and MAY apply narrower internal filtering if its architecture supports that attribution.

### Organization Filters

* Organization filters positively scope which Data Holders may answer.
* Matching is by organizational identity, typically an NPI carried in `organization.identifier`.
* A Data Holder may answer if it matches the named organization or is authorized to answer on that organization's behalf.
* This filter is endpoint-agnostic. If a Data Holder operates multiple technical endpoints, a single organization filter authorizes access through any endpoint by which that organization is authorized to answer and that supports the Permission Ticket grant type.
* Data Holders that manage integrated records across multiple facilities evaluate this filter at the Data Holder level, not as a resource-by-resource clinical data filter.
* A Data Holder answering on behalf of a named organization that is served through a broader shared system MAY narrow its response to that organization's records, if its architecture supports the attribution. Narrowing is permitted, not promised: the filter still gates who may answer, and acceptance still typically returns the combined record.

> **Open Question: Custodian-Level Targeting.** Should `data_holder_filter` gain an explicit custodian-scoped form — "answer only with this organization's records," enforce-or-reject — once vendors can attribute records to custodian organizations and network directories carry custodian-level identities? Today, narrowing is best-effort (above). Do existing network directories model custodian-level entries at all?
{: .callout .callout-open-question #oq-custodian-targeting}

### Constraint Algebra

Constraints combine as follows:

- **Across constraints** (AND): returned data must satisfy every constraint present in `access`. An absent constraint imposes no restriction.
- **Within a `fhir_resources` entry** (AND): a resource must be of the entry's `type` and match its `category` and `code` when present.
- **Across `fhir_resources` entries** (OR): a resource matching any single entry is authorized.
- **Within `data_holder_filter`** (OR): a Data Holder may answer if it matches any listed entry.

### Example Walkthrough

```json
"access": {
  "fhir_resources": [
    {
      "type": "Observation",
      "interactions": ["read", "search"],
      "category": {
        "system": "http://terminology.hl7.org/CodeSystem/observation-category",
        "code": "laboratory"
      }
    },
    {
      "type": "Observation",
      "interactions": ["read", "search"],
      "code": { "system": "http://loinc.org", "code": "4548-4" }
    },
    {
      "type": "Condition",
      "interactions": ["read", "search"]
    }
  ],
  "data_period": {
    "start": "2023-01-01",
    "end": "2024-12-31"
  },
  "data_holder_filter": [
    { "kind": "jurisdiction", "address": { "state": "CA" } },
    { "kind": "jurisdiction", "address": { "state": "NY" } },
    {
      "kind": "organization",
      "organization": {
        "resourceType": "Organization",
        "identifier": [{ "system": "http://hl7.org/fhir/sid/us-npi", "value": "123" }]
      }
    }
  ]
}
```

This example applies all three base constraints together:

- **`data_holder_filter`** (OR): only a Data Holder operating in CA, in NY, or matching organization NPI `123` may answer at all.
- **`fhir_resources`** (OR across entries): at a matching Data Holder, an Observation is authorized if it is a laboratory result or carries the HbA1c code `4548-4`. A Condition is authorized by the third entry with no narrowing.
- **`data_period`**: date filtering applies per the designated parameters — Observations by `date`, Conditions by `recorded-date` — limiting results to 2023–2024, with the stated allowances for currently relevant records.

Because constraints are ANDed: a matching Observation from a non-matching Data Holder is still not authorized, and date-filterable data outside the period is excluded even if it matches an entry. If disjoint time windows are needed, mint separate tickets.

### Defining New Access Constraints

Ticket-type profiles MAY define additional access constraints. A new constraint is a new named member of `access`, defined by covering all four sections of the [constraint template](#constraint-template). Enforcement may be defined against the Data Holder's own facts — as `data_holder_filter` already is — provided it stays determinate.

Discovery rides on ticket types. A `ticket_type` URI fixes the constraints its tickets require; changing the required set means minting a new URI. Data Holders advertise supported types, so a server that lists a type can enforce everything the type requires. A ticket MAY also carry constraints beyond its type's required set — a sensitivity withholding, for example — with the standard consequence: servers that do not enforce them reject the ticket, and issuers should expect that rejection wherever the extra constraint is unsupported.

For example, a profile that needs encounter-class scoping defines it as a constraint:

```json
"access": {
  "fhir_resources": [
    { "type": "DocumentReference", "interactions": ["read", "search"] }
  ],
  "encounter_class_filter": {
    "include": [
      { "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode", "code": "AMB" }
    ]
  }
}
```

A Data Holder that recognizes `encounter_class_filter` releases only records tied to matching encounters; one that does not recognize it rejects the ticket. The defining profile owes all four template sections — including what an authorization screen may say ("only office-visit records") and how records that link to no encounter at all are handled, since many patient-level resources do not.

### Sensitive Data Profiles

Sensitivity controls are handled through an experimental profile rather than the base kernel. Current implementations vary substantially in how they classify restricted or legally protected data, how they expose patient-facing choices, and how those choices map to access-control policy. [Proposal 005](proposal-005-sensitive-data-modeling.html) models both directions, split along the constraint border: a **withholding constraint** inside `access` — a limit any Data Holder with category labeling can honor, from any issuer, and servers that cannot enforce it reject the ticket — and a **release-authorization claim** at the top level — an issuer-attested fact, and a Data Holder that does not recognize it falls back to its own sensitivity gates and releases less. Withholding beats release authorization wherever both match; that is the constraint algebra, not a special rule. The profile is deliberately ahead of what base APIs can enforce today; its job is to give the ecosystem one shape to build toward.

> **Open Question (OQ-3): Sensitive Data Profiles.** Should the Proposal 005 sensitivity profile be incorporated into specific ticket types, and what authorization UX, vocabulary constraints, and Data Holder enforcement capabilities does each direction need before implementation? See [Proposal 005: Sensitive Data Profile](proposal-005-sensitive-data-modeling.html).
{: .callout .callout-open-question #oq-3}

