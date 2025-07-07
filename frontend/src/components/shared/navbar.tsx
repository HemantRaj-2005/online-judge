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

import { Menu, X } from "lucide-react";

export function AppNavbar() {
  const location = useLocation();
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleCollapsible = (title: string) => {
    setOpenItems((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        {/* Left Section */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 font-bold">
            CodeJudge
          </Link>

          {/* Desktop Nav */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="flex items-center gap-1">
              {navItems.map((item: NavItem) => (
                <NavigationMenuItem key={item.title} className="flex items-center">
                  {item.collapsible?.length ? (
                    <Collapsible
                      open={openItems[item.title] || false}
                      onOpenChange={() => toggleCollapsible(item.title)}
                    >
                      <CollapsibleTrigger asChild>
                        <NavigationMenuLink
                          className={cn(
                            "flex h-10 items-center px-3 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                            location.pathname.startsWith(item.href) &&
                              "bg-accent text-accent-foreground"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {item.icon && <item.icon className="w-4 h-4" />}
                            <span>{item.title}</span>
                            {openItems[item.title] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </NavigationMenuLink>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="absolute mt-1 min-w-[180px] rounded-md border bg-popover p-1 shadow-lg z-50">
                        <div className="grid gap-1">
                          {item.collapsible.map((sub) => (
                            <Link
                              key={sub.title}
                              to={sub.href}
                              className={cn(
                                "flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent",
                                location.pathname === sub.href && "bg-accent text-accent-foreground"
                              )}
                            >
                              {sub.title}
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
                        location.pathname === item.href && "bg-accent text-accent-foreground"
                      )}
                    >
                      {item.icon && <item.icon className="w-4 h-4" />}
                      {item.title}
                    </Link>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserDropdown />

          {/* Mobile Toggle Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pb-4">
          {navItems.map((item: NavItem) => (
            <div key={item.title} className="mb-2">
              {item.collapsible?.length ? (
                <Collapsible
                  open={openItems[item.title] || false}
                  onOpenChange={() => toggleCollapsible(item.title)}
                >
                  <CollapsibleTrigger className="w-full flex justify-between items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-accent">
                    <div className="flex items-center gap-2">
                      {item.icon && <item.icon className="w-4 h-4" />}
                      {item.title}
                    </div>
                    {openItems[item.title] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-6 pt-2 space-y-1">
                    {item.collapsible.map((sub) => (
                      <Link
                        key={sub.title}
                        to={sub.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "block px-2 py-1 rounded-md text-sm hover:bg-muted",
                          location.pathname === sub.href && "bg-accent text-accent-foreground"
                        )}
                      >
                        {sub.title}
                      </Link>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <Link
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-muted",
                    location.pathname === item.href && "bg-accent text-accent-foreground"
                  )}
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  {item.title}
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </header>
  );
}

