{% include callouts.html %}

**Status:** Draft for discussion \| **Author:** Josh Mandel \| **Date:** June 9, 2026

### Summary

This proposal defines the **Well-Known JWKS** client identity approach: a deterministic client identifier of the form `well-known:{entity_uri}` that resolves the same way at every Data Holder, with no per-holder registration step. It is one of the client identity approaches listed in the base specification's [Trust and Client Registration](index.html#trust-and-client-registration) table; the base specification does not require Data Holders to support it.

### Identifier and Key Publication

The client's identifier is `well-known:{entity_uri}`, where `entity_uri` is an HTTPS URL the client controls. The client publishes its public keys as a JWK Set at:

```
{entity_uri}/.well-known/jwks.json
```

The same `entity_uri` yields the same `client_id` at every Data Holder.

### Verification

When a client presents a `client_assertion` with `iss = sub = well-known:{entity_uri}`, the Data Holder:

1. Strips the `well-known:` prefix to obtain `entity_uri`.
2. Fetches the JWK Set from `{entity_uri}/.well-known/jwks.json`.
3. Verifies the assertion signature against those keys.
4. Applies any trust-framework checks for that entity (for example, confirming the entity appears in a framework's list of recognized participants).

Data Holders SHOULD cache fetched JWK Sets per HTTP cache headers.

### Use in Presenter Binding

A ticket can bind redemption to a well-known client with:

```json
{
  "method": "trust_framework_client",
  "trust_framework": "<trust framework id>",
  "framework_type": "well-known",
  "entity_uri": "https://app.example.com"
}
```

The Data Holder confirms the authenticated client's `entity_uri` matches the binding before redeeming the ticket.

### Trust Considerations

Possessing a domain is not the same as being trustworthy: anyone can host a JWKS. This approach establishes *key continuity for a name* — the party presenting today controls the same keys as the party who registered the name. Whether that name is allowed to do anything is a separate decision made by a trust framework that lists recognized entities, or by a Data Holder's local policy. Control of `entity_uri` is the root of this identity; domain expiration or takeover transfers it, which trust frameworks should account for in their participation rules.
