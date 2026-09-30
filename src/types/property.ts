export type VerificationStatus = 'Verified' | 'Partially Verified' | 'Conflict' | 'Under Review' | 'Pending';

export type PropertyType = 'Residential' | 'Commercial' | 'Mixed Use' | 'Utility / Parking' | 'Public / Institutional';

export interface PropertyUnit {
  id: string; // e.g. "U02"
  unitNumber: string; // e.g. "302"
  floorId: string; // e.g. "F03"
  floorNumber: number; // e.g. 3
  buildingId: string;
  parcelId: string;
  ulpin: string; // e.g. "ULPIN-TN-123456-F03-U02"
  propertyType: PropertyType;
  areaSqFt: number; // e.g. 820
  boundaryStatus: 'Verified' | 'Conflict' | 'Pending';
  recordStatus: 'Matched' | 'Discrepancy' | 'Unlinked';
  status: VerificationStatus;
  ownerName: string;
  registrationDate: string;
  deedNumber: string;
  coordinates: [number, number]; // [lat, lng]
  positionOffset: [number, number, number]; // [x, y, z] relative to floor
  size: [number, number, number]; // [width, height, depth] in meters
  conflictDetails?: {
    issue: string;
    riskLevel: 'Low' | 'Medium' | 'High';
    detectedBy: string;
    toleranceExceededCm: number;
    recommendedAction: string;
  };
}

export interface Floor {
  id: string; // e.g. "F03"
  floorNumber: number; // 0 to 4
  name: string; // e.g. "Floor 3"
  elevationMeters: number; // e.g. 9.6
  areaSqFt: number;
  verifiedUnitsCount: number;
  conflictCount: number;
  status: VerificationStatus;
  units: PropertyUnit[];
}

export interface Building {
  id: string; // e.g. "BLD-123456"
  name: string; // e.g. "Green Residency Block A"
  parcelId: string;
  floorCount: number;
  unitCount: number;
  heightMeters: number;
  footprintAreaSqFt: number;
  completionYear: number;
  status: VerificationStatus;
  floors: Floor[];
}

export interface Parcel {
  id: string; // e.g. "PAR-TN-123456"
  ulpin: string; // e.g. "ULPIN-TN-123456"
  name: string;
  location: string;
  district: string;
  state: string;
  pincode: string;
  coordinates: [number, number]; // [lat, lng]
  areaSqFt: number;
  landUse: PropertyType;
  verificationStatus: VerificationStatus;
  ownerRecord: string;
  surveyNumber: string;
  subRegistrarOffice: string;
  lastUpdated: string;
  buildingCount: number;
  polygon: [number, number][]; // 2D map polygon coordinates
  buildings: Building[];
}

export interface GlobalStats {
  totalParcels: number;
  buildingsMapped: number;
  threeDProperties: number;
  verifiedProperties: number;
  conflicts: number;
}
