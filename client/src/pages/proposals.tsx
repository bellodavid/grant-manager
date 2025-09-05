import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar, DollarSign, User, Edit } from "lucide-react";

export default function Proposals() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

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

  const { data: proposals, isLoading: proposalsLoading } = useQuery({
    queryKey: ["/api/proposals", { status: statusFilter !== "all" ? statusFilter : undefined, search: searchQuery || undefined }],
    retry: false,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-blue-100 text-blue-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "admin_review":
        return "bg-yellow-100 text-yellow-800";
      case "peer_review":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not submitted";
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: string | number | null) => {
    if (!amount) return "N/A";
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
        <Header title="Proposals" />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Header Actions */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Input
                placeholder="Search proposals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-80"
                data-testid="input-search-proposals"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48" data-testid="select-status-filter">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="admin_review">Admin Review</SelectItem>
                  <SelectItem value="peer_review">Peer Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Link href="/proposals/new">
              <Button data-testid="button-create-proposal">
                <Plus className="w-4 h-4 mr-2" />
                Create New Proposal
              </Button>
            </Link>
          </div>

          {/* Proposals Grid */}
          {proposalsLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : proposals?.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No proposals found</h3>
                <p className="text-gray-600 mb-4">
                  {statusFilter !== "all" || searchQuery 
                    ? "Try adjusting your filters to see more results"
                    : "Get started by creating your first proposal"
                  }
                </p>
                {statusFilter === "all" && !searchQuery && (
                  <Link href="/proposals/new">
                    <Button data-testid="button-create-first-proposal">
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Proposal
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {proposals?.map((proposal: any) => (
                <Card key={proposal.id} className="hover:shadow-md transition-shadow" data-testid={`card-proposal-${proposal.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2" data-testid={`text-proposal-title-${proposal.id}`}>
                        {proposal.title}
                      </CardTitle>
                      <Badge 
                        className={getStatusColor(proposal.status)}
                        data-testid={`badge-status-${proposal.id}`}
                      >
                        {proposal.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3" data-testid={`text-abstract-${proposal.id}`}>
                      {proposal.abstract}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span data-testid={`text-submission-date-${proposal.id}`}>
                          Submitted: {formatDate(proposal.submissionDate)}
                        </span>
                      </div>
                      
                      {proposal.totalBudget && (
                        <div className="flex items-center text-sm text-gray-500">
                          <DollarSign className="w-4 h-4 mr-2" />
                          <span data-testid={`text-budget-${proposal.id}`}>
                            Budget: {formatCurrency(proposal.totalBudget)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="w-4 h-4 mr-2" />
                        <span data-testid={`text-pi-${proposal.id}`}>
                          PI: {user?.firstName} {user?.lastName}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                      {proposal.status === "draft" && (
                        <Link href={`/proposals/${proposal.id}/edit`}>
                          <Button variant="outline" size="sm" data-testid={`button-edit-${proposal.id}`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </Link>
                      )}
                      <Button size="sm" data-testid={`button-view-${proposal.id}`}>
                        View Details
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
