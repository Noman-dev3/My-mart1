
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { NotFoundException, ChecksumException, FormatException } from '@zxing/library';
import QRCode from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Camera, QrCode, Scan, Upload, AlertCircle, Download } from 'lucide-react';
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
                        <CardDescription>Scan barcodes using your device camera or an image file.</CardDescription>
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
  const codeReader = useRef(new BrowserMultiFormatReader());


  const startScan = useCallback(async (deviceId: string) => {
    if (!videoRef.current) return;
    setError('');
    setScannedResult('');
    setIsScanning(true);

    try {
      codeReader.current.decodeFromVideoDevice(deviceId, videoRef.current, (result, err) => {
        if (result) {
          setScannedResult(result.getText());
          setIsScanning(false);
          codeReader.current.reset();
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
    codeReader.current.reset();
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
    };
  }, [stopScan]);

  const handleFileScan = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setError('');
      setScannedResult('');
      setIsScanning(true); // Visually indicate activity
      const localCodeReader = new BrowserMultiFormatReader();
      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
        const result = await localCodeReader.decodeFromImageUrl(dataUrl);
        setScannedResult(result.getText());
      } catch (err) {
        console.error("File scan error:", err);
        setError('Could not decode barcode from the image. Please try a clearer image.');
      } finally {
        setIsScanning(false);
      }
    }
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
        <div className="flex">
          <Button asChild variant="outline" className="w-full">
              <Label className="cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" /> Scan from Image
                  <Input type="file" accept="image/*" onChange={handleFileScan} className="hidden" />
              </Label>
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
