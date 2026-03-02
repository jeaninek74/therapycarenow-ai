import { Link, useLocation } from "wouter";
import { Heart, Menu, X, LayoutDashboard, Stethoscope, UserPlus, LogIn, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function NavBar() {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const links = [
    { href: "/demo", label: "Demo" },
    { href: "/directory", label: "Directory" },
    { href: "/find-therapist", label: "Find a Therapist" },
    { href: "/free-resources", label: "Free Help" },
    { href: "/benefits", label: "Benefits Wallet" },
    { href: "/ai-assistant", label: "AI Assistant" },
  ];

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out successfully.");
  };

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-40 shadow-sm">
      <div className="container flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg text-primary">
          <Heart className="w-5 h-5 fill-primary" />
          <span className="font-semibold">TherapyCareNow</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-5">
          {links.map((link) => (
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
          <Link
            href="/join-directory"
            className={`text-sm font-medium transition-colors flex items-center gap-1 ${
              location === "/join-directory" ? "text-primary" : "text-muted-foreground hover:text-primary"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            For Therapists
          </Link>
          <Link
            href="/clinician/login"
            className={`text-sm font-medium transition-colors flex items-center gap-1 ${
              location.startsWith("/clinician") ? "text-primary" : "text-muted-foreground hover:text-primary"
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            Clinician Portal
          </Link>
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
          {/* Auth buttons */}
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
        <div className="md:hidden border-t border-border bg-card px-4 py-3 flex flex-col gap-3">
          {links.map((link) => (
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
            <UserPlus className="w-4 h-4" /> For Therapists
          </Link>
          <Link href="/clinician/login" className="text-sm font-medium py-2 text-foreground hover:text-primary transition-colors flex items-center gap-2" onClick={() => setMenuOpen(false)}>
            <Stethoscope className="w-4 h-4" /> Clinician Portal
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
