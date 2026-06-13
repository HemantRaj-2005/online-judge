import { Link } from "react-router-dom";
import { Github, Twitter, Mail } from "lucide-react";

const footerLinks = {
  Platform: [
    { label: "Problems", href: "/problems" },
    { label: "Compilers", href: "/compilers/cpp" },
    { label: "Code Analyzer", href: "/code-analyzer" },
    { label: "Dashboard", href: "/dashboard" },
  ],
  Resources: [
    { label: "Getting Started", href: "/" },
    { label: "Documentation", href: "/" },
    { label: "API Reference", href: "/" },
    { label: "Changelog", href: "/" },
  ],
  Community: [
    { label: "Discord", href: "/" },
    { label: "GitHub", href: "/" },
    { label: "Twitter", href: "/" },
    { label: "Blog", href: "/" },
  ],
};

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06]">
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img
                src="/logo.svg"
                alt="Logo"
                className="h-7 w-7 rounded-lg"
              />
              <span className="text-base font-bold gradient-text">
                तपस्Code
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              A premium online judge platform where your code decides your
              karma. Practice, compete, and master algorithms.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-colors"
              >
                <Github className="w-4 h-4 text-muted-foreground" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-colors"
              >
                <Twitter className="w-4 h-4 text-muted-foreground" />
              </a>
              <a
                href="mailto:hello@tapascode.dev"
                className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-colors"
              >
                <Mail className="w-4 h-4 text-muted-foreground" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-foreground mb-4">
                {title}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-14 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} तपस्Code. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="/"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
