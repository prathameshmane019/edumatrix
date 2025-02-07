import React from "react";
import { 
  Skeleton, 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell 
} from "@nextui-org/react";

export default function SubjectTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Filters Skeleton */}
      {/* <div className="flex items-center gap-3">
        <Skeleton className="rounded-lg">
          <div className="h-10 w-40 rounded-lg bg-default-300"></div>
        </Skeleton>
        <Skeleton className="rounded-lg">
          <div className="h-10 w-40 rounded-lg bg-default-300"></div>
        </Skeleton>
        <Skeleton className="rounded-lg">
          <div className="h-10 w-40 rounded-lg bg-default-300"></div>
        </Skeleton>
        <Skeleton className="rounded-lg ml-auto">
          <div className="h-10 w-32 rounded-lg bg-default-300"></div>
        </Skeleton>
      </div> */}

      {/* Table Skeleton */}
      <Table 
        aria-label="Loading subjects table"
        removeWrapper
        classNames={{
          base: "min-h-[300px]",
          table: "min-h-[250px]",
        }}
      >
        <TableHeader>
          <TableColumn>ID</TableColumn>
          <TableColumn>SUBJECT NAME</TableColumn>
          <TableColumn>CLASS</TableColumn>
          <TableColumn>FACULTY</TableColumn>
          <TableColumn>ACTIONS</TableColumn>
        </TableHeader>
        <TableBody 
          emptyContent={null}
          items={[{}, {}, {}]}
        >
          {() => (
            <TableRow key="loading">
              <TableCell>
                <Skeleton className="h-6 w-20 rounded-lg" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-32 rounded-lg" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-24 rounded-lg" />
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-6 w-36 rounded-lg" />
                  <Skeleton className="h-6 w-28 rounded-lg" />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded-lg" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}