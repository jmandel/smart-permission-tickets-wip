```
Ticket 1 (Identity Provider - e.g., Clear):
{
  "iss": "https://clear.me",
  "sub": "clear-subject-789",
  "aud": "https://tefca.hhs.gov",
  "exp": 1735689600,
  "ticket_type": "https://smarthealthit.org/permission-ticket-type/identity-v1",
  "client_binding": {
    "jwks_uri": "https://health-app.example.com/jwks.json"
  },
  "ticket_context": {
    "actor": {
      "resourceType": "RelatedPerson",
      "identifier": [
        {
          "system": "https://clear.me/id",
          "value": "CLR-789"
        }
      ],
      "name": [
        {
          "family": "Smith",
          "given": [
            "Jane"
          ]
        }
      ]
    }
  }
}

Ticket 2 (Trust Broker):
{
  "iss": "https://trust-broker.org",
  "sub": "trust-subject-456",
  "aud": "https://tefca.hhs.gov",
  "exp": 1735689600,
  "ticket_type": "https://smarthealthit.org/permission-ticket-type/authorization-v1",
  "client_binding": {
    "jwks_uri": "https://health-app.example.com/jwks.json"
  },
  "ticket_context": {
    "subject": {
      "type": "match",
      "traits": {
        "resourceType": "Patient"
      }
    },
    "context": {
      "type": {
        "code": "DPOA"
      },
      "actor_reference": "https://clear.me/id|CLR-789"
    },
    "capability": {
      "scopes": [
        "patient/*.rs"
      ]
    }
  }
}
```
