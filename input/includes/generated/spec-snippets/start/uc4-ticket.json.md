```json
{
  "ticket_context": {
    "subject": {
      "resourceType": "Patient",
      "reference": "Patient/123"
    },
    "actor": {
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
    "context": {
      "type": {
        "system": "http://terminology.hl7.org/CodeSystem/v3-ActReason",
        "code": "REFER",
        "display": "Referral"
      },
      "focus": {
        "system": "http://snomed.info/sct",
        "code": "733423003",
        "display": "Food insecurity"
      },
      "identifier": [
        {
          "system": "https://referring-ehr.org/referrals",
          "value": "REF-555"
        }
      ]
    },
    "capability": {
      "scopes": [
        "patient/ServiceRequest.rsu",
        "patient/Task.rsu"
      ]
    }
  }
}
```
