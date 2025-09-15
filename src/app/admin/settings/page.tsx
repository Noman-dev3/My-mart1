
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { getSettings, updateSettings, type SiteSettings } from '@/lib/settings-actions';

const settingsSchema = z.object({
  storeName: z.string().min(1, "Store name is required."),
  contactEmail: z.string().email("Invalid email address."),
  contactPhone: z.string().min(1, "Phone number is required."),
  address: z.string().min(1, "Address is required."),
  theme: z.object({
    primaryColor: z.string().regex(/^(\d{1,3})\s(\d{1,3})%\s(\d{1,3})%$/, "Invalid HSL format. Example: 177 97% 40%"),
  }),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      storeName: 'My Mart',
      contactEmail: 'contact@mymart.com',
      contactPhone: '+92 311 9991972',
      address: '123 Market Street, Karachi, Pakistan',
      theme: {
        primaryColor: '177 97% 40%',
      },
    },
  });

  useEffect(() => {
    async function fetchSettings() {
      setIsLoading(true);
      const settings = await getSettings();
      if (settings) {
        form.reset({
          storeName: settings.storeName || 'My Mart',
          contactEmail: settings.contactEmail || 'contact@mymart.com',
          contactPhone: settings.contactPhone || '+92 311 9991972',
          address: settings.address || '123 Market Street, Karachi, Pakistan',
          theme: {
            primaryColor: settings.theme?.primaryColor || '177 97% 40%',
          },
        });
      }
      setIsLoading(false);
    }

    fetchSettings();
  }, [form]);

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      await updateSettings(data);
      toast({
        title: 'Success!',
        description: 'Settings have been updated successfully.',
      });
      // Optionally, force a reload to see theme changes if they don't apply automatically
      // window.location.reload();
    } catch (error) {
      console.error("Failed to save settings: ", error);
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Store Settings</h1>
        <p className="text-muted-foreground">Manage your store's identity, branding, and configuration.</p>
      </div>
      
       <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Store Information</CardTitle>
                    <CardDescription>Update your public store details. This will be reflected in the site footer and other contact points.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField control={form.control} name="storeName" render={({ field }) => ( <FormItem> <FormLabel>Store Name</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="contactEmail" render={({ field }) => ( <FormItem> <FormLabel>Contact Email</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                        <FormField control={form.control} name="contactPhone" render={({ field }) => ( <FormItem> <FormLabel>Contact Phone</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    </div>
                    <FormField control={form.control} name="address" render={({ field }) => ( <FormItem> <FormLabel>Address</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Theme & Branding</CardTitle>
                    <CardDescription>Customize the look and feel of your store.</CardDescription>
                </CardHeader>
                <CardContent>
                    <FormField control={form.control} name="theme.primaryColor" render={({ field }) => ( 
                        <FormItem> 
                            <FormLabel>Primary Color (HSL)</FormLabel> 
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage /> 
                            <p className="text-xs text-muted-foreground">Enter a color in HSL format (e.g., "222.2 84% 4.9%"). Changes will apply globally after saving.</p>
                        </FormItem> 
                    )} />
                </CardContent>
            </Card>
            
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save All Settings
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
