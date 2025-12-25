import type { CollectionBeforeDeleteHook } from 'payload'
import { APIError } from 'payload'

// Hardcoded protected users that cannot be deleted
const HARDCODED_PROTECTED_USERS = ['ashad@elabins.com']

// Get additional protected users from environment variable (comma-separated)
// Example: PROTECTED_USERS=admin@example.com,superadmin@example.com
const envProtectedUsers = process.env.PROTECTED_USERS
  ? process.env.PROTECTED_USERS.split(',').map((email) => email.trim())
  : []

// Combine hardcoded and environment variable protected users
const PROTECTED_USERS = [...HARDCODED_PROTECTED_USERS, ...envProtectedUsers]

/**
 * beforeDelete hook to prevent deletion of protected system administrator accounts
 *
 * Protected users are defined in:
 * 1. HARDCODED_PROTECTED_USERS array (always protected)
 * 2. PROTECTED_USERS environment variable (comma-separated emails)
 *
 * @example
 * // In .env file:
 * PROTECTED_USERS=admin@example.com,superadmin@example.com
 *
 * @throws {APIError} 403 Forbidden if attempting to delete a protected user
 */
export const preventProtectedUserDeletion: CollectionBeforeDeleteHook = async ({ req, id }) => {
  // Fetch the user being deleted
  const userToDelete = await req.payload.findByID({
    collection: 'users',
    id,
    depth: 0,
  })

  // Check if the user is protected
  if (userToDelete?.email && PROTECTED_USERS.includes(userToDelete.email)) {
    throw new APIError(
      `Cannot delete protected user: ${userToDelete.email}. This account is required for system administration.`,
      403,
    )
  }
}
