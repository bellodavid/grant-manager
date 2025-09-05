import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import MultiStepForm from "@/components/ui/multi-step-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus } from "lucide-react";

// Form schemas for each step
const projectInfoSchema = z.object({
  callId: z.string().min(1, "Please select a grant call"),
  title: z.string().min(1, "Title is required").max(500, "Title must be less than 500 characters"),
  abstract: z.string().min(1, "Abstract is required").max(5000, "Abstract must be less than 5000 characters"),
  objectives: z.string().optional(),
  methodology: z.string().optional(),
  expectedOutcomes: z.string().optional(),
});

const budgetSchema = z.object({
  totalBudget: z.string().optional(),
  budgetLines: z.array(z.object({
    category: z.string().min(1, "Category is required"),
    description: z.string().min(1, "Description is required"),
    amount: z.string().min(1, "Amount is required"),
    justification: z.string().optional(),
  })).optional(),
});

interface ProposalWizardProps {
  initialData?: {
    proposal?: any;
    budgetLines?: any[];
  };
  calls: any[];
  isEdit: boolean;
  isSubmitting: boolean;
  onSave: (data: any) => void;
  onSubmit?: () => void;
  onCancel: () => void;
  canSubmit?: boolean;
}

// Project Information Step
function ProjectInfoStep({ data, onChange, calls }: any) {
  const form = useForm({
    resolver: zodResolver(projectInfoSchema),
    defaultValues: {
      callId: data?.callId || "",
      title: data?.title || "",
      abstract: data?.abstract || "",
      objectives: data?.objectives || "",
      methodology: data?.methodology || "",
      expectedOutcomes: data?.expectedOutcomes || "",
    },
  });

  const onSubmit = (values: any) => {
    onChange(values);
  };

  // Watch for changes and auto-save
  const watchedValues = form.watch();
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="callId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grant Call *</FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  onChange({ ...watchedValues, callId: value });
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger data-testid="select-grant-call">
                    <SelectValue placeholder="Select a grant call" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {calls?.map((call: any) => (
                    <SelectItem key={call.id} value={call.id}>
                      {call.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Title *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter project title" 
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    onChange({ ...watchedValues, title: e.target.value });
                  }}
                  data-testid="input-project-title"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="abstract"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Abstract *</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Provide a clear and concise summary of your research project..."
                  className="min-h-32"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    onChange({ ...watchedValues, abstract: e.target.value });
                  }}
                  data-testid="textarea-abstract"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="objectives"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Research Objectives</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the specific objectives of your research..."
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    onChange({ ...watchedValues, objectives: e.target.value });
                  }}
                  data-testid="textarea-objectives"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="methodology"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Methodology</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your research methodology and approach..."
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    onChange({ ...watchedValues, methodology: e.target.value });
                  }}
                  data-testid="textarea-methodology"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expectedOutcomes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expected Outcomes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the expected outcomes and impact of your research..."
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    onChange({ ...watchedValues, expectedOutcomes: e.target.value });
                  }}
                  data-testid="textarea-expected-outcomes"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

// Budget Step
function BudgetStep({ data, onChange }: any) {
  const [budgetLines, setBudgetLines] = useState(data?.budgetLines || []);
  const [totalBudget, setTotalBudget] = useState(data?.totalBudget || "");

  const budgetCategories = [
    { value: "personnel", label: "Personnel" },
    { value: "equipment", label: "Equipment" },
    { value: "travel", label: "Travel" },
    { value: "materials", label: "Materials & Supplies" },
    { value: "overhead", label: "Overhead" },
    { value: "other", label: "Other" },
  ];

  const addBudgetLine = () => {
    const newLine = {
      id: Date.now().toString(),
      category: "",
      description: "",
      amount: "",
      justification: "",
    };
    const newBudgetLines = [...budgetLines, newLine];
    setBudgetLines(newBudgetLines);
    onChange({ ...data, budgetLines: newBudgetLines, totalBudget });
  };

  const updateBudgetLine = (index: number, field: string, value: string) => {
    const newBudgetLines = [...budgetLines];
    newBudgetLines[index] = { ...newBudgetLines[index], [field]: value };
    setBudgetLines(newBudgetLines);
    
    // Calculate total budget
    const calculatedTotal = newBudgetLines.reduce((sum, line) => {
      return sum + (parseFloat(line.amount) || 0);
    }, 0);
    
    setTotalBudget(calculatedTotal.toString());
    onChange({ ...data, budgetLines: newBudgetLines, totalBudget: calculatedTotal.toString() });
  };

  const removeBudgetLine = (index: number) => {
    const newBudgetLines = budgetLines.filter((_: any, i: number) => i !== index);
    setBudgetLines(newBudgetLines);
    
    const calculatedTotal = newBudgetLines.reduce((sum: number, line: any) => {
      return sum + (parseFloat(line.amount) || 0);
    }, 0);
    
    setTotalBudget(calculatedTotal.toString());
    onChange({ ...data, budgetLines: newBudgetLines, totalBudget: calculatedTotal.toString() });
  };

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return isNaN(num) ? "$0" : new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  return (
    <div className="space-y-6">
      {/* Total Budget Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Budget Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total Project Budget:</span>
            <span className="text-2xl font-bold text-green-600" data-testid="text-total-budget">
              {formatCurrency(totalBudget)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Budget Lines */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Budget Breakdown</h3>
          <Button 
            type="button" 
            onClick={addBudgetLine}
            data-testid="button-add-budget-line"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Budget Line
          </Button>
        </div>

        {budgetLines.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">No budget items added yet. Click "Add Budget Line" to start.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {budgetLines.map((line: any, index: number) => (
              <Card key={line.id || index} data-testid={`budget-line-${index}`}>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <Select
                        value={line.category}
                        onValueChange={(value) => updateBudgetLine(index, "category", value)}
                      >
                        <SelectTrigger data-testid={`select-category-${index}`}>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {budgetCategories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                      </label>
                      <Input
                        placeholder="Budget item description"
                        value={line.description}
                        onChange={(e) => updateBudgetLine(index, "description", e.target.value)}
                        data-testid={`input-description-${index}`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount ($) *
                      </label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={line.amount}
                        onChange={(e) => updateBudgetLine(index, "amount", e.target.value)}
                        data-testid={`input-amount-${index}`}
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeBudgetLine(index)}
                        className="text-red-600 hover:text-red-700"
                        data-testid={`button-remove-${index}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Justification
                    </label>
                    <Textarea
                      placeholder="Explain why this budget item is necessary..."
                      value={line.justification}
                      onChange={(e) => updateBudgetLine(index, "justification", e.target.value)}
                      data-testid={`textarea-justification-${index}`}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Review Step
function ReviewStep({ data }: any) {
  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount);
    return isNaN(num) ? "$0" : new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Review Your Proposal</h3>
        <p className="text-gray-600 mb-6">
          Please review all information before submitting. You can go back to make changes if needed.
        </p>
      </div>

      {/* Project Information */}
      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Title</label>
            <p className="text-gray-900" data-testid="review-title">{data.title}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Abstract</label>
            <p className="text-gray-900" data-testid="review-abstract">{data.abstract}</p>
          </div>
          {data.objectives && (
            <div>
              <label className="text-sm font-medium text-gray-500">Objectives</label>
              <p className="text-gray-900" data-testid="review-objectives">{data.objectives}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Budget Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-medium">Total Budget:</span>
            <span className="text-2xl font-bold text-green-600" data-testid="review-total-budget">
              {formatCurrency(data.totalBudget || "0")}
            </span>
          </div>
          
          {data.budgetLines && data.budgetLines.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Budget Breakdown:</h4>
              {data.budgetLines.map((line: any, index: number) => (
                <div key={index} className="flex justify-between text-sm" data-testid={`review-budget-line-${index}`}>
                  <span>{line.description} ({line.category})</span>
                  <span>{formatCurrency(line.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProposalWizard({
  initialData,
  calls,
  isEdit,
  isSubmitting,
  onSave,
  onSubmit,
  onCancel,
  canSubmit = true,
}: ProposalWizardProps) {
  const steps = [
    {
      id: "project-info",
      title: "Project Information",
      description: "Provide basic information about your research project",
      component: (props: any) => <ProjectInfoStep {...props} calls={calls} />,
      validation: (data: any) => {
        const result = projectInfoSchema.safeParse(data);
        return result.success ? true : "Please complete all required fields";
      },
    },
    {
      id: "budget",
      title: "Budget & Funding",
      description: "Define your project budget and funding requirements",
      component: BudgetStep,
    },
    {
      id: "review",
      title: "Review & Submit",
      description: "Review your proposal before submission",
      component: ReviewStep,
    },
  ];

  const handleComplete = (data: any) => {
    if (isEdit && canSubmit && onSubmit) {
      // If editing and can submit, show submit action
      onSubmit();
    } else {
      // Otherwise just save
      onSave(data);
    }
  };

  const handleStepChange = (stepIndex: number, data: any) => {
    // Auto-save on step changes
    onSave(data);
  };

  return (
    <div>
      <MultiStepForm
        steps={steps}
        initialData={initialData?.proposal || {}}
        onComplete={handleComplete}
        onCancel={onCancel}
        onStepChange={handleStepChange}
        isSubmitting={isSubmitting}
        submitButtonText={isEdit && canSubmit ? "Submit Proposal" : "Save Proposal"}
        allowSkipValidation={isEdit}
      />
      
      {/* Additional actions for edit mode */}
      {isEdit && canSubmit && onSubmit && (
        <div className="max-w-4xl mx-auto px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <Badge variant="secondary" className="mr-2">Draft</Badge>
              Your proposal is saved as a draft. Submit it when ready for review.
            </div>
            <Button 
              onClick={onSubmit}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-submit-proposal"
            >
              {isSubmitting ? "Submitting..." : "Submit for Review"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
