

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
import { getSettings, updateSettings, updateAdminPassword } from '@/lib/settings-actions';
import { updateApiKey, type SiteSettings } from '@/lib/api-keys';

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


const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(4, "New password must be at least 4 characters."),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

const apiKeySchema = z.object({
    geminiApiKey: z.string().min(1, "API Key is required.")
});

type ApiKeyFormValues = z.infer<typeof apiKeySchema>;


export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const settingsForm = useForm<SettingsFormValues>({
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

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    }
  });
  
  const apiKeyForm = useForm<ApiKeyFormValues>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
        geminiApiKey: ''
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

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    try {
        const result = await updateAdminPassword(data);
        if (result.success) {
            toast({
                title: 'Password Updated',
                description: 'Your admin password has been changed successfully.'
            });
            passwordForm.reset();
        } else {
            throw new Error(result.error);
        }
    } catch (error: any) {
        console.error("Failed to update password:", error);
        toast({
            title: 'Error',
            description: error.message || 'Failed to update password. Please try again.',
            variant: 'destructive',
        });
    }
  };
  
   const onApiKeySubmit = async (data: ApiKeyFormValues) => {
    try {
        await updateApiKey({ keyName: 'geminiApiKey', keyValue: data.geminiApiKey });
        toast({
            title: 'API Key Updated',
            description: 'The Gemini API key has been securely updated.'
        });
        apiKeyForm.reset({ geminiApiKey: '' });
    } catch (error: any) {
        console.error("Failed to update API key:", error);
        toast({
            title: 'Error',
            description: error.message || 'Failed to update API key.',
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
                    <CardDescription>Manage keys for third-party services. Keys are write-only for security.</CardDescription>
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
                </CardContent>
                 <CardFooter className="flex justify-end border-t pt-6">
                    <Button type="submit" disabled={apiKeyForm.formState.isSubmitting}>
                        {apiKeyForm.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Update API Key
                    </Button>
                </CardFooter>
            </form>
          </Form>
      </Card>

      <Card>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
                <CardHeader>
                    <CardTitle>Admin Account</CardTitle>
                    <CardDescription>Change the password for the primary admin account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Current Password</FormLabel>
                                <FormControl><Input type="password" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <FormField
                            control={passwordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl><Input type="password" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm New Password</FormLabel>
                                    <FormControl><Input type="password" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t pt-6">
                    <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                        {passwordForm.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Update Password
                    </Button>
                </CardFooter>
            </form>
          </Form>
      </Card>
    </div>
  );
}

    
