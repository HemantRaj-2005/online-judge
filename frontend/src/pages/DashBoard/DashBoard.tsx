import { useAppSelector } from "@/redux/hook";
import SubmissionsOnDashboard from "./SubmissionsOnDashboard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Mail,
  User,
  Bookmark,
  Trophy,
  Clock,
  CheckCircle,
  Code
} from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/theme-provider";

export default function DashBoard() {
  const { user } = useAppSelector((state) => state.auth);
  const initials = user?.username?.slice(0, 2).toUpperCase() || "US";
  const { theme } = useTheme();
  
  const lightGradient = "from-amber-500 to-rose-500";
  const darkGradient = "from-indigo-500 via-purple-500 to-pink-500";
  const gradientClass = theme === "dark" ? darkGradient : lightGradient;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
       <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={`mb-6 bg-gradient-to-r ${gradientClass} border-none shadow-lg`}>
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          <CardHeader className="pb-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <CardTitle className="text-white text-2xl md:text-3xl font-bold">
                Welcome back, {user?.username || "Coder"}! 👋
              </CardTitle>
              <motion.p 
                className="text-primary-foreground/80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Check your progress and recent activity
              </motion.p>
            </motion.div>
          </CardHeader>
        </motion.div>
      </Card>
    </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center space-x-4 space-y-0">
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{user?.username}</CardTitle>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-lg bg-secondary">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Username</p>
                <p>{user?.username}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-lg bg-secondary">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p>{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-lg bg-secondary">
                <Bookmark className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Member since</p>
                <p>July 2025</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submissions Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Code className="h-5 w-5 text-primary" />
              <CardTitle>Recent Submissions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <SubmissionsOnDashboard username={user?.username} limit={20} />
          </CardContent>
        </Card>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card>
       
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Problems Solved
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground mt-1">
              +5 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7 days</div>
            <p className="text-xs text-muted-foreground mt-1">
              Keep it going!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <div className="flex items-center mt-1">
              <Badge variant="secondary" className="text-xs">
                +2.5%
              </Badge>
              <span className="text-xs text-muted-foreground ml-1">
                from last month
              </span>
            </div>
          </CardContent>
        </Card>
        <p>Note: The above stats section is static, dynamic services coming soon..</p>
      </div>
    </div>
  );
}