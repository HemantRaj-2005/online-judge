import {
  CodeIcon,
  HomeIcon,
  LayoutList,
  Sparkles,
} from "lucide-react";

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
    title: "Problems",
    href: "/problems",
    icon: LayoutList,
  },
  {
    title: "Compilers",
    href: "/compilers",
    icon: CodeIcon,
    collapsible: [
      { title: "C++", href: "/compilers/cpp" },
      { title: "Java", href: "/compilers/java" },
      { title: "Python", href: "/compilers/python" },
    ],
  },
  {
    title: "Code Analyzer",
    href: "/code-analyzer",
    icon: Sparkles,
  },
];
