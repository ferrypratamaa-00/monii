"use client";

import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface NavigatorStandalone extends Navigator {
  standalone?: boolean;
}

interface InstallPromptProps {
  className?: string;
}

export function InstallPrompt({ className }: InstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
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
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Check if already installed
    const checkInstalled = () => {
      if (
        "standalone" in window.navigator &&
        (window.navigator as NavigatorStandalone).standalone
      ) {
        // iOS PWA mode
        setIsInstallable(false);
      } else if (window.matchMedia("(display-mode: standalone)").matches) {
        // Android PWA mode
        setIsInstallable(false);
      } else {
        // Listen for install prompt
        window.addEventListener(
          "beforeinstallprompt" as keyof WindowEventMap,
          handleBeforeInstallPrompt as EventListener,
        );
      }
    };

    checkInstalled();

    return () => {
      window.removeEventListener(
        "beforeinstallprompt" as keyof WindowEventMap,
        handleBeforeInstallPrompt as EventListener,
      );
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
    alert(
      'Untuk menginstall di iOS:\n1. Tap tombol Share (⬆️)\n2. Pilih "Add to Home Screen"\n3. Tap "Add"',
    );
  };

  const handleAndroidInstall = () => {
    alert(
      'Untuk menginstall di Android:\n1. Tap menu (⋮) di browser\n2. Pilih "Add to Home screen"\n3. Tap "Add"',
    );
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
          <Download className="w-6 h-6" />
        </Button>
      ) : isIOS ? (
        <Button
          onClick={handleIOSInstall}
          variant="outline"
          className="flex items-center gap-2"
          size="icon"
        >
          <Download className="w-6 h-6" />
        </Button>
      ) : isAndroid ? (
        <Button
          onClick={handleAndroidInstall}
          variant="outline"
          className="flex items-center gap-2"
          size="icon"
        >
          <Download className="w-6 h-6" />
        </Button>
      ) : null}
    </div>
  );
}
