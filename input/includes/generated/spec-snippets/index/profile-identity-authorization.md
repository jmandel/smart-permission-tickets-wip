```
Ticket 1 (Identity Provider - e.g., Clear):
{
  "iss": "https://clear.me",
  "sub": "grant-identity-789",
  "aud": "https://tefca.hhs.gov",
  "exp": 1735689600,
  "ticket_type": "https://smarthealthit.org/permission-ticket-type/identity-v1",
  "cnf": {
    "jkt": "0ZcOCORZNYy-DWpqq30jZyJGHTN0d2HglBV3uiguA4I"
  },
  "authorization": {
    "requester": {
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
  "sub": "grant-authorization-456",
  "aud": "https://tefca.hhs.gov",
  "exp": 1735689600,
  "ticket_type": "https://smarthealthit.org/permission-ticket-type/authorization-v1",
  "cnf": {
    "jkt": "0ZcOCORZNYy-DWpqq30jZyJGHTN0d2HglBV3uiguA4I"
  },
  "authorization": {
    "subject": {
      "type": "match",
      "traits": {
        "resourceType": "Patient"
      }
    },
    "access": {
      "scopes": [
        "patient/*.rs"
      ]
    }
  },
  "details": {
    "requesterReference": "https://clear.me/id|CLR-789"
  }
}
```
