import { LayoutDashboard, FilePlus, FolderOpen, BarChart3, Settings, LogOut, FileCheck, DollarSign, Users, PlusCircle } from "lucide-react";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import masterpieceLogo from "@/assets/masterpiece-logo.png";
import { ModeToggle } from "@/components/ModeToggle";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Clients", url: "/admin/clients", icon: Users },
  { title: "Field Agents", url: "/admin/agents", icon: Users },
  { title: "Invoice History", url: "/history", icon: FolderOpen },
  { title: "Client Documents", url: "/admin/documents", icon: FileCheck },
  { title: "Payment Approvals", url: "/admin/payments", icon: DollarSign },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { signOut } = useAuth();
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white p-1">
              <img src={masterpieceLogo} alt="Master Piece" className="h-full w-full object-contain" />
            </div>
            {open && (
              <div>
                <h2 className="text-sm font-semibold text-sidebar-foreground">Master Piece</h2>
                <p className="text-xs text-sidebar-foreground/70">Invoicing Console</p>
              </div>
            )}
          </div>
          {open && <ModeToggle />}
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {/* Quick Actions */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">
            {open ? "Quick Actions" : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Create New Invoice">
                  <Link 
                    to="/create" 
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all bg-primary/10 text-primary hover:bg-primary/20 font-medium"
                  >
                    <PlusCircle className="h-4 w-4" />
                    {open && <span>Create Invoice</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">
            {open ? "Navigation" : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={signOut} 
              tooltip="Sign Out" 
              className="text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            >
              <LogOut className="h-4 w-4" />
              {open && <span>Sign Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
