create table "public"."businesses" (
    "id" uuid not null default uuid_generate_v4(),
    "hash" text not null,
    "name" text not null,
    "address" text not null,
    "city" text not null,
    "state" text not null,
    "zip_code" text not null,
    "country" text not null,
    "latitude" double precision,
    "longitude" double precision,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."businesses" enable row level security;

create table "public"."reports" (
    "id" uuid not null default uuid_generate_v4(),
    "business_id" uuid not null,
    "user_id" uuid,
    "tip_practice" text not null,
    "suggested_tips" numeric[],
    "service_charge_percentage" numeric,
    "details" text,
    "created_at" timestamp with time zone default now()
);


alter table "public"."reports" enable row level security;

CREATE UNIQUE INDEX businesses_hash_key ON public.businesses USING btree (hash);

CREATE UNIQUE INDEX businesses_pkey ON public.businesses USING btree (id);

CREATE UNIQUE INDEX reports_pkey ON public.reports USING btree (id);

alter table "public"."businesses" add constraint "businesses_pkey" PRIMARY KEY using index "businesses_pkey";

alter table "public"."reports" add constraint "reports_pkey" PRIMARY KEY using index "reports_pkey";

alter table "public"."businesses" add constraint "businesses_hash_key" UNIQUE using index "businesses_hash_key";

alter table "public"."reports" add constraint "reports_business_id_fkey" FOREIGN KEY (business_id) REFERENCES businesses(id) not valid;

alter table "public"."reports" validate constraint "reports_business_id_fkey";

alter table "public"."reports" add constraint "reports_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."reports" validate constraint "reports_user_id_fkey";

grant delete on table "public"."businesses" to "anon";

grant insert on table "public"."businesses" to "anon";

grant references on table "public"."businesses" to "anon";

grant select on table "public"."businesses" to "anon";

grant trigger on table "public"."businesses" to "anon";

grant truncate on table "public"."businesses" to "anon";

grant update on table "public"."businesses" to "anon";

grant delete on table "public"."businesses" to "authenticated";

grant insert on table "public"."businesses" to "authenticated";

grant references on table "public"."businesses" to "authenticated";

grant select on table "public"."businesses" to "authenticated";

grant trigger on table "public"."businesses" to "authenticated";

grant truncate on table "public"."businesses" to "authenticated";

grant update on table "public"."businesses" to "authenticated";

grant delete on table "public"."businesses" to "service_role";

grant insert on table "public"."businesses" to "service_role";

grant references on table "public"."businesses" to "service_role";

grant select on table "public"."businesses" to "service_role";

grant trigger on table "public"."businesses" to "service_role";

grant truncate on table "public"."businesses" to "service_role";

grant update on table "public"."businesses" to "service_role";

grant delete on table "public"."reports" to "anon";

grant insert on table "public"."reports" to "anon";

grant references on table "public"."reports" to "anon";

grant select on table "public"."reports" to "anon";

grant trigger on table "public"."reports" to "anon";

grant truncate on table "public"."reports" to "anon";

grant update on table "public"."reports" to "anon";

grant delete on table "public"."reports" to "authenticated";

grant insert on table "public"."reports" to "authenticated";

grant references on table "public"."reports" to "authenticated";

grant select on table "public"."reports" to "authenticated";

grant trigger on table "public"."reports" to "authenticated";

grant truncate on table "public"."reports" to "authenticated";

grant update on table "public"."reports" to "authenticated";

grant delete on table "public"."reports" to "service_role";

grant insert on table "public"."reports" to "service_role";

grant references on table "public"."reports" to "service_role";

grant select on table "public"."reports" to "service_role";

grant trigger on table "public"."reports" to "service_role";

grant truncate on table "public"."reports" to "service_role";

grant update on table "public"."reports" to "service_role";

create policy "Anyone can view businesses"
on "public"."businesses"
as permissive
for select
to anon, authenticated
using (true);


create policy "Authenticated users can create businesses"
on "public"."businesses"
as permissive
for insert
to authenticated
with check (true);


create policy "Anyone can view reports"
on "public"."reports"
as permissive
for select
to anon, authenticated
using (true);


create policy "Users can create reports"
on "public"."reports"
as permissive
for insert
to authenticated
with check (true);


create policy "Users can delete own reports"
on "public"."reports"
as permissive
for delete
to authenticated
using ((auth.uid() = user_id));


create policy "Users can update own reports"
on "public"."reports"
as permissive
for update
to authenticated
using ((auth.uid() = user_id));



