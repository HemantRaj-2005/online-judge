import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HomeIcon, CodeIcon, LayoutList } from "lucide-react";
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
        <div className="flex items-center gap-1.5 glass-strong px-3 py-2 rounded-2xl shadow-2xl shadow-black/20">
          {/* Home */}
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="rounded-xl hover:bg-white/[0.06] h-9 w-9"
          >
            <Link to="/">
              <HomeIcon className="h-4 w-4" />
            </Link>
          </Button>

          {/* Compiler Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl hover:bg-white/[0.06] h-9 w-9"
              >
                <div className="flex items-center gap-0.5">
                  <CodeIcon className="h-4 w-4" />
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-40 glass-strong rounded-xl border-white/[0.08]">
              <DropdownMenuItem asChild>
                <Link to="/compilers/cpp" className="cursor-pointer rounded-lg">
                  C++
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/compilers/java" className="cursor-pointer rounded-lg">
                  Java
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/compilers/python" className="cursor-pointer rounded-lg">
                  Python
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Problemset */}
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="rounded-xl hover:bg-white/[0.06] h-9 w-9"
          >
            <Link to="/problems">
              <LayoutList className="h-4 w-4" />
            </Link>
          </Button>

          <div className="w-px h-5 bg-white/[0.08] mx-0.5" />

          <ModeToggle />

          {/* User Profile/Login */}
          <div className="ml-0.5">
            <UserDropdown />
          </div>
        </div>
      </nav>
    </Draggable>
  );
}
