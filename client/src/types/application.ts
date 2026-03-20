export type ApplicationType = '정기' | '일주차';

export type FuelType = '일반' | '친환경';

export interface Application {
  id: number;
  quarter: string;
  applicationType: ApplicationType;
  name: string;
  department: string;
  contact: string;
  vehicleNumber: string;
  vehicleType: string;
  fuelType: FuelType;
  address: string;
  distanceKm: number;
  privacyAgreed: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationForm = Omit<Application, 'id' | 'createdAt' | 'updatedAt'>;

/** 하이웍스 cache-api /me 응답 구조 */
export interface MeInfo {
  user_id: string;
  user_no: string;
  name: string;
  language: 'korean' | 'english' | 'chinese';
  level: 'admin' | 'user';
  office: {
    office_no: string;
    office_id: string;
    office_type: string;
    show_platform_menu: 'Y' | 'N';
    show_tab_menu: 'Y' | 'N';
  };
}

/** 하이웍스 account-api 소속조직 */
export interface AccountNode {
  id: number;
  name: string;
  full_name: string;
}

/** 하이웍스 account-api /accounts/me 응답 구조 */
export interface AccountMeInfo {
  name: string;
  address: string;
  cell: string;
  nodes: AccountNode[];
}

export interface Quarter {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
}
