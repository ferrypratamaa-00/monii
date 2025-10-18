"use client";

import { Download, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface InstallPromptProps {
  className?: string;
}

export function InstallPrompt({ className }: InstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Detect device type
    const userAgent = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(userAgent));
    setIsAndroid(/Android/.test(userAgent));

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Check if already installed
    const checkInstalled = () => {
      if ('standalone' in window.navigator && (window.navigator as any).standalone) {
        // iOS PWA mode
        setIsInstallable(false);
      } else if (window.matchMedia('(display-mode: standalone)').matches) {
        // Android PWA mode
        setIsInstallable(false);
      } else {
        // Listen for install prompt
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      }
    };

    checkInstalled();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    // Reset the deferred prompt
    setDeferredPrompt(null);
    setIsInstallable(false);

    // Log the result
    console.log(`User response to install prompt: ${outcome}`);
  };

  const handleIOSInstall = () => {
    alert('Untuk menginstall di iOS:\n1. Tap tombol Share (⬆️)\n2. Pilih "Add to Home Screen"\n3. Tap "Add"');
  };

  const handleAndroidInstall = () => {
    alert('Untuk menginstall di Android:\n1. Tap menu (⋮) di browser\n2. Pilih "Add to Home screen"\n3. Tap "Add"');
  };

  // Don't show if not installable and not on mobile
  if (!isInstallable && !isIOS && !isAndroid) return null;

  return (
    <div className={className}>
      {isInstallable ? (
        <Button
          onClick={handleInstallClick}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90"
          size="sm"
        >
          <Download className="w-4 h-4" />
          Install App
        </Button>
      ) : isIOS ? (
        <Button
          onClick={handleIOSInstall}
          variant="outline"
          className="flex items-center gap-2"
          size="sm"
        >
          <Smartphone className="w-4 h-4" />
          Install (iOS)
        </Button>
      ) : isAndroid ? (
        <Button
          onClick={handleAndroidInstall}
          variant="outline"
          className="flex items-center gap-2"
          size="sm"
        >
          <Smartphone className="w-4 h-4" />
          Install (Android)
        </Button>
      ) : null}
    </div>
  );
}