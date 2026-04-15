{% include callouts.html %}

**Status:** Draft for discussion \| **Author:** Josh Mandel \| **Date:** April 15, 2026

### Summary

This proposal details how Permission Ticket issuers can participate in [OpenID Federation 1.0](https://openid.net/specs/openid-federation-1_0.html) to publish their ticket-signing keys, and how Data Holders consume that publication when verifying tickets. It builds on the issuer key publication requirements in the [main specification](index.html#issuer-key-publication).

### Issuer Leaf Entity Configuration

An issuer that participates in OpenID Federation SHALL publish its leaf entity configuration at:

```
${iss}/.well-known/openid-federation
```

The leaf entity statement's `iss` and `sub` SHALL equal the `PermissionTicket`'s `iss` claim. This is the structural binding that ties the `PermissionTicket` to its OpenID Federation identity. A Data Holder that has verified the federation chain can derive the issuer's identity from the leaf entity ID itself; no separate `iss → entity` map is required.

### `smart_permission_ticket_issuer` Metadata Type

The leaf entity statement SHALL include the custom OpenID Federation metadata type `smart_permission_ticket_issuer` in its `metadata` object. The identifier is a project-defined bare snake_case OpenID Federation metadata type.

The `smart_permission_ticket_issuer` metadata object SHALL contain:

- `jwks`: an inline JWK Set carrying the public keys that sign `PermissionTicket` JWTs.

The `jwks` field is inline rather than a URI reference so that the federation chain itself cryptographically attests to the ticket-signing keys. A verifier that has walked the federation chain to a configured trust anchor does not need an additional HTTP fetch at ticket-verification time.

### Two Key Sets, Two Roles

A leaf entity statement carries two distinct JWK sets:

- **Top-level `jwks`** of the entity statement is the **federation-signing key set**. It is used to validate the entity statement itself as part of trust-chain verification.
- **`metadata.smart_permission_ticket_issuer.jwks`** is the **ticket-signing key set**. It is used to verify `PermissionTicket` signatures after the federation chain validates.

These two key sets are independent and rotate independently. A Data Holder SHALL NOT treat the leaf entity statement's top-level `jwks` as the ticket-signing key set.

### Verifier Pipeline

When a Data Holder receives a `PermissionTicket` whose `iss` is to be verified through OpenID Federation:

1. Fetch `${iss}/.well-known/openid-federation` to obtain the leaf entity configuration.
2. Discover and verify a trust chain from the leaf to a configured trust anchor.
3. Apply metadata policy.
4. Confirm `verified_chain.leaf.entity_id === permission_ticket.iss`.
5. Read the ticket-signing keys from `metadata.smart_permission_ticket_issuer.jwks`.
6. Verify the `PermissionTicket` signature against those keys.

The Data Holder needs only its configured trust anchors. No per-issuer pre-configuration is required.

### Relationship to Direct JWKS Publication

Every `PermissionTicket` issuer SHALL publish its verification keys as a JWK Set at `${iss}/.well-known/jwks.json` regardless of whether it also participates in OpenID Federation. See [Issuer Key Publication](index.html#issuer-key-publication) in the main specification.

When an issuer participates in OpenID Federation, the OpenID Federation publication is the federation-discovery counterpart to the direct JWKS publication. An issuer that participates in OpenID Federation SHOULD publish the same ticket-signing key set through both paths so that any Data Holder can resolve its keys regardless of which trust path the holder is configured for.

### Example Leaf Entity Statement Payload

```json
{
  "iss": "https://issuer.example/issuer/example",
  "sub": "https://issuer.example/issuer/example",
  "jwks": {
    "keys": [
      {
        "kid": "fed-2026-04",
        "kty": "EC",
        "crv": "P-256",
        "x": "...",
        "y": "..."
      }
    ]
  },
  "metadata": {
    "federation_entity": {
      "organization_name": "Example Health Issuer"
    },
    "smart_permission_ticket_issuer": {
      "jwks": {
        "keys": [
          {
            "kid": "tickets-2026-04",
            "kty": "EC",
            "crv": "P-256",
            "x": "...",
            "y": "..."
          }
        ]
      }
    }
  }
}
```

The top-level `jwks` (`fed-2026-04`) signs the entity statement and is the federation-signing key set. The metadata `jwks` (`tickets-2026-04`) signs `PermissionTicket` JWTs and is the ticket-signing key set.
