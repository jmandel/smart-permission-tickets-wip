declare module "fhir/r4" {
  export interface Coding {
    [key: string]: unknown;
  }

  export interface CodeableConcept {
    [key: string]: unknown;
  }

  export interface Identifier {
    [key: string]: unknown;
  }

  export interface HumanName {
    [key: string]: unknown;
  }

  export interface Period {
    [key: string]: unknown;
  }

  export interface Reference {
    [key: string]: unknown;
  }

  export interface Address {
    country?: string;
    state?: string;
    [key: string]: unknown;
  }

  export interface Patient {
    [key: string]: unknown;
  }

  export interface RelatedPerson {
    [key: string]: unknown;
  }

  export interface Practitioner {
    [key: string]: unknown;
  }

  export interface PractitionerRole {
    [key: string]: unknown;
  }

  export interface Organization {
    [key: string]: unknown;
  }

  export interface ServiceRequest {
    [key: string]: unknown;
  }

  export interface Claim {
    [key: string]: unknown;
  }

  export interface ResearchStudy {
    [key: string]: unknown;
  }
}
