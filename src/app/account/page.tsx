
'use client';

import { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AuthContext } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Activity } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { updateUserProfile } from '@/lib/auth-actions';

const profileSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.user_metadata.full_name || '',
      email: user?.email || '',
    },
  });

  async function onSubmit(data: ProfileFormValues) {
    const result = await updateUserProfile({ fullName: data.fullName });

    if (result.success) {
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
    } else {
      toast({
        title: "Update Failed",
        description: result.error || "An unknown error occurred.",
        variant: "destructive",
      });
    }
  }
  
  // Placeholder for recent activity
  const activityLog = [
    { action: 'Placed order #A4B2C1D9', time: '2 days ago' },
    { action: 'Updated profile information', time: '1 week ago' },
    { action: 'Asked a question on "Wireless Headphones"', time: '2 weeks ago' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-headline">My Profile</h1>
        <p className="text-muted-foreground">Update your personal information here.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                      <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                  </FormItem>
                  )}
              />
              <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                  <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} disabled />
                      </FormControl>
                      <FormMessage />
                  </FormItem>
                  )}
              />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
      
      <Separator />

      <div>
        <h3 className="text-lg font-headline font-semibold mb-4">Recent Activity</h3>
         <div className="space-y-4">
             {activityLog.map((activity, index) => (
                <div key={index} className="flex items-start gap-4">
                    <div className="bg-muted rounded-full p-2 mt-1">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="text-sm">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                </div>
             ))}
          </div>
      </div>
    </div>
  );
}
