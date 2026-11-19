import { useState, useEffect } from "react";
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
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email: loginEmail, password: loginPassword });
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
            <CardDescription className="text-center">Administrator sign in. Visitors do not need an account.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-1 mb-6">
                <TabsTrigger value="login">Sign In</TabsTrigger>
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
