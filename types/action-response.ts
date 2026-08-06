export type ActionResponse<T = null> =
  { success: true; data: T } | { success: false; error: string }
