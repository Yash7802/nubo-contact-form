"use client";

import { useState } from "react";
import Image from "next/image";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export default function LeadForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    email: "",
    companyName: "",
    service: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceChange = (value: string) => {
    setFormData((prev) => ({ ...prev, service: value }));
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
          custom_lead_package: formData.service,
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
          service: "",
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
          src="/Nubo_Logo.svg"
          alt="Nubo Logo"
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
            <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
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
            <Label htmlFor="mobile" className="text-sm font-medium">Mobile Number</Label>
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
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
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
            <Label htmlFor="companyName" className="text-sm font-medium">Company Name</Label>
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
            <Label htmlFor="service" className="text-sm font-medium">Service</Label>
            <Select
              value={formData.service}
              onValueChange={handleServiceChange}
              required
            >
              <SelectTrigger id="service" className="w-full h-12 text-base">
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {SERVICES.map((service) => (
                  <SelectItem key={service} value={service} className="py-3">
                    {service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          <Button type="submit" className="w-full h-12 text-base font-medium mt-2" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
