import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Calendar, DollarSign, FileText } from "lucide-react";

export default function CurrentCalls() {
  const { data: calls, isLoading } = useQuery({
    queryKey: ["/api/calls", { status: "published" }],
    retry: false,
  });

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: 'compact',
    }).format(Number(amount));
  };

  const formatDeadline = (closeDate: string) => {
    const date = new Date(closeDate);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return "Closed";
    } else if (diffDays === 0) {
      return "Closes today";
    } else if (diffDays === 1) {
      return "Closes tomorrow";
    } else if (diffDays <= 7) {
      return `Closes in ${diffDays} days`;
    } else {
      return `Closes ${date.toLocaleDateString()}`;
    }
  };

  const getStatusBadge = (closeDate: string) => {
    const date = new Date(closeDate);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: "Closed", className: "bg-gray-100 text-gray-800" };
    } else if (diffDays <= 3) {
      return { label: "Closing Soon", className: "bg-red-100 text-red-800" };
    } else if (diffDays <= 7) {
      return { label: "Open", className: "bg-yellow-100 text-yellow-800" };
    } else {
      return { label: "Open", className: "bg-green-100 text-green-800" };
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm border border-gray-200">
      <CardHeader className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Current Calls</CardTitle>
          <Button 
            variant="ghost" 
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            data-testid="button-manage-all-calls"
          >
            Manage All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border-b border-gray-100 last:border-b-0 pb-4 mb-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-32 mb-2" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-24" />
              </div>
            ))}
          </div>
        ) : !calls || calls.length === 0 ? (
          <div className="p-6 text-center">
            <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No active calls</p>
          </div>
        ) : (
          <>
            {calls.slice(0, 3).map((call: any, index: number) => {
              const statusBadge = getStatusBadge(call.closeDate);
              return (
                <div 
                  key={call.id} 
                  className="px-6 py-4 border-b border-gray-100 last:border-b-0"
                  data-testid={`current-call-${index}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-1" data-testid={`call-title-${index}`}>
                        {call.title}
                      </h4>
                      <div className="mt-1 flex items-center text-xs text-gray-500">
                        <span data-testid={`call-proposals-${index}`}>0 proposals</span>
                        <span className="mx-2">•</span>
                        <span data-testid={`call-budget-${index}`}>
                          {call.budgetCap ? formatCurrency(call.budgetCap) + " budget" : "No budget cap"}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center">
                        <Badge className={statusBadge.className} data-testid={`call-status-${index}`}>
                          {statusBadge.label}
                        </Badge>
                        <span className="ml-2 text-xs text-gray-500" data-testid={`call-deadline-${index}`}>
                          {formatDeadline(call.closeDate)}
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="ml-4 text-gray-400 hover:text-gray-600 p-1"
                      data-testid={`button-manage-call-${index}`}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </CardContent>
    </Card>
  );
}
