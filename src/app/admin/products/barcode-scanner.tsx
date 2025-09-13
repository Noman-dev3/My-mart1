
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

    // Use useCallback to memoize the tick function
    const tick = useCallback(() => {
        if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            try {
                const reader = new BrowserMultiFormatReader();
                const result = reader.decodeFromVideoElement(videoRef.current);
                if (result) {
                    onScan(result.getText());
                }
            } catch (err) {
                if (err instanceof NotFoundException) {
                    // This is expected, barcode not found in this frame
                } else if (err instanceof ChecksumException || err instanceof FormatException) {
                   // Also common, means a partial or invalid barcode was detected
                } else {
                    console.error('An unexpected scanning error occurred:', err);
                }
            }
        }
        animationFrameId.current = requestAnimationFrame(tick);
    }, [onScan]);

    useEffect(() => {
        let stream: MediaStream | null = null;
        
        const startScanner = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' },
                });

                setHasPermission(true);
                const videoElement = videoRef.current;

                if (videoElement) {
                    videoElement.srcObject = stream;
                    videoElement.muted = true;
                    videoElement.play();
                    setIsLoading(false);
                    animationFrameId.current = requestAnimationFrame(tick);
                }

            } catch (err) {
                console.error("Error accessing camera:", err);
                setHasPermission(false);
                setIsLoading(false);
            }
        };

        startScanner();

        // Cleanup function
        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [tick]);

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
                    autoPlay 
                    muted 
                    playsInline 
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
