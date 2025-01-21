"use client";

import React from 'react';
import { Button } from '@nextui-org/react';
import { CardBody, Card, CardHeader } from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

// Import SVG illustrations
import AttendanceIllustration from '@/public/illustrations/attendance.svg';
import FeedbackIllustration from '@/public/illustrations/feedback.svg';

export default function ModuleSelectionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  const role = session?.user?.role;
  const basePath = role === 'superadmin' || role === 'admin' ? '/admin' : `/${role}`;

  const modules = {
    admin: [
      {
        name: 'Attendance Management',
        path: `attendance${basePath}`,
        description: 'View and manage attendance records',
        illustration: AttendanceIllustration,
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600'
      },
      {
        name: 'Feedback Management',
        path: `feedback${basePath}`,
        description: 'Manage and review feedback',
        illustration: FeedbackIllustration,
        bgColor: 'bg-green-50',
        textColor: 'text-green-600'
      }
    ],
    superadmin: [
      {
        name: 'Attendance Management',
        path: `attendance/${basePath}`,
        description: 'View and manage attendance records',
        illustration: AttendanceIllustration,
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600'
      },
      {
        name: 'Feedback Management',
        path: `feedback${basePath}`,
        description: 'Manage and review feedback',
        illustration: FeedbackIllustration,
        bgColor: 'bg-green-50',
        textColor: 'text-green-600'
      }
    ],
    faculty: [
      {
        name: 'Attendance',
        path: `${basePath}/takeattendance`,
        description: 'Take and manage daily attendance',
        illustration: AttendanceIllustration,
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600'
      },
      // {
      //   name: 'Feedback',
      //   path: `${basePath}/feedback`,
      //   description: 'View student feedback',
      //   illustration: FeedbackIllustration,
      //   bgColor: 'bg-green-50',
      //   textColor: 'text-green-600'
      // }
    ],
    student: [
      {
        name: 'Attendance',
        path: `${basePath}`,
        description: 'View your attendance records',
        illustration: AttendanceIllustration,
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600'
      }
    ]
  };

  const userModules = modules[role] || [];

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Welcome, {session?.user?.name}
      </h1>
      <div className="grid md:grid-cols-3 gap-6">
        {userModules.map((module) => (
          <Card
            key={module.name}
            className={`
              ${module.bgColor}
              border-2 border-transparent
              hover:border-primary
              transition-all
              duration-300
              hover:shadow-xl
              transform
              hover:-translate-y-2
              flex flex-col
            `}
          >
            <CardHeader className="pb-2 flex-grow-0">
              <div className="flex justify-center mb-4 h-48">
                <Image
                  src={module.illustration}
                  alt={module.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <h1 className={`text-xl text-center ${module.textColor}`}>
                {module.name}
              </h1>
            </CardHeader>
            <CardBody className="flex flex-col flex-grow justify-end">
              <p className="text-muted-foreground mb-4 text-center">
                {module.description}
              </p>
              <Button
                variant="outline"
                className={`
                  w-full
                  ${module.textColor}
                  hover:bg-primary
                  hover:text-primary-foreground
                `}
                onClick={() => router.push(module.path)}
              >
                Open Module
              </Button>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}