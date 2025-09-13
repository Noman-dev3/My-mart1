
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserMultiFormatReader, NotFoundException, ChecksumException, FormatException } from '@zxing/browser';
import QRCode from 'qrcode.react';

// --- Helper Components ---

const Icon = ({ path, className = 'w-6 h-6' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d={path} />
  </svg>
);

const CameraIcon = () => <Icon path="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />;
const QRIcon = () => <Icon path="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM13 21h8v-8h-8v8zm2-6h4v4h-4v-4z" />;
const ScanIcon = () => <Icon path="M4 6h-2v-2c0-1.1.9-2 2-2h2v2h-2v2zm16 0h-2v-2h2v-2h2c1.1 0 2 .9 2 2v2h-2v-2zm-2 12h2v2c0 1.1-.9 2-2 2h-2v-2h2v-2zm-14 2h-2v-2h2v2h-2c-1.1 0-2-.9-2-2v-2h2v2h2v2zm6-14h-4v4h4v-4zM9 9H7v2h2V9zm4 0h-2v2h2V9zm2 0h-2v2h2V9zm2 0h-2v2h2V9zM9 13H7v2h2v-2zm4 0h-2v2h2v-2zm2 0h-2v2h2v-2z" />;
const DownloadIcon = () => <Icon path="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />;
const ErrorIcon = () => <Icon path="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />;

// --- Main App Component ---

export default function BarcodeToolsPage() {
  const [activeTab, setActiveTab] = useState('scanner');

  return (
    <div className="min-h-full bg-card text-card-foreground font-sans flex flex-col items-center p-0">
      <div className="w-full max-w-4xl bg-card rounded-2xl shadow-2xl overflow-hidden">
        <header className="bg-muted/30 p-4 sm:p-6 border-b">
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-primary">Barcode & QR Code Suite</h1>
          <p className="text-center text-muted-foreground mt-1">Scan, Generate, and Analyze</p>
        </header>

        <nav className="flex bg-card">
          <TabButton id="scanner" activeTab={activeTab} setActiveTab={setActiveTab} icon={<ScanIcon />}>
            Scanner
          </TabButton>
          <TabButton id="generator" activeTab={activeTab} setActiveTab={setActiveTab} icon={<QRIcon />}>
            Generator
          </TabButton>
        </nav>

        <main className="p-4 sm:p-8">
          {activeTab === 'scanner' && <ScannerComponent />}
          {activeTab === 'generator' && <GeneratorComponent />}
        </main>

        <footer className="text-center p-4 bg-muted/30 text-xs text-muted-foreground/50 border-t">
          Powered by ZXing
        </footer>
      </div>
    </div>
  );
}

const TabButton = ({ id, activeTab, setActiveTab, icon, children }) => (
  <button
    onClick={() => setActiveTab(id)}
    className={`flex-1 py-4 px-2 sm:px-4 text-sm sm:text-base font-semibold flex items-center justify-center gap-2 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-card focus:ring-primary ${
      activeTab === id
        ? 'bg-primary text-primary-foreground'
        : 'bg-card text-muted-foreground hover:bg-muted'
    }`}
  >
    {icon}
    {children}
  </button>
);

// --- Scanner Component ---

function ScannerComponent() {
  const [scannedResult, setScannedResult] = useState('');
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const videoRef = useRef(null);
  const codeReader = useRef(new BrowserMultiFormatReader());

  const startScan = useCallback(async (deviceId) => {
    if (!videoRef.current) return;
    setError('');
    setScannedResult('');
    setIsScanning(true);

    try {
      await codeReader.current.reset();
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
    } catch (err) {
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

  const handleFileScan = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setError('');
      setScannedResult('');
      setIsScanning(true);
      try {
        const reader = new FileReader();
        reader.onloadend = (e) => {
          const dataUrl = e.target?.result;
          if (typeof dataUrl === 'string') {
            codeReader.current.decodeFromImageUrl(dataUrl)
              .then(result => {
                setScannedResult(result.getText());
              })
              .catch(err => {
                 console.error("File scan error:", err);
                 setError('Could not decode barcode from the image. Please try a clearer image.');
              })
              .finally(() => setIsScanning(false));
          }
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.error(err);
        setError('Failed to read the image file.');
        setIsScanning(false);
      }
    }
  };
  
  return (
    <div className="flex flex-col gap-6">
      <div className="relative aspect-video bg-muted/20 rounded-lg overflow-hidden border-2 border-dashed border-border flex items-center justify-center">
        <video ref={videoRef} className={`w-full h-full object-cover ${isScanning ? '' : 'hidden'}`} />
        {!isScanning && (
            <div className="text-center text-muted-foreground p-4">
                <CameraIcon />
                <p className="mt-2">Camera is off. Press "Start Scan" to begin.</p>
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
                className="w-full flex-grow bg-input border border-border rounded-md px-3 py-2 focus:ring-primary focus:border-primary transition"
            >
                {devices.length > 0 ? devices.map(device => (
                    <option key={device.deviceId} value={device.deviceId}>{device.label || `Camera ${devices.indexOf(device) + 1}`}</option>
                )) : <option>No cameras found</option>}
            </select>
            <button
                onClick={() => isScanning ? stopScan() : startScan(selectedDevice)}
                disabled={!selectedDevice}
                className={`w-full sm:w-auto px-4 py-2 font-bold rounded-md transition duration-200 flex items-center justify-center gap-2 ${
                isScanning ? 'bg-destructive hover:bg-destructive/80' : 'bg-primary hover:bg-primary/80'
                } disabled:bg-muted-foreground disabled:cursor-not-allowed`}
            >
                {isScanning ? 'Stop Scan' : 'Start Scan'}
            </button>
        </div>
        <label className="relative w-full md:w-auto px-4 py-2 font-bold rounded-md transition duration-200 bg-secondary hover:bg-secondary/80 text-secondary-foreground text-center cursor-pointer">
            <span>Scan from Image</span>
            <input type="file" accept="image/*" onChange={handleFileScan} className="hidden" />
        </label>
      </div>

      {error && (
        <div className="bg-destructive/20 border border-destructive text-destructive-foreground px-4 py-3 rounded-md flex items-start gap-3">
            <ErrorIcon className="w-5 h-5 mt-1" />
            <p>{error}</p>
        </div>
      )}

      {scannedResult && (
        <div className="bg-muted/50 p-4 rounded-lg">
          <h3 className="text-lg font-bold text-primary">Scan Result</h3>
          <p className="text-foreground bg-background p-3 rounded-md break-words my-2">{scannedResult}</p>
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
        <label htmlFor="qr-input" className="block mb-2 text-sm font-medium text-muted-foreground">
          Enter URL or Text
        </label>
        <textarea
          id="qr-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={3}
          className="w-full bg-input border border-border rounded-md p-3 focus:ring-primary focus:border-primary transition"
          placeholder="e.g., https://google.com or your message here"
        />
      </div>
      
      {inputText && (
        <div className="bg-white p-6 rounded-lg shadow-lg" ref={qrRef}>
            <QRCode
              value={inputText}
              size={256}
              level={"H"}
              includeMargin={true}
            />
        </div>
      )}

      <button
        onClick={handleDownload}
        disabled={!inputText}
        className="w-full max-w-xs mt-4 px-6 py-3 font-bold rounded-md transition duration-200 bg-primary hover:bg-primary/80 text-primary-foreground disabled:bg-muted-foreground disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <DownloadIcon />
        Download QR Code
      </button>
    </div>
  );
}
