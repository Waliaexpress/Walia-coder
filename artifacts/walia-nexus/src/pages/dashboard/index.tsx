import { Link, Redirect } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/auth";
import { useGetProjectsSummary, useListProjects } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Server, Box, Globe, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: summary, isLoading: isLoadingSummary } = useGetProjectsSummary();
  const { data: projects, isLoading: isLoadingProjects } = useListProjects();

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground font-mono mt-1">System status and operational metrics.</p>
        </div>
        <Link href="/dashboard/projects">
          <Button className="bg-primary/20 text-primary border border-primary hover:bg-primary hover:text-primary-foreground shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card className="bg-card border-white/10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Systems</CardTitle>
            <Box className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{isLoadingSummary ? '-' : summary?.total || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-card border-white/10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Live Nodes</CardTitle>
            <Globe className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{isLoadingSummary ? '-' : summary?.live || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Building</CardTitle>
            <Activity className="w-4 h-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">{isLoadingSummary ? '-' : summary?.building || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-white/10 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Private Vaults</CardTitle>
            <Server className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{isLoadingSummary ? '-' : summary?.private || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <div>
        <h2 className="text-xl font-bold mb-4">Recent Deployments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoadingProjects ? (
            <div className="col-span-2 text-center py-12 text-muted-foreground font-mono">Scanning nodes...</div>
          ) : projects?.length === 0 ? (
            <div className="col-span-2 text-center py-12 bg-card border border-white/10 rounded-lg flex flex-col items-center">
              <Server className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <div className="text-lg font-medium mb-1">No systems deployed</div>
              <p className="text-sm text-muted-foreground mb-4">Initialize your first project to begin telemetry.</p>
              <Link href="/dashboard/projects">
                <Button variant="outline">Initialize Project</Button>
              </Link>
            </div>
          ) : (
            projects?.slice(0, 4).map(p => (
              <Card key={p.id} className="bg-card border-white/10">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {p.title}
                    </CardTitle>
                    <span className={`text-xs px-2 py-0.5 rounded-sm font-mono uppercase ${
                      p.status === 'live' ? 'bg-green-500/20 text-green-500 border border-green-500/30' :
                      p.status === 'building' ? 'bg-secondary/20 text-secondary border border-secondary/30' :
                      'bg-white/10 text-white/70 border border-white/20'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground font-mono">
                    ID: {p.id.split('-')[0]}
                    {p.stack && <><br/>Stack: <span className="text-primary/80">{p.stack}</span></>}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
