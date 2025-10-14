import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        
        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-lg font-semibold text-foreground">Invoicing Console</h1>
            </div>
            
            <Button onClick={() => navigate("/create")} className="gap-2">
              <Plus className="h-4 w-4" />
              Create New Invoice
            </Button>
          </header>
          
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
