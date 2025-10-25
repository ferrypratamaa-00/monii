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
import { useLanguage } from "@/components/LanguageProvider";

export default function SettingsPage() {
  const { t } = useLanguage();

  const settingsSections = [
    {
      title: t("settings.notifications"),
      description: t("settings.notificationsDescription"),
      icon: Bell,
      href: "/settings/notifications",
      color: "text-blue-600",
    },
    {
      title: t("settings.appearance"),
      description: t("settings.appearanceDescription"),
      icon: Palette,
      href: "/settings/appearance",
      color: "text-purple-600",
    },
    {
      title: t("settings.language"),
      description: t("settings.languageDescription"),
      icon: Globe,
      href: "/settings/language",
      color: "text-orange-600",
    },
    {
      title: t("settings.account"),
      description: t("settings.accountDescription"),
      icon: User,
      href: "/settings/account",
      color: "text-green-600",
    },
  ];
  return (
    <div className="container mx-auto py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{t("settings.pageTitle")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("settings.pageDescription")}
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
                    {t("settings.configure")} {section.title.toLowerCase()}
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
