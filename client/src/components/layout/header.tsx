import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
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
import { Bell, Search, HelpCircle, LogOut, Settings, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const signOutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/signout");
      return response.json();
    },
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully.",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Sign Out Failed",
        description: error.message || "Failed to sign out.",
        variant: "destructive",
      });
    },
  });

  const getUserInitials = (user: any) => {
    if (!user) return "U";
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "U";
  };

  const handleNotifications = () => {
    // TODO: Implement notifications panel
    console.log("Show notifications");
  };

  const handleHelp = () => {
    // TODO: Implement help/support
    console.log("Show help");
  };

  const handleSignOut = () => {
    signOutMutation.mutate();
  };

  const handleSettings = () => {
    setLocation("/settings");
  };

  return (
    <header
      className="bg-white shadow-sm border-b border-gray-200"
      data-testid="header"
    >
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex-1 flex items-center">
          <h2
            className="text-2xl font-semibold text-gray-900"
            data-testid="header-title"
          >
            {title}
          </h2>
          <div className="ml-6 flex items-center">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search proposals, calls, researchers..."
                className="w-96 pl-10 pr-4"
                data-testid="input-global-search"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="relative p-2"
            onClick={handleNotifications}
            data-testid="button-notifications"
          >
            <Bell className="w-5 h-5 text-gray-400 hover:text-gray-500" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center p-0">
              3
            </Badge>
          </Button>

          {/* Help */}
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
            onClick={handleHelp}
            data-testid="button-help"
          >
            <HelpCircle className="w-5 h-5 text-gray-400 hover:text-gray-500" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="p-0"
                data-testid="button-user-menu"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.profileImageUrl} />
                  <AvatarFallback className="bg-primary-100 text-primary-600 text-sm font-medium">
                    {getUserInitials(user)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSettings}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                disabled={signOutMutation.isPending}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>
                  {signOutMutation.isPending ? "Signing out..." : "Sign out"}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
