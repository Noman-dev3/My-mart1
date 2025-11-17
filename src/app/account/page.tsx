
'use client';

import { useContext, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AuthContext } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Activity, ShoppingCart, MessageSquare, User } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { updateUserProfile } from '@/lib/auth-actions';
import { getOrdersByUser } from '@/lib/order-actions';
import type { Order } from '@/lib/order-actions';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';

const profileSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

type ActivityLogItem = {
    icon: React.ElementType;
    action: string;
    time: string;
    date: Date;
};

export default function ProfilePage() {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const [activityLog, setActivityLog] = useState<ActivityLogItem[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  const supabase = createSupabaseBrowserClient();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.user_metadata.full_name || '',
      email: user?.email || '',
    },
  });
  
  useEffect(() => {
    if (user?.id) {
      setIsLoadingActivity(true);
      
      const fetchActivities = async () => {
        // Fetch orders
        const { data: orders } = await supabase
            .from('orders')
            .select('*')
            .eq('customer->>uid', user.id);

        const orderActivities: ActivityLogItem[] = (orders || []).map(order => ({
            icon: ShoppingCart,
            action: `Placed order #${order.id.slice(0, 8)}...`,
            time: formatDistanceToNow(new Date(order.date), { addSuffix: true }),
            date: new Date(order.date),
        }));

        // Fetch products with questions from this user
        const { data: productsWithQuestions } = await supabase
          .from('products')
          .select('name, questions');
        
        const questionActivities: ActivityLogItem[] = [];
        (productsWithQuestions || []).forEach(product => {
            if (product.questions) {
                const userQuestions = product.questions.filter((q: any) => q.authorId === user.id);
                userQuestions.forEach((q: any) => {
                    questionActivities.push({
                        icon: MessageSquare,
                        action: `Asked a question on "${product.name}"`,
                        time: formatDistanceToNow(new Date(q.date), { addSuffix: true }),
                        date: new Date(q.date),
                    });
                });
            }
        });

        // Combine and sort all activities
        const combinedLog = [...orderActivities, ...questionActivities].sort((a,b) => b.date.getTime() - a.date.getTime());
        setActivityLog(combinedLog);
        setIsLoadingActivity(false);
      }
      
      fetchActivities();

    } else {
        setIsLoadingActivity(false);
    }
  }, [user, supabase]);

  async function onSubmit(data: ProfileFormValues) {
    const result = await updateUserProfile({ fullName: data.fullName });

    if (result.success) {
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
      // Add profile update to the activity log on the client side
      const newActivity: ActivityLogItem = {
          icon: User,
          action: 'Updated your profile information.',
          time: 'just now',
          date: new Date(),
      };
      setActivityLog(prevLog => [newActivity, ...prevLog]);
    } else {
      toast({
        title: "Update Failed",
        description: result.error || "An unknown error occurred.",
        variant: "destructive",
      });
    }
  }

  const ActivitySkeleton = () => (
      <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/4" />
                  </div>
              </div>
          ))}
      </div>
  );

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
             {isLoadingActivity ? <ActivitySkeleton /> :
              activityLog.length > 0 ? (
                activityLog.map((activity, index) => (
                  <div key={index} className="flex items-start gap-4">
                      <div className="bg-muted rounded-full p-2 mt-1">
                          <activity.icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                          <p className="text-sm">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                  </div>
                ))
             ) : (
                <p className="text-sm text-muted-foreground">No recent activity to display.</p>
             )}
          </div>
      </div>
    </div>
  );
}
