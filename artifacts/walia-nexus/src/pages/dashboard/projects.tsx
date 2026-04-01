import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useListProjects, useCreateProject, useDeleteProject } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListProjectsQueryKey, getGetProjectsSummaryQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Loader2, FolderPlus, TerminalSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProjectStatus } from "@workspace/api-client-react";

export default function Projects() {
  const { data: projects, isLoading } = useListProjects();
  const createProject = useCreateProject();
  const deleteProject = useDeleteProject();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newStack, setNewStack] = useState("");
  const [newStatus, setNewStatus] = useState<ProjectStatus>("building");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    createProject.mutate(
      {
        data: {
          title: newTitle,
          stack: newStack,
          status: newStatus,
        }
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetProjectsSummaryQueryKey() });
          setIsCreateOpen(false);
          setNewTitle("");
          setNewStack("");
          setNewStatus("building");
          toast({ title: "Project Initialized" });
        },
        onError: (err) => {
          toast({ title: "Failed", description: err.message, variant: "destructive" });
        }
      }
    );
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to terminate this project? This action cannot be reversed.")) return;

    deleteProject.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetProjectsSummaryQueryKey() });
          toast({ title: "Project Terminated" });
        },
        onError: (err) => {
          toast({ title: "Failed", description: err.message, variant: "destructive" });
        }
      }
    );
  };

  return (
    <DashboardLayout>
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Active Systems</h1>
          <p className="text-muted-foreground font-mono mt-1">Manage project deployments and states.</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary/10 text-primary border border-primary hover:bg-primary hover:text-primary-foreground">
              <FolderPlus className="w-4 h-4 mr-2" />
              Initialize Project
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>New Deployment</DialogTitle>
              <DialogDescription className="font-mono text-xs">
                Configure parameters for the new system architecture.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="font-mono text-xs uppercase text-muted-foreground">Project Designation</Label>
                <Input
                  id="title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Nexus Core"
                  className="bg-background border-white/10"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stack" className="font-mono text-xs uppercase text-muted-foreground">Tech Stack</Label>
                <Input
                  id="stack"
                  value={newStack}
                  onChange={(e) => setNewStack(e.target.value)}
                  placeholder="e.g. React / Node / PG"
                  className="bg-background border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-mono text-xs uppercase text-muted-foreground">Initial State</Label>
                <Select value={newStatus} onValueChange={(v) => setNewStatus(v as ProjectStatus)}>
                  <SelectTrigger className="bg-background border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="building">Building</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter className="mt-6">
                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={createProject.isPending}>
                  {createProject.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <TerminalSquare className="w-4 h-4 mr-2" />}
                  Deploy Instance
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground font-mono flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin mr-2 opacity-50" /> Accessing records...
          </div>
        ) : projects?.length === 0 ? (
          <Card className="bg-card border-white/10 text-center py-12">
            <CardContent>
              <div className="opacity-50 mb-4 flex justify-center">
                <TerminalSquare className="w-12 h-12" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Active Systems</h3>
              <p className="text-muted-foreground font-mono text-sm max-w-sm mx-auto">
                Your cluster is currently empty. Initialize a project to begin operations.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects?.map(project => (
              <Card key={project.id} className="bg-card border-white/10 flex flex-col group hover:border-primary/50 transition-colors">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-1">{project.title}</CardTitle>
                      <div className="font-mono text-xs text-muted-foreground">ID: {project.id.split('-')[0]}</div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-sm font-mono uppercase tracking-wider border ${
                      project.status === 'live' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                      project.status === 'building' ? 'bg-secondary/10 text-secondary border-secondary/20' :
                      'bg-white/5 text-white/70 border-white/10'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end">
                  <div className="mb-6">
                    <Label className="font-mono text-[10px] text-muted-foreground uppercase mb-1 block">Architecture</Label>
                    <div className="text-sm font-mono bg-background/50 p-2 rounded-sm border border-white/5 truncate">
                      {project.stack || "Unspecified"}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                    <div className="text-xs text-muted-foreground font-mono">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDelete(project.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 -mr-2"
                      disabled={deleteProject.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
