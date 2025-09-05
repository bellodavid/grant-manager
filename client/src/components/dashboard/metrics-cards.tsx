import { Card, CardContent } from "@/components/ui/card";
import { FileText, Clock, Trophy, Megaphone } from "lucide-react";

interface MetricsCardsProps {
  metrics: any;
  isLoading: boolean;
}

export default function MetricsCards({ metrics, isLoading }: MetricsCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: amount >= 1000000 ? 'compact' : 'standard',
    }).format(amount);
  };

  const cards = [
    {
      title: "Active Proposals",
      value: metrics?.activeProposals || 0,
      change: "+12% from last month",
      changeType: "positive",
      icon: FileText,
      iconBg: "bg-primary-100",
      iconColor: "text-primary-600",
      testId: "metric-active-proposals"
    },
    {
      title: "Pending Reviews", 
      value: metrics?.pendingReviews || 0,
      change: "8 overdue",
      changeType: "warning",
      icon: Clock,
      iconBg: "bg-secondary-100",
      iconColor: "text-secondary-600",
      testId: "metric-pending-reviews"
    },
    {
      title: "Awards YTD",
      value: metrics?.awardsYTD || 0,
      change: metrics?.totalAwardAmount ? formatCurrency(metrics.totalAwardAmount) + " awarded" : "$0 awarded",
      changeType: "positive",
      icon: Trophy,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      testId: "metric-awards-ytd"
    },
    {
      title: "Open Calls",
      value: metrics?.openCalls || 0,
      change: "3 closing soon",
      changeType: "neutral",
      icon: Megaphone,
      iconBg: "bg-accent-100", 
      iconColor: "text-accent-600",
      testId: "metric-open-calls"
    }
  ];

  const getChangeColor = (type: string) => {
    switch (type) {
      case "positive":
        return "text-green-600";
      case "warning":
        return "text-amber-600";
      case "negative":
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => (
        <Card key={card.title} className="bg-white rounded-lg shadow-sm border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                  <card.icon className={`${card.iconColor} text-xl`} />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                {isLoading ? (
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-2xl font-semibold text-gray-900" data-testid={card.testId}>
                    {card.value.toLocaleString()}
                  </p>
                )}
                <p className={`text-sm ${getChangeColor(card.changeType)}`}>
                  {card.change}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
