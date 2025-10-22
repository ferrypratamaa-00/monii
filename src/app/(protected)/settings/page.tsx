"use client";

import { Bell, Globe, Palette, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const settingsSections = [
  {
    title: "Notifications",
    description: "Manage your notification preferences and alerts",
    icon: Bell,
    href: "/settings/notifications",
    color: "text-blue-600",
  },
  {
    title: "Appearance",
    description: "Customize the look and feel of the app",
    icon: Palette,
    href: "/settings/appearance",
    color: "text-purple-600",
  },
  {
    title: "Account",
    description: "Update your account information and security settings",
    icon: User,
    href: "/settings/account",
    color: "text-green-600",
  },
  {
    title: "Language",
    description: "Change the language and regional settings",
    icon: Globe,
    href: "/settings/language",
    color: "text-orange-600",
  },
];

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account preferences and app settings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settingsSections.map((section) => (
            <Card
              key={section.title}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <section.icon className={`h-6 w-6 ${section.color}`} />
                  <CardTitle className="text-xl">{section.title}</CardTitle>
                </div>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={section.href}>
                  <Button variant="outline" className="w-full">
                    Configure {section.title.toLowerCase()}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
