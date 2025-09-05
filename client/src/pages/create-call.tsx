import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCallSchema } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CalendarIcon, ArrowLeft } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import * as z from "zod";

const createCallSchema = insertCallSchema.extend({
  openDate: z.date({
    required_error: "Open date is required",
  }),
  closeDate: z.date({
    required_error: "Close date is required",
  }),
  budgetCap: z.string().optional(),
});

type CreateCallForm = z.infer<typeof createCallSchema>;

export default function CreateCall() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateCallForm>({
    resolver: zodResolver(createCallSchema),
    defaultValues: {
      title: "",
      description: "",
      shortDescription: "",
      eligibilityCriteria: "",
      budgetCap: "",
      rubrics: null,
    },
  });

  const createCallMutation = useMutation({
    mutationFn: async (data: CreateCallForm) => {
      const payload = {
        ...data,
        budgetCap: data.budgetCap ? parseFloat(data.budgetCap) : null,
      };
      const response = await apiRequest("POST", "/api/calls", payload);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Grant call created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/calls"] });
      setLocation("/grant-calls");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create grant call",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateCallForm) => {
    createCallMutation.mutate(data);
  };

  return (
    <div
      className="container mx-auto py-6 space-y-6"
      data-testid="create-call-page"
    >
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => setLocation("/grant-calls")}
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Grant Calls
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Grant Call</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter grant call title"
                        {...field}
                        data-testid="input-title"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shortDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief summary of the grant call"
                        rows={3}
                        {...field}
                        value={field.value || ""}
                        data-testid="input-short-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detailed description of the grant call"
                        rows={8}
                        {...field}
                        data-testid="input-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="openDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Open Date *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                              data-testid="button-open-date"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="closeDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Close Date *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                              data-testid="button-close-date"
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="budgetCap"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Cap</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Maximum budget per proposal"
                        {...field}
                        data-testid="input-budget-cap"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="eligibilityCriteria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Eligibility Criteria</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Who can apply for this grant"
                        rows={4}
                        {...field}
                        value={field.value || ""}
                        data-testid="input-eligibility"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/grant-calls")}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createCallMutation.isPending}
                  data-testid="button-create"
                >
                  {createCallMutation.isPending
                    ? "Creating..."
                    : "Create Grant Call"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
