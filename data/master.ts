// data/master.ts
import { StaffType, StatItem } from '@/types/master';

// Stats Data
export const statsData: StatItem[] = [
  {
    label: 'Total Staff Types',
    value: '12',
    icon: 'layers',
    sub: '+2 since last month',
    subIcon: 'trending_up',
    subColor: 'text-accent-success',
  },
  {
    label: 'Active Roles',
    value: '09',
    icon: 'check_circle',
    sub: '75% of total library',
    subColor: 'text-text-secondary',
  },
  {
    label: 'Inactive Roles',
    value: '03',
    icon: 'cancel',
    sub: 'Requires review',
    subColor: 'text-text-secondary',
  },
  {
    label: 'Permission Modules',
    value: '08',
    icon: 'key',
    sub: 'Across entire system',
    subColor: 'text-text-secondary',
  },
];

// Dummy Staff Data for Table
export const staffData: StaffType[] = [
  {
    id: 1,
    name: 'Administrator',
    description: 'Full system access with all permissions',
    permissionModules: 8,
    staffMembers: [
      { initials: 'JD', bg: 'bg-blue-500', color: 'text-white' },
      { initials: 'SM', bg: 'bg-purple-500', color: 'text-white' },
      { initials: 'RK', bg: 'bg-green-500', color: 'text-white' },
    ],
    status: 'Active',
    lastUpdated: '2026-07-28',
  },
  {
    id: 2,
    name: 'Library Manager',
    description: 'Manages library operations and staff',
    permissionModules: 6,
    staffMembers: [
      { initials: 'AL', bg: 'bg-indigo-500', color: 'text-white' },
      { initials: 'MC', bg: 'bg-pink-500', color: 'text-white' },
    ],
    status: 'Active',
    lastUpdated: '2026-07-27',
  },
  {
    id: 3,
    name: 'Cataloging Specialist',
    description: 'Manages book catalog and metadata',
    permissionModules: 4,
    staffMembers: [
      { initials: 'NR', bg: 'bg-orange-500', color: 'text-white' },
      { initials: 'PS', bg: 'bg-cyan-500', color: 'text-white' },
      { initials: 'AK', bg: 'bg-teal-500', color: 'text-white' },
      { initials: 'MT', bg: 'bg-rose-500', color: 'text-white' },
    ],
    status: 'Active',
    lastUpdated: '2026-07-26',
  },
  {
    id: 4,
    name: 'Circulation Officer',
    description: 'Handles book check-in/check-out and patron services',
    permissionModules: 3,
    staffMembers: [
      { initials: 'CR', bg: 'bg-amber-500', color: 'text-white' },
      { initials: 'DG', bg: 'bg-lime-500', color: 'text-white' },
    ],
    status: 'Inactive',
    lastUpdated: '2026-07-25',
  },
  {
    id: 5,
    name: 'Reference Librarian',
    description: 'Provides research assistance and reference services',
    permissionModules: 3,
    staffMembers: [
      { initials: 'JW', bg: 'bg-emerald-500', color: 'text-white' },
      { initials: 'LH', bg: 'bg-sky-500', color: 'text-white' },
    ],
    status: 'Active',
    lastUpdated: '2026-07-24',
  },
  {
    id: 6,
    name: 'Digital Resources Manager',
    description: 'Manages digital collections and online resources',
    permissionModules: 5,
    staffMembers: [
      { initials: 'TV', bg: 'bg-violet-500', color: 'text-white' },
    ],
    status: 'Inactive',
    lastUpdated: '2026-07-23',
  },
];

// Helper functions
export const getTotalStats = () => statsData.length;
export const getActiveStats = () => statsData.filter(stat => stat.subColor === 'text-accent-success');
export const getStatByLabel = (label: string) => statsData.find(stat => stat.label === label);
export const getActiveStaff = () => staffData.filter(staff => staff.status === 'Active');
export const getInactiveStaff = () => staffData.filter(staff => staff.status === 'Inactive');
export const getStaffById = (id: number) => staffData.find(staff => staff.id === id);