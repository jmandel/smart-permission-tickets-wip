// Generated from scripts/permission-ticket-schema.ts. Do not edit by hand.

export type PermissionTicketType = "https://smarthealthit.org/permission-ticket-type/patient-self-access-v1" | "https://smarthealthit.org/permission-ticket-type/patient-delegated-access-v1" | "https://smarthealthit.org/permission-ticket-type/public-health-investigation-v1" | "https://smarthealthit.org/permission-ticket-type/social-care-referral-v1" | "https://smarthealthit.org/permission-ticket-type/payer-claims-adjudication-v1" | "https://smarthealthit.org/permission-ticket-type/research-study-access-v1" | "https://smarthealthit.org/permission-ticket-type/provider-consult-v1";

export type RestInteraction = "read" | "search" | "history" | "create" | "update" | "patch" | "delete";

export type SensitiveDataPolicy = "exclude" | "include";

export type TicketAudienceType = "data_holder_url" | "trust_framework";

export type FHIRCoding = {
    system?: string | undefined;
    code?: string | undefined;
    display?: string | undefined;
    [x: string]: unknown;
};

export type FHIRCodeableConcept = {
    coding?: {
        system?: string | undefined;
        code?: string | undefined;
        display?: string | undefined;
        [x: string]: unknown;
    }[] | undefined;
    text?: string | undefined;
    [x: string]: unknown;
};

export type FHIRIdentifier = {
    system?: string | undefined;
    value?: string | undefined;
    type?: {
        coding?: {
            system?: string | undefined;
            code?: string | undefined;
            display?: string | undefined;
            [x: string]: unknown;
        }[] | undefined;
        text?: string | undefined;
        [x: string]: unknown;
    } | undefined;
    [x: string]: unknown;
};

export type FHIRHumanName = {
    family?: string | undefined;
    given?: string[] | undefined;
    prefix?: string[] | undefined;
    suffix?: string[] | undefined;
    [x: string]: unknown;
};

export type FHIRPeriod = {
    start?: string | undefined;
    end?: string | undefined;
    [x: string]: unknown;
};

export type FHIRReference = {
    reference?: string | undefined;
    identifier?: {
        system?: string | undefined;
        value?: string | undefined;
        type?: {
            coding?: {
                system?: string | undefined;
                code?: string | undefined;
                display?: string | undefined;
                [x: string]: unknown;
            }[] | undefined;
            text?: string | undefined;
            [x: string]: unknown;
        } | undefined;
        [x: string]: unknown;
    } | undefined;
    type?: string | undefined;
    display?: string | undefined;
    [x: string]: unknown;
};

export type FHIRAddress = {
    country?: string | undefined;
    state?: string | undefined;
};

export type KeyBinding = {
    method: "jkt";
    jkt: string;
    [x: string]: never;
};

export type FrameworkClientBinding = {
    method: "framework_client";
    framework: string;
    framework_type: "well-known" | "udap" | "oidf";
    entity_uri: string;
    [x: string]: never;
};

export type PresenterBinding = {
    method: "jkt";
    jkt: string;
    [x: string]: never;
} | {
    method: "framework_client";
    framework: string;
    framework_type: "well-known" | "udap" | "oidf";
    entity_uri: string;
    [x: string]: never;
};

export type Subject = {
    patient: {
        resourceType: "Patient";
        identifier?: {
            system?: string | undefined;
            value?: string | undefined;
            type?: {
                coding?: {
                    system?: string | undefined;
                    code?: string | undefined;
                    display?: string | undefined;
                    [x: string]: unknown;
                }[] | undefined;
                text?: string | undefined;
                [x: string]: unknown;
            } | undefined;
            [x: string]: unknown;
        }[] | undefined;
        name?: {
            family?: string | undefined;
            given?: string[] | undefined;
            prefix?: string[] | undefined;
            suffix?: string[] | undefined;
            [x: string]: unknown;
        }[] | undefined;
        birthDate?: string | undefined;
        gender?: string | undefined;
        [x: string]: unknown;
    };
    recipient_record?: {
        reference?: string | undefined;
        identifier?: {
            system?: string | undefined;
            value?: string | undefined;
            type?: {
                coding?: {
                    system?: string | undefined;
                    code?: string | undefined;
                    display?: string | undefined;
                    [x: string]: unknown;
                }[] | undefined;
                text?: string | undefined;
                [x: string]: unknown;
            } | undefined;
            [x: string]: unknown;
        } | undefined;
        type?: "Patient" | undefined;
        display?: string | undefined;
        [x: string]: unknown;
    } | undefined;
};

export type Requester = {
    resourceType: "RelatedPerson";
    relationship?: {
        coding?: {
            system?: string | undefined;
            code?: string | undefined;
            display?: string | undefined;
            [x: string]: unknown;
        }[] | undefined;
        text?: string | undefined;
        [x: string]: unknown;
    }[] | undefined;
    name?: {
        family?: string | undefined;
        given?: string[] | undefined;
        prefix?: string[] | undefined;
        suffix?: string[] | undefined;
        [x: string]: unknown;
    }[] | undefined;
    identifier?: {
        system?: string | undefined;
        value?: string | undefined;
        type?: {
            coding?: {
                system?: string | undefined;
                code?: string | undefined;
                display?: string | undefined;
                [x: string]: unknown;
            }[] | undefined;
            text?: string | undefined;
            [x: string]: unknown;
        } | undefined;
        [x: string]: unknown;
    }[] | undefined;
    [x: string]: unknown;
} | {
    resourceType: "Practitioner";
    name?: {
        family?: string | undefined;
        given?: string[] | undefined;
        prefix?: string[] | undefined;
        suffix?: string[] | undefined;
        [x: string]: unknown;
    }[] | undefined;
    identifier?: {
        system?: string | undefined;
        value?: string | undefined;
        type?: {
            coding?: {
                system?: string | undefined;
                code?: string | undefined;
                display?: string | undefined;
                [x: string]: unknown;
            }[] | undefined;
            text?: string | undefined;
            [x: string]: unknown;
        } | undefined;
        [x: string]: unknown;
    }[] | undefined;
    [x: string]: unknown;
} | {
    resourceType: "PractitionerRole";
    code?: {
        coding?: {
            system?: string | undefined;
            code?: string | undefined;
            display?: string | undefined;
            [x: string]: unknown;
        }[] | undefined;
        text?: string | undefined;
        [x: string]: unknown;
    }[] | undefined;
    identifier?: {
        system?: string | undefined;
        value?: string | undefined;
        type?: {
            coding?: {
                system?: string | undefined;
                code?: string | undefined;
                display?: string | undefined;
                [x: string]: unknown;
            }[] | undefined;
            text?: string | undefined;
            [x: string]: unknown;
        } | undefined;
        [x: string]: unknown;
    }[] | undefined;
    [x: string]: unknown;
} | {
    resourceType: "Organization";
    name?: string | undefined;
    identifier?: {
        system?: string | undefined;
        value?: string | undefined;
        type?: {
            coding?: {
                system?: string | undefined;
                code?: string | undefined;
                display?: string | undefined;
                [x: string]: unknown;
            }[] | undefined;
            text?: string | undefined;
            [x: string]: unknown;
        } | undefined;
        [x: string]: unknown;
    }[] | undefined;
    [x: string]: unknown;
};

export type DataPermission = {
    kind: "data";
    resource_type: string;
    interactions: ("read" | "search" | "history" | "create" | "update" | "patch" | "delete")[];
    category_any_of?: {
        system?: string | undefined;
        code?: string | undefined;
        display?: string | undefined;
        [x: string]: unknown;
    }[] | undefined;
    code_any_of?: {
        system?: string | undefined;
        code?: string | undefined;
        display?: string | undefined;
        [x: string]: unknown;
    }[] | undefined;
    [x: string]: never;
};

export type OperationPermission = {
    kind: "operation";
    name: string;
    target?: {
        reference?: string | undefined;
        identifier?: {
            system?: string | undefined;
            value?: string | undefined;
            type?: {
                coding?: {
                    system?: string | undefined;
                    code?: string | undefined;
                    display?: string | undefined;
                    [x: string]: unknown;
                }[] | undefined;
                text?: string | undefined;
                [x: string]: unknown;
            } | undefined;
            [x: string]: unknown;
        } | undefined;
        type?: string | undefined;
        display?: string | undefined;
        [x: string]: unknown;
    } | undefined;
    [x: string]: never;
};

export type PermissionRule = {
    kind: "data";
    resource_type: string;
    interactions: ("read" | "search" | "history" | "create" | "update" | "patch" | "delete")[];
    category_any_of?: {
        system?: string | undefined;
        code?: string | undefined;
        display?: string | undefined;
        [x: string]: unknown;
    }[] | undefined;
    code_any_of?: {
        system?: string | undefined;
        code?: string | undefined;
        display?: string | undefined;
        [x: string]: unknown;
    }[] | undefined;
    [x: string]: never;
} | {
    kind: "operation";
    name: string;
    target?: {
        reference?: string | undefined;
        identifier?: {
            system?: string | undefined;
            value?: string | undefined;
            type?: {
                coding?: {
                    system?: string | undefined;
                    code?: string | undefined;
                    display?: string | undefined;
                    [x: string]: unknown;
                }[] | undefined;
                text?: string | undefined;
                [x: string]: unknown;
            } | undefined;
            [x: string]: unknown;
        } | undefined;
        type?: string | undefined;
        display?: string | undefined;
        [x: string]: unknown;
    } | undefined;
    [x: string]: never;
};

export type JurisdictionFilter = {
    kind: "jurisdiction";
    address: {
        country?: string | undefined;
        state?: string | undefined;
    };
    [x: string]: never;
};

export type OrganizationFilter = {
    kind: "organization";
    organization: {
        resourceType: "Organization";
        name?: string | undefined;
        identifier?: {
            system?: string | undefined;
            value?: string | undefined;
            type?: {
                coding?: {
                    system?: string | undefined;
                    code?: string | undefined;
                    display?: string | undefined;
                    [x: string]: unknown;
                }[] | undefined;
                text?: string | undefined;
                [x: string]: unknown;
            } | undefined;
            [x: string]: unknown;
        }[] | undefined;
        [x: string]: unknown;
    };
    [x: string]: never;
};

export type DataHolderFilter = {
    kind: "jurisdiction";
    address: {
        country?: string | undefined;
        state?: string | undefined;
    };
    [x: string]: never;
} | {
    kind: "organization";
    organization: {
        resourceType: "Organization";
        name?: string | undefined;
        identifier?: {
            system?: string | undefined;
            value?: string | undefined;
            type?: {
                coding?: {
                    system?: string | undefined;
                    code?: string | undefined;
                    display?: string | undefined;
                    [x: string]: unknown;
                }[] | undefined;
                text?: string | undefined;
                [x: string]: unknown;
            } | undefined;
            [x: string]: unknown;
        }[] | undefined;
        [x: string]: unknown;
    };
    [x: string]: never;
};

export type AccessGrant = {
    permissions: ({
        kind: "data";
        resource_type: string;
        interactions: ("read" | "search" | "history" | "create" | "update" | "patch" | "delete")[];
        category_any_of?: {
            system?: string | undefined;
            code?: string | undefined;
            display?: string | undefined;
            [x: string]: unknown;
        }[] | undefined;
        code_any_of?: {
            system?: string | undefined;
            code?: string | undefined;
            display?: string | undefined;
            [x: string]: unknown;
        }[] | undefined;
        [x: string]: never;
    } | {
        kind: "operation";
        name: string;
        target?: {
            reference?: string | undefined;
            identifier?: {
                system?: string | undefined;
                value?: string | undefined;
                type?: {
                    coding?: {
                        system?: string | undefined;
                        code?: string | undefined;
                        display?: string | undefined;
                        [x: string]: unknown;
                    }[] | undefined;
                    text?: string | undefined;
                    [x: string]: unknown;
                } | undefined;
                [x: string]: unknown;
            } | undefined;
            type?: string | undefined;
            display?: string | undefined;
            [x: string]: unknown;
        } | undefined;
        [x: string]: never;
    })[];
    data_period?: {
        start?: string | undefined;
        end?: string | undefined;
        [x: string]: unknown;
    } | undefined;
    data_holder_filter?: ({
        kind: "jurisdiction";
        address: {
            country?: string | undefined;
            state?: string | undefined;
        };
        [x: string]: never;
    } | {
        kind: "organization";
        organization: {
            resourceType: "Organization";
            name?: string | undefined;
            identifier?: {
                system?: string | undefined;
                value?: string | undefined;
                type?: {
                    coding?: {
                        system?: string | undefined;
                        code?: string | undefined;
                        display?: string | undefined;
                        [x: string]: unknown;
                    }[] | undefined;
                    text?: string | undefined;
                    [x: string]: unknown;
                } | undefined;
                [x: string]: unknown;
            }[] | undefined;
            [x: string]: unknown;
        };
        [x: string]: never;
    })[] | undefined;
    sensitive_data?: ("exclude" | "include") | undefined;
    [x: string]: never;
};

export type PatientAccessContext = {
    [x: string]: never;
};

export type PublicHealthContext = {
    reportable_condition: {
        coding?: {
            system?: string | undefined;
            code?: string | undefined;
            display?: string | undefined;
            [x: string]: unknown;
        }[] | undefined;
        text?: string | undefined;
        [x: string]: unknown;
    };
    [x: string]: never;
};

export type SocialCareReferralContext = {
    concern: {
        coding?: {
            system?: string | undefined;
            code?: string | undefined;
            display?: string | undefined;
            [x: string]: unknown;
        }[] | undefined;
        text?: string | undefined;
        [x: string]: unknown;
    };
    referral: {
        resourceType: "ServiceRequest";
        identifier?: {
            system?: string | undefined;
            value?: string | undefined;
            type?: {
                coding?: {
                    system?: string | undefined;
                    code?: string | undefined;
                    display?: string | undefined;
                    [x: string]: unknown;
                }[] | undefined;
                text?: string | undefined;
                [x: string]: unknown;
            } | undefined;
            [x: string]: unknown;
        }[] | undefined;
        status: string;
        intent: string;
        [x: string]: unknown;
    };
    [x: string]: never;
};

export type PayerClaimsContext = {
    service: {
        coding?: {
            system?: string | undefined;
            code?: string | undefined;
            display?: string | undefined;
            [x: string]: unknown;
        }[] | undefined;
        text?: string | undefined;
        [x: string]: unknown;
    };
    claim: {
        resourceType: "Claim";
        identifier?: {
            system?: string | undefined;
            value?: string | undefined;
            type?: {
                coding?: {
                    system?: string | undefined;
                    code?: string | undefined;
                    display?: string | undefined;
                    [x: string]: unknown;
                }[] | undefined;
                text?: string | undefined;
                [x: string]: unknown;
            } | undefined;
            [x: string]: unknown;
        }[] | undefined;
        status: string;
        use: string;
        [x: string]: unknown;
    };
    [x: string]: never;
};

export type ResearchContext = {
    study: {
        resourceType: "ResearchStudy";
        identifier?: {
            system?: string | undefined;
            value?: string | undefined;
            type?: {
                coding?: {
                    system?: string | undefined;
                    code?: string | undefined;
                    display?: string | undefined;
                    [x: string]: unknown;
                }[] | undefined;
                text?: string | undefined;
                [x: string]: unknown;
            } | undefined;
            [x: string]: unknown;
        }[] | undefined;
        status: string;
        title?: string | undefined;
        [x: string]: unknown;
    };
    [x: string]: never;
};

export type ProviderConsultContext = {
    reason: {
        coding?: {
            system?: string | undefined;
            code?: string | undefined;
            display?: string | undefined;
            [x: string]: unknown;
        }[] | undefined;
        text?: string | undefined;
        [x: string]: unknown;
    };
    consult_request: {
        resourceType: "ServiceRequest";
        identifier?: {
            system?: string | undefined;
            value?: string | undefined;
            type?: {
                coding?: {
                    system?: string | undefined;
                    code?: string | undefined;
                    display?: string | undefined;
                    [x: string]: unknown;
                }[] | undefined;
                text?: string | undefined;
                [x: string]: unknown;
            } | undefined;
            [x: string]: unknown;
        }[] | undefined;
        status: string;
        intent: string;
        [x: string]: unknown;
    };
    [x: string]: never;
};

export type TicketContext = {
    [x: string]: never;
} | {
    reportable_condition: {
        coding?: {
            system?: string | undefined;
            code?: string | undefined;
            display?: string | undefined;
            [x: string]: unknown;
        }[] | undefined;
        text?: string | undefined;
        [x: string]: unknown;
    };
    [x: string]: never;
} | {
    concern: {
        coding?: {
            system?: string | undefined;
            code?: string | undefined;
            display?: string | undefined;
            [x: string]: unknown;
        }[] | undefined;
        text?: string | undefined;
        [x: string]: unknown;
    };
    referral: {
        resourceType: "ServiceRequest";
        identifier?: {
            system?: string | undefined;
            value?: string | undefined;
            type?: {
                coding?: {
                    system?: string | undefined;
                    code?: string | undefined;
                    display?: string | undefined;
                    [x: string]: unknown;
                }[] | undefined;
                text?: string | undefined;
                [x: string]: unknown;
            } | undefined;
            [x: string]: unknown;
        }[] | undefined;
        status: string;
        intent: string;
        [x: string]: unknown;
    };
    [x: string]: never;
} | {
    service: {
        coding?: {
            system?: string | undefined;
            code?: string | undefined;
            display?: string | undefined;
            [x: string]: unknown;
        }[] | undefined;
        text?: string | undefined;
        [x: string]: unknown;
    };
    claim: {
        resourceType: "Claim";
        identifier?: {
            system?: string | undefined;
            value?: string | undefined;
            type?: {
                coding?: {
                    system?: string | undefined;
                    code?: string | undefined;
                    display?: string | undefined;
                    [x: string]: unknown;
                }[] | undefined;
                text?: string | undefined;
                [x: string]: unknown;
            } | undefined;
            [x: string]: unknown;
        }[] | undefined;
        status: string;
        use: string;
        [x: string]: unknown;
    };
    [x: string]: never;
} | {
    study: {
        resourceType: "ResearchStudy";
        identifier?: {
            system?: string | undefined;
            value?: string | undefined;
            type?: {
                coding?: {
                    system?: string | undefined;
                    code?: string | undefined;
                    display?: string | undefined;
                    [x: string]: unknown;
                }[] | undefined;
                text?: string | undefined;
                [x: string]: unknown;
            } | undefined;
            [x: string]: unknown;
        }[] | undefined;
        status: string;
        title?: string | undefined;
        [x: string]: unknown;
    };
    [x: string]: never;
} | {
    reason: {
        coding?: {
            system?: string | undefined;
            code?: string | undefined;
            display?: string | undefined;
            [x: string]: unknown;
        }[] | undefined;
        text?: string | undefined;
        [x: string]: unknown;
    };
    consult_request: {
        resourceType: "ServiceRequest";
        identifier?: {
            system?: string | undefined;
            value?: string | undefined;
            type?: {
                coding?: {
                    system?: string | undefined;
                    code?: string | undefined;
                    display?: string | undefined;
                    [x: string]: unknown;
                }[] | undefined;
                text?: string | undefined;
                [x: string]: unknown;
            } | undefined;
            [x: string]: unknown;
        }[] | undefined;
        status: string;
        intent: string;
        [x: string]: unknown;
    };
    [x: string]: never;
};

export type PermissionTicket = {
    iss: string;
    aud: string | string[];
    aud_type?: ("data_holder_url" | "trust_framework") | undefined;
    exp: number;
    iat?: number | undefined;
    jti: string;
    presenter_binding?: ({
        method: "jkt";
        jkt: string;
        [x: string]: never;
    } | {
        method: "framework_client";
        framework: string;
        framework_type: "well-known" | "udap" | "oidf";
        entity_uri: string;
        [x: string]: never;
    }) | undefined;
    revocation?: {
        url: string;
        index: number;
        [x: string]: never;
    } | undefined;
    must_understand?: string[] | undefined;
    subject: {
        patient: {
            resourceType: "Patient";
            identifier?: {
                system?: string | undefined;
                value?: string | undefined;
                type?: {
                    coding?: {
                        system?: string | undefined;
                        code?: string | undefined;
                        display?: string | undefined;
                        [x: string]: unknown;
                    }[] | undefined;
                    text?: string | undefined;
                    [x: string]: unknown;
                } | undefined;
                [x: string]: unknown;
            }[] | undefined;
            name?: {
                family?: string | undefined;
                given?: string[] | undefined;
                prefix?: string[] | undefined;
                suffix?: string[] | undefined;
                [x: string]: unknown;
            }[] | undefined;
            birthDate?: string | undefined;
            gender?: string | undefined;
            [x: string]: unknown;
        };
        recipient_record?: {
            reference?: string | undefined;
            identifier?: {
                system?: string | undefined;
                value?: string | undefined;
                type?: {
                    coding?: {
                        system?: string | undefined;
                        code?: string | undefined;
                        display?: string | undefined;
                        [x: string]: unknown;
                    }[] | undefined;
                    text?: string | undefined;
                    [x: string]: unknown;
                } | undefined;
                [x: string]: unknown;
            } | undefined;
            type?: "Patient" | undefined;
            display?: string | undefined;
            [x: string]: unknown;
        } | undefined;
    };
    requester?: never | undefined;
    access: {
        permissions: ({
            kind: "data";
            resource_type: string;
            interactions: ("read" | "search" | "history" | "create" | "update" | "patch" | "delete")[];
            category_any_of?: {
                system?: string | undefined;
                code?: string | undefined;
                display?: string | undefined;
                [x: string]: unknown;
            }[] | undefined;
            code_any_of?: {
                system?: string | undefined;
                code?: string | undefined;
                display?: string | undefined;
                [x: string]: unknown;
            }[] | undefined;
            [x: string]: never;
        } | {
            kind: "operation";
            name: string;
            target?: {
                reference?: string | undefined;
                identifier?: {
                    system?: string | undefined;
                    value?: string | undefined;
                    type?: {
                        coding?: {
                            system?: string | undefined;
                            code?: string | undefined;
                            display?: string | undefined;
                            [x: string]: unknown;
                        }[] | undefined;
                        text?: string | undefined;
                        [x: string]: unknown;
                    } | undefined;
                    [x: string]: unknown;
                } | undefined;
                type?: string | undefined;
                display?: string | undefined;
                [x: string]: unknown;
            } | undefined;
            [x: string]: never;
        })[];
        data_period?: {
            start?: string | undefined;
            end?: string | undefined;
            [x: string]: unknown;
        } | undefined;
        data_holder_filter?: ({
            kind: "jurisdiction";
            address: {
                country?: string | undefined;
                state?: string | undefined;
            };
            [x: string]: never;
        } | {
            kind: "organization";
            organization: {
                resourceType: "Organization";
                name?: string | undefined;
                identifier?: {
                    system?: string | undefined;
                    value?: string | undefined;
                    type?: {
                        coding?: {
                            system?: string | undefined;
                            code?: string | undefined;
                            display?: string | undefined;
                            [x: string]: unknown;
                        }[] | undefined;
                        text?: string | undefined;
                        [x: string]: unknown;
                    } | undefined;
                    [x: string]: unknown;
                }[] | undefined;
                [x: string]: unknown;
            };
            [x: string]: never;
        })[] | undefined;
        sensitive_data?: ("exclude" | "include") | undefined;
        [x: string]: never;
    };
    ticket_type: "https://smarthealthit.org/permission-ticket-type/patient-self-access-v1";
    context?: {
        [x: string]: never;
    } | undefined;
    [x: string]: unknown;
} | {
    iss: string;
    aud: string | string[];
    aud_type?: ("data_holder_url" | "trust_framework") | undefined;
    exp: number;
    iat?: number | undefined;
    jti: string;
    presenter_binding?: ({
        method: "jkt";
        jkt: string;
        [x: string]: never;
    } | {
        method: "framework_client";
        framework: string;
        framework_type: "well-known" | "udap" | "oidf";
        entity_uri: string;
        [x: string]: never;
    }) | undefined;
    revocation?: {
        url: string;
        index: number;
        [x: string]: never;
    } | undefined;
    must_understand?: string[] | undefined;
    subject: {
        patient: {
            resourceType: "Patient";
            identifier?: {
                system?: string | undefined;
                value?: string | undefined;
                type?: {
                    coding?: {
                        system?: string | undefined;
                        code?: string | undefined;
                        display?: string | undefined;
                        [x: string]: unknown;
                    }[] | undefined;
                    text?: string | undefined;
                    [x: string]: unknown;
                } | undefined;
                [x: string]: unknown;
            }[] | undefined;
            name?: {
                family?: string | undefined;
                given?: string[] | undefined;
                prefix?: string[] | undefined;
                suffix?: string[] | undefined;
                [x: string]: unknown;
            }[] | undefined;
            birthDate?: string | undefined;
            gender?: string | undefined;
            [x: string]: unknown;
        };
        recipient_record?: {
            reference?: string | undefined;
            identifier?: {
                system?: string | undefined;
                value?: string | undefined;
                type?: {
                    coding?: {
                        system?: string | undefined;
                        code?: string | undefined;
                        display?: string | undefined;
                        [x: string]: unknown;
                    }[] | undefined;
                    text?: string | undefined;
                    [x: string]: unknown;
                } | undefined;
                [x: string]: unknown;
            } | undefined;
            type?: "Patient" | undefined;
            display?: string | undefined;
            [x: string]: unknown;
        } | undefined;
    };
    requester: {
        resourceType: "RelatedPerson";
        relationship?: {
            coding?: {
                system?: string | undefined;
                code?: string | undefined;
                display?: string | undefined;
                [x: string]: unknown;
            }[] | undefined;
            text?: string | undefined;
            [x: string]: unknown;
        }[] | undefined;
        name?: {
            family?: string | undefined;
            given?: string[] | undefined;
            prefix?: string[] | undefined;
            suffix?: string[] | undefined;
            [x: string]: unknown;
        }[] | undefined;
        identifier?: {
            system?: string | undefined;
            value?: string | undefined;
            type?: {
                coding?: {
                    system?: string | undefined;
                    code?: string | undefined;
                    display?: string | undefined;
                    [x: string]: unknown;
                }[] | undefined;
                text?: string | undefined;
                [x: string]: unknown;
            } | undefined;
            [x: string]: unknown;
        }[] | undefined;
        [x: string]: unknown;
    };
    access: {
        permissions: ({
            kind: "data";
            resource_type: string;
            interactions: ("read" | "search" | "history" | "create" | "update" | "patch" | "delete")[];
            category_any_of?: {
                system?: string | undefined;
                code?: string | undefined;
                display?: string | undefined;
                [x: string]: unknown;
            }[] | undefined;
            code_any_of?: {
                system?: string | undefined;
                code?: string | undefined;
                display?: string | undefined;
                [x: string]: unknown;
            }[] | undefined;
            [x: string]: never;
        } | {
            kind: "operation";
            name: string;
            target?: {
                reference?: string | undefined;
                identifier?: {
                    system?: string | undefined;
                    value?: string | undefined;
                    type?: {
                        coding?: {
                            system?: string | undefined;
                            code?: string | undefined;
                            display?: string | undefined;
                            [x: string]: unknown;
                        }[] | undefined;
                        text?: string | undefined;
                        [x: string]: unknown;
                    } | undefined;
                    [x: string]: unknown;
                } | undefined;
                type?: string | undefined;
                display?: string | undefined;
                [x: string]: unknown;
            } | undefined;
            [x: string]: never;
        })[];
        data_period?: {
            start?: string | undefined;
            end?: string | undefined;
            [x: string]: unknown;
        } | undefined;
        data_holder_filter?: ({
            kind: "jurisdiction";
            address: {
                country?: string | undefined;
                state?: string | undefined;
            };
            [x: string]: never;
        } | {
            kind: "organization";
            organization: {
                resourceType: "Organization";
                name?: string | undefined;
                identifier?: {
                    system?: string | undefined;
                    value?: string | undefined;
                    type?: {
                        coding?: {
                            system?: string | undefined;
                            code?: string | undefined;
                            display?: string | undefined;
                            [x: string]: unknown;
                        }[] | undefined;
                        text?: string | undefined;
                        [x: string]: unknown;
                    } | undefined;
                    [x: string]: unknown;
                }[] | undefined;
                [x: string]: unknown;
            };
            [x: string]: never;
        })[] | undefined;
        sensitive_data?: ("exclude" | "include") | undefined;
        [x: string]: never;
    };
    ticket_type: "https://smarthealthit.org/permission-ticket-type/patient-delegated-access-v1";
    context?: {
        [x: string]: never;
    } | undefined;
    [x: string]: unknown;
} | {
    iss: string;
    aud: string | string[];
    aud_type?: ("data_holder_url" | "trust_framework") | undefined;
    exp: number;
    iat?: number | undefined;
    jti: string;
    presenter_binding?: ({
        method: "jkt";
        jkt: string;
        [x: string]: never;
    } | {
        method: "framework_client";
        framework: string;
        framework_type: "well-known" | "udap" | "oidf";
        entity_uri: string;
        [x: string]: never;
    }) | undefined;
    revocation?: {
        url: string;
        index: number;
        [x: string]: never;
    } | undefined;
    must_understand?: string[] | undefined;
    subject: {
        patient: {
            resourceType: "Patient";
            identifier?: {
                system?: string | undefined;
                value?: string | undefined;
                type?: {
                    coding?: {
                        system?: string | undefined;
                        code?: string | undefined;
                        display?: string | undefined;
                        [x: string]: unknown;
                    }[] | undefined;
                    text?: string | undefined;
                    [x: string]: unknown;
                } | undefined;
                [x: string]: unknown;
            }[] | undefined;
            name?: {
                family?: string | undefined;
                given?: string[] | undefined;
                prefix?: string[] | undefined;
                suffix?: string[] | undefined;
                [x: string]: unknown;
            }[] | undefined;
            birthDate?: string | undefined;
            gender?: string | undefined;
            [x: string]: unknown;
        };
        recipient_record?: {
            reference?: string | undefined;
            identifier?: {
                system?: string | undefined;
                value?: string | undefined;
                type?: {
                    coding?: {
                        system?: string | undefined;
                        code?: string | undefined;
                        display?: string | undefined;
                        [x: string]: unknown;
                    }[] | undefined;
                    text?: string | undefined;
                    [x: string]: unknown;
                } | undefined;
                [x: string]: unknown;
            } | undefined;
            type?: "Patient" | undefined;
            display?: string | undefined;
            [x: string]: unknown;
        } | undefined;
    };
    requester: {
        resourceType: "Organization";
        name?: string | undefined;
        identifier?: {
            system?: string | undefined;
            value?: string | undefined;
            type?: {
                coding?: {
                    system?: string | undefined;
                    code?: string | undefined;
                    display?: string | undefined;
                    [x: string]: unknown;
                }[] | undefined;
                text?: string | undefined;
                [x: string]: unknown;
            } | undefined;
            [x: string]: unknown;
        }[] | undefined;
        [x: string]: unknown;
    };
    access: {
        permissions: ({
            kind: "data";
            resource_type: string;
            interactions: ("read" | "search" | "history" | "create" | "update" | "patch" | "delete")[];
            category_any_of?: {
                system?: string | undefined;
                code?: string | undefined;
                display?: string | undefined;
                [x: string]: unknown;
            }[] | undefined;
            code_any_of?: {
                system?: string | undefined;
                code?: string | undefined;
                display?: string | undefined;
                [x: string]: unknown;
            }[] | undefined;
            [x: string]: never;
        } | {
            kind: "operation";
            name: string;
            target?: {
                reference?: string | undefined;
                identifier?: {
                    system?: string | undefined;
                    value?: string | undefined;
                    type?: {
                        coding?: {
                            system?: string | undefined;
                            code?: string | undefined;
                            display?: string | undefined;
                            [x: string]: unknown;
                        }[] | undefined;
                        text?: string | undefined;
                        [x: string]: unknown;
                    } | undefined;
                    [x: string]: unknown;
                } | undefined;
                type?: string | undefined;
                display?: string | undefined;
                [x: string]: unknown;
            } | undefined;
            [x: string]: never;
        })[];
        data_period?: {
            start?: string | undefined;
            end?: string | undefined;
            [x: string]: unknown;
        } | undefined;
        data_holder_filter?: ({
            kind: "jurisdiction";
            address: {
                country?: string | undefined;
                state?: string | undefined;
            };
            [x: string]: never;
        } | {
            kind: "organization";
            organization: {
                resourceType: "Organization";
                name?: string | undefined;
                identifier?: {
                    system?: string | undefined;
                    value?: string | undefined;
                    type?: {
                        coding?: {
                            system?: string | undefined;
                            code?: string | undefined;
                            display?: string | undefined;
                            [x: string]: unknown;
                        }[] | undefined;
                        text?: string | undefined;
                        [x: string]: unknown;
                    } | undefined;
                    [x: string]: unknown;
                }[] | undefined;
                [x: string]: unknown;
            };
            [x: string]: never;
        })[] | undefined;
        sensitive_data?: ("exclude" | "include") | undefined;
        [x: string]: never;
    };
    ticket_type: "https://smarthealthit.org/permission-ticket-type/public-health-investigation-v1";
    context: {
        reportable_condition: {
            coding?: {
                system?: string | undefined;
                code?: string | undefined;
                display?: string | undefined;
                [x: string]: unknown;
            }[] | undefined;
            text?: string | undefined;
            [x: string]: unknown;
        };
        [x: string]: never;
    };
    [x: string]: unknown;
} | {
    iss: string;
    aud: string | string[];
    aud_type?: ("data_holder_url" | "trust_framework") | undefined;
    exp: number;
    iat?: number | undefined;
    jti: string;
    presenter_binding?: ({
        method: "jkt";
        jkt: string;
        [x: string]: never;
    } | {
        method: "framework_client";
        framework: string;
        framework_type: "well-known" | "udap" | "oidf";
        entity_uri: string;
        [x: string]: never;
    }) | undefined;
    revocation?: {
        url: string;
        index: number;
        [x: string]: never;
    } | undefined;
    must_understand?: string[] | undefined;
    subject: {
        patient: {
            resourceType: "Patient";
            identifier?: {
                system?: string | undefined;
                value?: string | undefined;
                type?: {
                    coding?: {
                        system?: string | undefined;
                        code?: string | undefined;
                        display?: string | undefined;
                        [x: string]: unknown;
                    }[] | undefined;
                    text?: string | undefined;
                    [x: string]: unknown;
                } | undefined;
                [x: string]: unknown;
            }[] | undefined;
            name?: {
                family?: string | undefined;
                given?: string[] | undefined;
                prefix?: string[] | undefined;
                suffix?: string[] | undefined;
                [x: string]: unknown;
            }[] | undefined;
            birthDate?: string | undefined;
            gender?: string | undefined;
            [x: string]: unknown;
        };
        recipient_record?: {
            reference?: string | undefined;
            identifier?: {
                system?: string | undefined;
                value?: string | undefined;
                type?: {
                    coding?: {
                        system?: string | undefined;
                        code?: string | undefined;
                        display?: string | undefined;
                        [x: string]: unknown;
                    }[] | undefined;
                    text?: string | undefined;
                    [x: string]: unknown;
                } | undefined;
                [x: string]: unknown;
            } | undefined;
            type?: "Patient" | undefined;
            display?: string | undefined;
            [x: string]: unknown;
        } | undefined;
    };
    requester: {
        resourceType: "Organization";
        name?: string | undefined;
        identifier?: {
            system?: string | undefined;
            value?: string | undefined;
            type?: {
                coding?: {
                    system?: string | undefined;
                    code?: string | undefined;
                    display?: string | undefined;
                    [x: string]: unknown;
                }[] | undefined;
                text?: string | undefined;
                [x: string]: unknown;
            } | undefined;
            [x: string]: unknown;
        }[] | undefined;
        [x: string]: unknown;
    };
    access: {
        permissions: ({
            kind: "data";
            resource_type: string;
            interactions: ("read" | "search" | "history" | "create" | "update" | "patch" | "delete")[];
            category_any_of?: {
                system?: string | undefined;
                code?: string | undefined;
                display?: string | undefined;
                [x: string]: unknown;
            }[] | undefined;
            code_any_of?: {
                system?: string | undefined;
                code?: string | undefined;
                display?: string | undefined;
                [x: string]: unknown;
            }[] | undefined;
            [x: string]: never;
        } | {
            kind: "operation";
            name: string;
            target?: {
                reference?: string | undefined;
                identifier?: {
                    system?: string | undefined;
                    value?: string | undefined;
                    type?: {
                        coding?: {
                            system?: string | undefined;
                            code?: string | undefined;
                            display?: string | undefined;
                            [x: string]: unknown;
                        }[] | undefined;
                        text?: string | undefined;
                        [x: string]: unknown;
                    } | undefined;
                    [x: string]: unknown;
                } | undefined;
                type?: string | undefined;
                display?: string | undefined;
                [x: string]: unknown;
            } | undefined;
            [x: string]: never;
        })[];
        data_period?: {
            start?: string | undefined;
            end?: string | undefined;
            [x: string]: unknown;
        } | undefined;
        data_holder_filter?: ({
            kind: "jurisdiction";
            address: {
                country?: string | undefined;
                state?: string | undefined;
            };
            [x: string]: never;
        } | {
            kind: "organization";
            organization: {
                resourceType: "Organization";
                name?: string | undefined;
                identifier?: {
                    system?: string | undefined;
                    value?: string | undefined;
                    type?: {
                        coding?: {
                            system?: string | undefined;
                            code?: string | undefined;
                            display?: string | undefined;
                            [x: string]: unknown;
                        }[] | undefined;
                        text?: string | undefined;
                        [x: string]: unknown;
                    } | undefined;
                    [x: string]: unknown;
                }[] | undefined;
                [x: string]: unknown;
            };
            [x: string]: never;
        })[] | undefined;
        sensitive_data?: ("exclude" | "include") | undefined;
        [x: string]: never;
    };
    ticket_type: "https://smarthealthit.org/permission-ticket-type/social-care-referral-v1";
    context: {
        concern: {
            coding?: {
                system?: string | undefined;
                code?: string | undefined;
                display?: string | undefined;
                [x: string]: unknown;
            }[] | undefined;
            text?: string | undefined;
            [x: string]: unknown;
        };
        referral: {
            resourceType: "ServiceRequest";
            identifier?: {
                system?: string | undefined;
                value?: string | undefined;
                type?: {
                    coding?: {
                        system?: string | undefined;
                        code?: string | undefined;
                        display?: string | undefined;
                        [x: string]: unknown;
                    }[] | undefined;
                    text?: string | undefined;
                    [x: string]: unknown;
                } | undefined;
                [x: string]: unknown;
            }[] | undefined;
            status: string;
            intent: string;
            [x: string]: unknown;
        };
        [x: string]: never;
    };
    [x: string]: unknown;
} | {
    iss: string;
    aud: string | string[];
    aud_type?: ("data_holder_url" | "trust_framework") | undefined;
    exp: number;
    iat?: number | undefined;
    jti: string;
    presenter_binding?: ({
        method: "jkt";
        jkt: string;
        [x: string]: never;
    } | {
        method: "framework_client";
        framework: string;
        framework_type: "well-known" | "udap" | "oidf";
        entity_uri: string;
        [x: string]: never;
    }) | undefined;
    revocation?: {
        url: string;
        index: number;
        [x: string]: never;
    } | undefined;
    must_understand?: string[] | undefined;
    subject: {
        patient: {
            resourceType: "Patient";
            identifier?: {
                system?: string | undefined;
                value?: string | undefined;
                type?: {
                    coding?: {
                        system?: string | undefined;
                        code?: string | undefined;
                        display?: string | undefined;
                        [x: string]: unknown;
                    }[] | undefined;
                    text?: string | undefined;
                    [x: string]: unknown;
                } | undefined;
                [x: string]: unknown;
            }[] | undefined;
            name?: {
                family?: string | undefined;
                given?: string[] | undefined;
                prefix?: string[] | undefined;
                suffix?: string[] | undefined;
                [x: string]: unknown;
            }[] | undefined;
            birthDate?: string | undefined;
            gender?: string | undefined;
            [x: string]: unknown;
        };
        recipient_record?: {
            reference?: string | undefined;
            identifier?: {
                system?: string | undefined;
                value?: string | undefined;
                type?: {
                    coding?: {
                        system?: string | undefined;
                        code?: string | undefined;
                        display?: string | undefined;
                        [x: string]: unknown;
                    }[] | undefined;
                    text?: string | undefined;
                    [x: string]: unknown;
                } | undefined;
                [x: string]: unknown;
            } | undefined;
            type?: "Patient" | undefined;
            display?: string | undefined;
            [x: string]: unknown;
        } | undefined;
    };
    requester: {
        resourceType: "Organization";
        name?: string | undefined;
        identifier?: {
            system?: string | undefined;
            value?: string | undefined;
            type?: {
                coding?: {
                    system?: string | undefined;
                    code?: string | undefined;
                    display?: string | undefined;
                    [x: string]: unknown;
                }[] | undefined;
                text?: string | undefined;
                [x: string]: unknown;
            } | undefined;
            [x: string]: unknown;
        }[] | undefined;
        [x: string]: unknown;
    };
    access: {
        permissions: ({
            kind: "data";
            resource_type: string;
            interactions: ("read" | "search" | "history" | "create" | "update" | "patch" | "delete")[];
            category_any_of?: {
                system?: string | undefined;
                code?: string | undefined;
                display?: string | undefined;
                [x: string]: unknown;
            }[] | undefined;
            code_any_of?: {
                system?: string | undefined;
                code?: string | undefined;
                display?: string | undefined;
                [x: string]: unknown;
            }[] | undefined;
            [x: string]: never;
        } | {
            kind: "operation";
            name: string;
            target?: {
                reference?: string | undefined;
                identifier?: {
                    system?: string | undefined;
                    value?: string | undefined;
                    type?: {
                        coding?: {
                            system?: string | undefined;
                            code?: string | undefined;
                            display?: string | undefined;
                            [x: string]: unknown;
                        }[] | undefined;
                        text?: string | undefined;
                        [x: string]: unknown;
                    } | undefined;
                    [x: string]: unknown;
                } | undefined;
                type?: string | undefined;
                display?: string | undefined;
                [x: string]: unknown;
            } | undefined;
            [x: string]: never;
        })[];
        data_period?: {
            start?: string | undefined;
            end?: string | undefined;
            [x: string]: unknown;
        } | undefined;
        data_holder_filter?: ({
            kind: "jurisdiction";
            address: {
                country?: string | undefined;
                state?: string | undefined;
            };
            [x: string]: never;
        } | {
            kind: "organization";
            organization: {
                resourceType: "Organization";
                name?: string | undefined;
                identifier?: {
                    system?: string | undefined;
                    value?: string | undefined;
                    type?: {
                        coding?: {
                            system?: string | undefined;
                            code?: string | undefined;
                            display?: string | undefined;
                            [x: string]: unknown;
                        }[] | undefined;
                        text?: string | undefined;
                        [x: string]: unknown;
                    } | undefined;
                    [x: string]: unknown;
                }[] | undefined;
                [x: string]: unknown;
            };
            [x: string]: never;
        })[] | undefined;
        sensitive_data?: ("exclude" | "include") | undefined;
        [x: string]: never;
    };
    ticket_type: "https://smarthealthit.org/permission-ticket-type/payer-claims-adjudication-v1";
    context: {
        service: {
            coding?: {
                system?: string | undefined;
                code?: string | undefined;
                display?: string | undefined;
                [x: string]: unknown;
            }[] | undefined;
            text?: string | undefined;
            [x: string]: unknown;
        };
        claim: {
            resourceType: "Claim";
            identifier?: {
                system?: string | undefined;
                value?: string | undefined;
                type?: {
                    coding?: {
                        system?: string | undefined;
                        code?: string | undefined;
                        display?: string | undefined;
                        [x: string]: unknown;
                    }[] | undefined;
                    text?: string | undefined;
                    [x: string]: unknown;
                } | undefined;
                [x: string]: unknown;
            }[] | undefined;
            status: string;
            use: string;
            [x: string]: unknown;
        };
        [x: string]: never;
    };
    [x: string]: unknown;
} | {
    iss: string;
    aud: string | string[];
    aud_type?: ("data_holder_url" | "trust_framework") | undefined;
    exp: number;
    iat?: number | undefined;
    jti: string;
    presenter_binding?: ({
        method: "jkt";
        jkt: string;
        [x: string]: never;
    } | {
        method: "framework_client";
        framework: string;
        framework_type: "well-known" | "udap" | "oidf";
        entity_uri: string;
        [x: string]: never;
    }) | undefined;
    revocation?: {
        url: string;
        index: number;
        [x: string]: never;
    } | undefined;
    must_understand?: string[] | undefined;
    subject: {
        patient: {
            resourceType: "Patient";
            identifier?: {
                system?: string | undefined;
                value?: string | undefined;
                type?: {
                    coding?: {
                        system?: string | undefined;
                        code?: string | undefined;
                        display?: string | undefined;
                        [x: string]: unknown;
                    }[] | undefined;
                    text?: string | undefined;
                    [x: string]: unknown;
                } | undefined;
                [x: string]: unknown;
            }[] | undefined;
            name?: {
                family?: string | undefined;
                given?: string[] | undefined;
                prefix?: string[] | undefined;
                suffix?: string[] | undefined;
                [x: string]: unknown;
            }[] | undefined;
            birthDate?: string | undefined;
            gender?: string | undefined;
            [x: string]: unknown;
        };
        recipient_record?: {
            reference?: string | undefined;
            identifier?: {
                system?: string | undefined;
                value?: string | undefined;
                type?: {
                    coding?: {
                        system?: string | undefined;
                        code?: string | undefined;
                        display?: string | undefined;
                        [x: string]: unknown;
                    }[] | undefined;
                    text?: string | undefined;
                    [x: string]: unknown;
                } | undefined;
                [x: string]: unknown;
            } | undefined;
            type?: "Patient" | undefined;
            display?: string | undefined;
            [x: string]: unknown;
        } | undefined;
    };
    requester: {
        resourceType: "Organization";
        name?: string | undefined;
        identifier?: {
            system?: string | undefined;
            value?: string | undefined;
            type?: {
                coding?: {
                    system?: string | undefined;
                    code?: string | undefined;
                    display?: string | undefined;
                    [x: string]: unknown;
                }[] | undefined;
                text?: string | undefined;
                [x: string]: unknown;
            } | undefined;
            [x: string]: unknown;
        }[] | undefined;
        [x: string]: unknown;
    };
    access: {
        permissions: ({
            kind: "data";
            resource_type: string;
            interactions: ("read" | "search" | "history" | "create" | "update" | "patch" | "delete")[];
            category_any_of?: {
                system?: string | undefined;
                code?: string | undefined;
                display?: string | undefined;
                [x: string]: unknown;
            }[] | undefined;
            code_any_of?: {
                system?: string | undefined;
                code?: string | undefined;
                display?: string | undefined;
                [x: string]: unknown;
            }[] | undefined;
            [x: string]: never;
        } | {
            kind: "operation";
            name: string;
            target?: {
                reference?: string | undefined;
                identifier?: {
                    system?: string | undefined;
                    value?: string | undefined;
                    type?: {
                        coding?: {
                            system?: string | undefined;
                            code?: string | undefined;
                            display?: string | undefined;
                            [x: string]: unknown;
                        }[] | undefined;
                        text?: string | undefined;
                        [x: string]: unknown;
                    } | undefined;
                    [x: string]: unknown;
                } | undefined;
                type?: string | undefined;
                display?: string | undefined;
                [x: string]: unknown;
            } | undefined;
            [x: string]: never;
        })[];
        data_period?: {
            start?: string | undefined;
            end?: string | undefined;
            [x: string]: unknown;
        } | undefined;
        data_holder_filter?: ({
            kind: "jurisdiction";
            address: {
                country?: string | undefined;
                state?: string | undefined;
            };
            [x: string]: never;
        } | {
            kind: "organization";
            organization: {
                resourceType: "Organization";
                name?: string | undefined;
                identifier?: {
                    system?: string | undefined;
                    value?: string | undefined;
                    type?: {
                        coding?: {
                            system?: string | undefined;
                            code?: string | undefined;
                            display?: string | undefined;
                            [x: string]: unknown;
                        }[] | undefined;
                        text?: string | undefined;
                        [x: string]: unknown;
                    } | undefined;
                    [x: string]: unknown;
                }[] | undefined;
                [x: string]: unknown;
            };
            [x: string]: never;
        })[] | undefined;
        sensitive_data?: ("exclude" | "include") | undefined;
        [x: string]: never;
    };
    ticket_type: "https://smarthealthit.org/permission-ticket-type/research-study-access-v1";
    context: {
        study: {
            resourceType: "ResearchStudy";
            identifier?: {
                system?: string | undefined;
                value?: string | undefined;
                type?: {
                    coding?: {
                        system?: string | undefined;
                        code?: string | undefined;
                        display?: string | undefined;
                        [x: string]: unknown;
                    }[] | undefined;
                    text?: string | undefined;
                    [x: string]: unknown;
                } | undefined;
                [x: string]: unknown;
            }[] | undefined;
            status: string;
            title?: string | undefined;
            [x: string]: unknown;
        };
        [x: string]: never;
    };
    [x: string]: unknown;
} | {
    iss: string;
    aud: string | string[];
    aud_type?: ("data_holder_url" | "trust_framework") | undefined;
    exp: number;
    iat?: number | undefined;
    jti: string;
    presenter_binding?: ({
        method: "jkt";
        jkt: string;
        [x: string]: never;
    } | {
        method: "framework_client";
        framework: string;
        framework_type: "well-known" | "udap" | "oidf";
        entity_uri: string;
        [x: string]: never;
    }) | undefined;
    revocation?: {
        url: string;
        index: number;
        [x: string]: never;
    } | undefined;
    must_understand?: string[] | undefined;
    subject: {
        patient: {
            resourceType: "Patient";
            identifier?: {
                system?: string | undefined;
                value?: string | undefined;
                type?: {
                    coding?: {
                        system?: string | undefined;
                        code?: string | undefined;
                        display?: string | undefined;
                        [x: string]: unknown;
                    }[] | undefined;
                    text?: string | undefined;
                    [x: string]: unknown;
                } | undefined;
                [x: string]: unknown;
            }[] | undefined;
            name?: {
                family?: string | undefined;
                given?: string[] | undefined;
                prefix?: string[] | undefined;
                suffix?: string[] | undefined;
                [x: string]: unknown;
            }[] | undefined;
            birthDate?: string | undefined;
            gender?: string | undefined;
            [x: string]: unknown;
        };
        recipient_record?: {
            reference?: string | undefined;
            identifier?: {
                system?: string | undefined;
                value?: string | undefined;
                type?: {
                    coding?: {
                        system?: string | undefined;
                        code?: string | undefined;
                        display?: string | undefined;
                        [x: string]: unknown;
                    }[] | undefined;
                    text?: string | undefined;
                    [x: string]: unknown;
                } | undefined;
                [x: string]: unknown;
            } | undefined;
            type?: "Patient" | undefined;
            display?: string | undefined;
            [x: string]: unknown;
        } | undefined;
    };
    requester: {
        resourceType: "PractitionerRole";
        code?: {
            coding?: {
                system?: string | undefined;
                code?: string | undefined;
                display?: string | undefined;
                [x: string]: unknown;
            }[] | undefined;
            text?: string | undefined;
            [x: string]: unknown;
        }[] | undefined;
        identifier?: {
            system?: string | undefined;
            value?: string | undefined;
            type?: {
                coding?: {
                    system?: string | undefined;
                    code?: string | undefined;
                    display?: string | undefined;
                    [x: string]: unknown;
                }[] | undefined;
                text?: string | undefined;
                [x: string]: unknown;
            } | undefined;
            [x: string]: unknown;
        }[] | undefined;
        [x: string]: unknown;
    };
    access: {
        permissions: ({
            kind: "data";
            resource_type: string;
            interactions: ("read" | "search" | "history" | "create" | "update" | "patch" | "delete")[];
            category_any_of?: {
                system?: string | undefined;
                code?: string | undefined;
                display?: string | undefined;
                [x: string]: unknown;
            }[] | undefined;
            code_any_of?: {
                system?: string | undefined;
                code?: string | undefined;
                display?: string | undefined;
                [x: string]: unknown;
            }[] | undefined;
            [x: string]: never;
        } | {
            kind: "operation";
            name: string;
            target?: {
                reference?: string | undefined;
                identifier?: {
                    system?: string | undefined;
                    value?: string | undefined;
                    type?: {
                        coding?: {
                            system?: string | undefined;
                            code?: string | undefined;
                            display?: string | undefined;
                            [x: string]: unknown;
                        }[] | undefined;
                        text?: string | undefined;
                        [x: string]: unknown;
                    } | undefined;
                    [x: string]: unknown;
                } | undefined;
                type?: string | undefined;
                display?: string | undefined;
                [x: string]: unknown;
            } | undefined;
            [x: string]: never;
        })[];
        data_period?: {
            start?: string | undefined;
            end?: string | undefined;
            [x: string]: unknown;
        } | undefined;
        data_holder_filter?: ({
            kind: "jurisdiction";
            address: {
                country?: string | undefined;
                state?: string | undefined;
            };
            [x: string]: never;
        } | {
            kind: "organization";
            organization: {
                resourceType: "Organization";
                name?: string | undefined;
                identifier?: {
                    system?: string | undefined;
                    value?: string | undefined;
                    type?: {
                        coding?: {
                            system?: string | undefined;
                            code?: string | undefined;
                            display?: string | undefined;
                            [x: string]: unknown;
                        }[] | undefined;
                        text?: string | undefined;
                        [x: string]: unknown;
                    } | undefined;
                    [x: string]: unknown;
                }[] | undefined;
                [x: string]: unknown;
            };
            [x: string]: never;
        })[] | undefined;
        sensitive_data?: ("exclude" | "include") | undefined;
        [x: string]: never;
    };
    ticket_type: "https://smarthealthit.org/permission-ticket-type/provider-consult-v1";
    context: {
        reason: {
            coding?: {
                system?: string | undefined;
                code?: string | undefined;
                display?: string | undefined;
                [x: string]: unknown;
            }[] | undefined;
            text?: string | undefined;
            [x: string]: unknown;
        };
        consult_request: {
            resourceType: "ServiceRequest";
            identifier?: {
                system?: string | undefined;
                value?: string | undefined;
                type?: {
                    coding?: {
                        system?: string | undefined;
                        code?: string | undefined;
                        display?: string | undefined;
                        [x: string]: unknown;
                    }[] | undefined;
                    text?: string | undefined;
                    [x: string]: unknown;
                } | undefined;
                [x: string]: unknown;
            }[] | undefined;
            status: string;
            intent: string;
            [x: string]: unknown;
        };
        [x: string]: never;
    };
    [x: string]: unknown;
};

export type ClientAssertion = {
    iss: string;
    sub: string;
    aud: string;
    jti: string;
    iat?: number | undefined;
    exp?: number | undefined;
};

export type TokenExchangeRequest = {
    grant_type: "urn:ietf:params:oauth:grant-type:token-exchange";
    subject_token: string;
    subject_token_type: "https://smarthealthit.org/token-type/permission-ticket";
    scope?: string | undefined;
    client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer";
    client_assertion: string;
};
