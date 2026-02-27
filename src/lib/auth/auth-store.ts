/**
 * @deprecated Auth is now handled by NextAuth.js. Use `useAuth()` from `./use-auth` instead.
 * This file is kept for backwards compatibility with existing imports.
 */

// Re-export useAuth as useAuthStore for backwards compat
export { useAuth as useAuthStore } from './use-auth'
