import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Eye, Users, FileText, Award } from "lucide-react";

export default function ManageCall() {
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
        <Header title="Manage Grant Call" />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
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
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setLocation(`/grant-calls/${id}`)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Call
                </Button>
              </div>
            </div>

            {/* Call Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{call.title}</CardTitle>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className={getStatusColor(call.status)}>
                        {call.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Management Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <FileText className="w-8 h-8 mx-auto mb-4 text-blue-600" />
                  <h3 className="font-semibold mb-2">Proposals</h3>
                  <p className="text-sm text-gray-600 mb-4">View and manage submitted proposals</p>
                  <Button variant="outline" size="sm" className="w-full">
                    View Proposals (0)
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 mx-auto mb-4 text-green-600" />
                  <h3 className="font-semibold mb-2">Reviewers</h3>
                  <p className="text-sm text-gray-600 mb-4">Assign and manage reviewers</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Manage Reviewers
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Award className="w-8 h-8 mx-auto mb-4 text-purple-600" />
                  <h3 className="font-semibold mb-2">Awards</h3>
                  <p className="text-sm text-gray-600 mb-4">Manage funding decisions</p>
                  <Button variant="outline" size="sm" className="w-full">
                    View Awards (0)
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <FileText className="w-8 h-8 mx-auto mb-4 text-orange-600" />
                  <h3 className="font-semibold mb-2">Reports</h3>
                  <p className="text-sm text-gray-600 mb-4">Generate call reports</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-sm text-gray-600">Total Proposals</p>
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
              <Card>
                <CardContent className="p-6">
                  <div className="text-2xl font-bold">$0</div>
                  <p className="text-sm text-gray-600">Total Awarded</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  No recent activity for this grant call
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}