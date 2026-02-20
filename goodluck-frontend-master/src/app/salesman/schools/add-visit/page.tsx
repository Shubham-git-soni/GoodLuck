"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import PageContainer from "@/components/layouts/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner"; // Uncomment when Sonner is installed

// Step components
import StepSchoolSelection from "@/components/forms/visit/StepSchoolSelection";
import StepContactPerson from "@/components/forms/visit/StepContactPerson";
import StepPurpose from "@/components/forms/visit/StepPurpose";
import StepJointWorking from "@/components/forms/visit/StepJointWorking";
import StepSpecimenAllocation from "@/components/forms/visit/StepSpecimenAllocation";
import StepFeedback from "@/components/forms/visit/StepFeedback";
import StepNextVisit from "@/components/forms/visit/StepNextVisit";

const steps = [
  { number: 1, title: "School Selection", component: "school" },
  { number: 2, title: "Contact Person", component: "contact" },
  { number: 3, title: "Purpose of Visit", component: "purpose" },
  { number: 4, title: "Joint Working", component: "joint" },
  { number: 5, title: "Specimen Allocation", component: "specimen" },
  { number: 6, title: "Feedback", component: "feedback" },
  { number: 7, title: "Next Visit", component: "next" },
];

function AddSchoolVisitForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    // Step 1
    city: "",
    schoolId: "",
    supplyThrough: "",
    // Step 2
    selectedContacts: [] as string[],
    newContacts: [] as { name: string; role: string }[],
    // Step 3
    purposes: [] as string[],
    needMappingType: "",
    // Step 4
    hasManager: false,
    managerId: "",
    managerType: "",
    // Step 5
    specimenRequired: "",
    specimensGiven: [] as any[],
    specimensReturned: [] as any[],
    paymentReceivedGL: 0,
    paymentReceivedVP: 0,
    // Step 6
    feedbackCategory: "",
    feedbackComment: "",
    schoolFeedback: "",
    schoolSpecialRequest: "",
    // Step 7
    nextVisitDate: "",
    nextVisitPurpose: "",
    reminder: "",
  });

  useEffect(() => {
    // Pre-fill school if coming from school profile
    const schoolId = searchParams.get("schoolId");
    if (schoolId) {
      setFormData((prev) => ({ ...prev, schoolId }));
    }
  }, [searchParams]);

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      toast.success("Visit logged successfully!"); // Uncomment when Sonner is installed
      console.log("Form submitted:", formData);
      setIsSubmitting(false);
      router.push("/salesman/schools");
    }, 1500);
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Cancel
        </Button>

        <h1 className="text-2xl md:text-3xl font-bold mb-2">Add School Visit</h1>
        <p className="text-muted-foreground">
          Complete all steps to log your school visit
        </p>
      </div>

      {/* Progress */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">
                Step {currentStep} of {steps.length}
              </p>
              <p className="text-sm text-muted-foreground">{Math.round(progress)}%</p>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Indicators */}
          <div className="hidden md:flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                      currentStep > step.number
                        ? "bg-primary border-primary text-primary-foreground"
                        : currentStep === step.number
                        ? "border-primary text-primary"
                        : "border-muted text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.number ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{step.number}</span>
                    )}
                  </div>
                  <p className="text-xs mt-2 text-center max-w-[80px]">
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 w-12 mx-2 ${
                      currentStep > step.number ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          <CardDescription>
            {currentStep === 1 && "Select the city and school you're visiting"}
            {currentStep === 2 && "Add or select contact persons you met"}
            {currentStep === 3 && "Select the purpose(s) of your visit"}
            {currentStep === 4 && "Was this a joint visit with your manager?"}
            {currentStep === 5 && "Record specimen books given and returned"}
            {currentStep === 6 && "Share your feedback about the visit"}
            {currentStep === 7 && "Schedule the next visit (optional)"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <StepSchoolSelection formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 2 && (
            <StepContactPerson formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 3 && (
            <StepPurpose formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 4 && (
            <StepJointWorking formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 5 && (
            <StepSpecimenAllocation formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 6 && (
            <StepFeedback formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 7 && (
            <StepNextVisit formData={formData} updateFormData={updateFormData} />
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pb-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        {currentStep < steps.length ? (
          <Button onClick={handleNext}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Visit"}
          </Button>
        )}
      </div>
    </PageContainer>
  );
}

export default function AddSchoolVisitPage() {
  return (
    <Suspense fallback={
      <PageContainer>
        <div className="mb-6">
          <Button variant="ghost" size="sm" disabled>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Add School Visit</CardTitle>
            <CardDescription>Loading...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <div className="text-center text-muted-foreground">Loading form...</div>
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    }>
      <AddSchoolVisitForm />
    </Suspense>
  );
}
