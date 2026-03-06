```json
{
  "authorization": {
    "subject": {
      "type": "reference",
      "resourceType": "Patient",
      "reference": "Patient/456"
    },
    "requester": {
      "resourceType": "Organization",
      "identifier": [
        {
          "system": "http://hl7.org/fhir/sid/us-npi",
          "value": "9876543210"
        }
      ],
      "name": "Blue Payer Inc"
    },
    "access": {
      "scopes": [
        "patient/DocumentReference.rs",
        "patient/Procedure.rs"
      ]
    }
  },
  "details": {
    "service": {
      "system": "http://snomed.info/sct",
      "code": "80146002",
      "display": "Appendectomy"
    },
    "claimIdentifier": [
      {
        "system": "http://provider.com/claims",
        "value": "CLAIM-2024-XYZ"
      }
    ]
  }
}
```
