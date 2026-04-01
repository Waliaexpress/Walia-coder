import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Command } from "lucide-react";

const formSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const loginMutation = useLogin();

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    loginMutation.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          login(data.token, data.user);
          setLocation("/dashboard");
        },
        onError: (error) => {
          toast({
            title: "Authentication Failed",
            description: error.message || "Invalid credentials. Access denied.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,240,255,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center justify-center w-16 h-16 bg-card border border-white/10 rounded-lg mb-6 shadow-[0_0_20px_rgba(0,240,255,0.1)] hover:border-primary/50 transition-colors">
            <Command className="w-8 h-8 text-primary" />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Identify Node</h1>
          <p className="text-muted-foreground font-mono">Establish secure connection to Nexus.</p>
        </div>

        <div className="bg-card border border-white/10 p-8 shadow-2xl relative">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/50" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary/50" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary/50" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary/50" />

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-mono text-xs text-muted-foreground uppercase">Email Designation</Label>
              <Input 
                id="email" 
                type="email" 
                autoComplete="email"
                placeholder="operator@domain.com"
                className="bg-background border-white/10 focus-visible:ring-primary focus-visible:border-primary font-mono"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive mt-1 font-mono">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-mono text-xs text-muted-foreground uppercase">Authorization Cipher</Label>
              <Input 
                id="password" 
                type="password" 
                autoComplete="current-password"
                className="bg-background border-white/10 focus-visible:ring-primary focus-visible:border-primary font-mono"
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-xs text-destructive mt-1 font-mono">{form.formState.errors.password.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)]"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Authenticate"
              )}
            </Button>
          </form>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground font-mono">
          Unknown clearance? <Link href="/register" className="text-primary hover:text-primary/80 underline underline-offset-4">Request access</Link>
        </div>
      </motion.div>
    </div>
  );
}
