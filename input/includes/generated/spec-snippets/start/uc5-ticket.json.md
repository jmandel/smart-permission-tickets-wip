```json
{
  "ticket_context": {
    "subject": {
      "type": "reference",
      "resourceType": "Patient",
      "reference": "Patient/456"
    },
    "actor": {
      "resourceType": "Organization",
      "identifier": [
        {
          "system": "http://hl7.org/fhir/sid/us-npi",
          "value": "9876543210"
        }
      ],
      "name": "Blue Payer Inc"
    },
    "context": {
      "type": {
        "system": "http://terminology.hl7.org/CodeSystem/v3-ActReason",
        "code": "CLMATTCH",
        "display": "Claim Attachment"
      },
      "focus": {
        "system": "http://snomed.info/sct",
        "code": "80146002",
        "display": "Appendectomy"
      },
      "identifier": [
        {
          "system": "http://provider.com/claims",
          "value": "CLAIM-2024-XYZ"
        }
      ]
    },
    "capability": {
      "scopes": [
        "patient/DocumentReference.rs",
        "patient/Procedure.rs"
      ]
    }
  }
}
```
