
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { NotFoundException, ChecksumException, FormatException } from '@zxing/library';
import QRCode from 'qrcode.react';
import { createSupabaseBrowserClient } from '@/lib/supabase-client';
import { type RealtimeChannel } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Camera, QrCode, Scan, Upload, Phone, AlertCircle, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export default function BarcodeToolsPage() {

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold font-headline">Barcode & QR Code Suite</h1>
            <p className="text-muted-foreground">A collection of tools for scanning and generating codes.</p>
        </div>

        <Tabs defaultValue="scanner" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="scanner"><Scan className="mr-2 h-4 w-4"/>Scanner</TabsTrigger>
                <TabsTrigger value="generator"><QrCode className="mr-2 h-4 w-4"/>Generator</TabsTrigger>
            </TabsList>
            <TabsContent value="scanner">
                <Card>
                    <CardHeader>
                        <CardTitle>Barcode Scanner</CardTitle>
                        <CardDescription>Scan barcodes using your device camera, an image file, or your phone.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScannerComponent />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="generator">
                 <Card>
                    <CardHeader>
                        <CardTitle>QR Code Generator</CardTitle>
                        <CardDescription>Create a QR code from any text or URL.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <GeneratorComponent />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>

    </div>
  );
}


// --- Scanner Component ---

function ScannerComponent() {
  const [scannedResult, setScannedResult] = useState('');
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [phoneSessionId, setPhoneSessionId] = useState('');
  const supabase = createSupabaseBrowserClient();
  const channelRef = useRef<RealtimeChannel | null>(null);


  const startScan = useCallback(async (deviceId: string) => {
    if (!videoRef.current) return;
    setError('');
    setScannedResult('');
    setIsScanning(true);

    const codeReader = new BrowserMultiFormatReader();

    try {
      codeReader.decodeFromVideoDevice(deviceId, videoRef.current, (result, err) => {
        if (result) {
          setScannedResult(result.getText());
          setIsScanning(false);
          codeReader.reset();
        }
        if (err && !(err instanceof NotFoundException || err instanceof ChecksumException || err instanceof FormatException)) {
           console.error("Scanning error:", err);
           setError('An unexpected error occurred during scanning.');
           setIsScanning(false);
        }
      });
    } catch (err: any) {
      console.error("Camera access error:", err);
      if (err.name === 'NotAllowedError') {
        setError('Camera access was denied. Please enable it in your browser settings.');
      } else {
        setError('Could not access camera. Please ensure it is not in use by another application.');
      }
      setIsScanning(false);
    }
  }, []);

  const stopScan = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
    setIsScanning(false);
  }, []);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices()
      .then(videoInputDevices => {
        const videoDevices = videoInputDevices.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedDevice(videoDevices[0].deviceId);
        }
      });

    return () => {
      stopScan();
      if(channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [stopScan, supabase]);

  const handleFileScan = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setError('');
      setScannedResult('');
      setIsScanning(true); // Visually indicate activity
      const codeReader = new BrowserMultiFormatReader();
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
        const result = await codeReader.decodeFromImageUrl(dataUrl);
        setScannedResult(result.getText());
      } catch (err) {
        console.error("File scan error:", err);
        setError('Could not decode barcode from the image. Please try a clearer image.');
      } finally {
        setIsScanning(false);
      }
    }
  };

  const openPhoneScanner = () => {
    const sessionId = `scan-session-${Math.random().toString(36).substring(2, 11)}`;
    setPhoneSessionId(sessionId);
    setIsPhoneModalOpen(true);
    
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase.channel(sessionId);
    channel.on('broadcast', { event: 'barcode-scanned' }, (payload) => {
        setScannedResult(payload.payload.barcode);
        setIsPhoneModalOpen(false);
        supabase.removeChannel(channel);
        channelRef.current = null;
    }).subscribe();

    channelRef.current = channel;
  };
  
  return (
    <div className="flex flex-col gap-6">
      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden border-2 border-dashed border-border flex items-center justify-center">
        <video ref={videoRef} className={`w-full h-full object-cover ${isScanning ? '' : 'hidden'}`} />
        {!isScanning && (
            <div className="text-center text-muted-foreground p-4 flex flex-col items-center gap-2">
                <Camera className="h-10 w-10" />
                <p>Camera is off. Press "Start Scan" to begin.</p>
            </div>
        )}
        {isScanning && <div className="absolute inset-0 border-4 border-primary/50 animate-pulse rounded-lg" />}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col sm:flex-row gap-2">
            <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                disabled={isScanning || devices.length === 0}
                className="w-full flex-grow bg-background border border-input rounded-md px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
                {devices.length > 0 ? devices.map(device => (
                    <option key={device.deviceId} value={device.deviceId}>{device.label || `Camera ${devices.indexOf(device) + 1}`}</option>
                )) : <option>No cameras found</option>}
            </select>
            <Button
                onClick={() => isScanning ? stopScan() : startScan(selectedDevice)}
                disabled={!selectedDevice}
                 variant={isScanning ? 'destructive' : 'default'}
                className="w-full sm:w-auto"
            >
                {isScanning ? 'Stop Scan' : 'Start Scan'}
            </Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button asChild variant="outline" className="w-full flex-1">
              <Label>
                  <Upload className="mr-2 h-4 w-4" /> Scan from Image
                  <Input type="file" accept="image/*" onChange={handleFileScan} className="hidden" />
              </Label>
          </Button>
           <Button onClick={openPhoneScanner} className="w-full sm:w-auto" variant="outline">
             <Phone className="mr-2 h-4 w-4" /> Use Phone
           </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive-foreground p-3 rounded-md flex items-start gap-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
        </div>
      )}

      {scannedResult && (
        <div className="bg-muted/50 p-4 rounded-lg">
          <h3 className="text-lg font-bold text-primary">Scan Result</h3>
          <p className="font-mono text-foreground bg-background p-3 rounded-md break-words my-2">{scannedResult}</p>
        </div>
      )}

      <Dialog open={isPhoneModalOpen} onOpenChange={setIsPhoneModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Use Your Phone as a Scanner</DialogTitle>
                <DialogDescription>
                    Scan the QR code below with your phone's camera to open the scanner page. The result will appear here automatically.
                </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center p-4 bg-white rounded-md my-4">
               {typeof window !== 'undefined' && phoneSessionId && (
                    <QRCode
                        value={`${window.location.origin}/scan/${phoneSessionId}`}
                        size={256}
                        level={"H"}
                        includeMargin={true}
                    />
               )}
            </div>
            <DialogFooter>
                <Button onClick={() => setIsPhoneModalOpen(false)}>Close</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- Generator Component ---

function GeneratorComponent() {
  const [inputText, setInputText] = useState('https://cloud.google.com/firebase');
  const qrRef = useRef(null);

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = "qrcode.png";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };
  
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-full">
        <Label htmlFor="qr-input" className="block mb-2 text-sm font-medium">
          Enter URL or Text
        </Label>
        <Textarea
          id="qr-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={3}
          className="w-full"
          placeholder="e.g., https://google.com or your message here"
        />
      </div>
      
      {inputText && (
        <div className="bg-white p-6 rounded-lg shadow-inner" ref={qrRef}>
            <QRCode
              value={inputText}
              size={256}
              level={"H"}
              includeMargin={true}
            />
        </div>
      )}

      <Button
        onClick={handleDownload}
        disabled={!inputText}
        className="w-full max-w-xs"
      >
        <Download className="mr-2 h-4 w-4"/>
        Download QR Code
      </Button>
    </div>
  );
}
