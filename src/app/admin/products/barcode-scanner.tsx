
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2, CameraOff } from 'lucide-react';
import { readBarcodeFromImage } from '@/ai/flows/read-barcode';
import { Button } from '@/components/ui/button';

type BarcodeScannerProps = {
  onScan: (barcode: string) => void;
  onClose: () => void;
};

export default function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAiScanning, setIsAiScanning] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let stream: MediaStream | null = null;
    
    const startCamera = async () => {
        if (!videoRef.current) return;
        setIsLoading(true);

        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
            });

            if (isMounted) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
                setHasPermission(true);
            }
        } catch (err) {
            if (isMounted) {
                console.error("Error accessing camera:", err);
                setHasPermission(false);
                toast({
                    title: 'Camera Access Denied',
                    description: 'Please enable camera permissions in your browser settings.',
                    variant: 'destructive',
                });
            }
        } finally {
            if (isMounted) {
                setIsLoading(false);
            }
        }
    };

    startCamera();

    return () => {
      isMounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);

  const handleAiScan = async () => {
    if (!videoRef.current?.srcObject) {
        toast({ title: 'Error', description: 'Camera is not active.', variant: 'destructive' });
        return;
    };
    
    const video = videoRef.current;
    // Ensure the video is playing and has dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) {
        toast({ title: 'Error', description: 'Video stream not ready. Please wait a moment.', variant: 'destructive' });
        return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    
    if (!context) {
        toast({ title: 'Error', description: 'Could not get canvas context.', variant: 'destructive' });
        return;
    }
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageDataUri = canvas.toDataURL('image/jpeg');

    setIsAiScanning(true);
    toast({ title: 'AI Scan Started', description: 'Analyzing image with Gemini...' });

    try {
        const result = await readBarcodeFromImage({ imageDataUri });
        if (result && result.barcode && result.barcode.trim()) {
            onScan(result.barcode.trim());
        } else {
            throw new Error("AI could not detect a valid barcode.");
        }
    } catch(err) {
        console.error("AI Scan Error:", err);
        toast({ title: 'AI Scan Failed', description: 'Could not extract a barcode from the image. Please try again with a clearer view.', variant: 'destructive' });
    } finally {
        setIsAiScanning(false);
    }
  };


  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="w-full max-w-md aspect-video bg-card-foreground/5 rounded-lg overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="mt-2 text-muted-foreground">🎥 Starting camera...</p>
          </div>
        )}
         {hasPermission === false && !isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10">
                <CameraOff className="h-10 w-10 text-destructive" />
                <p className="mt-2 text-muted-foreground">Camera access is required.</p>
            </div>
        )}
        <video
          ref={videoRef}
          className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          playsInline
          muted
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-4/5 h-1/2 border-4 border-dashed border-primary/50 rounded-lg" />
        </div>
      </div>
      
      <Button onClick={handleAiScan} disabled={isAiScanning || isLoading || !hasPermission} className="w-full max-w-md">
        {isAiScanning ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : '✨'}
        Scan with AI
      </Button>

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
