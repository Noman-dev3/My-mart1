
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { BrowserMultiFormatReader, NotFoundException, ChecksumException, FormatException } from '@zxing/library';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

type BarcodeScannerProps = {
    onScan: (barcode: string) => void;
    onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const { toast } = useToast();
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const animationFrameId = useRef<number>();
    const codeReader = useRef(new BrowserMultiFormatReader());

    const decodeFromStream = useCallback(() => {
        if (!videoRef.current) return;
        
        try {
            const result = codeReader.current.decodeFromVideoElement(videoRef.current);
            if (result) {
                onScan(result.getText());
            }
        } catch (err) {
            // These errors are expected and normal during scanning.
            if (!(err instanceof NotFoundException) && !(err instanceof ChecksumException) && !(err instanceof FormatException)) {
                console.error('An unexpected scanning error occurred:', err);
                toast({
                    title: 'Scanning Error',
                    description: 'An unexpected error occurred while scanning.',
                    variant: 'destructive',
                });
            }
        }
        
        animationFrameId.current = requestAnimationFrame(decodeFromStream);
    }, [onScan, toast]);

    useEffect(() => {
        let stream: MediaStream | null = null;
        
        const startScanner = async () => {
            setIsLoading(true);
            try {
                // Request camera permission
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' },
                });
                setHasPermission(true);

                const videoElement = videoRef.current;
                if (videoElement) {
                    videoElement.srcObject = stream;
                    
                    // The `loadeddata` event listener is crucial to ensure the video is ready before we start scanning
                    videoElement.addEventListener('loadeddata', () => {
                        setIsLoading(false);
                        // Start the scanning loop
                        animationFrameId.current = requestAnimationFrame(decodeFromStream);
                    });

                    // Start playing the video stream
                    videoElement.play();
                }

            } catch (err) {
                console.error("Error accessing camera:", err);
                setHasPermission(false);
                setIsLoading(false);
                 toast({
                    title: 'Camera Access Denied',
                    description: 'Please enable camera permissions in your browser settings.',
                    variant: 'destructive'
                });
            }
        };

        startScanner();

        // Cleanup function to stop the camera and animation frame when the component unmounts
        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [decodeFromStream, toast]);

    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-full max-w-md aspect-video bg-card-foreground/5 rounded-lg overflow-hidden relative">
                {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <p className="mt-2 text-muted-foreground">🎥 Starting camera...</p>
                    </div>
                )}
                <video 
                    ref={videoRef} 
                    className={`w-full h-full object-cover ${isLoading ? 'hidden' : 'block'}`}
                />
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
