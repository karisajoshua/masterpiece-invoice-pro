import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export function ClientRoute({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const { isClient, loading: roleLoading } = useUserRole();

  const { data: clientRecord, isLoading: clientLoading } = useQuery({
    queryKey: ["client-active-status", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("clients")
        .select("is_active")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user && isClient,
  });

  useEffect(() => {
    // Sign out deactivated clients
    if (clientRecord && clientRecord.is_active === false) {
      signOut();
    }
  }, [clientRecord, signOut]);

  const loading = roleLoading || clientLoading;

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

  // Redirect if client is deactivated
  if (clientRecord && clientRecord.is_active === false) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}