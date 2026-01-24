import { LayoutDashboard, Users, MessageSquare, User, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentAgent } from "@/hooks/useAgents";
import { useAgentMessages } from "@/hooks/useAgentMessages";
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
import { Badge } from "@/components/ui/badge";

const menuItems = [
  { title: "Dashboard", url: "/agent/dashboard", icon: LayoutDashboard },
  { title: "My Clients", url: "/agent/clients", icon: Users },
  { title: "Messages", url: "/agent/messages", icon: MessageSquare },
  { title: "Profile", url: "/agent/profile", icon: User },
];

export function AgentSidebar() {
  const { signOut } = useAuth();
  const { agent } = useCurrentAgent();
  const { unreadCount } = useAgentMessages();
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
                <h2 className="text-sm font-semibold text-sidebar-foreground">Field Agent</h2>
                <p className="text-xs text-sidebar-foreground/70">
                  {agent?.agent_code || "Loading..."}
                </p>
              </div>
            )}
          </div>
          {open && <ModeToggle />}
        </div>
      </SidebarHeader>
      
      <SidebarContent>
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
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {open && (
                        <span className="flex items-center gap-2">
                          {item.title}
                          {item.title === "Messages" && unreadCount > 0 && (
                            <Badge variant="destructive" className="h-5 min-w-5 text-xs">
                              {unreadCount}
                            </Badge>
                          )}
                        </span>
                      )}
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
