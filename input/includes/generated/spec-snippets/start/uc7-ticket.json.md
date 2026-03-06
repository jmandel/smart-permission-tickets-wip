```json
{
  "authorization": {
    "subject": {
      "type": "reference",
      "resourceType": "Patient",
      "reference": "Patient/999"
    },
    "requester": {
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
    "access": {
      "scopes": [
        "patient/*.rs"
      ]
    }
  },
  "details": {
    "reason": {
      "system": "http://snomed.info/sct",
      "code": "49436004",
      "display": "Atrial fibrillation"
    },
    "request": {
      "reference": "ServiceRequest/ref-req-111",
      "identifier": {
        "system": "https://referring-ehr.org/requests",
        "value": "ref-req-111"
      },
      "display": "Cardiology consult for atrial fibrillation"
    }
  }
}
```
