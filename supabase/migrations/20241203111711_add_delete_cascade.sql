alter table "public"."reports" drop constraint "reports_business_id_fkey";

alter table "public"."reports" drop constraint "reports_user_id_fkey";

alter table "public"."reports" add constraint "reports_business_id_fkey" FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE not valid;

alter table "public"."reports" validate constraint "reports_business_id_fkey";

alter table "public"."reports" add constraint "reports_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."reports" validate constraint "reports_user_id_fkey";


