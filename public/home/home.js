// This file would be where you define all your SVG illustrations
// For example in a file like public/home/home.js

import React from 'react';

// Export the ID constants
export const DashboardIllustration = "dashboard-illustration";
export const StudentDashboard = "student-dashboard";
export const FacultyPortal = "faculty-portal";
export const InstituteManagement = "institute-management";
export const DepartmentDashboard = "department-dashboard";
export const StudentManagementModule = "student-management-module";
export const AttendanceSystemModule = "attendance-system-module";
export const EducationDashboard3D = "education-dashboard-3d";
export const SupportIllustration = "support-illustration";
export const Avatar1 = "avatar-1";
export const Avatar2 = "avatar-2";
export const Avatar3 = "avatar-3";

// This component will define all your SVGs that can be referenced by their IDs
const HomeSVGDefinitions = () => {
  return (
    <svg viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
    {/* <!-- Dashboard Illustration - Enhanced version --> */}
    <symbol id="dashboard-illustration" viewBox="0 0 600 400">
      {/* <!-- Gradient Background --> */}
      <defs>
        <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f1f5f9" />
          <stop offset="100%" stop-color="#f8fafc" />
        </linearGradient>
        <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.1"/>
        </filter>
        <linearGradient id="chart-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#818cf8" />
          <stop offset="100%" stop-color="#4f46e5" />
        </linearGradient>
      </defs>
      
      {/* <!-- Background with subtle pattern --> */}
      <rect x="0" y="0" width="600" height="400" rx="12" fill="url(#bg-gradient)" />
      <path d="M0 0 L600 0 L600 400 L0 400 Z" fill="#4f46e5" fill-opacity="0.03" />
      <path d="M0 50 Q300 80 600 50 T600 80" fill="#4f46e5" fill-opacity="0.02" />
      
      {/* <!-- Header bar --> */}
      <rect x="0" y="0" width="600" height="60" rx="12" fill="#ffffff" filter="url(#drop-shadow)" />
      
      {/* <!-- Logo --> */}
      <g transform="translate(20, 20)">
        <rect width="36" height="20" rx="4" fill="#4f46e5" />
        <rect x="42" width="78" height="20" rx="4" fill="#4f46e5" opacity="0.8" />
      </g>
      
      {/* <!-- User profile --> */}
      <circle cx="550" cy="30" r="16" fill="#e0e7ff" />
      <circle cx="550" cy="30" r="12" fill="#818cf8" />
      <path d="M550 24 L550 36 M544 30 L556 30" stroke="white" stroke-width="2" stroke-linecap="round" />
      
      {/* <!-- Notifications --> */}
      <circle cx="510" cy="30" r="16" fill="#f5f3ff" />
      <path d="M510 24 C507 24, 504 26, 504 30 C504 34, 507 36, 510 36 C513 36, 516 34, 516 30 C516 26, 513 24, 510 24" stroke="#8b5cf6" stroke-width="2" fill="none" stroke-linecap="round" />
      <path d="M506 40 L514 40" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" />
      
      {/* <!-- Search --> */}
      <rect x="150" y="20" width="180" height="20" rx="10" fill="#f8fafc" />
      <circle cx="165" cy="30" r="5" stroke="#9ca3af" stroke-width="1.5" fill="none" />
      <line x1="169" y1="34" x2="173" y2="38" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round" />
      
      {/* <!-- Side navigation --> */}
      <rect x="0" y="60" width="80" height="340" fill="#ffffff" filter="url(#drop-shadow)" />
      
      {/* <!-- Nav icon --> */}
      <circle cx="40" cy="100" r="16" fill="#e0e7ff" />
      <path d="M40 92 L40 108 M32 100 L48 100" stroke="#6366f1" stroke-width="2" stroke-linecap="round" />
      
      {/* <!-- Nav items --> */}
      <rect x="24" y="140" width="32" height="8" rx="4" fill="#d1d5db" />
      <rect x="24" y="160" width="32" height="8" rx="4" fill="#4f46e5" />
      <rect x="24" y="180" width="32" height="8" rx="4" fill="#d1d5db" />
      <rect x="24" y="200" width="32" height="8" rx="4" fill="#d1d5db" />
      <rect x="24" y="220" width="32" height="8" rx="4" fill="#d1d5db" />
      <rect x="24" y="240" width="32" height="8" rx="4" fill="#d1d5db" />
      
      {/* <!-- Stats cards with gradient --> */}
      <g transform="translate(100, 80)">
        <rect width="140" height="100" rx="12" fill="#ffffff" filter="url(#drop-shadow)" />
        <rect x="20" y="20" width="60" height="8" rx="4" fill="#9ca3af" />
        <rect x="20" y="40" width="80" height="16" rx="8" fill="#4f46e5" />
        <rect x="20" y="70" width="40" height="8" rx="4" fill="#d1d5db" />
        {/* <!-- Trending icon --> */}
        <path d="M110 40 L120 30 L130 45" stroke="#4f46e5" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="120" cy="30" r="3" fill="#4f46e5" />
      </g>
      
      <g transform="translate(260, 80)">
        <rect width="140" height="100" rx="12" fill="#ffffff" filter="url(#drop-shadow)" />
        <rect x="20" y="20" width="60" height="8" rx="4" fill="#9ca3af" />
        <rect x="20" y="40" width="80" height="16" rx="8" fill="#10b981" />
        <rect x="20" y="70" width="40" height="8" rx="4" fill="#d1d5db" />
        {/* <!-- Trending icon --> */}
        <path d="M110 45 L120 25 L130 35" stroke="#10b981" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="120" cy="25" r="3" fill="#10b981" />
      </g>
      
      <g transform="translate(420, 80)">
        <rect width="140" height="100" rx="12" fill="#ffffff" filter="url(#drop-shadow)" />
        <rect x="20" y="20" width="60" height="8" rx="4" fill="#9ca3af" />
        <rect x="20" y="40" width="80" height="16" rx="8" fill="#f59e0b" />
        <rect x="20" y="70" width="40" height="8" rx="4" fill="#d1d5db" /> 
        <path d="M110 35 L120 40 L130 30" stroke="#f59e0b" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="130" cy="30" r="3" fill="#f59e0b" />
      </g>
       
      <rect x="100" y="200" width="300" height="180" rx="12" fill="#ffffff" filter="url(#drop-shadow)" />
      <rect x="120" y="220" width="100" height="12" rx="6" fill="#111827" />
      <rect x="120" y="240" width="60" height="8" rx="4" fill="#6b7280" />
       
      <rect x="140" y="350" width="20" height="0" rx="6">
        <animate attributeName="height" from="0" to="80" dur="0.8s" fill="freeze" />
        <animate attributeName="y" from="350" to="270" dur="0.8s" fill="freeze" />
      </rect>
      <rect x="140" y="270" width="20" height="80" rx="6" fill="url(#chart-gradient)" opacity="0.8" />
      
      <rect x="170" y="350" width="20" height="0" rx="6">
        <animate attributeName="height" from="0" to="60" dur="0.8s" begin="0.1s" fill="freeze" />
        <animate attributeName="y" from="350" to="290" dur="0.8s" begin="0.1s" fill="freeze" />
      </rect>
      <rect x="170" y="290" width="20" height="60" rx="6" fill="url(#chart-gradient)" opacity="0.85" />
      
      <rect x="200" y="350" width="20" height="0" rx="6">
        <animate attributeName="height" from="0" to="100" dur="0.8s" begin="0.2s" fill="freeze" />
        <animate attributeName="y" from="350" to="250" dur="0.8s" begin="0.2s" fill="freeze" />
      </rect>
      <rect x="200" y="250" width="20" height="100" rx="6" fill="url(#chart-gradient)" opacity="0.9" />
      
      <rect x="230" y="350" width="20" height="0" rx="6">
        <animate attributeName="height" from="0" to="70" dur="0.8s" begin="0.3s" fill="freeze" />
        <animate attributeName="y" from="350" to="280" dur="0.8s" begin="0.3s" fill="freeze" />
      </rect>
      <rect x="230" y="280" width="20" height="70" rx="6" fill="url(#chart-gradient)" opacity="0.95" />
      
      <rect x="260" y="350" width="20" height="0" rx="6">
        <animate attributeName="height" from="0" to="110" dur="0.8s" begin="0.4s" fill="freeze" />
        <animate attributeName="y" from="350" to="240" dur="0.8s" begin="0.4s" fill="freeze" />
      </rect>
      <rect x="260" y="240" width="20" height="110" rx="6" fill="url(#chart-gradient)" />
      
      <rect x="290" y="350" width="20" height="0" rx="6">
        <animate attributeName="height" from="0" to="90" dur="0.8s" begin="0.5s" fill="freeze" />
        <animate attributeName="y" from="350" to="260" dur="0.8s" begin="0.5s" fill="freeze" />
      </rect>
      <rect x="290" y="260" width="20" height="90" rx="6" fill="url(#chart-gradient)" opacity="0.95" />
      
      <rect x="320" y="350" width="20" height="0" rx="6">
        <animate attributeName="height" from="0" to="40" dur="0.8s" begin="0.6s" fill="freeze" />
        <animate attributeName="y" from="350" to="310" dur="0.8s" begin="0.6s" fill="freeze" />
      </rect>
      <rect x="320" y="310" width="20" height="40" rx="6" fill="url(#chart-gradient)" opacity="0.9" />
      
      {/* <!-- Chart grid lines --> */}
      <line x1="120" y1="350" x2="370" y2="350" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="4 4" />
      <line x1="120" y1="310" x2="370" y2="310" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="4 4" />
      <line x1="120" y1="270" x2="370" y2="270" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="4 4" />
      
      {/* <!-- Table area with animation --> */}
      <rect x="420" y="200" width="160" height="180" rx="12" fill="#ffffff" filter="url(#drop-shadow)" />
      <rect x="440" y="220" width="80" height="12" rx="6" fill="#111827" />
      <rect x="440" y="240" width="40" height="8" rx="4" fill="#6b7280" />
      
      {/* <!-- Table rows with hover effect --> */}
      <rect x="440" y="260" width="120" height="1" fill="#e5e7eb" />
      <g>
        <rect x="435" y="265" width="130" height="20" rx="4" fill="#f9fafb" opacity="0">
          <animate attributeName="opacity" values="0;0.5;0" dur="3s" begin="1s" repeatCount="indefinite" />
        </rect>
        <rect x="440" y="270" width="40" height="8" rx="4" fill="#111827" />
        <rect x="520" y="270" width="20" height="8" rx="4" fill="#10b981" />
      </g>
      
      <rect x="440" y="290" width="120" height="1" fill="#e5e7eb" />
      <g>
        <rect x="435" y="295" width="130" height="20" rx="4" fill="#f9fafb" opacity="0">
          <animate attributeName="opacity" values="0;0.5;0" dur="3s" begin="2s" repeatCount="indefinite" />
        </rect>
        <rect x="440" y="300" width="40" height="8" rx="4" fill="#111827" />
        <rect x="520" y="300" width="20" height="8" rx="4" fill="#f59e0b" />
      </g>
      
      <rect x="440" y="320" width="120" height="1" fill="#e5e7eb" />
      <g>
        <rect x="435" y="325" width="130" height="20" rx="4" fill="#f9fafb" opacity="0">
          <animate attributeName="opacity" values="0;0.5;0" dur="3s" begin="3s" repeatCount="indefinite" />
        </rect>
        <rect x="440" y="330" width="40" height="8" rx="4" fill="#111827" />
        <rect x="520" y="330" width="20" height="8" rx="4" fill="#ef4444" />
      </g>
      
      <rect x="440" y="350" width="120" height="1" fill="#e5e7eb" />
      <g>
        <rect x="435" y="355" width="130" height="20" rx="4" fill="#f9fafb" opacity="0">
          <animate attributeName="opacity" values="0;0.5;0" dur="3s" begin="4s" repeatCount="indefinite" />
        </rect>
        <rect x="440" y="360" width="40" height="8" rx="4" fill="#111827" />
        <rect x="520" y="360" width="20" height="8" rx="4" fill="#10b981" />
      </g>
    </symbol>
    
    {/* <!-- Student Dashboard - Enhanced version --> */}
    <symbol id="student-dashboard" viewBox="0 0 600 400">
      {/* <!-- Gradient Background --> */}
      <defs>
        <linearGradient id="student-bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f1f5f9" />
          <stop offset="100%" stop-color="#f8fafc" />
        </linearGradient>
        <filter id="student-drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.1"/>
        </filter>
        <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#818cf8" />
          <stop offset="100%" stop-color="#4f46e5" />
        </linearGradient>
        <linearGradient id="progress-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#34d399" />
          <stop offset="100%" stop-color="#10b981" />
        </linearGradient>
      </defs>
      
      {/* <!-- Background with subtle pattern --> */}
      <rect x="0" y="0" width="600" height="400" rx="12" fill="url(#student-bg-gradient)" />
      <path d="M0 0 L600 0 L600 400 L0 400 Z" fill="#4f46e5" fill-opacity="0.02" />
      <path d="M0 50 Q300 80 600 50 T600 80" fill="#4f46e5" fill-opacity="0.01" />
      
      {/* <!-- Header bar --> */}
      <rect x="0" y="0" width="600" height="60" rx="12" fill="#ffffff" filter="url(#student-drop-shadow)" />
      <rect x="20" y="20" width="120" height="20" rx="4" fill="#4f46e5" />
      
      {/* <!-- User profile icon --> */}
      <circle cx="550" cy="30" r="16" fill="#e0e7ff" />
      <path d="M550 24 C545 24, 542 27, 542 30 S545 36, 550 36 S558 33, 558 30 S555 24, 550 24" fill="#818cf8" />
      
      {/* <!-- Notifications -->/ */}
      <circle cx="510" cy="30" r="16" fill="#f5f3ff" />
      <path d="M510 24 C505 26, 510 28, 510 32 C510 36, 507 36, 510 36" stroke="#8b5cf6" stroke-width="2" fill="none" />
      <circle cx="510" cy="24" r="2" fill="#8b5cf6" />
      <path d="M506 36 L514 36" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" />
      
      {/* <!-- Student profile section with enhanced look --> */}
      <rect x="20" y="80" width="200" height="100" rx="12" fill="#ffffff" filter="url(#student-drop-shadow)" />
      
      {/* <!-- Student avatar with shadow --> */}
      <defs>
        <clipPath id="avatar-clip">
          <circle cx="60" cy="120" r="20" />
        </clipPath>
        <linearGradient id="avatar-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#c7d2fe" />
          <stop offset="100%" stop-color="#a5b4fc" />
        </linearGradient>
      </defs>
      
      <circle cx="60" cy="120" r="22" fill="#e0e7ff" />
      <circle cx="60" cy="120" r="20" fill="url(#avatar-bg)" />
      <g clip-path="url(#avatar-clip)">
        <ellipse cx="60" cy="110" rx="10" ry="8" fill="#6366f1" opacity="0.8" />
        <circle cx="60" cy="135" r="15" fill="#6366f1" opacity="0.8" />
      </g>
      
      {/* <!-- Student info with enhanced typography --> */}
      <rect x="90" y="105" width="80" height="10" rx="5" fill="#111827" />
      <rect x="90" y="125" width="60" height="8" rx="4" fill="#6b7280" />
      <rect x="90" y="145" width="90" height="4" rx="2" fill="#e5e7eb" />
      <rect x="90" y="155" width="70" height="4" rx="2" fill="#e5e7eb" />
      
      {/* <!-- Course cards with realistic effects --> */}
      <rect x="240" y="80" width="160" height="100" rx="12" fill="#ffffff" filter="url(#student-drop-shadow)" />
      <circle cx="270" cy="110" r="16" fill="#fef3c7" />
      <path d="M270 102 L270 118 M262 110 L278 110" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" />
      <rect x="295" y="95" width="80" height="10" rx="5" fill="#111827" />
      <rect x="295" y="115" width="60" height="8" rx="4" fill="#6b7280" />
      
      {/* <!-- Progress bar with animation --> */}
      <rect x="260" y="140" width="120" height="6" rx="3" fill="#e5e7eb" />
      <rect x="260" y="140" width="0" height="6" rx="3" fill="url(#progress-gradient)">
        <animate attributeName="width" from="0" to="80" dur="1.2s" fill="freeze" />
      </rect>
      
      <rect x="420" y="80" width="160" height="100" rx="12" fill="#ffffff" filter="url(#student-drop-shadow)" />
      <circle cx="450" cy="110" r="16" fill="#e0f2fe" />
      <path d="M450 102 L450 118 M442 110 L458 110" stroke="#0ea5e9" stroke-width="2" stroke-linecap="round" />
      <rect x="475" y="95" width="80" height="10" rx="5" fill="#111827" />
      <rect x="475" y="115" width="60" height="8" rx="4" fill="#6b7280" />
      
      {/* <!-- Progress bar with animation --> */}
      <rect x="440" y="140" width="120" height="6" rx="3" fill="#e5e7eb" />
      <rect x="440" y="140" width="0" height="6" rx="3" fill="url(#progress-gradient-2)">
        <animate attributeName="width" from="0" to="40" dur="1.2s" begin="0.2s" fill="freeze" />
      </rect>
       
      <rect x="20" y="200" width="340" height="180" rx="12" fill="#ffffff" filter="url(#student-drop-shadow)" />
      <rect x="40" y="220" width="80" height="12" rx="6" fill="#111827" />
       
      <rect x="40" y="250" width="300" height="1" fill="#e5e7eb" />
      <rect x="40" y="280" width="300" height="1" fill="#e5e7eb" />
      <rect x="40" y="310" width="300" height="1" fill="#e5e7eb" />
      <rect x="40" y="340" width="300" height="1" fill="#e5e7eb" />
      
      <rect x="40" y="250" width="1" height="120" fill="#e5e7eb" />
      <rect x="90" y="250" width="1" height="120" fill="#e5e7eb" />
      <rect x="140" y="250" width="1" height="120" fill="#e5e7eb" />
      <rect x="190" y="250" width="1" height="120" fill="#e5e7eb" />
      <rect x="240" y="250" width="1" height="120" fill="#e5e7eb" />
      <rect x="290" y="250" width="1" height="120" fill="#e5e7eb" />
      <rect x="340" y="250" width="1" height="120" fill="#e5e7eb" />
       
      <text x="65" y="245" font-family="sans-serif" font-size="8" fill="#6b7280" text-anchor="middle">Mon</text>
      <text x="115" y="245" font-family="sans-serif" font-size="8" fill="#6b7280" text-anchor="middle">Tue</text>
      <text x="165" y="245" font-family="sans-serif" font-size="8" fill="#6b7280" text-anchor="middle">Wed</text>
      <text x="215" y="245" font-family="sans-serif" font-size="8" fill="#6b7280" text-anchor="middle">Thu</text>
      <text x="265" y="245" font-family="sans-serif" font-size="8" fill="#6b7280" text-anchor="middle">Fri</text>
      <text x="315" y="245" font-family="sans-serif" font-size="8" fill="#6b7280" text-anchor="middle">Sat</text>
       
      <rect x="95" y="260" width="90" height="15" rx="4" fill="#e0e7ff" opacity="0">
        <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="0.8s" fill="freeze" />
      </rect>
      <rect x="145" y="290" width="90" height="15" rx="4" fill="#fef3c7" opacity="0">
        <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="1s" fill="freeze" />
      </rect>
      <rect x="245" y="320" width="90" height="15" rx="4" fill="#dcfce7" opacity="0">
        <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="1.2s" fill="freeze" />
      </rect>
       
      <rect x="380" y="200" width="200" height="180" rx="12" fill="#ffffff" filter="url(#student-drop-shadow)" />
      <rect x="400" y="220" width="100" height="12" rx="6" fill="#111827" />
       
      <rect x="400" y="250" width="160" height="1" fill="#e5e7eb" />
      <circle cx="415" cy="270" r="8" fill="#fee2e2" />
      <path d="M413 268 L417 272 M417 268 L413 272" stroke="#ef4444" stroke-width="1.5" stroke-linecap="round" />
      <rect x="430" y="265" width="100" height="8" rx="4" fill="#111827" />
      <rect x="430" y="280" width="60" height="6" rx="3" fill="#6b7280" />
      
      <rect x="400" y="300" width="160" height="1" fill="#e5e7eb" />
      <circle cx="415" cy="320" r="8" fill="#e0f2fe" />
      <path d="M415 316 L415 320 M415 324 L415 324" stroke="#0ea5e9" stroke-width="1.5" stroke-linecap="round" />
      <rect x="430" y="315" width="100" height="8" rx="4" fill="#111827" />
      <rect x="430" y="330" width="60" height="6" rx="3" fill="#6b7280" />
      
      <rect x="400" y="350" width="160" height="1" fill="#e5e7eb" />
      <circle cx="415" cy="370" r="8" fill="#dcfce7" />
      <path d="M411 370 L414 373 L419 368" stroke="#10b981" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
      <rect x="430" y="365" width="100" height="8" rx="4" fill="#111827" />
      <rect x="430" y="380" width="60" height="6" rx="3" fill="#6b7280" />
    </symbol>
    

  {/* <!-- Continuing the Education Dashboard 3D --> */}
  <symbol id="education-dashboard-3d" viewBox="0 0 600 400">
    {/* <!-- Background with 3D perspective grid --> */}
    <defs>
      <linearGradient id="dashboard-3d-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f1f5f9" />
        <stop offset="100%" stop-color="#f8fafc" />
      </linearGradient>
      <linearGradient id="card-3d-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#f8fafc" />
      </linearGradient>
      <linearGradient id="primary-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4f46e5" />
        <stop offset="100%" stop-color="#6366f1" />
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      <filter id="shadow-3d" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.15"/>
      </filter>
    </defs>
    
    {/* <!-- Main background --> */}
    <rect x="0" y="0" width="600" height="400" rx="12" fill="url(#dashboard-3d-bg)" />
    
    {/* <!-- 3D grid --> */}
    <g opacity="0.08">
      <path d="M0 50 L600 50" stroke="#6366f1" stroke-width="1" />
      <path d="M0 100 L600 100" stroke="#6366f1" stroke-width="1" />
      <path d="M0 150 L600 150" stroke="#6366f1" stroke-width="1" />
      <path d="M0 200 L600 200" stroke="#6366f1" stroke-width="1" />
      <path d="M0 250 L600 250" stroke="#6366f1" stroke-width="1" />
      <path d="M0 300 L600 300" stroke="#6366f1" stroke-width="1" />
      <path d="M0 350 L600 350" stroke="#6366f1" stroke-width="1" />
      
      <path d="M50 0 L50 400" stroke="#6366f1" stroke-width="1" />
      <path d="M100 0 L100 400" stroke="#6366f1" stroke-width="1" />
      <path d="M150 0 L150 400" stroke="#6366f1" stroke-width="1" />
      <path d="M200 0 L200 400" stroke="#6366f1" stroke-width="1" />
      <path d="M250 0 L250 400" stroke="#6366f1" stroke-width="1" />
      <path d="M300 0 L300 400" stroke="#6366f1" stroke-width="1" />
      <path d="M350 0 L350 400" stroke="#6366f1" stroke-width="1" />
      <path d="M400 0 L400 400" stroke="#6366f1" stroke-width="1" />
      <path d="M450 0 L450 400" stroke="#6366f1" stroke-width="1" />
      <path d="M500 0 L500 400" stroke="#6366f1" stroke-width="1" />
      <path d="M550 0 L550 400" stroke="#6366f1" stroke-width="1" />
    </g>
    
    {/* <!-- 3D Header bar with isometric effect --> */}
    <g transform="skewX(-10)">
      <rect x="40" y="20" width="540" height="60" rx="12" fill="#ffffff" filter="url(#shadow-3d)" />
      <rect x="60" y="40" width="120" height="20" rx="4" fill="url(#primary-gradient)" />
      
      {/* <!-- Notification icon --> */}
      <circle cx="510" cy="50" r="15" fill="#e0e7ff" />
      <path d="M510 45 C507 45, 505 47, 505 50 C505 53, 507 55, 510 55 C513 55, 515 53, 515 50 C515 47, 513 45, 510 45" stroke="#8b5cf6" stroke-width="2" fill="none" />
      <path d="M508 60 L512 60" stroke="#8b5cf6" stroke-width="1.5" />
      
      {/* <!-- User profile --> */}
      <circle cx="550" cy="50" r="15" fill="#e0e7ff" />
      <path d="M550 45 C545 45, 543 47, 543 50 S545 55, 550 55 S557 53, 557 50 S555 45, 550 45" fill="#818cf8" />
    </g>
    
    {/* <!-- 3D Dashboard main card with perspective --> */}
    <g transform="translate(40, 100)">
      <g transform="skewX(-5)">
        {/* <!-- Main card shadow layer --> */}
        <rect x="5" y="5" width="520" height="270" rx="12" fill="#6366f1" opacity="0.1" />
        {/* <!-- Main card --> */}
        <rect x="0" y="0" width="520" height="270" rx="12" fill="url(#card-3d-gradient)" filter="url(#shadow-3d)" />
        
        {/* <!-- Dashboard title -->   */}
        <text x="25" y="40" font-family="sans-serif" font-size="16" font-weight="bold" fill="#111827">Education Performance Dashboard</text>
        <rect x="25" y="50" width="80" height="3" rx="1.5" fill="#4f46e5" />
        
        {/* <!-- 3D metrics cards with floating effect --> */}
        <g transform="translate(25, 70)">
          {/* <!-- Card 1 --> */}
          <g>
            <rect width="150" height="80" rx="8" fill="#ffffff" filter="url(#shadow-3d)" opacity="0">
              <animate attributeName="opacity" from="0" to="1" dur="0.5s" fill="freeze" />
              <animate attributeName="y" from="10" to="0" dur="0.5s" fill="freeze" />
            </rect>
            <rect x="15" y="15" width="60" height="8" rx="4" fill="#6b7280" />
            <text x="15" y="45" font-family="sans-serif" font-size="24" font-weight="bold" fill="#4f46e5">95%</text>
            <rect x="15" y="55" width="100" height="4" rx="2" fill="#e5e7eb" />
            <rect x="15" y="55" width="95" height="4" rx="2" fill="#4f46e5">
              <animate attributeName="width" from="0" to="95" dur="1s" begin="0.5s" fill="freeze" />
            </rect>
          </g>
          
          {/* <!-- Card 2 --> */}
          <g transform="translate(165, 0)">
            <rect width="150" height="80" rx="8" fill="#ffffff" filter="url(#shadow-3d)" opacity="0">
              <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="0.2s" fill="freeze" />
              <animate attributeName="y" from="10" to="0" dur="0.5s" begin="0.2s" fill="freeze" />
            </rect>
            <rect x="15" y="15" width="60" height="8" rx="4" fill="#6b7280" />
            <text x="15" y="45" font-family="sans-serif" font-size="24" font-weight="bold" fill="#10b981">87%</text>
            <rect x="15" y="55" width="100" height="4" rx="2" fill="#e5e7eb" />
            <rect x="15" y="55" width="87" height="4" rx="2" fill="#10b981">
              <animate attributeName="width" from="0" to="87" dur="1s" begin="0.7s" fill="freeze" />
            </rect>
          </g>
          
          {/* <!-- Card 3 --> */}
          <g transform="translate(330, 0)">
            <rect width="150" height="80" rx="8" fill="#ffffff" filter="url(#shadow-3d)" opacity="0">
              <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="0.4s" fill="freeze" />
              <animate attributeName="y" from="10" to="0" dur="0.5s" begin="0.4s" fill="freeze" />
            </rect>
            <rect x="15" y="15" width="60" height="8" rx="4" fill="#6b7280" />
            <text x="15" y="45" font-family="sans-serif" font-size="24" font-weight="bold" fill="#f59e0b">76%</text>
            <rect x="15" y="55" width="100" height="4" rx="2" fill="#e5e7eb" />
            <rect x="15" y="55" width="76" height="4" rx="2" fill="#f59e0b">
              <animate attributeName="width" from="0" to="76" dur="1s" begin="0.9s" fill="freeze" />
            </rect>
          </g>
        </g>
        
        {/* <!-- 3D visualization area --> */}
        <g transform="translate(25, 160)">
          <rect width="470" height="90" rx="8" fill="#f8fafc" stroke="#e5e7eb" stroke-width="1" />
          
          {/* <!-- Animated line chart --> */}
          <polyline points="20,70 70,40 120,60 170,20 220,30 270,50 320,15 370,40 420,25 470,35" 
                  stroke="#4f46e5" stroke-width="2" fill="none" stroke-dasharray="500" stroke-dashoffset="500">
            <animate attributeName="stroke-dashoffset" from="500" to="0" dur="2s" begin="1s" fill="freeze" />
          </polyline>
          
          {/* <!-- Data points --> */}
          <circle cx="20" cy="70" r="4" fill="#4f46e5" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="1s" fill="freeze" />
          </circle>
          <circle cx="70" cy="40" r="4" fill="#4f46e5" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="1.1s" fill="freeze" />
          </circle>
          <circle cx="120" cy="60" r="4" fill="#4f46e5" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="1.2s" fill="freeze" />
          </circle>
          <circle cx="170" cy="20" r="4" fill="#4f46e5" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="1.3s" fill="freeze" />
          </circle>
          <circle cx="220" cy="30" r="4" fill="#4f46e5" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="1.4s" fill="freeze" />
          </circle>
          <circle cx="270" cy="50" r="4" fill="#4f46e5" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="1.5s" fill="freeze" />
          </circle>
          <circle cx="320" cy="15" r="4" fill="#4f46e5" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="1.6s" fill="freeze" />
          </circle>
          <circle cx="370" cy="40" r="4" fill="#4f46e5" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="1.7s" fill="freeze" />
          </circle>
          <circle cx="420" cy="25" r="4" fill="#4f46e5" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="1.8s" fill="freeze" />
          </circle>
          <circle cx="470" cy="35" r="4" fill="#4f46e5" opacity="0">
            <animate attributeName="opacity" from="0" to="1" dur="0.2s" begin="1.9s" fill="freeze" />
          </circle>
        </g>
      </g>
    </g>
    
    {/* <!-- Animated 3D sidebar navigation with depth --> */}
    <g transform="translate(10, 40)">
      <g transform="skewY(5)">
        <rect width="20" height="320" rx="10" fill="#4f46e5" opacity="0.9" filter="url(#shadow-3d)" />
        
        {/* <!-- Nav items --> */}
        <circle cx="10" cy="40" r="6" fill="#ffffff" opacity="0">
          <animate attributeName="opacity" from="0" to="1" dur="0.3s" begin="0.2s" fill="freeze" />
        </circle>
        <circle cx="10" cy="80" r="6" fill="#ffffff" opacity="0.6" />
        <circle cx="10" cy="120" r="6" fill="#ffffff" opacity="0.6" />
        <circle cx="10" cy="160" r="6" fill="#ffffff" opacity="0.6" />
        <circle cx="10" cy="200" r="6" fill="#ffffff" opacity="0.6" />
      </g>
    </g>
  </symbol>

  {/* <!-- Faculty Portal Enhanced --> */}
  <symbol id="faculty-portal" viewBox="0 0 600 400">
    <defs>
      <linearGradient id="faculty-bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f5f3ff" />
        <stop offset="100%" stop-color="#f8fafc" />
      </linearGradient>
      <linearGradient id="faculty-header-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#8b5cf6" />
        <stop offset="100%" stop-color="#6366f1" />
      </linearGradient>
      <filter id="faculty-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.1"/>
      </filter>
      <linearGradient id="performance-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="#8b5cf6" />
        <stop offset="100%" stop-color="#a855f7" />
      </linearGradient>
    </defs>
    
    {/* <!-- Background with subtle pattern --> */}
    <rect x="0" y="0" width="600" height="400" rx="12" fill="url(#faculty-bg-gradient)" />
    <path d="M0 0 L600 0 L600 400 L0 400 Z" fill="#8b5cf6" fill-opacity="0.03" />
    <path d="M0 50 Q300 80 600 50 T600 80" fill="#8b5cf6" fill-opacity="0.02" />
    
    {/* <!-- Header with gradient --> */}
    <rect x="0" y="0" width="600" height="60" rx="12" fill="url(#faculty-header-gradient)" />
    <rect x="20" y="20" width="120" height="20" rx="4" fill="#ffffff" opacity="0.9" />
    
    {/* <!-- Header icons --> */}
    <circle cx="550" cy="30" r="16" fill="#ffffff" opacity="0.2" />
    <path d="M550 24 C545 24, 542 27, 542 30 S545 36, 550 36 S558 33, 558 30 S555 24, 550 24" fill="#ffffff" />
    
    <circle cx="510" cy="30" r="16" fill="#ffffff" opacity="0.2" />
    <path d="M510 24 C507 24, 504 26, 504 30 C504 34, 507 36, 510 36 C513 36, 516 34, 516 30 C516 26, 513 24, 510 24" stroke="#ffffff" stroke-width="2" fill="none" />
    <path d="M506 40 L514 40" stroke="#ffffff" stroke-width="2" />
    
    {/* <!-- Faculty profile area with realistic avatar --> */}
    <rect x="20" y="80" width="220" height="120" rx="12" fill="#ffffff" filter="url(#faculty-shadow)" />
    
    {/* <!-- Faculty avatar with advanced styling --> */}
    <defs>
      <clipPath id="faculty-avatar-clip">
        <circle cx="70" cy="130" r="30" />
      </clipPath>
      <linearGradient id="faculty-avatar-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#c4b5fd" />
        <stop offset="100%" stop-color="#a78bfa" />
      </linearGradient>
    </defs>
    
    <circle cx="70" cy="130" r="32" fill="#e0e7ff" />
    <circle cx="70" cy="130" r="30" fill="url(#faculty-avatar-bg)" />
    <g clip-path="url(#faculty-avatar-clip)">
      <ellipse cx="70" cy="116" rx="15" ry="10" fill="#8b5cf6" opacity="0.5" />
      <circle cx="70" cy="150" r="25" fill="#8b5cf6" opacity="0.5" />
    </g>
    
    {/* <!-- Faculty info with enhanced typography --> */}
    <rect x="110" y="110" width="100" height="12" rx="6" fill="#111827" />
    <rect x="110" y="130" width="70" height="8" rx="4" fill="#6b7280" />
    <rect x="110" y="150" width="90" height="8" rx="4" fill="#8b5cf6" />
    
    {/* <!-- Class Schedule with depth --> */}
    <rect x="260" y="80" width="320" height="120" rx="12" fill="#ffffff" filter="url(#faculty-shadow)" />
    <rect x="280" y="100" width="120" height="12" rx="6" fill="#111827" />
    
    {/* <!-- Schedule grid with subtle colors --> */}
    <rect x="280" y="130" width="280" height="1" fill="#e5e7eb" />
    <rect x="280" y="160" width="280" height="1" fill="#e5e7eb" />
    <rect x="280" y="130" width="1" height="60" fill="#e5e7eb" />
    <rect x="350" y="130" width="1" height="60" fill="#e5e7eb" />
    <rect x="420" y="130" width="1" height="60" fill="#e5e7eb" />
    <rect x="490" y="130" width="1" height="60" fill="#e5e7eb" />
    <rect x="560" y="130" width="1" height="60" fill="#e5e7eb" />
    
    {/* <!-- Day labels --> */}
    <text x="315" y="125" font-family="sans-serif" font-size="8" fill="#6b7280" text-anchor="middle">MON</text>
    <text x="385" y="125" font-family="sans-serif" font-size="8" fill="#6b7280" text-anchor="middle">TUE</text>
    <text x="455" y="125" font-family="sans-serif" font-size="8" fill="#6b7280" text-anchor="middle">WED</text>
    <text x="525" y="125" font-family="sans-serif" font-size="8" fill="#6b7280" text-anchor="middle">THU</text>
    
    {/* <!-- Schedule items with animations --> */}
    <rect x="290" y="140" width="50" height="15" rx="4" fill="#ede9fe" stroke="#8b5cf6" stroke-width="1" opacity="0">
      <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="0.5s" fill="freeze" />
    </rect>
    <rect x="360" y="140" width="50" height="15" rx="4" fill="#fef3c7" stroke="#f59e0b" stroke-width="1" opacity="0">
      <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="0.7s" fill="freeze" />
    </rect>
    <rect x="430" y="140" width="50" height="15" rx="4" fill="#dcfce7" stroke="#10b981" stroke-width="1" opacity="0">
      <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="0.9s" fill="freeze" />
    </rect>
    
    {/* <!-- Student Performance chart area --> */}
    <rect x="20" y="220" width="280" height="160" rx="12" fill="#ffffff" filter="url(#faculty-shadow)" />
    <rect x="40" y="240" width="150" height="12" rx="6" fill="#111827" />
    <rect x="40" y="260" width="90" height="6" rx="3" fill="#6b7280" />
    
    {/* <!-- Performance chart grid --> */}
    <rect x="40" y="270" width="240" height="1" fill="#e5e7eb" />
    <rect x="40" y="300" width="240" height="1" fill="#e5e7eb" />
    <rect x="40" y="330" width="240" height="1" fill="#e5e7eb" />
    <rect x="40" y="360" width="240" height="1" fill="#e5e7eb" />
    
    {/* <!-- Chart axes labels --> */}
    <text x="38" y="275" font-family="sans-serif" font-size="8" fill="#6b7280" text-anchor="end">100%</text>
    <text x="38" y="305" font-family="sans-serif" font-size="8" fill="#6b7280" text-anchor="end">75%</text>
    <text x="38" y="335" font-family="sans-serif" font-size="8" fill="#6b7280" text-anchor="end">50%</text>
    <text x="38" y="365" font-family="sans-serif" font-size="8" fill="#6b7280" text-anchor="end">25%</text>
    
    {/* <!-- Animated chart line --> */}
    <path d="M60 350 L100 330 L140 340 L180 310 L220 290 L260 270" 
          stroke="url(#performance-gradient)" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"
          stroke-dasharray="500" stroke-dashoffset="500">
      <animate attributeName="stroke-dashoffset" from="500" to="0" dur="1.5s" begin="1s" fill="freeze" />
    </path>
    
    {/* <!-- Chart data points with pulsing animation --> */}
    <circle cx="60" cy="350" r="5" fill="#8b5cf6">
      <animate attributeName="r" values="3;5;3" dur="2s" begin="1.5s" repeatCount="indefinite" />
    </circle>
    <circle cx="100" cy="330" r="5" fill="#8b5cf6">
      <animate attributeName="r" values="3;5;3" dur="2s" begin="1.6s" repeatCount="indefinite" />
    </circle>
    <circle cx="140" cy="340" r="5" fill="#8b5cf6">
      <animate attributeName="r" values="3;5;3" dur="2s" begin="1.7s" repeatCount="indefinite" />
    </circle>
    <circle cx="180" cy="310" r="5" fill="#8b5cf6">
      <animate attributeName="r" values="3;5;3" dur="2s" begin="1.8s" repeatCount="indefinite" />
    </circle>
    <circle cx="220" cy="290" r="5" fill="#8b5cf6">
      <animate attributeName="r" values="3;5;3" dur="2s" begin="1.9s" repeatCount="indefinite" />
    </circle>
    <circle cx="260" cy="270" r="5" fill="#8b5cf6">
      <animate attributeName="r" values="3;5;3" dur="2s" begin="2s" repeatCount="indefinite" />
    </circle>
    
    {/* <!-- Assignment area with depth --> */}
    <rect x="320" y="220" width="260" height="160" rx="12" fill="#ffffff" filter="url(#faculty-shadow)" />
    <rect x="340" y="240" width="120" height="12" rx="6" fill="#111827" />
    <rect x="340" y="260" width="80" height="6" rx="3" fill="#6b7280" />
    
    {/* <!-- Assignment items with realistic styling --> */}
    <rect x="340" y="280" width="220" height="1" fill="#e5e7eb" />
    <rect x="340" y="295" width="220" height="30" rx="6" fill="#f9fafb" stroke="#e5e7eb" stroke-width="1" />
    <rect x="350" y="305" width="150" height="10" rx="5" fill="#111827" />
    <rect x="520" y="305" width="30" height="10" rx="5" fill="#dcfce7" />
    
    <rect x="340" y="335" width="220" height="30" rx="6" fill="#f9fafb" stroke="#e5e7eb" stroke-width="1" />
    <rect x="350" y="345" width="150" height="10" rx="5" fill="#111827" />
    <rect x="520" y="345" width="30" height="10" rx="5" fill="#fee2e2" />
  </symbol>  
    </svg>
  );
};
export default HomeSVGDefinitions;