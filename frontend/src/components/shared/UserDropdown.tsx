import { useAppSelector } from "@/redux/hook";
import { Button } from "../ui/button";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { logout } from "@/redux/user/authSlice";
import { useDispatch } from "react-redux";
import { LogOut, Settings, User, Plus, ArrowRight } from "lucide-react";

export default function UserDropdown() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!user)
    return (
      <Button
        asChild
        className="btn-gradient text-white rounded-lg px-5 h-9 text-sm font-medium"
      >
        <Link to="/sign-in">
          Sign In <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Link>
      </Button>
    );

  const initials = user.username?.slice(0, 2).toUpperCase() || "US";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 w-9 rounded-full p-0 ring-2 ring-primary/20 hover:ring-primary/40 transition-all"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 glass-strong rounded-xl border-white/[0.08] p-1.5"
        align="end"
        forceMount
      >
        <div className="px-3 py-2.5 mb-1">
          <p className="text-sm font-semibold text-foreground">{user.username}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
        </div>
        <DropdownMenuSeparator className="bg-white/[0.06]" />
        <DropdownMenuItem asChild className="rounded-lg cursor-pointer gap-2 py-2">
          <Link to={`/dashboard/${user.username}`}>
            <User className="w-4 h-4 text-muted-foreground" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="rounded-lg cursor-pointer gap-2 py-2">
          <Link to="/settings">
            <Settings className="w-4 h-4 text-muted-foreground" />
            Settings
          </Link>
        </DropdownMenuItem>
        {user.isAuthor && (
          <DropdownMenuItem asChild className="rounded-lg cursor-pointer gap-2 py-2">
            <Link to="/create-problem">
              <Plus className="w-4 h-4 text-muted-foreground" />
              Create Problem
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator className="bg-white/[0.06]" />
        <DropdownMenuItem
          onClick={() => {
            dispatch(logout());
            navigate("/");
          }}
          className="rounded-lg cursor-pointer gap-2 py-2 text-destructive focus:text-destructive"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
