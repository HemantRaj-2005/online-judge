import { useAppSelector } from "@/redux/hook";
import SubmissionsOnDashboard from "./SubmissionsOnDashboard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  User,
  Calendar,
  Trophy,
  CheckCircle,
  Code,
  Flame,
  Target,
} from "lucide-react";
import { motion } from "framer-motion";

export default function DashBoard() {
  const { user } = useAppSelector((state) => state.auth);
  const initials = user?.username?.slice(0, 2).toUpperCase() || "US";

  const statCards = [
    {
      icon: CheckCircle,
      label: "Problems Solved",
      value: "24",
      change: "+5 this month",
      gradient: "from-emerald-500 to-teal-500",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-400",
    },
    {
      icon: Flame,
      label: "Current Streak",
      value: "7 days",
      change: "Keep it going!",
      gradient: "from-amber-500 to-orange-500",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-400",
    },
    {
      icon: Target,
      label: "Accuracy",
      value: "85%",
      change: "+2.5% from last month",
      gradient: "from-indigo-500 to-purple-500",
      iconBg: "bg-indigo-500/10",
      iconColor: "text-indigo-400",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back,{" "}
            <span className="gradient-text">
              {user?.username || "Coder"}
            </span>{" "}
            👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here's your progress overview and recent activity.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="glass rounded-2xl p-5 glow-border transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </span>
                <div className={`p-2 rounded-xl ${stat.iconBg}`}>
                  <stat.icon className={`w-4 h-4 ${stat.iconColor}`} />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground">
                {stat.value}
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 h-5 rounded-md bg-primary/[0.08] text-primary border-0"
                >
                  ↑
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="glass rounded-2xl p-6 glow-border h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full opacity-50 blur-sm" />
                  <Avatar className="h-14 w-14 relative">
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-lg font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {user?.username}
                  </h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  {
                    icon: User,
                    label: "Username",
                    value: user?.username,
                  },
                  {
                    icon: Mail,
                    label: "Email",
                    value: user?.email,
                  },
                  {
                    icon: Calendar,
                    label: "Member since",
                    value: "July 2025",
                  },
                  {
                    icon: Trophy,
                    label: "Rank",
                    value: "#142",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 py-2"
                  >
                    <div className="p-2 rounded-xl bg-white/[0.04]">
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Submissions */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="glass rounded-2xl p-6 glow-border">
              <div className="flex items-center gap-2 mb-5">
                <div className="p-2 rounded-xl bg-primary/[0.08]">
                  <Code className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Recent Submissions
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Your latest coding activity
                  </p>
                </div>
              </div>
              <SubmissionsOnDashboard username={user?.username} limit={20} />
            </div>
          </motion.div>
        </div>

        {/* Note */}
        <motion.p
          variants={itemVariants}
          className="text-xs text-muted-foreground/50 text-center mt-8"
        >
          Note: Stats are currently static. Dynamic analytics coming soon.
        </motion.p>
      </motion.div>
    </div>
  );
}