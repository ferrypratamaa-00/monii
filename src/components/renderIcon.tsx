import * as LucideIcons from "lucide-react";

const renderIcon = (iconName?: string | null) => {
  if (!iconName) {
    return (
      <span className="h-4 w-4 flex items-center justify-center text-muted-foreground">
        •
      </span>
    );
  }
  const IconComponent = (LucideIcons as any)[iconName];
  return IconComponent ? (
    <IconComponent className="h-4 w-4" />
  ) : (
    <span className="h-4 w-4 flex items-center justify-center text-muted-foreground" />
  );
};

export default renderIcon;
