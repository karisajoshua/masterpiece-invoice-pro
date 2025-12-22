import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AgentSidebar } from "./AgentSidebar";
import { useCurrentAgent } from "@/hooks/useAgents";

interface AgentLayoutProps {
  children: React.ReactNode;
}

export function AgentLayout({ children }: AgentLayoutProps) {
  const { agent } = useCurrentAgent();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AgentSidebar />
        <SidebarInset className="flex flex-col flex-1">
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1" />
            {agent && (
              <div className="text-sm text-muted-foreground">
                Welcome, <span className="font-medium text-foreground">{agent.full_name}</span>
              </div>
            )}
          </header>
          <main className="flex-1 p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
