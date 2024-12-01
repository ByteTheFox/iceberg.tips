"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Database } from "@/lib/supabase/types"

type BusinessReport = Database["public"]["Tables"]["business_reports"]["Row"]

interface BusinessListProps {
  reports: BusinessReport[]
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
    }
    return colors[practice] || colors.other
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <Card key={report.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl">{report.business_name}</CardTitle>
              <Badge className={getTipPracticeBadge(report.tip_practice)}>
                {report.tip_practice.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {report.address}, {report.city}, {report.state} {report.zip_code}
            </p>
            {report.details && (
              <p className="mt-2 text-sm">{report.details}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}