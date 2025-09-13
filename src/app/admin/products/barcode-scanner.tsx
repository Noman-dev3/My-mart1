
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { MultiFormatReader, BarcodeFormat, DecodeHintType, NotFoundException } from '@zxing/library';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Loader2, CameraOff } from 'lucide-react';

type BarcodeScannerProps = {
  onScan: (barcode: string) => void;
  onClose: () => void;
};

export default function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const codeReader = useRef<MultiFormatReader | null>(null);

  useEffect(() => {
    // Initialize the reader
    const hints = new Map();
    const formats = [BarcodeFormat.CODE_128, BarcodeFormat.CODE_39, BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.UPC_A, BarcodeFormat.UPC_E, BarcodeFormat.QR_CODE];
    hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
    codeReader.current = new MultiFormatReader();
    codeReader.current.setHints(hints);
  }, []);

  const tick = useCallback(() => {
    if (videoRef.current && canvasRef.current && codeReader.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current.getContext('2d', { willReadFrequently: true });
      if (canvas) {
        canvasRef.current.height = videoRef.current.videoHeight;
        canvasRef.current.width = videoRef.current.videoWidth;
        canvas.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        try {
          const result = codeReader.current.decode(canvasRef.current);
          if (result) {
            onScan(result.getText());
            return; // Stop the loop
          }
        } catch (err) {
          if (!(err instanceof NotFoundException)) {
            console.error('Barcode decoding error:', err);
          }
        }
      }
    }
    requestAnimationFrame(tick);
  }, [onScan]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let isMounted = true;
    
    const startScanner = async () => {
      setIsLoading(true);
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });

        if (!isMounted) {
            stream.getTracks().forEach(track => track.stop());
            return;
        }

        setHasPermission(true);
        const videoElement = videoRef.current;
        if (videoElement) {
          videoElement.srcObject = stream;
          videoElement.onloadedmetadata = () => {
            videoElement.play();
            setIsLoading(false);
            requestAnimationFrame(tick); // Start the scanning loop
          };
        }
      } catch (err) {
        if (isMounted) {
            console.error("Error accessing camera:", err);
            setHasPermission(false);
            setIsLoading(false);
            toast({
              title: 'Camera Access Denied',
              description: 'Please enable camera permissions in your browser settings.',
              variant: 'destructive',
            });
        }
      }
    };

    startScanner();

    // Cleanup function
    return () => {
      isMounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [tick, toast]);

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
        <canvas ref={canvasRef} className="hidden" />
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

    