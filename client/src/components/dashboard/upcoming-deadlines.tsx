import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "lucide-react";

export default function UpcomingDeadlines() {
  // Since this would require complex queries across multiple tables and deadline calculation logic,
  // we'll show the structure but with empty state for now until the backend provides this endpoint
  const deadlines: any[] = [];
  const isLoading = false;

  const getTypeColor = (type: string) => {
    switch (type) {
      case "submission":
        return "bg-blue-100 text-blue-800";
      case "review":
        return "bg-amber-100 text-amber-800";
      case "report":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getUrgencyColor = (daysLeft: number) => {
    if (daysLeft <= 3) {
      return "bg-red-100 text-red-800";
    } else if (daysLeft <= 7) {
      return "bg-amber-100 text-amber-800";
    } else {
      return "bg-green-100 text-green-800";
    }
  };

  const formatDaysLeft = (daysLeft: number) => {
    if (daysLeft === 0) {
      return "Due today";
    } else if (daysLeft === 1) {
      return "1 day left";
    } else {
      return `${daysLeft} days left`;
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm border border-gray-200">
      <CardHeader className="p-6 border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-900">Upcoming Deadlines</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </div>
        ) : deadlines.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming deadlines</h3>
            <p className="text-gray-600">
              All caught up! Deadlines will appear here as they approach.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Call/Proposal
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PI/Reviewer
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </TableHead>
                  <TableHead className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white divide-y divide-gray-200">
                {deadlines.map((deadline, index) => (
                  <TableRow key={deadline.id} data-testid={`deadline-row-${index}`}>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getTypeColor(deadline.type)} data-testid={`deadline-type-${index}`}>
                        {deadline.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" data-testid={`deadline-title-${index}`}>
                      {deadline.title}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" data-testid={`deadline-person-${index}`}>
                      {deadline.person}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" data-testid={`deadline-due-date-${index}`}>
                      {deadline.dueDate}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getUrgencyColor(deadline.daysLeft)} data-testid={`deadline-status-${index}`}>
                        {formatDaysLeft(deadline.daysLeft)}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-primary-600 hover:text-primary-900"
                        data-testid={`button-view-deadline-${index}`}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
