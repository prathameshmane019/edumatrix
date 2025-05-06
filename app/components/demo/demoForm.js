"use client";

import React, { useState } from "react";
import { Button, Input, Card, CardBody, CardHeader } from "@nextui-org/react";
import Link from "next/link";

const DemoForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/v2/schedule-demo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFormData({ name: "", email: "", phone: "" });
      } else {
        setError(data.message || "Failed to schedule demo. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-violet-50 to-violet-100">
        <Card className="max-w-lg w-full text-center p-6 border-none shadow-xl">
          <CardBody>
            <div className="flex justify-center mb-6">
              <SuccessIcon />
            </div>
            <h2 className="text-3xl font-bold mb-3 text-violet-800">Thank You!</h2>
            <p className="text-gray-600 mb-6 text-lg">
              Your demo has been scheduled successfully. Please check your email for details.
            </p>
            <Link href="/">
              <Button color="primary" className="w-full bg-violet-600 hover:bg-violet-700 font-medium text-white shadow-md">
                Back to Home
              </Button>
            </Link>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-violet-100 flex items-center justify-center p-4">
      <Card className="max-w-4xl w-full flex flex-col md:flex-row border-none shadow-xl overflow-hidden">
        <div className="w-full md:w-1/2 bg-violet-100 flex justify-center items-center p-6">
          <DemoIllustration />
        </div>
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center bg-white">
          <CardHeader className="flex flex-col pb-4 gap-1">
            <h2 className="text-2xl md:text-3xl font-bold text-violet-800">Schedule a Demo</h2>
            <p className="text-violet-600 text-lg">
              Experience the power of EduMatrix Pro firsthand
            </p>
          </CardHeader>

          <CardBody className="px-0">
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                type="text"
                name="name"
                label="Full Name"
                variant="bordered"
                value={formData.name}
                onChange={handleChange}
                required
                classNames={{
                  input: 'bg-transparent',
                  inputWrapper: 'bg-violet-50 hover:bg-violet-100 transition-colors border-violet-200 focus-within:border-violet-400',
                  label: 'text-violet-700'
                }}
              />
              <Input
                type="email"
                name="email"
                label="Work Email"
                variant="bordered"
                value={formData.email}
                onChange={handleChange}
                required
                classNames={{
                  input: 'bg-transparent',
                  inputWrapper: 'bg-violet-50 hover:bg-violet-100 transition-colors border-violet-200 focus-within:border-violet-400',
                  label: 'text-violet-700'
                }}
              />
              <Input
                type="tel"
                name="phone"
                label="Phone Number"
                variant="bordered"
                value={formData.phone}
                onChange={handleChange}
                classNames={{
                  input: 'bg-transparent',
                  inputWrapper: 'bg-violet-50 hover:bg-violet-100 transition-colors border-violet-200 focus-within:border-violet-400',
                  label: 'text-violet-700'
                }}
              />
              {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
              <Button
                type="submit"
                color="primary"
                isLoading={loading}
                className="w-full bg-violet-600 hover:bg-violet-700 shadow-md h-12 text-lg font-medium"
                size="lg"
              >
                {loading ? "Processing..." : "Schedule Demo"}
              </Button>
            </form>
          </CardBody>
        </div>
      </Card>
    </div>
  );
};

// Custom SVG illustration for the demo form
const DemoIllustration = () => (
  <svg viewBox="0 0 500 500" className="w-full max-w-md">
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#6d28d9" stopOpacity="0.4" />
      </linearGradient>
      <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.7" />
        <stop offset="100%" stopColor="#6d28d9" stopOpacity="0.9" />
      </linearGradient>
    </defs>
    
    {/* Background shapes */}
    <circle cx="250" cy="250" r="200" fill="url(#grad1)" />
    <circle cx="150" cy="150" r="50" fill="white" fillOpacity="0.2" />
    <circle cx="350" cy="320" r="70" fill="white" fillOpacity="0.2" />
    
    {/* Abstract representation of education and technology */}
    <path d="M150,150 Q250,50 350,150 T550,250" stroke="url(#grad2)" strokeWidth="8" fill="none" />
    <path d="M100,250 Q200,150 300,250 T500,350" stroke="white" strokeWidth="4" strokeOpacity="0.7" fill="none" />
    
    {/* Stylized laptop/screen */}
    <rect x="175" y="200" width="150" height="100" rx="5" fill="#6d28d9" />
    <rect x="180" y="205" width="140" height="90" rx="3" fill="#f5f3ff" />
    <polygon points="150,300 350,300 325,350 175,350" fill="#6d28d9" />
    
    {/* Data visualization elements */}
    <rect x="195" y="225" width="20" height="50" rx="2" fill="#8b5cf6" />
    <rect x="225" y="240" width="20" height="35" rx="2" fill="#8b5cf6" />
    <rect x="255" y="215" width="20" height="60" rx="2" fill="#8b5cf6" />
    <rect x="285" y="230" width="20" height="45" rx="2" fill="#8b5cf6" />
    
    {/* Decorative elements */}
    <circle cx="150" cy="320" r="15" fill="#6d28d9" />
    <circle cx="350" cy="180" r="15" fill="#6d28d9" />
    <circle cx="250" cy="120" r="10" fill="#6d28d9" />
  </svg>
);

// Success icon SVG
const SuccessIcon = () => (
  <svg width="80" height="80" viewBox="0 0 80 80">
    <circle cx="40" cy="40" r="38" fill="#ebf4ff" stroke="#6d28d9" strokeWidth="4" />
    <path d="M25,40 L35,50 L55,30" stroke="#6d28d9" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

export default DemoForm;