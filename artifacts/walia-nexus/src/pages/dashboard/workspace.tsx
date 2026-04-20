import { useParams, useSearch } from "wouter";
import { ActiveWorkspace } from "@/components/workspace/ActiveWorkspace";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function WorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const search = useSearch();
  const [, navigate] = useLocation();
  const { user, isLoading } = useAuth();

  const params = new URLSearchParams(search);
  const title = params.get("title") ?? "Untitled Project";

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  if (!id) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0e1117] text-white font-mono text-sm">
        Project ID missing.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0e1117]">
        <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
      </div>
    );
  }

  return <ActiveWorkspace projectId={id} projectTitle={title} />;
}
