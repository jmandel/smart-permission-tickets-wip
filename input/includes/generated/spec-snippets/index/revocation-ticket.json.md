```json
{
  "iss": "https://trust-broker.org",
  "sub": "issuer-defined-subject",
  "aud": "https://tefca.hhs.gov",
  "exp": 1735689600,
  "ticket_type": "https://smarthealthit.org/permission-ticket-type/proxy-v1",
  "cnf": {
    "jkt": "0ZcOCORZNYy-DWpqq30jZyJGHTN0d2HglBV3uiguA4I"
  },
  "jti": "ticket-unique-id",
  "revocation": {
    "url": "https://trust-broker.org/.well-known/crl/patient-access.json",
    "rid": "abc123xyz"
  },
  "ticket_context": {
    "subject": {
      "resourceType": "Patient"
    },
    "capability": {
      "scopes": [
        "patient/*.rs"
      ]
    }
  }
}
```
