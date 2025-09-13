
'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { headers } from 'next/headers';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

export type AdminActivity = {
    id: number;
    created_at: string;
    user_agent: string;
    action: string;
    details: string;
};

const activitySchema = z.object({
  action: z.string(),
  details: z.string().optional(),
});


export async function logAdminActivity(data: z.infer<typeof activitySchema>) {
    const supabase = createServerActionClient({ cookies });
    const headersList = headers();
    
    const newActivity = {
        action: data.action,
        details: data.details,
        user_agent: headersList.get('user-agent') || 'Unknown',
    };

    const { error } = await supabase.from('admin_activity').insert(newActivity);
    
    if (error) {
        console.error("Error logging admin activity:", error);
    } else {
        revalidatePath('/admin');
    }
}

    