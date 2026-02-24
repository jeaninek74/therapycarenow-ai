/**
 * VerificationBadge — shows provider verification status.
 * Addresses misrepresentation risk by clearly communicating
 * what "verified" means and what it does NOT guarantee.
 */
import { BadgeCheck, Clock, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type Status = "verified" | "pending" | "unverified" | "self_reported";

interface Props {
  status: Status;
  size?: "sm" | "md";
}

const CONFIG: Record<Status, { label: string; icon: React.ElementType; color: string; tooltip: string }> = {
  verified: {
    label: "NPI Verified",
    icon: BadgeCheck,
    color: "text-teal-700 bg-teal-50 border-teal-200",
    tooltip:
      "This provider's NPI number was verified against the CMS NPPES public registry at the time of listing. Verification confirms the NPI exists and matches the provider's name and specialty. It does not guarantee current licensure, availability, or fitness to practice. Always verify credentials independently before engaging a provider.",
  },
  pending: {
    label: "Verification Pending",
    icon: Clock,
    color: "text-amber-700 bg-amber-50 border-amber-200",
    tooltip:
      "This provider's credentials are currently being reviewed. Verification has not yet been completed.",
  },
  self_reported: {
    label: "Self-Reported",
    icon: AlertCircle,
    color: "text-slate-600 bg-slate-50 border-slate-200",
    tooltip:
      "This provider submitted their own information. NPI verification has not been completed. Verify credentials independently before engaging this provider.",
  },
  unverified: {
    label: "Unverified",
    icon: AlertCircle,
    color: "text-slate-500 bg-slate-50 border-slate-200",
    tooltip:
      "This listing has not been verified. Information may be incomplete or inaccurate. Verify credentials independently before engaging this provider.",
  },
};

export default function VerificationBadge({ status, size = "md" }: Props) {
  const config = CONFIG[status] ?? CONFIG.unverified;
  const Icon = config.icon;
  const sizeClass = size === "sm" ? "text-xs px-1.5 py-0.5 gap-1" : "text-xs px-2 py-1 gap-1.5";
  const iconSize = size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={`inline-flex items-center rounded-full border font-medium cursor-help ${sizeClass} ${config.color}`}
        >
          <Icon className={iconSize} />
          {config.label}
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs leading-relaxed">
        {config.tooltip}
      </TooltipContent>
    </Tooltip>
  );
}
