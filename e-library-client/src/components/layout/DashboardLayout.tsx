import { ReactNode, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { motion } from "framer-motion";
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
import { Separator } from "@/components/ui/separator";
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
  Search,
  Settings,
  Sun,
  Users,
  ClipboardList,
  BarChart3,
  ScrollText,
  GraduationCap,
  CloudUpload,
  ChevronRight,
  FolderOpen,
  ChevronsUpDown,
} from "lucide-react";
import { useTheme } from "next-themes";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: any;
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

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
    }
  }, [isHydrated, isAuthenticated, router]);

  if (!isHydrated || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
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
        // { name: "Search", href: "/search", icon: Search },
      ],
    },
    {
      title: "Personal",
      items: [
        { name: "My Requests", href: "/requests", icon: ClipboardList },
      ],
    },
  ];

  // Staff Navigation (All student routes + upload)
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
        // { name: "Search", href: "/search", icon: Search },
      ],
    },
    {
      title: "Staff Tools",
      items: [
        // { name: "Upload Resource", href: "/staff/upload", icon: CloudUpload },
        { name: "My Requests", href: "/requests", icon: ClipboardList },
      ],
    },
  ];

  // Admin Navigation (Independent admin routes)
  const adminNavigation: NavSection[] = [
    {
      items: [
        { name: "Admin Dashboard", href: "/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      title: "Content Management",
      items: [
        { name: "Resources", href: "/resources", icon: FileText },
        { name: "Courses", href: "/courses", icon: GraduationCap },
        // { name: "Upload Resource", href: "/resources/upload", icon: CloudUpload },
        // { name: "Search", href: "/search", icon: Search },
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

  // Determine navigation based on role
  const getNavigation = (): NavSection[] => {
    if (isAdmin) return adminNavigation;
    if (isStaffOrAdmin) return staffNavigation;
    return studentNavigation;
  };

  const navigation = getNavigation();

  const isActiveLink = (href: string) => {
    if (href === "/dashboard" || href === "/admin/dashboard") {
      return router.pathname === href;
    }
    return router.pathname === href || router.pathname.startsWith(href + "/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo Section */}
          <div className="flex h-16 items-center gap-2 px-6 border-b">
            <div className="flex items-center gap-2 flex-1">
              <div className="p-2 bg-primary rounded-lg">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-none">ResourceHub</span>
                <span className="text-xs text-muted-foreground capitalize">
                  {user.role.toLowerCase()}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-6">
              {navigation.map((section, idx) => (
                <div key={idx} className="space-y-1">
                  {section.title && (
                    <h4 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {section.title}
                    </h4>
                  )}
                  <div className="space-y-0.5">
                    {section.items.map((item) => {
                      const isActive = isActiveLink(item.href);
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={cn(
                            "group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                            isActive
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <item.icon className={cn(
                            "h-4 w-4 shrink-0 transition-transform",
                            isActive ? "scale-110" : "group-hover:scale-110"
                          )} />
                          <span className="flex-1">{item.name}</span>
                          {item.badge && (
                            <span className={cn(
                              "px-2 py-0.5 text-xs font-medium rounded-full",
                              isActive
                                ? "bg-primary-foreground/20 text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            )}>
                              {item.badge}
                            </span>
                          )}
                          {isActive && (
                            <ChevronRight className="h-4 w-4 shrink-0" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </ScrollArea>

          {/* User Profile Section */}
          <div className="">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start px-3 py-4 h-auto hover:bg-accent"
                >
                  <div className="flex items-center gap-3 w-full">
                    <Avatar className="h-9 w-9 border-2 border-primary/10">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(`${user.name}`)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                    <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {user.role.toLowerCase()}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:pl-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-full items-center gap-4 px-4 sm:px-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            {title && (
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold">{title}</h1>
              </div>
            )}
            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="relative"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9 border-2 border-primary/10">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(`${user.firstName} ${user.lastName}`)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4 sm:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}