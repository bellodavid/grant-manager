import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar, DollarSign, Users } from "lucide-react";
import { Link } from "wouter";

export default function GrantCalls() {
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

  const { data: calls, isLoading: callsLoading } = useQuery({
    queryKey: ["/api/calls"],
    retry: false,
  });


  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "closed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(amount));
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
        <Header title="Grant Calls" />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Header Actions */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search calls..."
                className="w-80"
                data-testid="input-search-calls"
              />
              <Select>
                <SelectTrigger className="w-48" data-testid="select-status-filter">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button asChild data-testid="button-create-call">
              <Link href="/grant-calls/new">
                <Plus className="w-4 h-4 mr-2" />
                Create New Call
              </Link>
            </Button>
          </div>

          {/* Calls Grid */}
          {callsLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : calls?.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No grant calls found</h3>
                <p className="text-gray-600 mb-4">Get started by creating your first grant call</p>
                <Button asChild data-testid="button-create-first-call">
                  <Link href="/grant-calls/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Call
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {calls?.map((call: any) => (
                <Card key={call.id} className="hover:shadow-md transition-shadow" data-testid={`card-call-${call.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2" data-testid={`text-call-title-${call.id}`}>
                        {call.title}
                      </CardTitle>
                      <Badge 
                        className={getStatusColor(call.status)}
                        data-testid={`badge-status-${call.id}`}
                      >
                        {call.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3" data-testid={`text-description-${call.id}`}>
                      {call.shortDescription || call.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span data-testid={`text-dates-${call.id}`}>
                          {formatDate(call.openDate)} - {formatDate(call.closeDate)}
                        </span>
                      </div>
                      
                      {call.budgetCap && (
                        <div className="flex items-center text-sm text-gray-500">
                          <DollarSign className="w-4 h-4 mr-2" />
                          <span data-testid={`text-budget-${call.id}`}>
                            Budget Cap: {formatCurrency(call.budgetCap)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="w-4 h-4 mr-2" />
                        <span data-testid={`text-proposals-${call.id}`}>
                          0 proposals submitted
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        asChild
                        data-testid={`button-view-${call.id}`}
                      >
                        <Link href={`/grant-calls/${call.id}`}>
                          View Details
                        </Link>
                      </Button>
                      <Button 
                        size="sm" 
                        asChild
                        data-testid={`button-manage-${call.id}`}
                      >
                        <Link href={`/grant-calls/${call.id}/manage`}>
                          Manage
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
