"use client";

import { ArrowLeft, Globe } from "lucide-react";
import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LanguageSettingsPage() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Settings
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Globe className="h-8 w-8 text-orange-600" />
            <h1 className="text-3xl font-bold">Language</h1>
          </div>
          <p className="text-muted-foreground">
            Change the language and regional settings for the app.
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Language Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">App Language</p>
                  <p className="text-sm text-muted-foreground">
                    Select your preferred language for the interface
                  </p>
                </div>
                <LanguageSwitcher />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
