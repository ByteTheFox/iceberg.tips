"use client";

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tables } from "@/lib/types";
import { tipPracticeOptions } from "@/lib/constants";

type BusinessReport = Tables<"reports"> & {
  business: Tables<"businesses"> | null;
};

interface BusinessListProps {
  reports: BusinessReport[];
}

export function BusinessList({ reports }: BusinessListProps) {
  const getTipPracticeBadgeClassName = (practice: string) => {
    const color = tipPracticeOptions.find(
      (option) => option.value === practice
    );

    return color?.className || "bg-gray-100 text-gray-800";
  };

  const getTipPracticeBadgeLabel = (practice: string) => {
    const label = tipPracticeOptions.find(
      (option) => option.value === practice
    );

    return label?.label || "Unknown";
  };

  return (
    <div className="divide-y divide-gray-100">
      {reports.map((report) => (
        <div key={report.id} className="hover:bg-muted/50">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl">{report.business?.name}</CardTitle>
              <Badge
                className={getTipPracticeBadgeClassName(report.tip_practice)}
              >
                {getTipPracticeBadgeLabel(report.tip_practice)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {report.business?.address}, {report.business?.city},{" "}
              {report.business?.state} {report.business?.zip_code}
            </p>
            {report.details && <p className="mt-2 text-sm">{report.details}</p>}
          </CardContent>
        </div>
      ))}
    </div>
  );
}
