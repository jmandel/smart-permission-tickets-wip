```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "iss": {
      "type": "string",
      "minLength": 1
    },
    "aud": {
      "anyOf": [
        {
          "type": "string",
          "minLength": 1
        },
        {
          "minItems": 1,
          "type": "array",
          "items": {
            "type": "string",
            "minLength": 1
          }
        }
      ]
    },
    "exp": {
      "type": "integer",
      "minimum": -9007199254740991,
      "maximum": 9007199254740991
    },
    "iat": {
      "type": "integer",
      "minimum": -9007199254740991,
      "maximum": 9007199254740991
    },
    "jti": {
      "type": "string",
      "minLength": 1
    },
    "ticket_type": {
      "type": "string",
      "enum": [
        "https://smarthealthit.org/permission-ticket-type/network-patient-access-v1",
        "https://smarthealthit.org/permission-ticket-type/authorized-representative-access-v1",
        "https://smarthealthit.org/permission-ticket-type/public-health-investigation-v1",
        "https://smarthealthit.org/permission-ticket-type/social-care-referral-v1",
        "https://smarthealthit.org/permission-ticket-type/payer-claims-adjudication-v1",
        "https://smarthealthit.org/permission-ticket-type/research-study-access-v1",
        "https://smarthealthit.org/permission-ticket-type/provider-consult-v1"
      ]
    },
    "presenter_binding": {
      "type": "object",
      "properties": {
        "key": {
          "type": "object",
          "properties": {
            "jkt": {
              "type": "string",
              "minLength": 1
            }
          },
          "required": [
            "jkt"
          ],
          "additionalProperties": false
        },
        "framework_client": {
          "type": "object",
          "properties": {
            "framework": {
              "type": "string",
              "minLength": 1
            },
            "framework_type": {
              "type": "string",
              "enum": [
                "well-known",
                "udap"
              ]
            },
            "entity_uri": {
              "type": "string",
              "minLength": 1
            }
          },
          "required": [
            "framework",
            "framework_type",
            "entity_uri"
          ],
          "additionalProperties": false
        }
      },
      "additionalProperties": false
    },
    "revocation": {
      "type": "object",
      "properties": {
        "url": {
          "type": "string",
          "minLength": 1
        },
        "rid": {
          "type": "string",
          "minLength": 1
        }
      },
      "required": [
        "url",
        "rid"
      ],
      "additionalProperties": false
    },
    "must_understand": {
      "minItems": 1,
      "type": "array",
      "items": {
        "type": "string",
        "pattern": "^[a-z][a-z0-9_]*$"
      }
    },
    "subject": {
      "type": "object",
      "properties": {
        "patient": {
          "type": "object",
          "properties": {
            "resourceType": {
              "type": "string",
              "const": "Patient"
            },
            "identifier": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "system": {
                    "type": "string"
                  },
                  "value": {
                    "type": "string"
                  },
                  "type": {
                    "type": "object",
                    "properties": {
                      "coding": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "system": {
                              "type": "string"
                            },
                            "code": {
                              "type": "string"
                            },
                            "display": {
                              "type": "string"
                            }
                          },
                          "additionalProperties": {}
                        }
                      },
                      "text": {
                        "type": "string"
                      }
                    },
                    "additionalProperties": {}
                  }
                },
                "additionalProperties": {}
              }
            },
            "name": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "family": {
                    "type": "string"
                  },
                  "given": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  },
                  "prefix": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  },
                  "suffix": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  }
                },
                "additionalProperties": {}
              }
            },
            "birthDate": {
              "type": "string"
            },
            "gender": {
              "type": "string"
            }
          },
          "required": [
            "resourceType"
          ],
          "additionalProperties": {}
        },
        "recipient_record": {
          "type": "object",
          "properties": {
            "reference": {
              "type": "string"
            },
            "identifier": {
              "type": "object",
              "properties": {
                "system": {
                  "type": "string"
                },
                "value": {
                  "type": "string"
                },
                "type": {
                  "type": "object",
                  "properties": {
                    "coding": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "system": {
                            "type": "string"
                          },
                          "code": {
                            "type": "string"
                          },
                          "display": {
                            "type": "string"
                          }
                        },
                        "additionalProperties": {}
                      }
                    },
                    "text": {
                      "type": "string"
                    }
                  },
                  "additionalProperties": {}
                }
              },
              "additionalProperties": {}
            },
            "type": {
              "type": "string",
              "const": "Patient"
            },
            "display": {
              "type": "string"
            }
          },
          "additionalProperties": {}
        }
      },
      "required": [
        "patient"
      ],
      "additionalProperties": false
    },
    "requester": {
      "oneOf": [
        {
          "type": "object",
          "properties": {
            "resourceType": {
              "type": "string",
              "const": "RelatedPerson"
            },
            "relationship": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "coding": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "system": {
                          "type": "string"
                        },
                        "code": {
                          "type": "string"
                        },
                        "display": {
                          "type": "string"
                        }
                      },
                      "additionalProperties": {}
                    }
                  },
                  "text": {
                    "type": "string"
                  }
                },
                "additionalProperties": {}
              }
            },
            "name": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "family": {
                    "type": "string"
                  },
                  "given": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  },
                  "prefix": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  },
                  "suffix": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  }
                },
                "additionalProperties": {}
              }
            },
            "identifier": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "system": {
                    "type": "string"
                  },
                  "value": {
                    "type": "string"
                  },
                  "type": {
                    "type": "object",
                    "properties": {
                      "coding": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "system": {
                              "type": "string"
                            },
                            "code": {
                              "type": "string"
                            },
                            "display": {
                              "type": "string"
                            }
                          },
                          "additionalProperties": {}
                        }
                      },
                      "text": {
                        "type": "string"
                      }
                    },
                    "additionalProperties": {}
                  }
                },
                "additionalProperties": {}
              }
            }
          },
          "required": [
            "resourceType"
          ],
          "additionalProperties": {}
        },
        {
          "type": "object",
          "properties": {
            "resourceType": {
              "type": "string",
              "const": "Practitioner"
            },
            "name": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "family": {
                    "type": "string"
                  },
                  "given": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  },
                  "prefix": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  },
                  "suffix": {
                    "type": "array",
                    "items": {
                      "type": "string"
                    }
                  }
                },
                "additionalProperties": {}
              }
            },
            "identifier": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "system": {
                    "type": "string"
                  },
                  "value": {
                    "type": "string"
                  },
                  "type": {
                    "type": "object",
                    "properties": {
                      "coding": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "system": {
                              "type": "string"
                            },
                            "code": {
                              "type": "string"
                            },
                            "display": {
                              "type": "string"
                            }
                          },
                          "additionalProperties": {}
                        }
                      },
                      "text": {
                        "type": "string"
                      }
                    },
                    "additionalProperties": {}
                  }
                },
                "additionalProperties": {}
              }
            }
          },
          "required": [
            "resourceType"
          ],
          "additionalProperties": {}
        },
        {
          "type": "object",
          "properties": {
            "resourceType": {
              "type": "string",
              "const": "PractitionerRole"
            },
            "code": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "coding": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "system": {
                          "type": "string"
                        },
                        "code": {
                          "type": "string"
                        },
                        "display": {
                          "type": "string"
                        }
                      },
                      "additionalProperties": {}
                    }
                  },
                  "text": {
                    "type": "string"
                  }
                },
                "additionalProperties": {}
              }
            },
            "identifier": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "system": {
                    "type": "string"
                  },
                  "value": {
                    "type": "string"
                  },
                  "type": {
                    "type": "object",
                    "properties": {
                      "coding": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "system": {
                              "type": "string"
                            },
                            "code": {
                              "type": "string"
                            },
                            "display": {
                              "type": "string"
                            }
                          },
                          "additionalProperties": {}
                        }
                      },
                      "text": {
                        "type": "string"
                      }
                    },
                    "additionalProperties": {}
                  }
                },
                "additionalProperties": {}
              }
            }
          },
          "required": [
            "resourceType"
          ],
          "additionalProperties": {}
        },
        {
          "type": "object",
          "properties": {
            "resourceType": {
              "type": "string",
              "const": "Organization"
            },
            "name": {
              "type": "string"
            },
            "identifier": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "system": {
                    "type": "string"
                  },
                  "value": {
                    "type": "string"
                  },
                  "type": {
                    "type": "object",
                    "properties": {
                      "coding": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "system": {
                              "type": "string"
                            },
                            "code": {
                              "type": "string"
                            },
                            "display": {
                              "type": "string"
                            }
                          },
                          "additionalProperties": {}
                        }
                      },
                      "text": {
                        "type": "string"
                      }
                    },
                    "additionalProperties": {}
                  }
                },
                "additionalProperties": {}
              }
            }
          },
          "required": [
            "resourceType"
          ],
          "additionalProperties": {}
        }
      ]
    },
    "access": {
      "type": "object",
      "properties": {
        "permissions": {
          "minItems": 1,
          "type": "array",
          "items": {
            "oneOf": [
              {
                "type": "object",
                "properties": {
                  "kind": {
                    "type": "string",
                    "const": "data"
                  },
                  "resource_type": {
                    "type": "string",
                    "minLength": 1
                  },
                  "interactions": {
                    "minItems": 1,
                    "type": "array",
                    "items": {
                      "type": "string",
                      "enum": [
                        "read",
                        "search",
                        "history",
                        "create",
                        "update",
                        "patch",
                        "delete"
                      ]
                    }
                  },
                  "category_any_of": {
                    "minItems": 1,
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "system": {
                          "type": "string"
                        },
                        "code": {
                          "type": "string"
                        },
                        "display": {
                          "type": "string"
                        }
                      },
                      "additionalProperties": {}
                    }
                  },
                  "code_any_of": {
                    "minItems": 1,
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "system": {
                          "type": "string"
                        },
                        "code": {
                          "type": "string"
                        },
                        "display": {
                          "type": "string"
                        }
                      },
                      "additionalProperties": {}
                    }
                  }
                },
                "required": [
                  "kind",
                  "resource_type",
                  "interactions"
                ],
                "additionalProperties": false
              },
              {
                "type": "object",
                "properties": {
                  "kind": {
                    "type": "string",
                    "const": "operation"
                  },
                  "name": {
                    "type": "string",
                    "minLength": 1
                  },
                  "target": {
                    "type": "object",
                    "properties": {
                      "reference": {
                        "type": "string"
                      },
                      "identifier": {
                        "type": "object",
                        "properties": {
                          "system": {
                            "type": "string"
                          },
                          "value": {
                            "type": "string"
                          },
                          "type": {
                            "type": "object",
                            "properties": {
                              "coding": {
                                "type": "array",
                                "items": {
                                  "type": "object",
                                  "properties": {
                                    "system": {
                                      "type": "string"
                                    },
                                    "code": {
                                      "type": "string"
                                    },
                                    "display": {
                                      "type": "string"
                                    }
                                  },
                                  "additionalProperties": {}
                                }
                              },
                              "text": {
                                "type": "string"
                              }
                            },
                            "additionalProperties": {}
                          }
                        },
                        "additionalProperties": {}
                      },
                      "type": {
                        "type": "string"
                      },
                      "display": {
                        "type": "string"
                      }
                    },
                    "additionalProperties": {}
                  }
                },
                "required": [
                  "kind",
                  "name"
                ],
                "additionalProperties": false
              }
            ]
          }
        },
        "data_period": {
          "type": "object",
          "properties": {
            "start": {
              "type": "string"
            },
            "end": {
              "type": "string"
            }
          },
          "additionalProperties": {}
        },
        "jurisdictions": {
          "minItems": 1,
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "country": {
                "type": "string"
              },
              "state": {
                "type": "string"
              }
            },
            "additionalProperties": false
          }
        },
        "source_organizations": {
          "minItems": 1,
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "system": {
                "type": "string"
              },
              "value": {
                "type": "string"
              },
              "type": {
                "type": "object",
                "properties": {
                  "coding": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "system": {
                          "type": "string"
                        },
                        "code": {
                          "type": "string"
                        },
                        "display": {
                          "type": "string"
                        }
                      },
                      "additionalProperties": {}
                    }
                  },
                  "text": {
                    "type": "string"
                  }
                },
                "additionalProperties": {}
              }
            },
            "additionalProperties": {}
          }
        },
        "sensitive_data": {
          "type": "string",
          "enum": [
            "exclude",
            "include"
          ]
        }
      },
      "required": [
        "permissions"
      ],
      "additionalProperties": false
    },
    "context": {
      "oneOf": [
        {
          "type": "object",
          "properties": {
            "kind": {
              "type": "string",
              "const": "patient-access"
            }
          },
          "required": [
            "kind"
          ],
          "additionalProperties": false
        },
        {
          "type": "object",
          "properties": {
            "kind": {
              "type": "string",
              "const": "public-health"
            },
            "reportable_condition": {
              "type": "object",
              "properties": {
                "coding": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "system": {
                        "type": "string"
                      },
                      "code": {
                        "type": "string"
                      },
                      "display": {
                        "type": "string"
                      }
                    },
                    "additionalProperties": {}
                  }
                },
                "text": {
                  "type": "string"
                }
              },
              "additionalProperties": {}
            },
            "investigation_case": {
              "type": "object",
              "properties": {
                "system": {
                  "type": "string"
                },
                "value": {
                  "type": "string"
                },
                "type": {
                  "type": "object",
                  "properties": {
                    "coding": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "system": {
                            "type": "string"
                          },
                          "code": {
                            "type": "string"
                          },
                          "display": {
                            "type": "string"
                          }
                        },
                        "additionalProperties": {}
                      }
                    },
                    "text": {
                      "type": "string"
                    }
                  },
                  "additionalProperties": {}
                }
              },
              "additionalProperties": {}
            },
            "triggering_resource": {
              "anyOf": [
                {
                  "type": "object",
                  "properties": {
                    "resourceType": {
                      "type": "string",
                      "const": "Condition"
                    }
                  },
                  "required": [
                    "resourceType"
                  ],
                  "additionalProperties": {}
                },
                {
                  "type": "object",
                  "properties": {
                    "resourceType": {
                      "type": "string",
                      "const": "Observation"
                    }
                  },
                  "required": [
                    "resourceType"
                  ],
                  "additionalProperties": {}
                },
                {
                  "type": "object",
                  "properties": {
                    "resourceType": {
                      "type": "string",
                      "const": "DiagnosticReport"
                    }
                  },
                  "required": [
                    "resourceType"
                  ],
                  "additionalProperties": {}
                }
              ]
            },
            "source_report": {
              "type": "object",
              "properties": {
                "resourceType": {
                  "type": "string",
                  "const": "DocumentReference"
                }
              },
              "required": [
                "resourceType"
              ],
              "additionalProperties": {}
            }
          },
          "required": [
            "kind",
            "reportable_condition"
          ],
          "additionalProperties": false
        },
        {
          "type": "object",
          "properties": {
            "kind": {
              "type": "string",
              "const": "social-care-referral"
            },
            "concern": {
              "type": "object",
              "properties": {
                "coding": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "system": {
                        "type": "string"
                      },
                      "code": {
                        "type": "string"
                      },
                      "display": {
                        "type": "string"
                      }
                    },
                    "additionalProperties": {}
                  }
                },
                "text": {
                  "type": "string"
                }
              },
              "additionalProperties": {}
            },
            "referral": {
              "type": "object",
              "properties": {
                "resourceType": {
                  "type": "string",
                  "const": "ServiceRequest"
                }
              },
              "required": [
                "resourceType"
              ],
              "additionalProperties": {}
            },
            "task": {
              "type": "object",
              "properties": {
                "resourceType": {
                  "type": "string",
                  "const": "Task"
                }
              },
              "required": [
                "resourceType"
              ],
              "additionalProperties": {}
            }
          },
          "required": [
            "kind",
            "concern",
            "referral"
          ],
          "additionalProperties": false
        },
        {
          "type": "object",
          "properties": {
            "kind": {
              "type": "string",
              "const": "payer-claims"
            },
            "service": {
              "type": "object",
              "properties": {
                "coding": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "system": {
                        "type": "string"
                      },
                      "code": {
                        "type": "string"
                      },
                      "display": {
                        "type": "string"
                      }
                    },
                    "additionalProperties": {}
                  }
                },
                "text": {
                  "type": "string"
                }
              },
              "additionalProperties": {}
            },
            "claim": {
              "type": "object",
              "properties": {
                "resourceType": {
                  "type": "string",
                  "const": "Claim"
                }
              },
              "required": [
                "resourceType"
              ],
              "additionalProperties": {}
            }
          },
          "required": [
            "kind",
            "service",
            "claim"
          ],
          "additionalProperties": false
        },
        {
          "type": "object",
          "properties": {
            "kind": {
              "type": "string",
              "const": "research"
            },
            "study": {
              "type": "object",
              "properties": {
                "resourceType": {
                  "type": "string",
                  "const": "ResearchStudy"
                }
              },
              "required": [
                "resourceType"
              ],
              "additionalProperties": {}
            },
            "research_subject": {
              "type": "object",
              "properties": {
                "resourceType": {
                  "type": "string",
                  "const": "ResearchSubject"
                }
              },
              "required": [
                "resourceType"
              ],
              "additionalProperties": {}
            },
            "condition": {
              "type": "object",
              "properties": {
                "coding": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "system": {
                        "type": "string"
                      },
                      "code": {
                        "type": "string"
                      },
                      "display": {
                        "type": "string"
                      }
                    },
                    "additionalProperties": {}
                  }
                },
                "text": {
                  "type": "string"
                }
              },
              "additionalProperties": {}
            }
          },
          "required": [
            "kind",
            "study"
          ],
          "additionalProperties": false
        },
        {
          "type": "object",
          "properties": {
            "kind": {
              "type": "string",
              "const": "provider-consult"
            },
            "reason": {
              "type": "object",
              "properties": {
                "coding": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "system": {
                        "type": "string"
                      },
                      "code": {
                        "type": "string"
                      },
                      "display": {
                        "type": "string"
                      }
                    },
                    "additionalProperties": {}
                  }
                },
                "text": {
                  "type": "string"
                }
              },
              "additionalProperties": {}
            },
            "consult_request": {
              "type": "object",
              "properties": {
                "resourceType": {
                  "type": "string",
                  "const": "ServiceRequest"
                }
              },
              "required": [
                "resourceType"
              ],
              "additionalProperties": {}
            }
          },
          "required": [
            "kind",
            "reason",
            "consult_request"
          ],
          "additionalProperties": false
        }
      ]
    },
    "supporting_artifacts": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "resourceType": {
            "type": "string",
            "minLength": 1
          }
        },
        "required": [
          "resourceType"
        ],
        "additionalProperties": {}
      }
    }
  },
  "required": [
    "iss",
    "aud",
    "exp",
    "jti",
    "ticket_type",
    "subject",
    "access",
    "context"
  ],
  "additionalProperties": {}
}
```
