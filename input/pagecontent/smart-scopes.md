{% include callouts.html %}

This page defines one access constraint. The constraint model and template are on [Access Constraints](access-constraints.html); the ticket types that draw this constraint are in the [Use Case Catalog](use-case-catalog.html).

**Shape and validity.** Required wherever it appears — every ticket type except Payer Claims Adjudication, which grants access through [`claim_linkage`](claim-linkage.html) instead. An array of one or more [SMART App Launch v2](https://hl7.org/fhir/smart-app-launch/scopes-and-launch-context.html) scope strings, each naming a resource type, the interactions permitted on it, and an optional granular search-parameter narrowing. The grammar, with examples:

```
( "patient" | "user" | "system" ) "/" ( resourceType | "*" ) "." cruds [ "?" search-params ]

patient/Observation.rs
patient/Condition.rs
patient/Observation.rs?category=http://terminology.hl7.org/CodeSystem/observation-category|laboratory
```

The current ticket types are all single-patient, so their scopes use the `patient/` prefix; a future population-level type could use `system/`. The issuer derives scopes from the authorizing party's sharing decision or from the access the ticket type defines. Omitting a resource type keeps an entire record type out of automated release — clinical notes routed through human review, for example.

**For the authorizing party.** Each scope is one kind of record being shared — immunizations, lab results, conditions — optionally narrowed to a category or code. One screen choice, one scope. A scope with no `?` narrowing means all records of that type.

**For the client.** `smart_scopes` is the ceiling on what scopes can be granted. Request scopes within it. Because narrowings are expressed directly as SMART granular scopes, a granted scope carries its own limit: a grant does not mean unfiltered data.

**For the Data Holder.** Grant the intersection of `smart_scopes` with the client's requested `scope` parameter, using the SMART scope matching the server already performs — then narrow further by client eligibility, the selected ticket type, and local policy. Enforce any granular search-parameter narrowing from the scope itself, at the token endpoint, the resource server, or both. Enforcement is determinate: the scopes are explicit, so two servers given the same request reach the same set.

### Notes

`smart_scopes` *is* SMART scopes — there is no separate projection step, and no resource-type or narrowing grain that lives outside the scope string. The array is a union: an interaction on a resource is within the constraint if any one complete scope entry authorizes it. Within an entry, the resource type, permitted interactions, and any granular search-parameter narrowing all apply together; the query portion retains its SMART granular-scope and FHIR search semantics.

FHIR operations (e.g., `$everything`, `$export`) are not modeled in the base kernel. A future profile may add operation-level permissions when a use case requires them.
