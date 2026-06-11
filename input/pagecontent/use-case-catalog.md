{% include callouts.html %}

This page is the registry of Permission Ticket use cases. Each use case maps to a single `ticket_type` URI that identifies the ticket's schema and processing rules. The base protocol — transport, validation pipeline, access calculation — is defined on the [main specification page](index.html); each ticket type has its own page defining what it requires and how a Data Holder processes it.

This specification currently defines four ticket types:

{% include generated/spec-snippets/index/use-case-profile-map.md %}

Ticket types are identified by their `ticket_type` URIs and referred to by name. Public Health Investigation is fully modeled and lives on [Future Use Cases](future-use-cases.html) since June 2026, alongside the other candidates; the near-term catalog holds the flows implementers on the project are ready to exercise.

### Status

| Status | Meaning |
|--------|---------|
| **Ready** | The underlying workflow is real today; ready for first implementations. |
| **Modeled** | Fields and processing rules are drafted in detail, but no real-world deployments exercise this flow yet. |

Patient Self Access is Ready; the other three ticket types are Modeled.

### Per-Profile Constraints

The table below summarizes required and optional fields for each ticket type. Each profile pulls in the [access constraints](access-constraints.html) it needs; the Constraints section on each profile's page states which it draws and where the values come from.

{% include generated/spec-snippets/index/per-profile-constraints.md %}

The Identity Evidence column applies the base rule from [Identity Evidence](index.html#identity-evidence) — evidence accompanies each natural person whose verified identity is the basis of the grant; per-type detail lives on each profile page.

Each profile page follows a common template, including **Policy Selection Inputs**. `ticket_type` tells the Data Holder what kind of request this is (self-access, proxy access, claims review, …); the inputs listed per use case are the ticket fields that help it pick the right one of its own internal policies for this specific request. Tickets help the Data Holder pick a policy; they do not create new policies or override existing ones.
