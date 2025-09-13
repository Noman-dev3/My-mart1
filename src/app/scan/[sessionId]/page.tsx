
'use client';

import { useParams } from 'next/navigation';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserMultiFormatReader, NotFoundException, ChecksumException, FormatException } from '@zxing/library';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import { Loader2, CameraOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ScanPage() {
    const { sessionId } = useParams();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [hasPermission, setHasPermission] = useState<boolean|null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createSupabaseBrowserClient();
    const { toast } = useToast();

    const handleScanResult = useCallback(async (barcode: string) => {
        setIsScanning(false);
        try {
            const channel = supabase.channel(sessionId as string);
            await channel.send({
                type: 'broadcast',
                event: 'barcode-scanned',
                payload: { barcode: barcode },
            });
            toast({
                title: 'Scan Successful!',
                description: 'Barcode sent to your PC. You can close this window.',
            });
            // Optional: Close the window after sending
            // setTimeout(() => window.close(), 1000);
        } catch (e) {
            console.error('Failed to send barcode', e);
            setError('Failed to send barcode to PC. Please try again.');
        }
    }, [sessionId, supabase, toast]);

    const startScan = useCallback(async () => {
        if (!videoRef.current) return;
        
        setHasPermission(true);
        setIsScanning(true);
        setIsLoading(false);

        const codeReader = new BrowserMultiFormatReader();
        try {
            await codeReader.decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
                if (result) {
                    handleScanResult(result.getText());
                    codeReader.reset();
                }
                if (err && !(err instanceof NotFoundException)) {
                    console.error("Scan error:", err);
                    setError('An error occurred during scanning.');
                }
            });
        } catch(err: any) {
            console.error('Camera access error:', err);
             if (err.name === 'NotAllowedError') {
                setError('Camera access was denied. Please enable it in your browser settings.');
            } else {
                setError('Could not access camera. Is it in use by another app?');
            }
            setHasPermission(false);
            setIsLoading(false);
        }
    }, [handleScanResult]);


    useEffect(() => {
        const getCameraPermission = async () => {
            setIsLoading(true);
            try {
                // Just to get permissions
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                setHasPermission(true);
                startScan(); // Start scanning immediately after getting permission
                 // Clean up the initial stream, startScan will create its own
                stream.getTracks().forEach(track => track.stop());
            } catch (error) {
                console.error('Error accessing camera:', error);
                setHasPermission(false);
                setIsLoading(false);
                toast({
                  variant: 'destructive',
                  title: 'Camera Access Denied',
                  description: 'Please enable camera permissions in your browser settings to use this feature.',
                });
            }
        };

        getCameraPermission();
        
        // This return is for cleanup, but ZXing handles its own stream.
        return () => {
           // Cleanup logic is handled by the library's reset method.
        };
    }, [startScan, toast]);

    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
            <h1 className="text-2xl font-bold text-primary mb-2">Remote Scanner</h1>
            <p className="text-muted-foreground mb-4 text-center">Point your camera at a barcode.</p>
            
            <div className="w-full max-w-md aspect-video bg-black rounded-lg overflow-hidden relative shadow-lg">
                {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 z-10">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <p className="mt-2 text-muted-foreground">🎥 Requesting Camera...</p>
                    </div>
                )}
                {hasPermission === false && !isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 z-10 text-center p-4">
                        <CameraOff className="h-10 w-10 text-destructive" />
                        <p className="mt-4 text-muted-foreground">Camera access is required to use the remote scanner.</p>
                         <Alert variant="destructive" className="mt-4">
                            <AlertTitle>Camera Access Denied</AlertTitle>
                            <AlertDescription>
                                Please allow camera access in your browser settings and refresh this page.
                            </AlertDescription>
                        </Alert>
                    </div>
                )}
                <video
                    ref={videoRef}
                    className={`w-full h-full object-cover transition-opacity duration-500 ${isLoading || hasPermission === false ? 'opacity-0' : 'opacity-100'}`}
                    playsInline
                    muted
                />
                 {isScanning && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-4/5 h-2/5 border-4 border-dashed border-primary/70 rounded-lg animate-pulse" />
                    </div>
                )}
            </div>
            
            {error && <p className="text-destructive mt-4">{error}</p>}
        </main>
    );
}

