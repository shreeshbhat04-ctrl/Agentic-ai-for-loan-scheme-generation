import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { generateCaptcha } from "@/lib/utils";

interface CaptchaInputProps {
  onVerify: (isValid: boolean) => void;
}

export function CaptchaInput({ onVerify }: CaptchaInputProps) {
  const [captcha, setCaptcha] = useState("");
  const [userInput, setUserInput] = useState("");

  const refreshCaptcha = useCallback(() => {
    setCaptcha(generateCaptcha(6));
    setUserInput("");
    onVerify(false);
  }, [onVerify]);

  useEffect(() => {
    refreshCaptcha();
  }, []);

  useEffect(() => {
    onVerify(userInput.toLowerCase() === captcha.toLowerCase() && userInput !== "");
  }, [userInput, captcha, onVerify]);

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">Enter CAPTCHA</label>
      <div className="flex items-center gap-3">
        {/* CAPTCHA Display */}
        <div className="relative flex-1 max-w-[180px]">
          <div 
            className="h-12 rounded-lg bg-muted flex items-center justify-center select-none"
            style={{
              background: `repeating-linear-gradient(
                45deg,
                hsl(var(--muted)),
                hsl(var(--muted)) 10px,
                hsl(var(--muted-foreground) / 0.05) 10px,
                hsl(var(--muted-foreground) / 0.05) 20px
              )`,
            }}
          >
            <span 
              className="text-xl font-bold tracking-[0.3em] text-foreground"
              style={{
                fontFamily: "monospace",
                textShadow: "1px 1px 0 hsl(var(--background)), -1px -1px 0 hsl(var(--muted-foreground))",
                transform: "skewX(-5deg)",
              }}
            >
              {captcha}
            </span>
          </div>
          {/* Noise overlay for CAPTCHA */}
          <div 
            className="absolute inset-0 rounded-lg pointer-events-none opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' /%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Refresh Button */}
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={refreshCaptcha}
          className="shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>

        {/* User Input */}
        <Input
          type="text"
          placeholder="Enter code"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          maxLength={6}
          className="flex-1"
        />
      </div>
    </div>
  );
}
