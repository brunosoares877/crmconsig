import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const DashboardMetricsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="shadow-sm border-slate-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <Skeleton className="h-4 w-1/2 bg-slate-200" />
            <Skeleton className="h-8 w-8 rounded-full bg-slate-200" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-3/4 mb-2 bg-slate-200" />
            <Skeleton className="h-3 w-full bg-slate-100" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export const TableSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-10 w-1/3 bg-slate-200" />
        <Skeleton className="h-10 w-32 bg-slate-200" />
      </div>
      <div className="border rounded-md">
        <div className="h-12 border-b bg-slate-50 flex items-center px-4">
          <Skeleton className="h-4 w-full bg-slate-200" />
        </div>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-20 border-b flex items-center px-4 gap-4">
            <Skeleton className="h-12 w-12 rounded-full bg-slate-200" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/4 bg-slate-200" />
              <Skeleton className="h-3 w-1/3 bg-slate-100" />
            </div>
            <Skeleton className="h-8 w-24 bg-slate-200" />
            <Skeleton className="h-8 w-16 bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  );
};
