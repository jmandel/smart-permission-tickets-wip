{% include callouts.html %}

This page defines one access constraint. The constraint model, template, and algebra are on [Access Constraints](access-constraints.html); the ticket types that draw this constraint are in the [Use Case Catalog](use-case-catalog.html).

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
* Matching is by organizational identifier — for example, an NPI carried in `organization.identifier`.
* A Data Holder may answer if it matches the named organization or is authorized to answer on that organization's behalf.
* This filter is endpoint-agnostic. If a Data Holder operates multiple technical endpoints, a single organization filter authorizes access through any endpoint by which that organization is authorized to answer and that supports the Permission Ticket grant type.
* Data Holders that manage integrated records across multiple facilities evaluate this filter at the Data Holder level, not as a resource-by-resource clinical data filter.
* A Data Holder answering on behalf of a named organization that is served through a broader shared system MAY narrow its response to that organization's records, if its architecture supports the attribution. Narrowing is permitted, not promised: the filter still gates who may answer, and acceptance still typically returns the combined record.

> **Open Question (OQ-CUSTODIAN): Custodian-Level Targeting.** Should `data_holder_filter` gain an explicit custodian-scoped form — "answer only with this organization's records," enforce-or-reject — once vendors can attribute records to custodian organizations and network directories carry custodian-level identities? Today, narrowing is best-effort (above). Do existing network directories model custodian-level entries at all?
{: .callout .callout-open-question #oq-custodian-targeting}
