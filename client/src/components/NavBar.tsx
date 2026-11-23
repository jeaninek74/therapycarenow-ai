import { Link, useLocation } from "wouter";
import {
  Heart, Menu, X, LayoutDashboard, Stethoscope, UserPlus,
  LogIn, LogOut, User, ChevronDown, UserCheck, Brain, Search,
  Home, PlayCircle, HandHeart, Users, Medal, Building2, Briefcase, ShieldCheck,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const PROVIDER_TYPES = [
  {
    href: "/therapists",
    label: "Therapists",
    icon: <UserCheck className="w-4 h-4" />,
    color: "text-[oklch(0.45_0.18_200)]",
    bg: "bg-[oklch(0.55_0.18_200)]/10",
    description: "Licensed counselors · Talk therapy · CBT, DBT, EMDR",
  },
  {
    href: "/psychiatrists",
    label: "Psychiatrists",
    icon: <Stethoscope className="w-4 h-4" />,
    color: "text-[oklch(0.45_0.18_30)]",
    bg: "bg-[oklch(0.55_0.18_30)]/10",
    description: "MD/DO/PMHNP · Diagnosis · Medication management",
  },
  {
    href: "/psychologists",
    label: "Psychologists",
    icon: <Brain className="w-4 h-4" />,
    color: "text-[oklch(0.45_0.18_280)]",
    bg: "bg-[oklch(0.55_0.18_280)]/10",
    description: "PhD/PsyD · Psychological testing · Advanced therapy",
  },
];

const RESOURCE_LINKS = [
  { href: "/free-resources", label: "Free and Low-Cost Help", description: "Clinics, hotlines and sliding-scale care", icon: HandHeart, tint: "bg-emerald-100 text-emerald-700" },
  { href: "/group-therapy", label: "Group Therapy", description: "Support groups near you or online", icon: Users, tint: "bg-sky-100 text-sky-700" },
  { href: "/veterans", label: "Veterans", description: "VA clinics, Vet Centers and crisis support", icon: Medal, tint: "bg-amber-100 text-amber-700" },
  { href: "/programs", label: "Medi-Cal (Medicaid) and Hospital Programs", description: "County programs and psychiatric hospitals", icon: Building2, tint: "bg-rose-100 text-rose-700" },
  { href: "/eap", label: "Employee Assistance Program", description: "Free counseling through your employer", icon: Briefcase, tint: "bg-violet-100 text-violet-700" },
  { href: "/benefits", label: "Find Care by Insurance", description: "See which providers take your plan", icon: ShieldCheck, tint: "bg-teal-100 text-teal-700" },
];

export default function NavBar() {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [providerDropdownOpen, setProviderDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);


  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProviderDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isProviderActive =
    location === "/find-therapist" ||
    location === "/therapists" ||
    location === "/psychiatrists" ||
    location === "/psychologists" ||
    location === "/directory";

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-40 shadow-sm">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg text-primary shrink-0">
          <Heart className="w-5 h-5 fill-primary" />
          <span className="font-semibold hidden sm:inline">TherapyCareNow</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden 2xl:flex items-center gap-5">
          <Link
            href="/"
            className={`whitespace-nowrap text-sm font-medium transition-colors hover:text-primary ${
              location === "/" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Home
          </Link>
          {/* Demo */}
          <a
            href="/#demo-video"
            className="whitespace-nowrap text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
          >
            Demo
          </a>

          {/* Find a Provider dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProviderDropdownOpen((v) => !v)}
              className={`whitespace-nowrap flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary ${
                isProviderActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              Find a Provider
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${providerDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {providerDropdownOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50">
                <div className="p-2">
                  {PROVIDER_TYPES.map((pt) => (
                    <Link
                      key={pt.href}
                      href={pt.href}
                      onClick={() => setProviderDropdownOpen(false)}
                      className={`flex items-start gap-3 p-3 rounded-xl hover:bg-muted/60 transition-colors group`}
                    >
                      <div className={`w-8 h-8 rounded-lg ${pt.bg} ${pt.color} flex items-center justify-center shrink-0 mt-0.5`}>
                        {pt.icon}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${pt.color} group-hover:underline`}>{pt.label}</p>
                        <p className="text-xs text-muted-foreground leading-snug">{pt.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="border-t border-border p-2">
                  <Link
                    href="/find-therapist"
                    onClick={() => setProviderDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-muted/60 transition-colors"
                  >
                    <Search className="w-4 h-4 text-primary" />
                    Search all providers
                  </Link>
                  <Link
                    href="/directory"
                    onClick={() => setProviderDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-muted/60 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-primary" />
                    Browse by county
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Other nav links */}
          {[
            { href: "/free-resources", label: "Free and Low-Cost Help" },
            { href: "/group-therapy", label: "Group Therapy" },
            { href: "/veterans", label: "Veterans" },
            { href: "/programs", label: "Medi-Cal (Medicaid) and Hospital Programs" },
            { href: "/eap", label: "Employee Assistance Program" },
            { href: "/benefits", label: "Find Care by Insurance" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`whitespace-nowrap text-sm font-medium transition-colors hover:text-primary ${
                location === link.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Admin links */}
          

          {/* Auth */}
          
        </div>

        {/* Mobile menu toggle */}
        <button
          className="2xl:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="2xl:hidden border-t border-border bg-card px-4 py-4 flex flex-col gap-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl border border-border p-3 hover:border-primary/40 hover:bg-primary/5 transition-colors">
              <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Home className="w-5 h-5" /></span>
              <span className="text-sm font-semibold text-foreground">Home</span>
            </Link>
            <a href="/#demo-video" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl border border-border p-3 hover:border-primary/40 hover:bg-primary/5 transition-colors">
              <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><PlayCircle className="w-5 h-5" /></span>
              <span className="text-sm font-semibold text-foreground">Watch the demo</span>
            </a>
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Find a Provider</p>
            <div className="grid sm:grid-cols-3 gap-3">
              {PROVIDER_TYPES.map((pt) => (
                <Link
                  key={pt.href}
                  href={pt.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-start gap-3 rounded-xl border border-border p-3 hover:border-primary/40 hover:bg-primary/5 transition-colors"
                >
                  <span className={`w-9 h-9 rounded-lg ${pt.bg} ${pt.color} flex items-center justify-center flex-shrink-0`}>{pt.icon}</span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">{pt.label}</span>
                    <span className="block text-xs text-muted-foreground">{pt.description}</span>
                  </span>
                </Link>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <Link href="/find-therapist" onClick={() => setMenuOpen(false)} className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity">
                <Search className="w-4 h-4" /> Search all providers
              </Link>
              <Link href="/directory" onClick={() => setMenuOpen(false)} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:border-primary/40 transition-colors">
                <LayoutDashboard className="w-4 h-4" /> Browse by county
              </Link>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Help and Programs</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {RESOURCE_LINKS.map(({ href, label, description, icon: Icon, tint }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-start gap-3 rounded-xl border p-3 transition-colors hover:border-primary/40 hover:bg-primary/5 ${
                    location === href ? "border-primary/50 bg-primary/5" : "border-border"
                  }`}
                >
                  <span className={`w-9 h-9 rounded-lg ${tint} flex items-center justify-center flex-shrink-0`}><Icon className="w-5 h-5" /></span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">{label}</span>
                    <span className="block text-xs text-muted-foreground">{description}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
