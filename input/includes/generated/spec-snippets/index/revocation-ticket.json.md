```json
{
  "iss": "https://trusted-issuer.org",
  "aud": "https://tefca.hhs.gov",
  "exp": 1735689600,
  "jti": "ticket-unique-id",
  "ticket_type": "https://smarthealthit.org/permission-ticket-type/network-patient-access-v1",
  "presenter_binding": {
    "key": {
      "jkt": "0ZcOCORZNYy-DWpqq30jZyJGHTN0d2HglBV3uiguA4I"
    }
  },
  "revocation": {
    "url": "https://trusted-issuer.org/.well-known/crl/patient-access.json",
    "rid": "abc123xyz"
  },
  "subject": {
    "patient": {
      "resourceType": "Patient"
    }
  },
  "access": {
    "permissions": [
      {
        "kind": "data",
        "resource_type": "*",
        "interactions": [
          "read",
          "search"
        ]
      }
    ]
  },
  "context": {
    "kind": "patient-access"
  }
}
```
