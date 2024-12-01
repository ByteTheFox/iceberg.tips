"use client";

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tables } from "@/lib/types";

type BusinessReport = Tables<"reports"> & {
  business: Tables<"businesses"> | null;
};

interface BusinessListProps {
  reports: BusinessReport[];
}

export function BusinessList({ reports }: BusinessListProps) {
  const getTipPracticeBadge = (practice: string) => {
    const colors: Record<string, string> = {
      no_tipping: "bg-blue-100 text-blue-800",
      living_wage: "bg-green-100 text-green-800",
      traditional: "bg-gray-100 text-gray-800",
      service_charge: "bg-purple-100 text-purple-800",
      tip_pooling: "bg-yellow-100 text-yellow-800",
      other: "bg-red-100 text-red-800",
    };
    return colors[practice] || colors.other;
  };

  return (
    <div className="divide-y">
      {reports.map((report) => (
        <div key={report.id} className="p-4 hover:bg-muted/50">
          <h3 className="font-medium">{report.business?.name}</h3>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl">{report.business?.name}</CardTitle>
              <Badge className={getTipPracticeBadge(report.tip_practice)}>
                {report.tip_practice.replace("_", " ").toUpperCase()}
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
