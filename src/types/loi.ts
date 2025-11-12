// types/loi.ts
export interface FormValues {
  title: string;
  propertyAddress: string;
  landlordName: string;
  landlordEmail: string;
  tenantName: string;
  tenantEmail: string;
  rentAmount: string;
    startDate: string,
  securityDeposit: string;
  propertyType: string;
  leaseDuration: string;
  propertySize: string;
  intendedUse: string;
  parkingSpaces: string;
  utilities: {
    electricity: boolean;
    waterSewer: boolean;
    naturalGas: boolean;
    internetCable: boolean;
    hvac: boolean;
    securitySystem: boolean;
  };
  renewalOption: boolean;
  improvementAllowance: string;
  specialConditions: string;
  financingApproval: boolean;
  environmentalAssessment: boolean;
  zoningCompliance: boolean;
  permitsLicenses: boolean;
  propertyInspection: boolean;
  insuranceApproval: boolean;
  terms: boolean;
  
}

export interface Step {
  id: number;
  title: string;
  subtitle: string;
}

// types/loi.ts or near transformToApiPayload

export interface LOIApiPayload {
  title: string;
  propertyAddress: string;
  partyInfo: {
    landlord_name: string;
    landlord_email: string;
    tenant_name: string;
    tenant_email: string;
  };
  leaseTerms: {
    monthlyRent: string;
    securityDeposit: string;
    leaseType: string;
    leaseDuration: string;
    startDate: string;
  };
  propertyDetails: {
    propertySize: string;
    intendedUse: string;
    propertyType: string;
    amenities: string[];
    utilities: string[];
  };
  additionalDetails: {
    renewalOption: boolean;
    tenantImprovement: string;
    specialConditions: string;
    contingencies: string;
  };
  submit_status: string;
}

export type LOIStatus = 'Draft' | 'Sent' | 'Approved';
export interface Letter {
  id: number;
  title: string;
  propertyAddress: string;
  updated_at: string;
  submit_status: LOIStatus;
  assignee: string;
}

export interface PartyInfo {
  landlord_name: string;
  landlord_email: string;
  tenant_name: string;
  tenant_email: string;
}

export interface LeaseTerms {
  monthlyRent: string;
  securityDeposit: string;
  leaseType: string;
  leaseDuration: string;
  startDate: string | null;
}

export interface PropertyDetails {
  propertySize: string;
  intendedUse: string;
  propertyType: string;
  amenities: string[];
  utilities: string[];
}

export interface AdditionalDetails {
  renewalOption: boolean;
  tenantImprovement: string;
  specialConditions: string;
  contingencies: string;
}

export interface FullLOI {
  id?: number;
  title: string;
  propertyAddress: string;
  submit_status: LOIStatus;
  updated_at?: string;
  assignee?: string;

  partyInfo: PartyInfo;
  leaseTerms: LeaseTerms;
  propertyDetails: PropertyDetails;
  additionalDetails: AdditionalDetails;
}

export interface CustomFieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  as?: 'input' | 'textarea';
  rows?: number;
  required?: boolean;
}

export interface FileData {
  name: string;
  size: string;
  type: string;
  file: File;
}

export interface LeaseFormValues {
  title: string,
  startDate: string,
  endDate: string,
  propertyAddress: '',
  notes: '',
  document: ''
}
export type SetFieldValue = (field: string, value: File | null) => void;

// Extended FormikErrors to handle File type properly
export interface ExtendedFormikErrors {
  document?: string;
}
