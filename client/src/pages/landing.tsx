import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  GraduationCap,
  FileText,
  Users,
  Award,
  BarChart3,
  Shield,
} from "lucide-react";
import AuthForm from "@/components/auth/auth-form";
import { useLocation } from "wouter";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold text-gray-900">Grant Flow</h1>
              <p className="text-sm text-gray-600">Research Grant Management</p>
            </div>
          </div>
          <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
            <DialogTrigger asChild>
              <Button data-testid="button-login">Sign In</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <AuthForm onSuccess={handleAuthSuccess} />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Streamline Your Research Grant Management
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            From grant calls to award tracking, manage your entire research
            funding lifecycle with our comprehensive platform designed for
            academic institutions.
          </p>
          <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
            <DialogTrigger asChild>
              <Button size="lg" data-testid="button-get-started">
                Get Started
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <AuthForm onSuccess={handleAuthSuccess} />
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need for Grant Management
          </h3>
          <p className="text-lg text-gray-600">
            Powerful features to support researchers, reviewers, and
            administrators
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-primary-600" />
              </div>
              <CardTitle>Call Management</CardTitle>
              <CardDescription>
                Create and manage grant calls with custom eligibility criteria,
                deadlines, and scoring rubrics
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-secondary-600" />
              </div>
              <CardTitle>Proposal Submission</CardTitle>
              <CardDescription>
                Multi-step proposal forms with team management, budget planning,
                and document uploads
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-accent-600" />
              </div>
              <CardTitle>Review Workflow</CardTitle>
              <CardDescription>
                Structured peer review process with blind review options and
                configurable scoring
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Award Tracking</CardTitle>
              <CardDescription>
                Monitor awarded projects, track milestones, and manage progress
                reporting
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Analytics & Reports</CardTitle>
              <CardDescription>
                Comprehensive reporting and analytics to track performance and
                compliance
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-indigo-600" />
              </div>
              <CardTitle>Role-Based Access</CardTitle>
              <CardDescription>
                Secure role-based permissions for researchers, reviewers, and
                administrators
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">
            Ready to Transform Your Grant Management?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Join leading research institutions using RGMA to streamline their
            funding processes
          </p>
          <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                variant="secondary"
                data-testid="button-cta-login"
              >
                Sign In to Get Started
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <AuthForm onSuccess={handleAuthSuccess} />
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-200">
        <div className="text-center text-gray-600">
          <p>
            &copy; 2024 Research Grant Management Application. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
