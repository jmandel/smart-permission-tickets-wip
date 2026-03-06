```json
{
  "iss": "https://trust-broker.org",
  "sub": "grant-revocable-example",
  "aud": "https://tefca.hhs.gov",
  "exp": 1735689600,
  "ticket_type": "https://smarthealthit.org/permission-ticket-type/network-patient-access-v1",
  "cnf": {
    "jkt": "0ZcOCORZNYy-DWpqq30jZyJGHTN0d2HglBV3uiguA4I"
  },
  "jti": "ticket-unique-id",
  "revocation": {
    "url": "https://trust-broker.org/.well-known/crl/patient-access.json",
    "rid": "abc123xyz"
  },
  "authorization": {
    "subject": {
      "type": "match",
      "resourceType": "Patient"
    },
    "access": {
      "scopes": [
        "patient/*.rs"
      ]
    }
  }
}
```
