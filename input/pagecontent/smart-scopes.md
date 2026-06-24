{% include callouts.html %}

This page defines one access constraint. The constraint model, template, and algebra are on [Access Constraints](access-constraints.html); the ticket types that draw this constraint are in the [Use Case Catalog](use-case-catalog.html).

**Shape and validity.** Required. An array of one or more [SMART App Launch v2](https://hl7.org/fhir/smart-app-launch/scopes-and-launch-context.html) scope strings. Each scope names a resource type and the interactions permitted on it, and MAY be narrowed with SMART's granular search-parameter syntax. A scope follows the SMART v2 grammar — `( "patient" | "user" | "system" ) "/" ( resourceType | "*" ) "." cruds [ "?" search-params ]` — for example `patient/Observation.rs`, `patient/Condition.rs`, or, narrowed, `patient/Observation.rs?category=http://terminology.hl7.org/CodeSystem/observation-category|laboratory`. The current ticket types are all single-patient, so their scopes use the `patient/` prefix; a future population-level type could use `system/`. The issuer derives scopes from the authorizing party's sharing decision or from the access the ticket type defines. By omitting a resource type, the issuer keeps an entire record type out of automated release — clinical notes routed through human review, for example.

**For the authorizing party.** Each scope is one kind of record being shared — immunizations, lab results, conditions — optionally narrowed to a category or code. One screen choice, one scope. A scope with no `?` narrowing means all records of that type.

**For the client.** `smart_scopes` is the ceiling on what scopes can be granted. Request scopes within it. Because narrowings are expressed directly as SMART granular scopes, a granted scope carries its own limit: a grant does not mean unfiltered data.

**For the Data Holder.** Grant the intersection of `smart_scopes` with the client's requested `scope` parameter, using the SMART scope matching the server already performs — then narrow further by client eligibility, the selected ticket type, and local policy. Enforce any granular search-parameter narrowing from the scope itself, at the token endpoint, the resource server, or both. Enforcement is determinate: the scopes are explicit, so two servers given the same request reach the same set.

### Notes

`smart_scopes` *is* SMART scopes — there is no separate projection step, and no resource-type or narrowing grain that lives outside the scope string. Multiple scopes for the same resource type combine by union, per the SMART v2 semantics the [constraint algebra](access-constraints.html#constraint-algebra) restates.

FHIR operations (e.g., `$everything`, `$export`) are not modeled in the base kernel. A future profile may add operation-level permissions when a use case requires them.
