// types/master.ts
export interface StaffType {
  id: number;
  name: string;
  description: string;
  permissionModules: number;
  staffMembers: string | StaffMember[];
  status: 'Active' | 'Inactive';
  lastUpdated: string;
}

export interface StaffMember {
  initials: string;
  bg: string;
  color: string;
}

export interface StatItem {
  label: string;
  value: string;
  icon: string;
  sub: string;
  subIcon?: string;
  subColor?: string;
}

export interface FilterOption {
  label: string;
  value: 'All' | 'Active' | 'Inactive';
}

export interface StaffStats {
  total: number;
  active: number;
  inactive: number;
  permissionModules: number;
}