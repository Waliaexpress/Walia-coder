import { DashboardShell } from "@/components/layout/DashboardShell";
import { useAdminListUsers, useAdminDeleteUser } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Redirect } from "wouter";
import { getAdminListUsersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ShieldAlert, Loader2, UserMinus } from "lucide-react";

export default function Admin() {
  const { user } = useAuth();
  const { data: users, isLoading } = useAdminListUsers();
  const deleteUser = useAdminDeleteUser();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  if (user?.role !== "admin") {
    return <Redirect to="/dashboard" />;
  }

  const handleRevoke = (id: string, email: string) => {
    if (id === user?.id) {
      toast({ title: "Operation Denied", description: "Cannot terminate own access.", variant: "destructive" });
      return;
    }

    if (!confirm(`Revoke access for ${email}? This will terminate their session and delete associated data.`)) return;

    deleteUser.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getAdminListUsersQueryKey() });
          toast({ title: "Access Revoked", description: `${email} has been removed from the system.` });
        },
        onError: (err) => {
          toast({ title: "Operation Failed", description: err.message, variant: "destructive" });
        }
      }
    );
  };

  return (
    <DashboardShell>
      <div className="mb-8 flex items-center gap-3">
        <ShieldAlert className="w-8 h-8 text-destructive" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-destructive">Admin Console</h1>
          <p className="text-muted-foreground font-mono mt-1">High-clearance personnel access management.</p>
        </div>
      </div>

      <div className="bg-card border border-destructive/20 rounded-lg overflow-hidden shadow-[0_0_20px_rgba(255,0,0,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-mono">
            <thead className="bg-background/50 border-b border-white/10 uppercase text-xs tracking-wider text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Identifier</th>
                <th className="px-6 py-4 font-medium">Designation (Email)</th>
                <th className="px-6 py-4 font-medium">Clearance Level</th>
                <th className="px-6 py-4 font-medium">Provisioned</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 opacity-50" />
                    Querying personnel records...
                  </td>
                </tr>
              ) : users?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No records found.
                  </td>
                </tr>
              ) : (
                users?.map(u => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-muted-foreground">{u.id.split('-')[0]}</td>
                    <td className="px-6 py-4 font-medium text-foreground">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-sm text-xs ${
                        u.role === 'admin' ? 'bg-destructive/20 text-destructive border border-destructive/30' :
                        'bg-white/10 text-white/70 border border-white/10'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.id !== user?.id && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleRevoke(u.id, u.email)}
                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground font-bold tracking-wider uppercase"
                          disabled={deleteUser.isPending}
                        >
                          <UserMinus className="w-4 h-4 mr-2" />
                          Revoke
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  );
}
