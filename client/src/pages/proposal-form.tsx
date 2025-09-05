import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useParams } from "wouter";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import ProposalWizard from "@/components/forms/proposal-wizard";

export default function ProposalForm() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const params = useParams();
  const queryClient = useQueryClient();
  
  const isEdit = params.id !== undefined;
  const proposalId = params.id;

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

  // Fetch proposal data if editing
  const { data: proposal, isLoading: proposalLoading } = useQuery({
    queryKey: ["/api/proposals", proposalId],
    enabled: isEdit && !!proposalId,
    retry: false,
  });

  // Fetch available calls
  const { data: calls, isLoading: callsLoading } = useQuery({
    queryKey: ["/api/calls", { status: "published" }],
    retry: false,
  });

  // Fetch budget lines if editing
  const { data: budgetLines, isLoading: budgetLoading } = useQuery({
    queryKey: ["/api/proposals", proposalId, "budget"],
    enabled: isEdit && !!proposalId,
    retry: false,
  });

  const createProposalMutation = useMutation({
    mutationFn: async (proposalData: any) => {
      const response = await apiRequest("POST", "/api/proposals", proposalData);
      return response.json();
    },
    onSuccess: (newProposal) => {
      queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
      toast({
        title: "Proposal Created",
        description: "Your proposal has been saved as draft",
      });
      setLocation(`/proposals/${newProposal.id}/edit`);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to create proposal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateProposalMutation = useMutation({
    mutationFn: async (proposalData: any) => {
      const response = await apiRequest("PUT", `/api/proposals/${proposalId}`, proposalData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proposals", proposalId] });
      queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
      toast({
        title: "Proposal Updated",
        description: "Your changes have been saved",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to update proposal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const submitProposalMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/proposals/${proposalId}/submit`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proposals", proposalId] });
      queryClient.invalidateQueries({ queryKey: ["/api/proposals"] });
      toast({
        title: "Proposal Submitted",
        description: "Your proposal has been submitted for review",
      });
      setLocation("/proposals");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to submit proposal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSave = (data: any) => {
    if (isEdit) {
      updateProposalMutation.mutate(data);
    } else {
      createProposalMutation.mutate(data);
    }
  };

  const handleSubmit = () => {
    if (proposalId) {
      submitProposalMutation.mutate();
    }
  };

  const handleCancel = () => {
    setLocation("/proposals");
  };

  if (isLoading || (isEdit && proposalLoading)) {
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
        <Header title={isEdit ? "Edit Proposal" : "Create New Proposal"} />
        
        <main className="flex-1 overflow-y-auto">
          <ProposalWizard
            initialData={{
              proposal: proposal,
              budgetLines: budgetLines || [],
            }}
            calls={calls || []}
            isEdit={isEdit}
            isSubmitting={createProposalMutation.isPending || updateProposalMutation.isPending}
            onSave={handleSave}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            canSubmit={proposal?.status === "draft"}
          />
        </main>
      </div>
    </div>
  );
}
