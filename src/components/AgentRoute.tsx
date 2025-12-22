import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useCurrentAgent } from "@/hooks/useAgents";

export function AgentRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { isAgent, loading: roleLoading } = useUserRole();
  const { agent, isLoading: agentLoading } = useCurrentAgent();

  const loading = roleLoading || agentLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user || !isAgent) {
    return <Navigate to="/auth" replace />;
  }

  // Check if agent is active
  if (agent && !agent.is_active) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
