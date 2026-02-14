import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Lock, ArrowRight, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CaptchaInput } from "@/components/CaptchaInput";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  
  const [customerId, setCustomerId] = useState("");
  const [password, setPassword] = useState("");
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!customerId.trim()) {
      toast({
        title: "Customer ID Required",
        description: "Please enter your Customer ID",
        variant: "destructive",
      });
      return;
    }

    if (!password) {
      toast({
        title: "Password Required",
        description: "Please enter your password",
        variant: "destructive",
      });
      return;
    }

    if (!isCaptchaValid) {
      toast({
        title: "Invalid CAPTCHA",
        description: "Please enter the correct CAPTCHA",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await login(customerId.trim(), password);
      toast({
        title: "Login Successful",
        description: "Welcome back to FinTrust!",
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="min-h-screen flex items-center justify-center py-24">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="animated-blob w-96 h-96 bg-primary/10 top-20 -left-48" />
          <div className="animated-blob w-80 h-80 bg-accent/10 bottom-20 right-20" />
        </div>

        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-card rounded-2xl border border-border shadow-large p-8"
            >
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Customer Login
                </h1>
                <p className="text-muted-foreground text-sm">
                  Enter your credentials to access your account
                </p>
              </div>

              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
                onSubmit={handleLogin}
              >
                {/* Customer ID */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Customer ID</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Enter your Customer ID (e.g., CUST-1234)"
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value.toUpperCase())}
                      className="pl-12"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* CAPTCHA */}
                <CaptchaInput onVerify={setIsCaptchaValid} />

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      Login
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>

                {/* Help Text */}
                <p className="text-center text-sm text-muted-foreground">
                  New customer?{" "}
                  <a href="#" className="text-primary font-medium hover:underline">
                    Apply for a loan
                  </a>
                </p>
              </motion.form>
            </motion.div>

            {/* Security Notice */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 text-center"
            >
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>Your data is protected with bank-grade encryption</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
