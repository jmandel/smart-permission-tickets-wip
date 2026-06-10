```json
{
  "iss": "https://trusted-issuer.org",
  "aud": "https://tefca.hhs.gov",
  "aud_type": "trust_framework",
  "exp": 1735689600,
  "iat": 1735686000,
  "jti": "ticket-unique-id",
  "ticket_type": "https://smarthealthit.org/permission-ticket-type/patient-self-access-v1",
  "presenter_binding": {
    "method": "jkt",
    "jkt": "0ZcOCORZNYy-DWpqq30jZyJGHTN0d2HglBV3uiguA4I"
  },
  "revocation": {
    "url": "https://trusted-issuer.org/.well-known/status/patient-access",
    "index": 4722
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
  }
}
```
