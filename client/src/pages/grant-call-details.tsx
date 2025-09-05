import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, DollarSign, Edit } from "lucide-react";
import { format } from "date-fns";

export default function GrantCallDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  const { data: call, isLoading } = useQuery({
    queryKey: [`/api/calls/${id}`],
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
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!call) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header title="Grant Call Not Found" />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Grant Call Not Found</h2>
              <Button onClick={() => setLocation("/grant-calls")}>
                Back to Grant Calls
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Grant Call Details" />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setLocation("/grant-calls")}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Grant Calls
              </Button>
              <Button onClick={() => setLocation(`/grant-calls/${id}/manage`)}>
                <Edit className="h-4 w-4 mr-2" />
                Manage Call
              </Button>
            </div>

            {/* Main Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{call.title}</CardTitle>
                    <div className="flex items-center space-x-4">
                      <Badge className={getStatusColor(call.status)}>
                        {call.status}
                      </Badge>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {format(new Date(call.openDate), "PPP")} - {format(new Date(call.closeDate), "PPP")}
                      </div>
                      {call.budgetCap && (
                        <div className="flex items-center text-sm text-gray-500">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {formatCurrency(call.budgetCap)} cap
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {call.shortDescription && (
                  <div>
                    <h3 className="font-semibold mb-2">Summary</h3>
                    <p className="text-gray-700">{call.shortDescription}</p>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{call.description}</p>
                  </div>
                </div>

                {call.eligibilityCriteria && (
                  <div>
                    <h3 className="font-semibold mb-2">Eligibility Criteria</h3>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap">{call.eligibilityCriteria}</p>
                    </div>
                  </div>
                )}

                {call.rubrics && (
                  <div>
                    <h3 className="font-semibold mb-2">Evaluation Rubrics</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="text-sm">{JSON.stringify(call.rubrics, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-sm text-gray-600">Proposals Submitted</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-sm text-gray-600">Under Review</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-sm text-gray-600">Awarded</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}