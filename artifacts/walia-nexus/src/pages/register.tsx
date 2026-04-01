import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield } from "lucide-react";

const formSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function Register() {
  useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerMutation = useRegister();

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    registerMutation.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          login(data.token, data.user);
          window.location.href = "/workspace";
        },
        onError: (error) => {
          toast({
            title: "Initialization Failed",
            description: error.message || "Failed to create identity.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,176,0,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[500px] bg-secondary/5 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center justify-center w-16 h-16 bg-card border border-white/10 rounded-lg mb-6 shadow-[0_0_20px_rgba(255,176,0,0.1)] hover:border-secondary/50 transition-colors">
            <Shield className="w-8 h-8 text-secondary" />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Request Clearance</h1>
          <p className="text-muted-foreground font-mono">Provision a new operational identity.</p>
        </div>

        <div className="bg-card border border-white/10 p-8 shadow-2xl relative">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-secondary/50" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-secondary/50" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-secondary/50" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-secondary/50" />

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-mono text-xs text-muted-foreground uppercase">Email Designation</Label>
              <Input 
                id="email" 
                type="email" 
                autoComplete="email"
                placeholder="operator@domain.com"
                className="bg-background border-white/10 focus-visible:ring-secondary focus-visible:border-secondary font-mono"
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
                autoComplete="new-password"
                className="bg-background border-white/10 focus-visible:ring-secondary focus-visible:border-secondary font-mono"
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-xs text-destructive mt-1 font-mono">{form.formState.errors.password.message}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(255,176,0,0.3)]"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Provisioning...
                </>
              ) : (
                "Initialize"
              )}
            </Button>
          </form>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground font-mono">
          Clearance already active? <Link href="/login" className="text-secondary hover:text-secondary/80 underline underline-offset-4">Authenticate</Link>
        </div>
      </motion.div>
    </div>
  );
}
