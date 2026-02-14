import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  FileText,
  CreditCard,
  HelpCircle,
  RefreshCw,
  Loader2,
  CheckCircle,
  Info,
  Upload,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { sendChatMessage, resetConversation } from "@/lib/api/chat";
import { verifySalaryDocument } from "@/lib/api/documents";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const quickActions = [
  { icon: CreditCard, label: "Check loan eligibility", action: "Check my eligibility for a personal loan" },
  { icon: FileText, label: "Required documents", action: "What documents do I need for a home loan?" },
  { icon: HelpCircle, label: "EMI query", action: "How is EMI calculated?" },
  { icon: Sparkles, label: "Best loan for me", action: "Which loan product is best for my needs?" },
];

export default function AIAssistant() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! 👋 I'm your FinTrust AI Assistant, here to help you with loan-related queries.\n\nI can help you with:\n• Checking loan eligibility\n• Understanding EMI calculations\n• Document requirements\n• Finding the right loan product\n• Government schemes and subsidies\n\nHow can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Check authentication
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication Required",
        description: "Please login to use the AI Assistant",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await sendChatMessage(user.custId, content.trim());
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Sorry, I encountered an error: ${error.message || 'Unable to process your request. Please try again.'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication Required",
        description: "Please login to upload documents",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadedFile(file);

    try {
      const result = await verifySalaryDocument(file);
      
      if (result.status === 'verified' && result.monthly_salary) {
        const message = `I've uploaded my salary document. The verified monthly salary is ₹${result.monthly_salary.toLocaleString('en-IN')}.`;
        await handleSendMessage(message);
      } else {
        toast({
          title: "Document Verification",
          description: result.error || "Could not verify salary from document",
          variant: result.status === 'failed' ? "destructive" : "default",
        });
      }
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload document",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadedFile(null);
    }
  };

  const handleQuickAction = (action: string) => {
    handleSendMessage(action);
  };

  const handleReset = async () => {
    if (!isAuthenticated || !user) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: "Hello! 👋 I'm your FinTrust AI Assistant. How can I help you today?",
          timestamp: new Date(),
        },
      ]);
      return;
    }

    try {
      await resetConversation(user.custId);
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: "Hello! 👋 I'm your FinTrust AI Assistant. How can I help you today?",
          timestamp: new Date(),
        },
      ]);
      toast({
        title: "Conversation Reset",
        description: "Your conversation has been reset",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to reset conversation",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20 pb-4 flex flex-col">
        <div className="container mx-auto px-4 flex-1 flex flex-col max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-6"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              AI Loan Assistant
            </h1>
            <p className="text-muted-foreground text-sm">
              Get instant answers about loans, eligibility, and more
            </p>
          </motion.div>

          {/* Chat Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1 flex flex-col bg-card rounded-2xl border border-border shadow-soft overflow-hidden"
          >
            {/* Connection Status */}
            {isAuthenticated ? (
              <div className="bg-success/10 border-b border-success/20 px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-success">
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    Connected to AI Assistant as <strong>{user.name}</strong> ({user.custId})
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-warning/10 border-b border-warning/20 px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-warning">
                  <Info className="w-4 h-4" />
                  <span>
                    Please <a href="/login" className="underline font-medium">login</a> to use the AI Assistant
                  </span>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex items-start gap-3 ${
                      message.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-secondary text-secondary-foreground rounded-tl-sm"
                      }`}
                    >
                      <div 
                        className="text-sm whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{
                          __html: message.content
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\n/g, '<br>')
                        }}
                      />
                      <p
                        className={`text-xs mt-2 ${
                          message.role === "user"
                            ? "text-primary-foreground/60"
                            : "text-muted-foreground"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                    <Bot className="w-4 h-4 text-secondary-foreground" />
                  </div>
                  <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length <= 2 && (
              <div className="px-4 py-3 border-t border-border bg-secondary/30">
                <p className="text-xs text-muted-foreground mb-2">Quick actions:</p>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action) => (
                    <Button
                      key={action.label}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction(action.action)}
                      className="text-xs"
                    >
                      <action.icon className="w-3 h-3 mr-1" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-card">
              {/* File Upload Preview */}
              {uploadedFile && (
                <div className="mb-3 flex items-center gap-2 p-2 bg-secondary rounded-lg">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground flex-1 truncate">{uploadedFile.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setUploadedFile(null)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (uploadedFile) {
                    handleFileUpload(uploadedFile);
                  } else {
                    handleSendMessage(inputValue);
                  }
                }}
                className="flex gap-3"
              >
                <div className="flex-1 relative">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={isAuthenticated ? "Type your question here..." : "Please login to chat"}
                    className="pr-10"
                    disabled={isTyping || !isAuthenticated}
                  />
                  <label className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer">
                    <Upload className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file);
                        }
                      }}
                      disabled={isTyping || !isAuthenticated || isUploading}
                    />
                  </label>
                </div>
                <Button 
                  type="submit" 
                  disabled={(!inputValue.trim() && !uploadedFile) || isTyping || !isAuthenticated || isUploading}
                >
                  {isTyping || isUploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleReset}
                  title="Reset conversation"
                  disabled={!isAuthenticated}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>

          {/* Disclaimer */}
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground">
              This AI assistant provides general information only. Final loan decisions are subject to verification and approval.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
