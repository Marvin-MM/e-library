import React, { ReactNode, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { useRole, useLogout, useUser } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  ChevronLeft,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  Users,
  ClipboardList,
  BarChart3,
  ScrollText,
  GraduationCap,
  FolderOpen,
  ChevronsUpDown,
  Bell,
  Search,
  Brain,
  BotIcon
} from "lucide-react";
import { useTheme } from "next-themes";
import { getInitials, cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const { sidebarOpen, setSidebarOpen, toggleSidebar } = useUIStore();
  const { isAdmin, isStaffOrAdmin } = useRole();
  const { mutate: logout } = useLogout();
  const { theme, setTheme } = useTheme();
  const { isLoading: userLoading } = useUser();

  const pageTitle = title ? `${title} | ResourceHub` : "ResourceHub";

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
    }
  }, [isHydrated, isAuthenticated, router]);

  // Close sidebar on route change (for mobile)
  useEffect(() => {
    const handleRouteChange = () => {
      setSidebarOpen(false);
    };
    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router, setSidebarOpen]);

  if (!isHydrated || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="space-y-4 flex flex-col items-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-primary/20 animate-pulse" />
            <BookOpen className="h-8 w-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Student Navigation
  const studentNavigation: NavSection[] = [
    {
      items: [
        { name: "Dashboard", href: "/dashboard", icon: Home },
      ],
    },
    {
      title: "Learning",
      items: [
        { name: "Courses", href: "/courses", icon: GraduationCap },
        { name: "Resources", href: "/resources", icon: FileText },
      ],
    },
    {
      title: "Personal",
      items: [
        { name: "My Requests", href: "/requests", icon: ClipboardList },
      ],
    },
  ];

  // Staff Navigation
  const staffNavigation: NavSection[] = [
    {
      items: [
        { name: "Dashboard", href: "/dashboard", icon: Home },
      ],
    },
    {
      title: "Learning",
      items: [
        { name: "Courses", href: "/courses", icon: GraduationCap },
        { name: "Resources", href: "/resources", icon: FileText },
      ],
    },
    {
      title: "Staff Tools",
      items: [
        { name: "My Requests", href: "/requests", icon: ClipboardList },
      ],
    },
  ];

  // Admin Navigation
  const adminNavigation: NavSection[] = [
    {
      items: [
        { name: "Admin Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
      ],
    },
    {
      title: "Content Management",
      items: [
        { name: "Resources", href: "/resources", icon: FileText },
        { name: "Courses", href: "/courses", icon: GraduationCap },
      ],
    },
    {
      title: "User Management",
      items: [
        { name: "Users", href: "/admin/users", icon: Users },
        { name: "All Requests", href: "/admin/requests", icon: FolderOpen },
      ],
    },
    {
      title: "System",
      items: [
        { name: "Metrics", href: "/admin/metrics", icon: BarChart3 },
        { name: "Audit Logs", href: "/admin/audit-logs", icon: ScrollText },
      ],
    },
  ];

  const getNavigation = (): NavSection[] => {
    if (isAdmin) return adminNavigation;
    if (isStaffOrAdmin) return staffNavigation;
    return studentNavigation;
  };

  const navigation = getNavigation();

  const isActiveLink = (href: string) => {
    if (href === "/dashboard" || href === "/dashboard/admin") {
      return router.pathname === href;
    }
    return router.pathname === href || router.pathname.startsWith(href + "/");
  };

  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Head>
        <title>{pageTitle}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-60 bg-card/50 backdrop-blur-xl border-r shadow-2xl lg:shadow-none transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 px-6 border-b rounded-b-2xl bg-card/50">
            <div className="p-1.5">
              <img src="/vu-logo.png" alt="VU Logo" className="h-24 w-24 object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                ResourceHub
              </span>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                {user.role} Portal
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>

          {/* Nav Items */}
          <ScrollArea className="flex-1 px-4 py-6">
            <nav className="space-y-8">
              {navigation.map((section, idx) => (
                <div key={idx} className="space-y-2">
                  {section.title && (
                    <h4 className="px-4 text-xs font-bold text-muted-foreground/70 uppercase tracking-wider mb-3">
                      {section.title}
                    </h4>
                  )}
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = isActiveLink(item.href);
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={cn(
                            "group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 overflow-hidden",
                            isActive
                              ? "text-primary-foreground shadow-md shadow-primary/25"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          )}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="activeNav"
                              className="absolute inset-0 bg-primary"
                              initial={false}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                          )}
                          <item.icon className={cn(
                            "h-5 w-5 shrink-0 transition-transform duration-200 relative z-10",
                            isActive ? "scale-110" : "group-hover:scale-110"
                          )} />
                          <span className="relative z-10 font-medium">{item.name}</span>
                          {item.badge && (
                            <span className={cn(
                              "ml-auto px-2 py-0.5 text-[10px] font-bold rounded-full relative z-10",
                              isActive
                                ? "bg-primary-foreground/20 text-primary-foreground"
                                : "bg-primary/10 text-primary"
                            )}>
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </ScrollArea>

          {/* User Profile */}
          <div className="bg-card/50">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start px-3 py-4 h-auto hover:bg-accent/50 rounded-xl group"
                >
                  <div className="flex items-center gap-3 w-full">
                    <Avatar className="h-10 w-10 border-2 border-background shadow-sm group-hover:border-primary/20 transition-colors">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {getInitials(`${user.name}`)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                    <ChevronsUpDown className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 rounded-xl shadow-xl border-border/50" sideOffset={10}>
                <DropdownMenuLabel className="p-4">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[8px] font-bold uppercase tracking-wider">
                        {user.role}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="p-3 cursor-pointer">
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="p-3 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-60 min-h-screen flex flex-col transition-all duration-300">
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-full items-center gap-4 px-4 sm:px-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="lg:hidden hover:bg-accent/50 -ml-2"
            >
              <Menu className="h-6 w-6" />
            </Button>

            {title && (
              <div className="flex flex-col gap-0.5">
                <h1 className="text-base font-bold tracking-tight">{title}</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Welcome back, {user?.name || 'User'}
                </p>
              </div>
            )}

            <div className="ml-auto flex items-center gap-2 sm:gap-4">
              {/* Ask AI Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/50">
                    <BotIcon className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem disabled className="text-center">
                    <span className="text-muted-foreground">Coming Soon</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Search (Placeholder) */}
              {/* <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/50 hidden sm:flex">
                <Search className="h-5 w-5" />
              </Button> */}

              {/* Notifications (Placeholder) */}
              <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/50 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-background" />
              </Button>

              <div className="h-8 w-px bg-border mx-1" />

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full hover:bg-accent/50"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}