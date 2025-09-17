
'use server';

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export type AdminRole = 'SUPER_ADMIN' | 'FULFILLMENT_MANAGER' | 'INVENTORY_MANAGER' | 'CONTENT_EDITOR';

const roleHierarchy: Record<AdminRole, AdminRole[]> = {
    SUPER_ADMIN: ['SUPER_ADMIN', 'FULFILLMENT_MANAGER', 'INVENTORY_MANAGER', 'CONTENT_EDITOR'],
    FULFILLMENT_MANAGER: ['FULFILLMENT_MANAGER'],
    INVENTORY_MANAGER: ['INVENTORY_MANAGER'],
    CONTENT_EDITOR: ['CONTENT_EDITOR'],
};

/**
 * Checks if a user's role has permission to access a page requiring a specific role.
 * @param userRole The role of the logged-in user.
 * @param pageRole The role required by the page.
 * @returns True if the user has permission, false otherwise.
 */
export function hasPermission(userRole: AdminRole, pageRole: AdminRole): boolean {
    const userPermissions = roleHierarchy[userRole];
    if (!userPermissions) {
        return false; // Role doesn't exist in the hierarchy
    }
    return userPermissions.includes(pageRole);
}


/**
 * Verifies a user's credentials against the administrators table.
 * @param username The username to verify.
 * @param passwordAttempt The password attempt.
 * @returns An object indicating success, the user's role if successful, or an error message.
 */
export async function verifyUserRole(username: string, passwordAttempt: string): Promise<{ success: boolean; role?: AdminRole; error?: string }> {
    const supabase = createServerActionClient({ cookies });

    try {
        const { data: admin, error } = await supabase
            .from('administrators')
            .select('password, role')
            .eq('username', username)
            .single();

        if (error || !admin) {
            console.error('Auth error or user not found:', error?.message);
            // Simulate delay to prevent timing attacks on username enumeration
            await new Promise(resolve => setTimeout(resolve, 500));
            return { success: false, error: 'Incorrect credentials.' };
        }

        // In a real production app, passwords would be hashed and compared securely.
        // For this prototype, we're doing a direct comparison.
        const isPasswordCorrect = admin.password === passwordAttempt;

        if (!isPasswordCorrect) {
            return { success: false, error: 'Incorrect credentials.' };
        }
        
        return { success: true, role: admin.role as AdminRole };

    } catch (e) {
        console.error("Unexpected error during role verification:", e);
        return { success: false, error: 'An unexpected server error occurred.' };
    }
}
