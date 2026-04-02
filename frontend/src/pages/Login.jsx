import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Wallet, LogIn, User, Lock, Mail, UserPlus } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const { login, register, connectWallet } = useAuth();
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (isRegistering) {
      const res = await register(name, email, password);
      if (res.success) {
        toast.success("Registration successful! Please login.");
        setIsRegistering(false);
      } else {
        toast.error(res.message);
      }
    } else {
      const res = await login(email, password);
      if (res.success) {
        toast.success("Login successful!");
        navigate("/");
      } else {
        toast.error(res.message);
      }
    }
    setLoading(false);
  };

  const handleWeb3Login = async () => {
    const address = await connectWallet();
    if (address) {
      toast.success("Wallet connected!");
      navigate("/");
    }
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center animate-in zoom-in-95 duration-300">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border bg-card shadow-2xl">
        <div className="p-8 pb-0 text-center space-y-2">
          <h2 className="text-3xl font-black tracking-tighter">
            {isRegistering ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-sm text-muted-foreground font-medium">
            {isRegistering ? "Join the future of decentralized voting." : "Log in to access your secure ballot."}
          </p>
        </div>

        <div className="p-8">
          <div className="grid gap-6">
            {!isRegistering && (
              <>
                <button
                  onClick={handleWeb3Login}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-primary/20 bg-primary/5 py-4 transition-all hover:bg-primary/10 hover:border-primary/40 font-black text-primary active:scale-[0.98]"
                >
                  <Wallet className="h-5 w-5" />
                  Connect with MetaMask
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase">
                    <span className="bg-card px-4 text-muted-foreground font-black tracking-widest">Or Web2 Auth</span>
                  </div>
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className="grid gap-5 text-sm font-bold">
              {isRegistering && (
                <div className="grid gap-2">
                  <label htmlFor="name">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="flex h-11 w-full rounded-xl border border-input bg-background pl-12 pr-4 transition-all focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="grid gap-2">
                <label htmlFor="email">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex h-11 w-full rounded-xl border border-input bg-background pl-12 pr-4 transition-all focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label htmlFor="password">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="flex h-11 w-full rounded-xl border border-input bg-background pl-12 pr-4 transition-all focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-black text-white transition-all hover:bg-primary/90 disabled:opacity-50 active:scale-[0.98] shadow-lg shadow-primary/20"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin border-2 border-white border-t-transparent rounded-full" />
                ) : isRegistering ? (
                  <>
                    <UserPlus className="h-5 w-5" />
                    Create Account
                  </>
                ) : (
                  <>
                    <LogIn className="h-5 w-5" />
                    Sign In
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground font-medium">
            {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
            <button 
              onClick={() => setIsRegistering(!isRegistering)}
              className="font-black text-primary hover:underline underline-offset-4"
            >
              {isRegistering ? "Login instead" : "Sign up now"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
