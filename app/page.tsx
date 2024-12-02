import { createClient } from "@/lib/supabase/server";
import BusinessUI from "@/components/business-ui";

export default async function Home() {
  const supabase = await createClient();
  const { data: businesses } = await supabase
    .from("business_stats")
    .select("*");

  return <BusinessUI businesses={businesses} />;
}
