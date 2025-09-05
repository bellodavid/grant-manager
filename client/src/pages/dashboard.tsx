import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MetricsCards from "@/components/dashboard/metrics-cards";
import RecentActivity from "@/components/dashboard/recent-activity";
import CurrentCalls from "@/components/dashboard/current-calls";
import UpcomingDeadlines from "@/components/dashboard/upcoming-deadlines";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus, BarChart3 } from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
    retry: false,
  });

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ["/api/dashboard/activity"],
    retry: false,
  });

  const handleCreateCall = () => {
    // TODO: Navigate to create call page
    toast({
      title: "Feature Coming Soon",
      description: "Call creation wizard will be available in the next update",
    });
  };

  const handleAssignReviewers = () => {
    // TODO: Navigate to reviewer assignment page
    toast({
      title: "Feature Coming Soon", 
      description: "Reviewer assignment will be available in the next update",
    });
  };

  const handleGenerateReports = () => {
    // TODO: Navigate to reports page
    toast({
      title: "Feature Coming Soon",
      description: "Report generation will be available in the next update",
    });
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Dashboard" />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Key Metrics Cards */}
          <MetricsCards metrics={metrics} isLoading={metricsLoading} />

          {/* Quick Actions */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                className="bg-primary-500 hover:bg-primary-600 text-white p-4 h-auto justify-start"
                onClick={handleCreateCall}
                data-testid="button-create-call"
              >
                <Plus className="w-5 h-5 mr-3" />
                Create New Call
              </Button>
              <Button 
                className="bg-secondary-500 hover:bg-secondary-600 text-white p-4 h-auto justify-start"
                onClick={handleAssignReviewers}
                data-testid="button-assign-reviewers"
              >
                <UserPlus className="w-5 h-5 mr-3" />
                Assign Reviewers
              </Button>
              <Button 
                className="bg-accent-500 hover:bg-accent-600 text-white p-4 h-auto justify-start"
                onClick={handleGenerateReports}
                data-testid="button-generate-reports"
              >
                <BarChart3 className="w-5 h-5 mr-3" />
                Generate Reports
              </Button>
            </div>
          </div>

          {/* Recent Activity & Current Calls */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <RecentActivity activity={activity} isLoading={activityLoading} />
            <CurrentCalls />
          </div>

          {/* Upcoming Deadlines */}
          <UpcomingDeadlines />
        </main>
      </div>
    </div>
  );
}
