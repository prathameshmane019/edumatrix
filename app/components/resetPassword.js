"use client"
import React, { useState } from 'react';
import { Input, Button } from '@nextui-org/react';
import { toast } from 'sonner';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { IoIosEye, IoIosEyeOff } from "react-icons/io";
import { RiShieldUserFill, RiLockPasswordLine } from "react-icons/ri";
import Link from 'next/link';

export default function ResetPasswordComponent() {
  const [identifier, setIdentifier] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !oldPassword || !newPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post('/api/reset-password', {
        identifier,
        oldPassword,
        newPassword
      });
      if (response.status === 200) {
        toast.success('Password reset successfully');
        router.push("/login")
      } else {
        toast.error(response.data.message || 'Password reset failed');
      }
    } catch (error) {
      console.error('Failed to reset password', error);
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIdentifier('');
    setOldPassword('');
    setNewPassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-violet-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl flex overflow-hidden">
        {/* Left side - Illustration */}
        <div className="hidden lg:flex w-1/2 bg-violet-500 p-12 flex-col justify-between relative">
          <div className="relative z-10">
            <h1 className="text-4xl font-bold text-white mb-6">Reset Your Password</h1>
            <p className="text-violet-100 text-lg">Create a new password to secure your account.</p>
          </div>

          {/* Insert the SVG illustration here */}
          <svg
            viewBox="0 0 800 600"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0 w-full h-full"
          >
            {/* Background Circle */}
            <rect width="800" height="600" fill="#8b5cf6" />

            {/* Decorative Circles */}
            <circle cx="400" cy="300" r="250" fill="#a78bfa" opacity="0.1" />
            <circle cx="400" cy="300" r="200" fill="#c4b5fd" opacity="0.2" />

            {/* Decorative Lines */}
            <path
              d="M200 200 Q400 100 600 200"
              stroke="#c4b5fd"
              fill="none"
              strokeWidth="2"
            />
            <path
              d="M200 400 Q400 500 600 400"
              stroke="#c4b5fd"
              fill="none"
              strokeWidth="2"
            />

            {/* Lock Body */}
            <rect x="350" y="250" width="100" height="120" rx="10" fill="#6d28d9" />

            {/* Lock Shackle */}
            <path
              d="M380 250 L380 200 Q400 180 420 200 L420 250"
              stroke="#6d28d9"
              strokeWidth="20"
              strokeLinecap="round"
              fill="none"
            />

            {/* Key Hole */}
            <circle cx="400" cy="300" r="15" fill="white" />
            <rect x="395" y="310" width="10" height="25" fill="white" />

            {/* Rotating Elements */}
            <g transform="translate(400 300)">
              <circle
                cx="0"
                cy="0"
                r="60"
                stroke="#6d28d9"
                strokeWidth="2"
                fill="none"
                opacity="0.4"
              />
              <circle cx="60" cy="0" r="4" fill="#6d28d9" />
              <circle cx="-60" cy="0" r="4" fill="#6d28d9" />
            </g>

            {/* Dots */}
            <circle cx="300" cy="200" r="5" fill="#6d28d9" />
            <circle cx="500" cy="200" r="5" fill="#6d28d9" />
            <circle cx="300" cy="400" r="5" fill="#6d28d9" />
            <circle cx="500" cy="400" r="5" fill="#6d28d9" />
          </svg>

        </div>

        {/* Right side - Reset Password Form */}
        <div className="w-full lg:w-1/2 p-12">
          <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Reset Password</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input
                  type="text"
                  label="User ID"
                  variant="bordered"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  endContent={
                    <RiShieldUserFill className="text-2xl text-default-400 pointer-events-none" />
                  }
                  classNames={{
                    input: "bg-transparent",
                    inputWrapper: "bg-default-100/50 hover:bg-default-200/70 transition-colors"
                  }}
                />
              </div>

              <div>
                <Input
                  type={showOldPassword ? "text" : "password"}
                  label="Old Password"
                  variant="bordered"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  endContent={
                    <button
                      className="focus:outline-none"
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                    >
                      {showOldPassword ? (
                        <IoIosEyeOff className="text-2xl text-default-400 pointer-events-none" />
                      ) : (
                        <IoIosEye className="text-2xl text-default-400 pointer-events-none" />
                      )}
                    </button>
                  }
                  classNames={{
                    input: "bg-transparent",
                    inputWrapper: "bg-default-100/50 hover:bg-default-200/70 transition-colors"
                  }}
                />
              </div>

              <div>
                <Input
                  type={showNewPassword ? "text" : "password"}
                  label="New Password"
                  variant="bordered"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  endContent={
                    <button
                      className="focus:outline-none"
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <IoIosEyeOff className="text-2xl text-default-400 pointer-events-none" />
                      ) : (
                        <IoIosEye className="text-2xl text-default-400 pointer-events-none" />
                      )}
                    </button>
                  }
                  classNames={{
                    input: "bg-transparent",
                    inputWrapper: "bg-default-100/50 hover:bg-default-200/70 transition-colors"
                  }}
                />
              </div>

              <div className="flex flex-col space-y-4 pt-4">
                <Button
                  color="primary"
                  type="submit"
                  className="w-full bg-violet-500 hover:bg-violet-600 transition-colors"
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? 'Resetting Password...' : 'Reset Password'}
                </Button>

                <Button
                  color="default"
                  onClick={handleCancel}
                  className="w-full"
                  size="lg"
                  variant="bordered"
                >
                  Cancel
                </Button>
              </div>

              <div className="text-center mt-6">
                <Link
                  href="/login"
                  className="text-violet-600 hover:text-violet-700 transition-colors text-sm font-medium"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}