import { AntennaIcon, ArrowUpLeftFromCircleIcon, BellIcon, CodeIcon, HomeIcon, Newspaper, Projector } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
  collapsible?: {
    title: string;
    href: string;
  }[];
 
}


export const navItems: NavItem[] = [
    {
        title: "Home",
        href: "/",
        icon: HomeIcon,
    },
    {
    title: "Compilers",
    href: "/compilers",
    icon: CodeIcon,
    collapsible: [
      { title: "C++", href: "/compilers/cpp" },
      { title: "Java", href: "/compilers/java" },
      { title: "Python", href: "/compilers/python" },
      { title: "JavaScript", href: "/compilers/javascript" },
      { title: "Go", href: "/compilers/go" }
    ]
  },
  {
    title: "Problemset",
    href: "/problems",
    icon: Projector
  },
  {
    title: "Articles",
    href: "/articles",
    icon: Newspaper,
    collapsible: [
      { title: "DSA", href: "/articles/dsa" },
      { title: "C++", href: "/articles/cpp" },
      { title: "Python", href: "/articles/python" },
      { title: "AI/ML", href: "/articles/ai-ml" },
      { title: "Django", href: "/articles/django" }
    ]
  },
  {
    title: "AI-Interview",
    href: "/ai-interview",
    icon: AntennaIcon
  },
  {
    title: "Announcements",
    href: "/announcements",
    icon: BellIcon,
  }
]