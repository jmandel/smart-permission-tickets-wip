```json
{
  "ticket_context": {
    "subject": {
      "type": "reference",
      "resourceType": "Patient",
      "reference": "Patient/999"
    },
    "actor": {
      "resourceType": "Practitioner",
      "identifier": [
        {
          "system": "http://hl7.org/fhir/sid/us-npi",
          "value": "1112223333"
        }
      ],
      "name": [
        {
          "family": "Heart",
          "given": [
            "A."
          ]
        }
      ]
    },
    "context": {
      "type": {
        "system": "http://terminology.hl7.org/CodeSystem/v3-ActReason",
        "code": "REFER",
        "display": "Referral"
      },
      "focus": {
        "system": "http://snomed.info/sct",
        "code": "49436004",
        "display": "Atrial fibrillation"
      },
      "identifier": [
        {
          "system": "https://referring-ehr.org/requests",
          "value": "ref-req-111"
        }
      ]
    },
    "capability": {
      "scopes": [
        "patient/*.rs"
      ]
    }
  }
}
```
