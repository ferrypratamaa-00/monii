"use client";

import { Award, Star, Target, Trophy, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GoalBadge {
  id: number;
  name: string;
  description: string;
  icon: string;
  earnedAt?: Date;
}

export type { GoalBadge };

const iconMap = {
  "🏆": Trophy,
  "⭐": Star,
  "🎯": Target,
  "⚡": Zap,
  "🏅": Award,
};

export function BadgeDisplay({
  badges,
  title = "Achievements",
}: {
  badges: GoalBadge[];
  title?: string;
}) {
  const earnedBadges = badges.filter((badge) => badge.earnedAt);
  const availableBadges = badges.filter((badge) => !badge.earnedAt);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {earnedBadges.length === 0 && availableBadges.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No badges available yet
          </p>
        ) : (
          <div className="space-y-4">
            {/* Earned Badges */}
            {earnedBadges.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3">
                  Earned ({earnedBadges.length})
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {earnedBadges.map((badge) => {
                    const IconComponent =
                      iconMap[badge.icon as keyof typeof iconMap] || Trophy;
                    return (
                      <div
                        key={badge.id}
                        className="flex flex-col items-center p-3 border rounded-lg bg-primary/5 border-primary/20"
                      >
                        <IconComponent className="h-8 w-8 text-primary mb-2" />
                        <h5 className="text-sm font-medium text-center">
                          {badge.name}
                        </h5>
                        <p className="text-xs text-muted-foreground text-center mt-1">
                          {badge.description}
                        </p>
                        {badge.earnedAt && (
                          <Badge variant="secondary" className="text-xs mt-2">
                            Earned
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Available Badges */}
            {availableBadges.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3">
                  Available ({availableBadges.length})
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableBadges.map((badge) => {
                    const IconComponent =
                      iconMap[badge.icon as keyof typeof iconMap] || Trophy;
                    return (
                      <div
                        key={badge.id}
                        className="flex flex-col items-center p-3 border rounded-lg opacity-60"
                      >
                        <IconComponent className="h-8 w-8 text-muted-foreground mb-2" />
                        <h5 className="text-sm font-medium text-center">
                          {badge.name}
                        </h5>
                        <p className="text-xs text-muted-foreground text-center mt-1">
                          {badge.description}
                        </p>
                        <Badge variant="outline" className="text-xs mt-2">
                          Locked
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
