"use client";

import { ArrowLeft, Palette } from "lucide-react";
import Link from "next/link";
import ThemeSelector from "@/components/ThemeSelector";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AppearanceSettingsPage() {
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
            <Palette className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold">Appearance</h1>
          </div>
          <p className="text-muted-foreground">
            Customize the look and feel of the app to match your preferences.
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Color Theme</p>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred color scheme
                  </p>
                </div>
                <ThemeSelector />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Toggle between light and dark themes
                  </p>
                </div>
                <ThemeSwitcher />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
