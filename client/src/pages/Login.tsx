import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Heart } from "lucide-react";
import { Link } from "wouter";

export default function Login() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  // Get return path from query string
  const returnPath = (() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("return") || "/";
  })();

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      toast.success("Welcome back! You are now signed in.");
      navigate(returnPath);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      toast.success("Account created! Welcome to TherapyCareNow.");
      navigate(returnPath);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email: loginEmail, password: loginPassword });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirm) {
      toast.error("Passwords don't match.");
      return;
    }
    registerMutation.mutate({ name: regName, email: regEmail, password: regPassword });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-teal-700 hover:text-teal-800">
            <Heart className="w-8 h-8 fill-teal-600 text-teal-600" />
            <span className="text-2xl font-bold">TherapyCareNow</span>
          </Link>
          <p className="text-slate-500 mt-2 text-sm">Your mental health resource hub</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-center text-slate-800">Welcome</CardTitle>
            <CardDescription className="text-center">Sign in or create a free account</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Create Account</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Signing in…" : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="reg-name">Full Name</Label>
                    <Input
                      id="reg-name"
                      type="text"
                      placeholder="Jane Smith"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      required
                      autoComplete="name"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="you@example.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="At least 8 characters"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      minLength={8}
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="reg-confirm">Confirm Password</Label>
                    <Input
                      id="reg-confirm"
                      type="password"
                      placeholder="Repeat password"
                      value={regConfirm}
                      onChange={(e) => setRegConfirm(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Creating account…" : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <p className="text-center text-xs text-slate-400 mt-6">
              By continuing, you agree to our{" "}
              <a href="/terms" className="underline hover:text-teal-600">Terms of Service</a>{" "}
              and{" "}
              <a href="/privacy" className="underline hover:text-teal-600">Privacy Policy</a>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
