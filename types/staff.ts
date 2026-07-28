// types/staff.ts

export type StaffStatus = 'Active' | 'Offline' | 'Invited'

export interface StaffMember {
  id: number
  name: string
  email: string
  role: string
  avatar: string | null 
  status: StaffStatus
  lastActive: string 
}

export interface StaffPageStats {
  totalStaff: number
  totalStaffChange: string 
  onlineNow: number
  pendingInvites: number
  activeSessions: number
}

export type StaffFilter = 'All' | StaffStatus


