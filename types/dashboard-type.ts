export interface AdminDashboardStats {
  totalUsers: number
  verifiedUsers: number
  activeSession: number
  bannedUsers: number
}

export interface UserDashboardStats {
  totalContacts: number
  contactsThisMonth: number
  totalAddresses: number
  addressesThisMonth: number
}
