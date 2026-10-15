'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';

interface QrCameraScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

export default function QrCameraScanner({ isOpen, onClose, onScanSuccess }: QrCameraScannerProps) {
  const [scannerStarted, setScannerStarted] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen || typeof window === 'undefined') {
      if (scannerRef.current && scannerStarted) {
        scannerRef.current.stop().catch(() => {}).finally(() => {
          setScannerStarted(false);
        });
      }
      return;
    }

    let isMounted = true;

    // Dynamically import browser-only library
    import('html5-qrcode')
      .then(({ Html5Qrcode }) => {
        if (!isMounted) return;

        const html5QrCode = new Html5Qrcode('qr-reader-container');
        scannerRef.current = html5QrCode;

        html5QrCode
          .start(
            { facingMode: 'environment' },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            (decodedText) => {
              onScanSuccess(decodedText);
              onClose();
            },
            () => {
              // frame drop
            }
          )
          .then(() => {
            if (isMounted) {
              setScannerStarted(true);
              setCameraError(null);
            }
          })
          .catch((err) => {
            console.warn('Camera stream error:', err);
            if (isMounted) {
              setCameraError('Camera access not granted or unavailable on this device. You can simulate scan below.');
              setScannerStarted(false);
            }
          });
      })
      .catch((err) => {
        console.warn('html5-qrcode dynamic import failed:', err);
        setCameraError('Scanner module failed to load in this environment.');
      });

    return () => {
      isMounted = false;
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="glass-panel p-6 rounded-2xl border border-slate-700 w-full max-w-md space-y-4 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">Live Camera QR / Barcode Scanner</h3>
        </div>

        <p className="text-xs text-slate-300">
          Point device camera at reagent bottle QR code. Works offline on any peri-urban Android mobile browser.
        </p>

        {/* Video stream container */}
        <div className="overflow-hidden rounded-xl border border-slate-700 bg-black min-h-[260px] flex items-center justify-center relative">
          <div id="qr-reader-container" className="w-full" />
          {cameraError && (
            <div className="absolute inset-0 p-4 bg-slate-900/95 flex flex-col items-center justify-center text-center">
              <Camera className="w-8 h-8 text-amber-400 mb-2 opacity-70" />
              <p className="text-xs text-slate-300 max-w-xs">{cameraError}</p>
              
              {/* Quick simulation buttons */}
              <div className="mt-4 flex flex-col gap-2 w-full max-w-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Simulate Scan:</span>
                <button
                  onClick={() => {
                    onScanSuccess('QR-GHSS-ETH-001');
                    onClose();
                  }}
                  className="p-2 rounded bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/50 text-rose-200 text-xs font-semibold text-left"
                >
                  Scan Ether Bottle (Critical Peroxides)
                </button>
                <button
                  onClick={() => {
                    onScanSuccess('QR-GHSS-HNO-002');
                    onClose();
                  }}
                  className="p-2 rounded bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/50 text-amber-200 text-xs font-semibold text-left"
                >
                  Scan Nitric Acid (Incompatibility Warning)
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Close Scanner
          </button>
        </div>
      </div>
    </div>
  );
}
