// data/staff.ts
import { StaffMember, StaffPageStats } from '@/types/staff'

export const staffStats: StaffPageStats = {
  totalStaff: 28,
  totalStaffChange: '+2',
  onlineNow: 12,
  pendingInvites: 4,
  activeSessions: 18,
}

export const staffMembers: StaffMember[] = [
  {
    id: 1,
    name: 'Marcus Thorne',
    email: 'm.thorne@urbandrive.com',
    role: 'Super Admin',
    avatar: null,
    status: 'Active',
    lastActive: 'Just now',
  },
  {
    id: 2,
    name: 'Elena Rodriguez',
    email: 'e.rodriguez@urbandrive.com',
    role: 'Fleet Manager',
    avatar: null,
    status: 'Active',
    lastActive: '14 mins ago',
  },
  {
    id: 3,
    name: 'Simon Chen',
    email: 's.chen@urbandrive.com',
    role: 'Booking Manager',
    avatar: null,
    status: 'Offline',
    lastActive: '2 hours ago',
  },
  {
    id: 4,
    name: 'Julian Voss',
    email: 'j.voss@urbandrive.com',
    role: 'Staff User',
    avatar: null,
    status: 'Invited',
    lastActive: 'Pending',
  },
]

export const getStaffByStatus = (status: 'All' | StaffMember['status']) =>
  status === 'All' ? staffMembers : staffMembers.filter((m) => m.status === status)