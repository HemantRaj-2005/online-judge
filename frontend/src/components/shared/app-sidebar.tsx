import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "../ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible"; // Shadcn/UI Collapsible components
import { Link, useLocation } from "react-router-dom";
import { navItems, type NavItem } from "./NavItems";
import UserDropdown from "./UserDropdown";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ModeToggle } from "../mode-toggle";

export function AppSidebar() {
  const location = useLocation();
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});

  const toggleCollapsible = (title: string) => {
    setOpenItems((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader>
        <span className="text-lg font-bold overflow-hidden whitespace-nowrap transition-all duration-200">
          CodeJudge
        </span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item: NavItem) => (
              <SidebarMenuItem key={item.title}>
                {item.collapsible && item.collapsible.length > 0 ? (
                  <Collapsible
                    open={openItems[item.title] || false}
                    onOpenChange={() => toggleCollapsible(item.title)}
                  >
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        isActive={location.pathname.startsWith(item.href)}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        {item.icon && (
                          <item.icon className="h-5 w-5 shrink-0" />
                        )}
                        <span>{item.title}</span>
                        <span className="ml-auto">
                          {openItems[item.title] ? (
                            <ChevronUp className="h-4 w-4 ml-auto" />
                          ) : (
                            <ChevronDown className="h-4 w-4 ml-auto" />
                          )}
                        </span>
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.collapsible.map((sub) => (
                          <SidebarMenuSubItem key={sub.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={location.pathname === sub.href}
                            >
                              <Link to={sub.href}>{sub.title}</Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.href}
                  >
                    <Link to={item.href} className="flex items-center gap-2">
                      {item.icon && <item.icon className="h-5 w-5 shrink-0" />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <ModeToggle />
        <UserDropdown />
      </SidebarFooter>
    </Sidebar>
  );
}
