```json
{
  "authorization": {
    "subject": {
      "type": "reference",
      "resourceType": "Patient",
      "reference": "Patient/123"
    },
    "requester": {
      "resourceType": "PractitionerRole",
      "contained": [
        {
          "resourceType": "Practitioner",
          "id": "p1",
          "name": [
            {
              "family": "Volunteer",
              "given": [
                "Alice"
              ]
            }
          ],
          "telecom": [
            {
              "system": "email",
              "value": "alice@foodbank.org"
            }
          ]
        },
        {
          "resourceType": "Organization",
          "id": "o1",
          "name": "Downtown Food Bank"
        }
      ],
      "practitioner": {
        "reference": "#p1"
      },
      "organization": {
        "reference": "#o1"
      }
    },
    "access": {
      "scopes": [
        "patient/ServiceRequest.rsu",
        "patient/Task.rsu"
      ]
    }
  },
  "details": {
    "concern": {
      "system": "http://snomed.info/sct",
      "code": "733423003",
      "display": "Food insecurity"
    },
    "referralIdentifier": [
      {
        "system": "https://referring-ehr.org/referrals",
        "value": "REF-555"
      }
    ]
  }
}
```
