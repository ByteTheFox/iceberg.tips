"use client";

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tables } from "@/lib/types";
import { tipPracticeOptions } from "@/lib/constants";

interface BusinessListProps {
  businesses: Tables<"business_stats">[] | null;
}

export function BusinessList({ businesses }: BusinessListProps) {
  const getTipPracticeBadgeClassName = (practice?: string | null) => {
    if (!practice) return "bg-gray-100 text-gray-800";
    const color = tipPracticeOptions.find(
      (option) => option.value === practice
    );
    return color?.className || "bg-gray-100 text-gray-800";
  };

  const getTipPracticeBadgeLabel = (practice?: string | null) => {
    if (!practice) return "Unknown";

    const label = tipPracticeOptions.find(
      (option) => option.value === practice
    );
    return label?.label || "Unknown";
  };

  const getTipsGoToStaffBadge = (goesToStaff?: boolean | null) => {
    if (goesToStaff === null || goesToStaff === undefined) return "Unknown";
    return goesToStaff ? "Tips Go To Staff" : "Tips Don't Go To Staff";
  };

  const getTipsGoToStaffClassName = (goesToStaff?: boolean | null) => {
    if (goesToStaff === null || goesToStaff === undefined)
      return "bg-gray-100 text-gray-800";
    return goesToStaff
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  return (
    <div className="divide-y divide-gray-100">
      {businesses?.map((business) => (
        <div key={business.id} className="hover:bg-muted/50">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">{business.name}</CardTitle>
              <Badge
                className={getTipsGoToStaffClassName(
                  business.computed_tips_go_to_staff
                )}
              >
                {getTipsGoToStaffBadge(business.computed_tips_go_to_staff)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {business.address}, {business.city}, {business.state}{" "}
              {business.zip_code}
            </p>
            {business.computed_suggested_tips &&
              business.computed_suggested_tips.length > 0 && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Suggested Tips:{" "}
                  {business.computed_suggested_tips?.map(
                    (tip, index, array) => {
                      if (index === 0) return `${tip}%`;
                      if (index === array.length - 1) return ` and ${tip}%`;
                      return `, ${tip}%`;
                    }
                  )}
                </p>
              )}
            {(business.computed_service_charge_percentage ?? 0) > 0 && (
              <p className="mt-2 text-sm">
                Service Charge: {business.computed_service_charge_percentage}%
              </p>
            )}
            <div className="mt-2 flex items-center justify-between gap-2">
              <Badge
                className={getTipPracticeBadgeClassName(
                  business.computed_tip_practice
                )}
              >
                {getTipPracticeBadgeLabel(business.computed_tip_practice)}
              </Badge>
              <Badge variant="secondary">
                {business.report_count}{" "}
                {business.report_count === 1 ? "Report" : "Reports"}
              </Badge>
            </div>
          </CardContent>
        </div>
      ))}
    </div>
  );
}
