```json
{
  "ticket_context": {
    "subject": {
      "type": "identifier",
      "resourceType": "Patient",
      "identifier": [
        {
          "value": "MRN-123"
        }
      ]
    },
    "actor": {
      "resourceType": "Organization",
      "name": "Oncology Research Institute",
      "identifier": [
        {
          "value": "research-org-id"
        }
      ]
    },
    "context": {
      "type": {
        "system": "http://terminology.hl7.org/CodeSystem/v3-ActReason",
        "code": "RESCH",
        "display": "Biomedical Research"
      },
      "focus": {
        "system": "http://snomed.info/sct",
        "code": "363358000",
        "display": "Malignant tumor of lung"
      },
      "identifier": [
        {
          "system": "https://consent-service.org/studies",
          "value": "STUDY-PROTO-22"
        }
      ]
    },
    "capability": {
      "scopes": [
        "patient/*.rs"
      ],
      "periods": [
        {
          "start": "2020-01-01",
          "end": "2025-01-01"
        }
      ]
    }
  }
}
```
