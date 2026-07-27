CREATE TABLE "classes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"name" text NOT NULL,
	"level" text NOT NULL,
	"academic_year" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"subject" text NOT NULL,
	"term" text NOT NULL,
	"score" numeric(4, 2) NOT NULL,
	"class_average" numeric(4, 2),
	"rank" integer,
	"remark" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"label" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"due_date" date NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"method" text NOT NULL,
	"paid_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reference" text
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"school_id" uuid NOT NULL,
	"class_id" uuid,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"birth_date" date,
	"matricule" text,
	"parent_user_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grades" ADD CONSTRAINT "grades_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_parent_user_id_users_id_fk" FOREIGN KEY ("parent_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;

-- ════════════════════════════════════════════════════════════════
-- Row Level Security — mêmes principes que la migration 0001_rls.sql
-- ════════════════════════════════════════════════════════════════

alter table public.classes  enable row level security;
alter table public.students enable row level security;
alter table public.grades   enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;

-- classes : scopées à l'organisation via l'école
create policy "staff access classes of own org" on public.classes
  for all using (
    exists (select 1 from public.schools s
            where s.id = classes.school_id
            and s.organization_id = public.current_org_id())
  )
  with check (
    exists (select 1 from public.schools s
            where s.id = classes.school_id
            and s.organization_id = public.current_org_id())
  );

-- students : staff de l'organisation en lecture/écriture ; le parent
-- rattaché (parent_user_id) ne voit que son propre enfant.
create policy "staff access students of own org" on public.students
  for all using (
    exists (select 1 from public.schools s
            where s.id = students.school_id
            and s.organization_id = public.current_org_id())
  )
  with check (
    exists (select 1 from public.schools s
            where s.id = students.school_id
            and s.organization_id = public.current_org_id())
  );
create policy "parent reads own child" on public.students
  for select using (parent_user_id = auth.uid());

-- grades : staff via l'école de l'élève ; parent lit les notes de son enfant
create policy "staff access grades of own org" on public.grades
  for all using (
    exists (select 1 from public.students st
            join public.schools s on s.id = st.school_id
            where st.id = grades.student_id
            and s.organization_id = public.current_org_id())
  );
create policy "parent reads own child grades" on public.grades
  for select using (
    exists (select 1 from public.students st
            where st.id = grades.student_id
            and st.parent_user_id = auth.uid())
  );

-- invoices : staff via l'école de l'élève ; parent lit les factures de son enfant
create policy "staff access invoices of own org" on public.invoices
  for all using (
    exists (select 1 from public.students st
            join public.schools s on s.id = st.school_id
            where st.id = invoices.student_id
            and s.organization_id = public.current_org_id())
  );
create policy "parent reads own child invoices" on public.invoices
  for select using (
    exists (select 1 from public.students st
            where st.id = invoices.student_id
            and st.parent_user_id = auth.uid())
  );

-- payments : staff via l'école de l'élève (facture -> élève) ; parent en lecture seule
create policy "staff access payments of own org" on public.payments
  for all using (
    exists (select 1 from public.invoices inv
            join public.students st on st.id = inv.student_id
            join public.schools s on s.id = st.school_id
            where inv.id = payments.invoice_id
            and s.organization_id = public.current_org_id())
  );
create policy "parent reads own child payments" on public.payments
  for select using (
    exists (select 1 from public.invoices inv
            join public.students st on st.id = inv.student_id
            where inv.id = payments.invoice_id
            and st.parent_user_id = auth.uid())
  );