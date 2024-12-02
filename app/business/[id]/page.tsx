import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { tipPracticeOptions } from "@/lib/constants";
import { BusinessMap } from "@/components/business-map";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

interface Report {
  id: string;
  created_at: string;
  tip_practice: string | null;
  tips_go_to_staff: boolean | null;
  suggested_tips: number[] | null;
  service_charge_percentage: number | null;
  notes: string | null;
}

export default async function BusinessPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { page?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const pageSize = 10;
  const supabase = await createClient();

  const { data: business } = await supabase
    .from("business_stats")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!business) {
    notFound();
  }

  const { data: reports, count } = await supabase
    .from("reports")
    .select("*", { count: "exact" })
    .eq("business_id", params.id)
    .order("created_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  const totalPages = count ? Math.ceil(count / pageSize) : 0;

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

  return (
    <div className="w-full max-w-7xl mx-auto py-8 space-y-4">
      <Link
        href="/"
        className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2"
      >
        ← Back to all businesses
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">{business.name}</h1>
            <Badge
              className={`${
                business.computed_tips_go_to_staff === true
                  ? "bg-green-100 text-green-800"
                  : business.computed_tips_go_to_staff === false
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {business.computed_tips_go_to_staff === null
                ? "Unknown"
                : business.computed_tips_go_to_staff
                ? "Tips Go To Staff"
                : "Tips Don't Go To Staff"}
            </Badge>
          </div>

          <div>
            <h3 className="font-medium mb-2">Location</h3>
            <p className="text-muted-foreground">
              {business.address}, {business.city}, {business.state}{" "}
              {business.zip_code}
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Tip Practice</h3>
            <Badge
              className={getTipPracticeBadgeClassName(
                business.computed_tip_practice
              )}
            >
              {getTipPracticeBadgeLabel(business.computed_tip_practice)}
            </Badge>
          </div>

          {business.computed_suggested_tips &&
            business.computed_suggested_tips.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">Suggested Tips</h3>
                <p className="text-muted-foreground">
                  {business.computed_suggested_tips
                    .map((tip) => `${tip}%`)
                    .join(", ")
                    .replace(/,([^,]*)$/, " and$1")}
                </p>
              </div>
            )}

          {(business.computed_service_charge_percentage ?? 0) > 0 && (
            <div>
              <h3 className="font-medium mb-2">Service Charge</h3>
              <p className="text-muted-foreground">
                {business.computed_service_charge_percentage}%
              </p>
            </div>
          )}

          <div>
            <h3 className="font-medium mb-2">Reports</h3>
            <Badge variant="secondary">
              {business.report_count}{" "}
              {business.report_count === 1 ? "report" : "reports"}
            </Badge>
          </div>
        </div>

        <div className="h-[400px] rounded-lg overflow-hidden">
          <BusinessMap
            businesses={[business]}
            center={{
              lat: business.latitude ?? 0,
              lng: business.longitude ?? 0,
            }}
          />
        </div>
      </div>

      <div className="border-t pt-8">
        <h2 className="text-xl font-semibold mb-6">Reports History</h2>
        <div className="space-y-4">
          {reports?.map((report) => (
            <Card key={report.id} className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    {report.tip_practice && (
                      <Badge
                        className={getTipPracticeBadgeClassName(
                          report.tip_practice
                        )}
                      >
                        {getTipPracticeBadgeLabel(report.tip_practice)}
                      </Badge>
                    )}
                    {report.tips_go_to_staff !== null && (
                      <Badge
                        className={
                          report.tips_go_to_staff
                            ? "bg-green-100 text-green-800 ml-2"
                            : "bg-red-100 text-red-800 ml-2"
                        }
                      >
                        {report.tips_go_to_staff
                          ? "Tips Go To Staff"
                          : "Tips Don't Go To Staff"}
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(report.created_at ?? ""), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                {report.tip_practice === "tip_requested" &&
                  (!report.suggested_tips ||
                    report.suggested_tips.length === 0) && (
                    <p className="text-sm text-amber-600">
                      Tips are requested but no specific amounts are suggested
                    </p>
                  )}
                {report.suggested_tips && report.suggested_tips.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Suggested tips:{" "}
                    {report.suggested_tips.map((tip) => `${tip}%`).join(", ")}
                  </p>
                )}
                {report.service_charge_percentage && (
                  <p className="text-sm text-muted-foreground">
                    Service charge: {report.service_charge_percentage}%
                  </p>
                )}
                {report.details && (
                  <p className="text-sm mt-2">{report.details}</p>
                )}
              </div>
            </Card>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <Link
                  key={pageNum}
                  href={`/business/${params.id}?page=${pageNum}`}
                  className={`px-3 py-1 rounded ${
                    pageNum === page
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary hover:bg-secondary/80"
                  }`}
                >
                  {pageNum}
                </Link>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
