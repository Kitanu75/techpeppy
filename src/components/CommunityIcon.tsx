"use client";

import React from "react";
import {
  LayoutGrid,
  Code2,
  Cpu,
  Database,
  Monitor,
  Newspaper,
  Layers,
  LucideIcon,
} from "lucide-react";

interface CommunityIconProps {
  slug?: string;
  className?: string;
}

const iconMap: Record<string, LucideIcon> = {
  all: LayoutGrid,
  "software-architecture": Code2,
  "ai-learning": Cpu,
  "data-science": Database,
  "desk-setups": Monitor,
  "tech-news": Newspaper,
};

export const CommunityIcon: React.FC<CommunityIconProps> = ({
  slug = "all",
  className = "h-3.5 w-3.5",
}) => {
  const IconComponent = iconMap[slug] || Layers;
  return <IconComponent className={`${className} shrink-0`} />;
};
