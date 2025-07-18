// components/shared/app-navbar.tsx
import { Link, useLocation } from "react-router-dom";
import { navItems, type NavItem } from "./NavItems";
import UserDropdown from "./UserDropdown";
import { useState } from "react";
import { ChevronDown, ChevronUp, Menu, X } from "lucide-react";
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
import { Button } from "../ui/button";

export function AppNavbar() {
  const location = useLocation();
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleCollapsible = (title: string) => {
    setOpenItems((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        {/* Left Section - Logo and Desktop Nav */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 font-bold">
          <span>
            <img src="/logo.svg" alt="Logo" className="h-10 w-10 rounded-full" />
          </span>
            तपस्Code
          </Link>

          {/* Desktop Nav - Hidden on mobile */}
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

        {/* Right Section - User controls */}
        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <ModeToggle />
          </div>
          <UserDropdown />

          {/* Mobile Toggle Button - Visible only on mobile */}
          <Button
            className="md:hidden p-2 rounded-md hover:bg-accent"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu - Full width dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <div className="px-4 py-2">
            <div className="flex justify-end mb-2">
              <ModeToggle />
            </div>
            
            {navItems.map((item: NavItem) => (
              <div key={item.title} className="mb-1">
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
                      {openItems[item.title] ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-6 pt-1 space-y-1">
                      {item.collapsible.map((sub) => (
                        <Link
                          key={sub.title}
                          to={sub.href}
                          onClick={closeMobileMenu}
                          className={cn(
                            "block px-3 py-2 rounded-md text-sm hover:bg-muted",
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
                    onClick={closeMobileMenu}
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
        </div>
      )}
    </header>
  );
}