
'use server';

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export type AdminRole = 'SUPER_ADMIN' | 'FULFILLMENT_MANAGER' | 'INVENTORY_MANAGER' | 'CONTENT_EDITOR';

/**
 * Verifies if a user with a given username and password exists and has the required role.
 * @param requiredRole The role required to access the resource.
 * @param username The username entered by the user.
 * @param password The password entered by the user.
 * @returns boolean - True if the user is authenticated and has the correct role, false otherwise.
 */
export async function verifyUserRole(requiredRole: AdminRole, username: string, passwordAttempt: string): Promise<boolean> {
    const supabase = createServerActionClient({ cookies });

    try {
        // Fetch the administrator by username
        const { data: admin, error } = await supabase
            .from('administrators')
            .select('password, role')
            .eq('username', username)
            .single();

        if (error || !admin) {
            console.error('Auth error or user not found:', error?.message);
            // Simulate delay even if user not found to prevent timing attacks
            await new Promise(resolve => setTimeout(resolve, 500));
            return false;
        }

        // In a real production app, passwords would be hashed.
        // For this prototype, we're doing a direct comparison.
        const isPasswordCorrect = admin.password === passwordAttempt;

        if (!isPasswordCorrect) {
            return false;
        }

        // Check if the user's role is sufficient
        const userRole = admin.role as AdminRole;
        
        // SUPER_ADMIN can access everything.
        if (userRole === 'SUPER_ADMIN') {
            return true;
        }

        // Check if the user's role matches the required role for the page.
        return userRole === requiredRole;

    } catch (e) {
        console.error("Unexpected error during role verification:", e);
        return false;
    }
}
