import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Check, Megaphone, User, Clock } from "lucide-react";

interface RecentActivityProps {
  activity: any[];
  isLoading: boolean;
}

export default function RecentActivity({ activity, isLoading }: RecentActivityProps) {
  const getActivityIcon = (action: string) => {
    switch (action) {
      case "create_proposal":
      case "submit_proposal":
        return FileText;
      case "create_review":
      case "complete_review":
        return Check;
      case "create_call":
        return Megaphone;
      default:
        return User;
    }
  };

  const getActivityColor = (action: string) => {
    switch (action) {
      case "create_proposal":
      case "submit_proposal":
        return "bg-primary-100 text-primary-600";
      case "create_review":
      case "complete_review":
        return "bg-green-100 text-green-600";
      case "create_call":
        return "bg-accent-100 text-accent-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const formatActivityMessage = (activityItem: any) => {
    switch (activityItem.action) {
      case "create_proposal":
        return "New proposal created";
      case "submit_proposal":
        return "Proposal submitted for review";
      case "create_review":
        return "Review submitted";
      case "create_call":
        return "New grant call published";
      default:
        return activityItem.action.replace('_', ' ');
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return `${diffDays} days ago`;
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm border border-gray-200">
      <CardHeader className="p-6 border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start mb-4">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                <div className="ml-3 flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : !activity || activity.length === 0 ? (
          <div className="p-6 text-center">
            <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No recent activity</p>
          </div>
        ) : (
          <>
            {activity.slice(0, 5).map((activityItem, index) => {
              const IconComponent = getActivityIcon(activityItem.action);
              return (
                <div 
                  key={activityItem.id} 
                  className="px-6 py-4 border-b border-gray-100 last:border-b-0"
                  data-testid={`activity-item-${index}`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activityItem.action)}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm text-gray-900" data-testid={`activity-message-${index}`}>
                        {formatActivityMessage(activityItem)}
                      </p>
                      <p className="text-xs text-gray-500" data-testid={`activity-timestamp-${index}`}>
                        {formatTimestamp(activityItem.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <Button 
            variant="ghost" 
            className="text-primary-600 hover:text-primary-700 text-sm font-medium w-full justify-start p-0"
            data-testid="button-view-all-activity"
          >
            View all activity →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
