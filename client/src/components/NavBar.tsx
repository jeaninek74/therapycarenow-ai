import { Link, useLocation } from "wouter";
import {
  Heart, Menu, X, LayoutDashboard, Stethoscope, UserPlus,
  LogIn, LogOut, User, ChevronDown, UserCheck, Brain, Search,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
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

export default function NavBar() {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [providerDropdownOpen, setProviderDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out successfully.");
  };

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
        <div className="hidden md:flex items-center gap-4 xl:gap-5">
          {/* Demo */}
          <Link
            href="/demo"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              location === "/demo" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Demo
          </Link>

          {/* Find a Provider dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProviderDropdownOpen((v) => !v)}
              className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary ${
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
                    Browse by state
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Other nav links */}
          {[
            { href: "/free-resources", label: "Free Help" },
            { href: "/benefits", label: "Benefits Wallet" },
            { href: "/ai-assistant", label: "Assistant" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location === link.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* For Providers */}
          <Link
            href="/join-directory"
            className={`text-sm font-medium transition-colors flex items-center gap-1 ${
              location === "/join-directory" ? "text-primary" : "text-muted-foreground hover:text-primary"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            For Providers
          </Link>

          {/* Admin links */}
          {user?.role === "admin" && (
            <>
              <Link
                href="/admin"
                className={`text-sm font-medium transition-colors flex items-center gap-1 ${
                  location === "/admin" ? "text-primary" : "text-muted-foreground hover:text-primary"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Admin
              </Link>
              <Link
                href="/admin/verification"
                className={`text-sm font-medium transition-colors flex items-center gap-1 ${
                  location === "/admin/verification" ? "text-primary" : "text-muted-foreground hover:text-primary"
                }`}
              >
                Verify Providers
              </Link>
            </>
          )}

          {/* Auth */}
          {user ? (
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border">
              <span className="text-xs text-muted-foreground flex items-center gap-1 max-w-[120px] truncate">
                <User className="w-3 h-3 shrink-0" />
                {user.name}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7 px-2"
                onClick={handleLogout}
              >
                <LogOut className="w-3 h-3 mr-1" /> Sign Out
              </Button>
            </div>
          ) : (
            <Link href="/login" className="ml-2">
              <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-7 px-3">
                <LogIn className="w-3 h-3 mr-1" /> Sign In
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-3 flex flex-col gap-1">
          <Link href="/demo" className="text-sm font-medium py-2 text-foreground hover:text-primary transition-colors" onClick={() => setMenuOpen(false)}>
            Demo
          </Link>

          {/* Provider types section */}
          <div className="py-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-0">Find a Provider</p>
            {PROVIDER_TYPES.map((pt) => (
              <Link
                key={pt.href}
                href={pt.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                <span className={`${pt.color}`}>{pt.icon}</span>
                {pt.label}
              </Link>
            ))}
            <Link href="/find-therapist" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
              <Search className="w-4 h-4" /> Search all providers
            </Link>
            <Link href="/directory" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
              <LayoutDashboard className="w-4 h-4" /> Browse by state
            </Link>
          </div>

          <div className="border-t border-border my-1" />

          {[
            { href: "/free-resources", label: "Free Help" },
            { href: "/benefits", label: "Benefits Wallet" },
            { href: "/ai-assistant", label: "Assistant" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium py-2 text-foreground hover:text-primary transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <Link href="/join-directory" className="text-sm font-medium py-2 text-foreground hover:text-primary transition-colors flex items-center gap-2" onClick={() => setMenuOpen(false)}>
            <UserPlus className="w-4 h-4" /> For Providers
          </Link>

          {user?.role === "admin" && (
            <>
              <Link href="/admin" className="text-sm font-medium py-2 text-foreground hover:text-primary transition-colors flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
              </Link>
              <Link href="/admin/verification" className="text-sm font-medium py-2 text-foreground hover:text-primary transition-colors" onClick={() => setMenuOpen(false)}>
                Verify Providers
              </Link>
            </>
          )}

          <div className="border-t border-border pt-2 mt-1">
            {user ? (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <User className="w-3 h-3" /> {user.name}
                </span>
                <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => { handleLogout(); setMenuOpen(false); }}>
                  <LogOut className="w-3 h-3 mr-1" /> Sign Out
                </Button>
              </div>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)}>
                <Button size="sm" className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs">
                  <LogIn className="w-3 h-3 mr-1" /> Sign In / Create Account
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
