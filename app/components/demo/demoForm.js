"use client";
import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import { Button, Input, Card, CardBody, CardHeader } from "@nextui-org/react";

const DemoForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/v2/schedule-demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: ''
          
        });
      } else {
        setError(data.message || 'Failed to schedule demo. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="max-w-md mx-auto">
        <CardBody className="text-center py-8">
          <div className="text-success mb-4">✓</div>
          <h2 className="text-2xl font-bold mb-4">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            Your demo has been scheduled successfully. Please check your email for access credentials.
          </p>
          <Button
            color="primary"
            onClick={() => setSuccess(false)}
          >
            Schedule Another Demo
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="flex flex-col items-center pb-0">
        <h2 className="text-2xl font-bold">Schedule a Demo</h2>
        <p className="text-gray-600 text-center mt-2">
          Experience the power of EduMatrix Pro firsthand
        </p>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            name="name"
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full"
          />
          <Input
            type="email"
            name="email"
            label="Work Email"
            placeholder="Enter your valid email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full"
          />
          <Input
            type="tel"
            name="phone"
            label="Phone Number"
            placeholder="Enter your phone number"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full"
          />
          
          
          
          {error && (
            <div className="text-red-500 text-sm mt-2">{error}</div>
          )}
          
          <Button
            type="submit"
            color="primary"
            isLoading={loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Processing...' : 'Schedule Demo'}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
};

export default DemoForm;