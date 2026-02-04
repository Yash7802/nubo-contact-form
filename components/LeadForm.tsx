"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const SERVICES = [
  "Nubo",
  "ERP Next",
  "Custom Software & Mobile Apps",
  "SaaS Platforms",
  "FinTech & Payment Solutions",
  "AI Solutions",
  "Blockchain Applications",
  "Cloud Hosting & DevOps",
  "Dedicated Teams & Staff Augmentation",
];

const LEAD_TYPES = [
  { value: "Hot Lead", color: "bg-red-500 hover:bg-red-600", textColor: "text-white" },
  { value: "Warm Lead", color: "bg-amber-500 hover:bg-amber-600", textColor: "text-white" },
  { value: "Maybe", color: "bg-blue-500 hover:bg-blue-600", textColor: "text-white" },
  { value: "Not Interested", color: "bg-gray-500 hover:bg-gray-600", textColor: "text-white" },
];

export default function LeadForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    email: "",
    companyName: "",
    services: [] as string[],
    comment: "",
    custom_lead_type: "",
  });
  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        servicesRef.current &&
        !servicesRef.current.contains(event.target as Node)
      ) {
        setServicesOpen(false);
      }
    };

    if (servicesOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [servicesOpen]);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceToggle = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, comment: e.target.value }));
  };

  const handlePhoneChange = (value: string | undefined) => {
    setFormData((prev) => ({ ...prev, mobile: value || "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          source: "Nubo Contact Form",
          custom_lead_purpose: formData.comment,
          custom_lead_type: formData.custom_lead_type,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: "Thank you! We will get back to you soon.",
        });
        setFormData({
          fullName: "",
          mobile: "",
          email: "",
          companyName: "",
          services: [],
          comment: "",
          custom_lead_type: "",
        });
      } else {
        setSubmitStatus({
          type: "error",
          message: data.error || "Something went wrong. Please try again.",
        });
      }
    } catch {
      setSubmitStatus({
        type: "error",
        message: "Network error. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-0 shadow-none sm:border sm:shadow-sm">
      <CardHeader className="text-center px-4 sm:px-6">
        <Image
          src="/ct-logo.png"
          alt="CT Logo"
          width={140}
          height={48}
          className="mx-auto mb-4"
        />
        <CardTitle className="text-xl sm:text-2xl">Get in Touch</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Fill out the form below and we&apos;ll get back to you shortly.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium">
              Full Name
            </Label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="Rahul Sharma"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile" className="text-sm font-medium">
              Mobile Number
            </Label>
            <PhoneInput
              id="mobile"
              international
              defaultCountry="IN"
              value={formData.mobile}
              onChange={handlePhoneChange}
              className="h-12 text-base border rounded-md px-3 [&>input]:border-0 [&>input]:outline-none [&>input]:h-full [&>input]:text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="rahul@example.com"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-sm font-medium">
              Company Name
            </Label>
            <Input
              id="companyName"
              name="companyName"
              placeholder="Tata Industries"
              value={formData.companyName}
              onChange={handleInputChange}
              required
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Services</Label>
            <div className="relative" ref={servicesRef}>
              <button
                type="button"
                onClick={() => setServicesOpen(!servicesOpen)}
                className="flex h-12 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <span
                  className={
                    formData.services.length === 0
                      ? "text-muted-foreground"
                      : ""
                  }
                >
                  {formData.services.length === 0
                    ? "Select services"
                    : `${formData.services.length} service${formData.services.length > 1 ? "s" : ""} selected`}
                </span>
                <svg
                  className={`h-4 w-4 transition-transform ${servicesOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {servicesOpen && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-2 shadow-md">
                  {SERVICES.map((service) => (
                    <label
                      key={service}
                      className="flex items-center gap-3 py-2 px-2 cursor-pointer hover:bg-accent rounded-sm"
                    >
                      <Checkbox
                        checked={formData.services.includes(service)}
                        onCheckedChange={() => handleServiceToggle(service)}
                      />
                      <span className="text-sm">{service}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Lead Status</Label>
            <div className="grid grid-cols-2 gap-2">
              {LEAD_TYPES.map((leadType) => (
                <button
                  key={leadType.value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      custom_lead_type: prev.custom_lead_type === leadType.value ? "" : leadType.value,
                    }))
                  }
                  className={`h-10 rounded-md text-sm font-medium transition-all ${
                    formData.custom_lead_type === leadType.value
                      ? `${leadType.color} ${leadType.textColor} ring-2 ring-offset-2 ring-gray-400`
                      : `${leadType.color} ${leadType.textColor} opacity-70`
                  }`}
                >
                  {leadType.value}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment" className="text-sm font-medium">
              Comments
            </Label>
            <Textarea
              id="comment"
              name="comment"
              placeholder="Tell us more about your project or requirements..."
              value={formData.comment}
              onChange={handleCommentChange}
              className="min-h-[100px] text-base resize-none"
            />
          </div>

          {submitStatus.type && (
            <div
              className={`p-4 rounded-md text-sm ${
                submitStatus.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {submitStatus.message}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-base font-medium mt-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
