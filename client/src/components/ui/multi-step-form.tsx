import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Step {
  id: string;
  title: string;
  description?: string;
  component: React.ComponentType<any>;
  validation?: (data: any) => boolean | string;
}

interface MultiStepFormProps {
  steps: Step[];
  initialData?: any;
  onComplete: (data: any) => void;
  onCancel?: () => void;
  onStepChange?: (stepIndex: number, data: any) => void;
  isSubmitting?: boolean;
  submitButtonText?: string;
  allowSkipValidation?: boolean;
}

export default function MultiStepForm({
  steps,
  initialData = {},
  onComplete,
  onCancel,
  onStepChange,
  isSubmitting = false,
  submitButtonText = "Complete",
  allowSkipValidation = false,
}: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateData = (stepData: any) => {
    const newData = { ...formData, ...stepData };
    setFormData(newData);
    if (onStepChange) {
      onStepChange(currentStep, newData);
    }
  };

  const validateCurrentStep = () => {
    if (allowSkipValidation) return true;
    
    const step = steps[currentStep];
    if (step.validation) {
      const result = step.validation(formData);
      if (typeof result === "string") {
        setErrors({ [step.id]: result });
        return false;
      }
      if (!result) {
        setErrors({ [step.id]: "Please complete all required fields" });
        return false;
      }
    }
    setErrors({});
    return true;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        onComplete(formData);
      }
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900" data-testid="form-title">
            {steps[currentStep].title}
          </h2>
          <span className="text-sm text-gray-500" data-testid="step-counter">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>
        
        <Progress value={progress} className="mb-4" data-testid="form-progress" />
        
        {steps[currentStep].description && (
          <p className="text-gray-600" data-testid="step-description">
            {steps[currentStep].description}
          </p>
        )}
        
        {errors[steps[currentStep].id] && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600" data-testid="step-error">
              {errors[steps[currentStep].id]}
            </p>
          </div>
        )}
      </div>

      {/* Step Navigation */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 overflow-x-auto">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => goToStep(index)}
              className={`flex-shrink-0 px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                index === currentStep
                  ? "bg-primary-100 text-primary-700"
                  : index < currentStep
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
              data-testid={`step-nav-${index}`}
            >
              {step.title}
            </button>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          <CurrentStepComponent
            data={formData}
            onChange={updateData}
            errors={errors}
          />
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center space-x-2">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={previousStep}
              disabled={isSubmitting}
              data-testid="button-previous"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
          )}
          
          {onCancel && (
            <Button
              variant="ghost"
              onClick={onCancel}
              disabled={isSubmitting}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
          )}
        </div>

        <Button
          onClick={nextStep}
          disabled={isSubmitting}
          data-testid={currentStep === steps.length - 1 ? "button-submit" : "button-next"}
        >
          {isSubmitting ? (
            "Processing..."
          ) : currentStep === steps.length - 1 ? (
            submitButtonText
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
