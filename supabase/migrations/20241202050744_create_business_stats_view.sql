create or replace view "public"."business_stats" as  WITH report_stats AS (
         SELECT reports.business_id,
            mode() WITHIN GROUP (ORDER BY reports.tip_practice) AS tip_practice,
            (NULLIF(mode() WITHIN GROUP (ORDER BY
                CASE
                    WHEN reports.tips_go_to_staff THEN 'true'::text
                    WHEN (NOT reports.tips_go_to_staff) THEN 'false'::text
                    ELSE NULL::text
                END), NULL::text))::boolean AS tips_go_to_staff,
            mode() WITHIN GROUP (ORDER BY reports.service_charge_percentage) AS service_charge_percentage,
            mode() WITHIN GROUP (ORDER BY reports.suggested_tips) AS suggested_tips,
            count(*) AS report_count
           FROM reports
          GROUP BY reports.business_id
        )
 SELECT b.id,
    b.hash,
    b.name,
    b.address,
    b.city,
    b.state,
    b.zip_code,
    b.country,
    b.latitude,
    b.longitude,
    b.created_at,
    b.updated_at,
    COALESCE(rs.tip_practice, 'unknown'::text) AS computed_tip_practice,
    rs.tips_go_to_staff AS computed_tips_go_to_staff,
    COALESCE(rs.service_charge_percentage, (0)::numeric) AS computed_service_charge_percentage,
    COALESCE(rs.suggested_tips, '{}'::numeric[]) AS computed_suggested_tips,
    COALESCE(rs.report_count, (0)::bigint) AS report_count
   FROM (businesses b
     LEFT JOIN report_stats rs ON ((b.id = rs.business_id)));



