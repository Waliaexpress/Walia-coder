import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useGetMySubscription, useCreateSubscription } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMySubscriptionQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionPlan } from "@workspace/api-client-react";

export default function Subscription() {
  const { data: subscription, isLoading } = useGetMySubscription();
  const createSubscription = useCreateSubscription();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleUpgrade = (plan: SubscriptionPlan) => {
    createSubscription.mutate(
      { data: { plan } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetMySubscriptionQueryKey() });
          toast({ title: `Upgraded to ${plan.toUpperCase()}` });
        },
        onError: (err) => {
          toast({ title: "Upgrade Failed", description: err.message, variant: "destructive" });
        }
      }
    );
  };

  const currentPlan = subscription?.plan || 'free';

  const plans = [
    {
      id: "free" as SubscriptionPlan,
      name: "Free",
      price: "$0/mo",
      desc: "Basic operational capacity for single instances.",
      features: ["1 Active Project", "Basic Telemetry", "Community Support", "Standard Nodes"]
    },
    {
      id: "pro" as SubscriptionPlan,
      name: "Pro",
      price: "$49/mo",
      desc: "Advanced capabilities for dedicated engineering teams.",
      features: ["10 Active Projects", "Advanced Diagnostics", "Priority Support", "Custom Domains", "Performance Nodes"],
      highlight: true
    },
    {
      id: "enterprise" as SubscriptionPlan,
      name: "Enterprise",
      price: "$299/mo",
      desc: "Unrestricted power for global deployments.",
      features: ["Unlimited Projects", "Dedicated Clusters", "SLA & 24/7 Support", "On-Premise Options", "Bare-metal Access"]
    }
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Resource Allocation</h1>
        <p className="text-muted-foreground font-mono mt-1">Manage platform quotas and capabilities.</p>
      </div>

      {!isLoading && subscription && (
        <Card className="mb-12 bg-card border-primary/20 shadow-[0_0_20px_rgba(0,240,255,0.05)]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  Current Allocation
                  <Badge variant="outline" className="font-mono ml-2 border-primary/50 text-primary uppercase">
                    {subscription.status}
                  </Badge>
                </CardTitle>
                <CardDescription className="font-mono mt-1">
                  ID: {subscription.id.split('-')[0]}
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary uppercase tracking-wider">{subscription.plan}</div>
                <div className="text-xs text-muted-foreground font-mono mt-1">Tier Level</div>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      <h2 className="text-2xl font-bold tracking-tight mb-6">Available Tiers</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const isPending = createSubscription.isPending && createSubscription.variables?.data.plan === plan.id;

          return (
            <Card 
              key={plan.id} 
              className={`flex flex-col bg-card border-white/10 relative overflow-hidden ${
                plan.highlight ? 'border-secondary/50 shadow-[0_0_20px_rgba(255,176,0,0.1)]' : ''
              } ${isCurrent ? 'bg-primary/5 border-primary' : ''}`}
            >
              {plan.highlight && !isCurrent && (
                <div className="absolute top-0 right-0 bg-secondary text-secondary-foreground text-[10px] font-bold px-3 py-1 font-mono uppercase tracking-wider rounded-bl-sm">
                  Recommended
                </div>
              )}
              {isCurrent && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 font-mono uppercase tracking-wider rounded-bl-sm flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Active
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold mt-2 font-mono tracking-tighter">{plan.price}</div>
                <CardDescription className="h-10 mt-2">{plan.desc}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground font-mono">
                      <Zap className={`w-4 h-4 mt-0.5 shrink-0 ${plan.highlight ? 'text-secondary' : 'text-primary'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className={`w-full font-bold uppercase tracking-wider ${
                    isCurrent ? 'bg-primary/20 text-primary cursor-default hover:bg-primary/20' : 
                    plan.highlight ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-[0_0_15px_rgba(255,176,0,0.3)]' :
                    'bg-white/10 hover:bg-white/20'
                  }`}
                  disabled={isCurrent || createSubscription.isPending}
                  onClick={() => handleUpgrade(plan.id)}
                >
                  {isCurrent ? "Current Tier" : isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Request Upgrade"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
