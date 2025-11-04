import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";

export function ClientRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { isClient, loading } = useUserRole();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user || !isClient) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}