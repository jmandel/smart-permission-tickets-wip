```json
{
  "authorization": {
    "subject": {
      "type": "identifier",
      "resourceType": "Patient",
      "identifier": [
        {
          "system": "https://national-mpi.net",
          "value": "pt-555"
        }
      ]
    },
    "requester": {
      "resourceType": "RelatedPerson",
      "name": [
        {
          "family": "Doe",
          "given": [
            "Jane"
          ]
        }
      ],
      "telecom": [
        {
          "system": "email",
          "value": "jane.doe@example.com"
        }
      ],
      "relationship": [
        {
          "coding": [
            {
              "system": "http://terminology.hl7.org/CodeSystem/v3-RoleCode",
              "code": "DAU",
              "display": "Daughter"
            }
          ]
        }
      ]
    },
    "access": {
      "scopes": [
        "patient/*.rs"
      ]
    }
  }
}
```
