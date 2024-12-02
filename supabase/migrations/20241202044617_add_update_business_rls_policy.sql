create policy "Users can update businesses they've reported"
on "public"."businesses"
as permissive
for update
to authenticated
using ((EXISTS ( SELECT 1
   FROM reports
  WHERE ((reports.business_id = businesses.id) AND (reports.user_id = auth.uid())))))
with check ((EXISTS ( SELECT 1
   FROM reports
  WHERE ((reports.business_id = businesses.id) AND (reports.user_id = auth.uid())))));



