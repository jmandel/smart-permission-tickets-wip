```js
{
  // Standard JWT envelope: who minted the ticket, who may redeem it, and when it expires.
  "iss": "https://trusted-issuer.org",
  "aud": "https://network.org",
  "aud_type": "trust_framework",
  "exp": 1735689600,
  "iat": 1735686000,
  "jti": "ticket-example-001",

  // Profile selector: tells the Data Holder which validation and access rules apply.
  "ticket_type": "https://smarthealthit.org/permission-ticket-type/patient-self-access-v1",

  // Presenter binding: redemption is limited to the client holding this key thumbprint.
  "presenter_binding": {
    "method": "jkt",
    "jkt": "0ZcOCORZNYy-DWpqq30jZyJGHTN0d2HglBV3uiguA4I"
  },

  // Subject: identifies whose data this ticket is about.
  "subject": {
    "patient": {
      "resourceType": "Patient",
      "name": [
        {
          "family": "Smith",
          "given": [
            "John"
          ]
        }
      ],
      "birthDate": "1980-01-01",
      "identifier": [
        {
          "system": "http://hospital.example.org/mrn",
          "value": "A12345"
        }
      ]
    }
  },

  // Access: defines what the client may read or search once the ticket is redeemed.
  "access": {
    "smart_scopes": [
      "patient/Immunization.rs",
      "patient/AllergyIntolerance.rs"
    ]
  }
}
```
