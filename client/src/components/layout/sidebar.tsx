import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  GraduationCap, 
  LayoutDashboard, 
  Megaphone, 
  FileText, 
  Users, 
  Award, 
  BarChart3, 
  FolderOpen,
  Settings,
  UserCog,
  History,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const mainNavItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/grant-calls", label: "Grant Calls", icon: Megaphone },
  { href: "/proposals", label: "Proposals", icon: FileText },
  { href: "/reviews", label: "Reviews", icon: Users },
  { href: "/awards", label: "Awards", icon: Award },
  { href: "/settings", label: "Settings", icon: Settings },
];

const adminNavItems: NavItem[] = [
  { href: "/admin/users", label: "Users & Roles", icon: UserCog },
  { href: "/admin/audit", label: "Audit Log", icon: History },
];

export default function Sidebar() {
  const { user } = useAuth();
  const [location] = useLocation();

  const getUserInitials = (user: any) => {
    if (!user) return "U";
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U";
  };

  const getUserRole = (user: any) => {
    if (!user?.roles) return "User";
    if (user.roles.includes("grant_manager")) return "Grant Manager";
    if (user.roles.includes("researcher")) return "Researcher";
    if (user.roles.includes("reviewer")) return "Reviewer";
    if (user.roles.includes("finance_officer")) return "Finance Officer";
    if (user.roles.includes("super_admin")) return "Super Admin";
    return "User";
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const isCurrentPath = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-200" data-testid="sidebar-header">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
            <GraduationCap className="text-white text-lg" />
          </div>
          <div className="ml-3">
            <h1 className="text-lg font-semibold text-gray-900">RGMA</h1>
            <p className="text-sm text-gray-500">Grant Management</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200" data-testid="user-info">
        <div className="flex items-center">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user?.profileImageUrl} />
            <AvatarFallback className="bg-primary-100 text-primary-600 text-sm font-medium">
              {getUserInitials(user)}
            </AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900" data-testid="text-user-name">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user?.email || "User"
              }
            </p>
            <p className="text-xs text-gray-500" data-testid="text-user-role">
              {getUserRole(user)}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 pt-4" data-testid="navigation-menu">
        <div className="px-4 space-y-1">
          {mainNavItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  isCurrentPath(item.href) && "bg-primary-50 text-primary-700"
                )}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <item.icon className={cn("mr-3", 
                  isCurrentPath(item.href) ? "text-primary-500" : "text-gray-400"
                )} />
                {item.label}
              </Button>
            </Link>
          ))}
        </div>
        
        {/* Admin Section */}
        <div className="mt-8 px-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Administration
          </h3>
          <div className="space-y-1">
            {adminNavItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    isCurrentPath(item.href) && "bg-primary-50 text-primary-700"
                  )}
                  data-testid={`admin-nav-${item.label.toLowerCase().replace(/[\s&]+/g, '-')}`}
                >
                  <item.icon className={cn("mr-3", 
                    isCurrentPath(item.href) ? "text-primary-500" : "text-gray-400"
                  )} />
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200" data-testid="logout-section">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-600 hover:text-gray-900"
          onClick={handleLogout}
          data-testid="button-logout"
        >
          <LogOut className="mr-3 text-gray-400" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
