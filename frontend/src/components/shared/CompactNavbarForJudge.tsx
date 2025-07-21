// components/CompactNavbar.tsx
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HomeIcon, CodeIcon, Projector } from "lucide-react";
import UserDropdown from "./UserDropdown";
import { ModeToggle } from "../mode-toggle";
import Draggable from "react-draggable";
import { useRef, useState } from "react";

export function CompactNavbarForJudge() {
  const nodeRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  return (
    <Draggable
      nodeRef={nodeRef}
      onStart={() => setDragging(true)}
      onStop={() => setDragging(false)}
    >
      <nav
        ref={nodeRef}
        className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 ${
          dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{ touchAction: "none" }}
        aria-label="Draggable judge navbar"
      >
        <div className="flex items-center gap-2 bg-white/5 dark:bg-gray-950/5 backdrop-blur-xs px-4 py-2 rounded-full shadow-lg border border-gray-200 dark:border-gray-700">
          {/* Home */}
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
          >
            <Link to="/">
              <HomeIcon className="h-5 w-5" />
            </Link>
          </Button>

          {/* Compiler Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
              >
                <div className="flex items-center gap-1">
                  <CodeIcon className="h-5 w-5" />
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48">
              <DropdownMenuItem asChild>
                <Link to="/compilers/cpp" className="cursor-pointer">
                  C++
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/compilers/java" className="cursor-pointer">
                  Java
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/compilers/python" className="cursor-pointer">
                  Python
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/compilers/javascript" className="cursor-pointer">
                  JavaScript
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/compilers/go" className="cursor-pointer">
                  Go
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Problemset */}
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
          >
            <Link to="/problems">
              <Projector className="h-5 w-5" />
            </Link>
          </Button>
          <ModeToggle />

          {/* User Profile/Login */}
          <div className="ml-1">
            <UserDropdown />
          </div>
        </div>
      </nav>
    </Draggable>
  );
}
