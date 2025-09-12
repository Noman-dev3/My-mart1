
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

type BarcodeScannerProps = {
    onScan: (barcode: string) => void;
}

export default function BarcodeScanner({ onScan }: BarcodeScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const { toast } = useToast();
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const codeReader = useRef(new BrowserMultiFormatReader());
    const isScanning = useRef(true);

    const startScanner = useCallback(async () => {
        if (!videoRef.current || !navigator.mediaDevices) {
            toast({
                title: 'Scanner Unavailable',
                description: 'Camera features are not supported on this device/browser.',
                variant: 'destructive'
            });
            setHasPermission(false);
            return;
        }
        
        isScanning.current = true;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            setHasPermission(true);
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;

                codeReader.current.decodeFromStream(stream, videoRef.current, (result, err) => {
                    if (result && isScanning.current) {
                        isScanning.current = false; // Stop scanning after one successful read
                        onScan(result.getText());
                    }
                    if (err && !(err instanceof NotFoundException)) {
                        console.error('Barcode decoding error:', err);
                        toast({
                            title: 'Scanning Error',
                            description: 'Could not decode barcode. Please try again.',
                            variant: 'destructive'
                        });
                    }
                });
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            setHasPermission(false);
        }
    }, [onScan, toast]);

    const stopScanner = useCallback(() => {
        codeReader.current.reset();
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    }, []);

    useEffect(() => {
        startScanner();
        return () => {
            stopScanner();
        };
    }, [startScanner, stopScanner]);

    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-full max-w-md aspect-video bg-card-foreground/5 rounded-lg overflow-hidden relative">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-4/5 h-1/2 border-4 border-dashed border-primary/50 rounded-lg" />
                </div>
            </div>
            {hasPermission === false && (
                <Alert variant="destructive">
                    <AlertTitle>Camera Access Required</AlertTitle>
                    <AlertDescription>
                        Please allow camera access in your browser settings to use this feature.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
