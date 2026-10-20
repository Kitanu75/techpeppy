"use client";

import React from "react";
import { Code2, BrainCircuit, Database, Laptop, Zap, Layers, LucideIcon } from "lucide-react";

interface CommunityIconProps {
  slug?: string;
  className?: string;
  variant?: "plain" | "badge";
}

const iconMap: Record<string, { icon: LucideIcon; color: string; bg: string }> = {
  "software-architecture": {
    icon: Code2,
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200/60",
  },
  "ai-learning": {
    icon: BrainCircuit,
    color: "text-violet-700",
    bg: "bg-violet-50 border-violet-200/60",
  },
  "data-science": {
    icon: Database,
    color: "text-teal-700",
    bg: "bg-teal-50 border-teal-200/60",
  },
  "desk-setups": {
    icon: Laptop,
    color: "text-sky-700",
    bg: "bg-sky-50 border-sky-200/60",
  },
  "tech-news": {
    icon: Zap,
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200/60",
  },
};

export const CommunityIcon: React.FC<CommunityIconProps> = ({
  slug = "",
  className = "h-4 w-4",
  variant = "plain",
}) => {
  const meta = iconMap[slug] || {
    icon: Layers,
    color: "text-zinc-700",
    bg: "bg-zinc-100 border-zinc-200/80",
  };

  const IconComponent = meta.icon;

  if (variant === "badge") {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-xl border ${meta.bg} ${meta.color} p-2 shrink-0`}
      >
        <IconComponent className={className} />
      </div>
    );
  }

  return <IconComponent className={`${className} ${meta.color} shrink-0`} />;
};
