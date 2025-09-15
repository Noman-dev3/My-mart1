
'use server';

export type AdminRole = 'SUPER_ADMIN' | 'FULFILLMENT_MANAGER' | 'INVENTORY_MANAGER' | 'CONTENT_EDITOR';

const roleCredentials: Record<AdminRole, string> = {
    SUPER_ADMIN: 'superadmin123',
    FULFILLMENT_MANAGER: 'orders123',
    INVENTORY_MANAGER: 'products123',
    CONTENT_EDITOR: 'content123',
};

export async function verifyRolePassword(role: AdminRole, passwordAttempt: string): Promise<boolean> {
    const correctPassword = roleCredentials[role];
    
    // In a real application, use a secure comparison method.
    // For this prototype, direct comparison is sufficient.
    const isValid = passwordAttempt === correctPassword;
    
    // Simulate network delay to prevent timing attacks
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return isValid;
}
