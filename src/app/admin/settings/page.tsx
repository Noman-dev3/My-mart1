

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { getSettings, updateSettings } from '@/lib/settings-actions';
import { updateApiKey } from '@/lib/api-keys';
import RoleGate from '@/components/admin/role-gate';

const settingsSchema = z.object({
  storeName: z.string().min(1, "Store name is required."),
  contactEmail: z.string().email("Invalid email address."),
  contactPhone: z.string().min(1, "Phone number is required."),
  address: z.string().min(1, "Address is required."),
  siteUrl: z.string().url("Please enter a valid URL."),
  theme: z.object({
    primaryColor: z.string().regex(/^(\d{1,3})\s(\d{1,3})%\s(\d{1,3})%$/, "Invalid HSL format. Example: 177 97% 40%"),
  }),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const apiKeySchema = z.object({
    geminiApiKey: z.string().optional(),
    supabaseUrl: z.string().optional(),
    supabaseAnonKey: z.string().optional(),
    supabaseServiceKey: z.string().optional(),
});

type ApiKeyFormValues = z.infer<typeof apiKeySchema>;

function SettingsPageContent() {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const settingsForm = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      storeName: 'My Mart',
      contactEmail: 'contact@mymart.com',
      contactPhone: '+92 311 9991972',
      address: '123 Market Street, Karachi, Pakistan',
      siteUrl: 'https://6000-firebase-studio-1757434852092.cluster-xpmcxs2fjnhg6xvn446ubtgpio.cloudworkstations.dev',
      theme: {
        primaryColor: '177 97% 40%',
      },
    },
  });

  const apiKeyForm = useForm<ApiKeyFormValues>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
        geminiApiKey: '',
        supabaseUrl: '',
        supabaseAnonKey: '',
        supabaseServiceKey: '',
    }
  });


  useEffect(() => {
    async function fetchSettings() {
      setIsLoading(true);
      const settings = await getSettings();
      if (settings) {
        settingsForm.reset({
          storeName: settings.storeName || 'My Mart',
          contactEmail: settings.contactEmail || 'contact@mymart.com',
          contactPhone: settings.contactPhone || '+92 311 9991972',
          address: settings.address || '123 Market Street, Karachi, Pakistan',
          siteUrl: settings.siteUrl || 'https://6000-firebase-studio-1757434852092.cluster-xpmcxs2fjnhg6xvn446ubtgpio.cloudworkstations.dev',
          theme: {
            primaryColor: settings.theme?.primaryColor || '177 97% 40%',
          },
        });
      }
      setIsLoading(false);
    }

    fetchSettings();
  }, [settingsForm]);

  const onSettingsSubmit = async (data: SettingsFormValues) => {
    try {
      await updateSettings(data);
      toast({
        title: 'Success!',
        description: 'Settings have been updated successfully.',
      });
      // Optionally, force a reload to see theme changes if they don't apply automatically
      window.location.reload();
    } catch (error) {
      console.error("Failed to save settings: ", error);
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
   const onApiKeySubmit = async (data: ApiKeyFormValues) => {
    const updates = Object.entries(data).filter(([, value]) => value);

    if (updates.length === 0) {
        toast({ title: 'No Keys to Update', description: 'Please enter a value for at least one key.'});
        return;
    }

    try {
        for (const [keyName, keyValue] of updates) {
            if (keyValue) {
                await updateApiKey({ keyName, keyValue });
            }
        }
        toast({
            title: 'API Keys Updated',
            description: 'The provided API keys have been securely updated.'
        });
        apiKeyForm.reset();
    } catch (error: any) {
        console.error("Failed to update API key:", error);
        toast({
            title: 'Error',
            description: error.message || 'Failed to update API keys.',
            variant: 'destructive',
        });
    }
  }


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
      
       <Form {...settingsForm}>
        <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Store Information</CardTitle>
                    <CardDescription>Update your public store details. This will be reflected in the site footer and other contact points.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField control={settingsForm.control} name="storeName" render={({ field }) => ( <FormItem> <FormLabel>Store Name</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={settingsForm.control} name="contactEmail" render={({ field }) => ( <FormItem> <FormLabel>Contact Email</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                        <FormField control={settingsForm.control} name="contactPhone" render={({ field }) => ( <FormItem> <FormLabel>Contact Phone</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    </div>
                    <FormField control={settingsForm.control} name="address" render={({ field }) => ( <FormItem> <FormLabel>Address</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={settingsForm.control} name="siteUrl" render={({ field }) => ( <FormItem> <FormLabel>Site URL</FormLabel> <FormControl><Input {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Theme & Branding</CardTitle>
                    <CardDescription>Customize the look and feel of your store.</CardDescription>
                </CardHeader>
                <CardContent>
                    <FormField control={settingsForm.control} name="theme.primaryColor" render={({ field }) => ( 
                        <FormItem> 
                            <FormLabel>Primary Color (HSL)</FormLabel> 
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage /> 
                            <p className="text-xs text-muted-foreground">Enter a color in HSL format (e.g., "222.2 84% 4.9%"). Changes will apply globally after saving.</p>
                        </FormItem> 
                    )} />
                </CardContent>
                 <CardFooter className="flex justify-end border-t pt-6">
                    <Button type="submit" disabled={settingsForm.formState.isSubmitting}>
                    {settingsForm.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Site Settings
                    </Button>
                </CardFooter>
            </Card>
        </form>
      </Form>
      
      <Card>
          <Form {...apiKeyForm}>
            <form onSubmit={apiKeyForm.handleSubmit(onApiKeySubmit)}>
                <CardHeader>
                    <CardTitle>API Key Management</CardTitle>
                    <CardDescription>Manage keys for third-party services. Keys are write-only for security and current values are not displayed.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <FormField
                        control={apiKeyForm.control}
                        name="geminiApiKey"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Google AI (Gemini) API Key</FormLabel>
                                <FormControl><Input type="password" {...field} placeholder="Enter new API Key..." /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={apiKeyForm.control}
                        name="supabaseUrl"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Supabase URL</FormLabel>
                                <FormControl><Input type="password" {...field} placeholder="Enter new Supabase URL..." /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={apiKeyForm.control}
                        name="supabaseAnonKey"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Supabase Anon Key</FormLabel>
                                <FormControl><Input type="password" {...field} placeholder="Enter new Anon Key..." /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={apiKeyForm.control}
                        name="supabaseServiceKey"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Supabase Service Role Key</FormLabel>
                                <FormControl><Input type="password" {...field} placeholder="Enter new Service Role Key..." /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
                 <CardFooter className="flex justify-end border-t pt-6">
                    <Button type="submit" disabled={apiKeyForm.formState.isSubmitting}>
                        {apiKeyForm.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Update API Keys
                    </Button>
                </CardFooter>
            </form>
          </Form>
      </Card>
    </div>
  );
}

export default function SettingsPage() {
    return (
        <RoleGate role="SUPER_ADMIN">
            <SettingsPageContent />
        </RoleGate>
    )
}
