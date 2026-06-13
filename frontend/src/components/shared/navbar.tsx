import { Link, useLocation } from "react-router-dom";
import { navItems, type NavItem } from "./NavItems";
import UserDropdown from "./UserDropdown";
import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { ModeToggle } from "../mode-toggle";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";

export function AppNavbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full glass-navbar">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left — Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src="/logo.svg"
            alt="Logo"
            className="h-8 w-8 rounded-lg transition-transform group-hover:scale-110"
          />
          <span className="text-lg font-bold tracking-tight gradient-text hidden sm:inline-block">
            तपस्Code
          </span>
        </Link>

        {/* Center — Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item: NavItem) => (
            <div key={item.title}>
              {item.collapsible?.length ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                        "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]",
                        location.pathname.startsWith(item.href) &&
                          "text-foreground bg-white/[0.06]"
                      )}
                    >
                      {item.title}
                      <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="center"
                    className="w-44 glass-strong rounded-xl border-white/[0.08] mt-1"
                  >
                    {item.collapsible.map((sub) => (
                      <DropdownMenuItem key={sub.title} asChild>
                        <Link
                          to={sub.href}
                          className={cn(
                            "cursor-pointer rounded-lg text-sm",
                            location.pathname === sub.href &&
                              "text-primary font-medium"
                          )}
                        >
                          {sub.title}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  to={item.href}
                  className={cn(
                    "relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]",
                    location.pathname === item.href &&
                      "text-foreground"
                  )}
                >
                  {item.title}
                  {location.pathname === item.href && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-3 right-3 h-[2px] bg-primary rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Right — Controls */}
        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <ModeToggle />
          </div>
          <UserDropdown />

          {/* Mobile Menu Trigger */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-lg hover:bg-white/[0.06]"
                aria-label="Toggle menu"
              >
                <AnimatePresence mode="wait">
                  {mobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <X className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Menu className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 glass-strong border-l border-white/[0.06] p-0">
              <div className="flex flex-col h-full pt-12 px-4">
                <div className="flex justify-end mb-4 px-2">
                  <ModeToggle />
                </div>
                <nav className="flex flex-col gap-1">
                  {navItems.map((item: NavItem) => (
                    <div key={item.title}>
                      {item.collapsible?.length ? (
                        <div className="space-y-1">
                          <span className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground">
                            {item.icon && <item.icon className="w-4 h-4" />}
                            {item.title}
                          </span>
                          <div className="pl-6 space-y-0.5">
                            {item.collapsible.map((sub) => (
                              <Link
                                key={sub.title}
                                to={sub.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={cn(
                                  "block px-3 py-2 rounded-lg text-sm transition-colors",
                                  "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]",
                                  location.pathname === sub.href &&
                                    "text-primary bg-primary/[0.08]"
                                )}
                              >
                                {sub.title}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <Link
                          to={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                            "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]",
                            location.pathname === item.href &&
                              "text-primary bg-primary/[0.08]"
                          )}
                        >
                          {item.icon && <item.icon className="w-4 h-4" />}
                          {item.title}
                        </Link>
                      )}
                    </div>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}