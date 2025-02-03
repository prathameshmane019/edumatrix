"use client";

import React, { useState } from "react";
import { Button, Input, Card, CardBody, CardHeader } from "@nextui-org/react";
import Image from "next/image";

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
      <div className="flex justify-center items-center min-h-screen">
        <Card className="max-w-lg w-full text-center p-4">
          <CardBody>
            <div className="text-green-500 text-4xl mb-4">✓</div>
            <h2 className="text-2xl font-bold mb-2">Thank You!</h2>
            <p className="text-gray-600 mb-4">
              Your demo has been scheduled successfully. Please check your email for details.
            </p>
            {/* <Button color="primary" onClick={() => setSuccess(false)}>
            Start Demo
            </Button> */}
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-violet-100 flex items-center justify-center ">
      <Card className="max-w-4xl w-full flex flex-row p-4 border border-gray-200 rounded-lg shadow-md ">
        <div className="w-1/2 flex justify-center items-center">
          <Image
            src="/demo.jpg"
            alt="Demo Preview"
            width={400}
            height={400}
            className="rounded-lg"
          />
        </div>
        <div className="w-1/2 p-6 flex flex-col justify-center">
          <CardHeader className="text-center flex flex-col pb-4">
            <h2 className="text-2xl font-bold">Schedule a Demo</h2>
            <p className="text-violet-600 hover:text-violet-700 transition-colors mt-2">
              Experience the power of EduMatrix Pro firsthand
            </p>
          </CardHeader>

          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  inputWrapper: 'bg-default-100/50 hover:bg-default-200/70 transition-colors',
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
                  inputWrapper: 'bg-default-100/50 hover:bg-default-200/70 transition-colors',
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
                  inputWrapper: 'bg-default-100/50 hover:bg-default-200/70 transition-colors',
                }}
              />
              {error && <div className="text-red-500 text-sm">{error}</div>}
              <Button
                type="submit"
                color="primary"
                isLoading={loading}
                className="w-full"
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

export default DemoForm;