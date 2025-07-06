// components/shared/app-navbar.tsx
import { Link, useLocation } from "react-router-dom";
import { navItems, type NavItem } from "./NavItems";
import UserDropdown from "./UserDropdown";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ModeToggle } from "../mode-toggle";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "../ui/navigation-menu";
import { cn } from "@/lib/utils";

export function AppNavbar() {
  const location = useLocation();
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});

  const toggleCollapsible = (title: string) => {
    setOpenItems((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 font-bold">
            CodeJudge
          </Link>

          <NavigationMenu>
            <NavigationMenuList className="flex items-center gap-1">
              {navItems.map((item: NavItem) => (
                <NavigationMenuItem
                  key={item.title}
                  className="flex items-center"
                >
                  {item.collapsible && item.collapsible.length > 0 ? (
                    <Collapsible
                      open={openItems[item.title] || false}
                      onOpenChange={() => toggleCollapsible(item.title)}
                    >
                      <CollapsibleTrigger asChild>
                        <NavigationMenuLink
                          className={cn(
                            "flex h-10 w-full items-center justify-between px-3 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                            location.pathname.startsWith(item.href) &&
                              "bg-accent text-accent-foreground"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {item.icon && <item.icon className="w-4 h-4" />}
                            <span>{item.title}</span>
                          </div>
                          {openItems[item.title] ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </NavigationMenuLink>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="absolute mt-1 min-w-[180px] rounded-md border bg-popover p-1 shadow-lg">
                        <div className="grid gap-1">
                          {item.collapsible.map((sub) => (
                            <Link
                              key={sub.title}
                              to={sub.href}
                              className={cn(
                                "flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent",
                                location.pathname === sub.href &&
                                  "bg-accent text-accent-foreground"
                              )}
                            >
                              <span>{sub.title}</span>
                            </Link>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <Link
                      to={item.href}
                      className={cn(
                        "flex items-center gap-2 h-10 px-3 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                        location.pathname === item.href &&
                          "bg-accent text-accent-foreground"
                      )}
                    >
                      {item.icon && (
                        <span className="flex items-center justify-center w-5 h-5">
                          <item.icon className="w-4 h-4" />
                        </span>
                      )}
                      <span>{item.title}</span>
                    </Link>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}
