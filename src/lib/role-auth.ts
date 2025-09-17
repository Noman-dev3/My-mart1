
'use server';

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export type AdminRole = 'SUPER_ADMIN' | 'FULFILLMENT_MANAGER' | 'INVENTORY_MANAGER' | 'CONTENT_EDITOR';


/**
 * Verifies a user's credentials against the administrators table.
 * @param username The username to verify.
 * @param passwordAttempt The password attempt.
 * @returns An object indicating success, the user's role if successful, or an error message.
 */
export async function verifyUserRole(username: string, passwordAttempt: string): Promise<{ success: boolean; role?: AdminRole; error?: string; }> {
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

        const isPasswordCorrect = admin.password === passwordAttempt;

        if (!isPasswordCorrect) {
            return { success: false, error: 'Incorrect credentials.' };
        }
        
        const userRole = admin.role as AdminRole;
        
        return { 
            success: true, 
            role: userRole,
        };

    } catch (e) {
        console.error("Unexpected error during role verification:", e);
        return { success: false, error: 'An unexpected server error occurred.' };
    }
}
