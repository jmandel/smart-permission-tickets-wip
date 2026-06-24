{% include callouts.html %}

This page defines one access constraint. The constraint model, template, and algebra are on [Access Constraints](access-constraints.html); the ticket types that draw this constraint are in the [Use Case Catalog](use-case-catalog.html).

**Shape and validity.** Optional. A FHIR Period with `start` and/or `end`. One coarse window per ticket; if the grant needs disjoint windows, the issuer mints separate tickets.

**For the authorizing party.** The window limits sharing to records from a period — by clinical dates, approximately. The approximation is part of what the person agrees to: records still relevant to current care (an active allergy recorded years ago), and kinds of records that cannot be filtered by date, may be shared regardless. Authorization screens SHALL present the period this way; a screen that presents it as a hard wall promises more than the constraint delivers.

**For the client.** Where date filtering applies, resources outside the window are excluded regardless of when they were created or last updated. The window shapes the response; it is not a guarantee in either direction: absence of a record is not evidence it does not exist, and an out-of-window record that is still clinically current is not an error.

**For the Data Holder.** Apply designated-parameter filtering (below) to every resource type that has a designated parameter. For resource types that have none, filter by the best available date attribution or release unfiltered — either is within the promise. Releasing records regardless of the window is also permitted when local policy treats them as currently relevant (active allergies, active problem-list items).

### Data Period Enforcement

Where date filtering applies, its meaning is defined by standard FHIR R4 date search parameters. A resource type's **designated parameter** is its standard `date` search parameter when the type defines one, except where the table below overrides the choice. For each covered type, the Data Holder SHALL behave **as if every search carried `&{param}=ge{start}&{param}=le{end}`** using the designated parameter, and SHALL apply the same comparison to the designated element on direct reads. FHIR date search semantics apply: period-valued elements match on overlap, and resources with no value in the designated element do not match. The designated parameter defines the semantics; a Data Holder may implement the filter by any equivalent means and need not expose the search parameter to clients.

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
