import React from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Card,
  CardHeader,
  CardBody,
  Select,
  SelectItem
} from "@nextui-org/react";
import { DateRangePicker } from "@nextui-org/react";
import { departmentOptions } from "@/app/utils/department";
import { Calendar, Download } from "lucide-react";

export default function FilterControls({ userProfile, filters, onFilterChange, onDownloadReport }) {
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm">
      <CardHeader className="flex justify-between">
        <h2 className="text-xl font-bold">Filter Options</h2>
        <Button 
          variant="ghost" 
          color="primary" 
          size="sm" 
          onClick={onDownloadReport}
          endContent={<Download size={16} />}
        >
          Download Report
        </Button>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {userProfile?.role === "superadmin" && (
            <Dropdown>
              <DropdownTrigger>
                <Button variant="bordered" className="w-full justify-between">
                  {filters.selectedDepartment || "Select Department"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Department selection"
                onAction={(key) => onFilterChange({ selectedDepartment: key })}
              >
                {departmentOptions.map((department) => (
                  <DropdownItem key={department.key}>{department.label}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          )}
          
          {(userProfile?.role === "admin" || userProfile?.role === "superadmin") && (
            <Dropdown>
              <DropdownTrigger>
                <Button variant="bordered" className="w-full justify-between">
                  {filters.selectedClass || "Select Class"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Class selection"
                onAction={(key) => onFilterChange({ selectedClass: key })}
                items={userProfile.classes}
              >
                {(item) => (
                  <DropdownItem key={item}>{item}</DropdownItem>
                )}
              </DropdownMenu>
            </Dropdown>
          )}
          
          {(userProfile.role === "admin" || userProfile.role === "superadmin" || userProfile?.classes) && (
            <Dropdown>
              <DropdownTrigger>
                <Button variant="bordered" className="w-full justify-between">
                  {filters.viewType === "cumulative" ? "Cumulative View" : "Individual View"}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="View type selection"
                onAction={(key) => onFilterChange({ viewType: key })}
              >
                <DropdownItem key="cumulative">Cumulative View</DropdownItem>
                <DropdownItem key="individual">Individual View</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          )}
          
          {userProfile?.role === "faculty" && filters.viewType === "individual" && (
            <>
              {userProfile.subjects && (
                <Dropdown>
                  <DropdownTrigger>
                    <Button variant="bordered" className="w-full justify-between">
                      {filters.selectedSubject ? `Current: ${filters.selectedSubject}` : "Select Current Year Subject"}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Subject selection"
                    onAction={(key) => onFilterChange({ selectedSubject: key, selectedInactiveSubject: "" })}
                  >
                    {userProfile.subjects?.map((subject) => (
                      <DropdownItem key={subject}>{subject}</DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              )}
              
              {userProfile.inactiveSubjects && (
                <Dropdown>
                  <DropdownTrigger>
                    <Button variant="bordered" className="w-full justify-between">
                      {filters.selectedInactiveSubject ? `Previous: ${filters.selectedInactiveSubject}` : "Select Previous Year Subject"}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Inactive subject selection"
                    onAction={(key) => onFilterChange({ selectedInactiveSubject: key, selectedSubject: "" })}
                  >
                    {userProfile.inactiveSubjects?.map((subject) => (
                      <DropdownItem key={subject}>{subject}</DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              )}
            </>
          )}
          
          {(userProfile.role === "admin" || userProfile.role === "superadmin") && (
            <>
              {filters.viewType === "individual" && (
                <Dropdown>
                  <DropdownTrigger>
                    <Button variant="bordered" className="w-full justify-between">
                      {filters.selectedSubject ? filters.selectedSubject : "Select Subject"}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu 
                    className="max-h-48 overflow-y-auto" 
                    aria-label="Subject selection" 
                    onAction={(key) => onFilterChange({ selectedSubject: key })}
                  >
                    {userProfile.subjects?.map((subject) => (
                      <DropdownItem key={subject}>{subject}</DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              )}
            </>
          )}
        </div>
        
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2 flex items-center">
            <Calendar size={16} className="mr-1 text-default-400" />
            Select Date Range
          </h3>
          <DateRangePicker
            from={filters.dateRange.from}
            to={filters.dateRange.to}
            onSelect={(range) => onFilterChange({ dateRange: range })}
            className="w-full md:max-w-md"
          />
        </div>
      </CardBody>
    </Card>
  );
}