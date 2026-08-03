alter table public.grades enable row level security;

-- grades : staff via l'école de l'élève; la clause WITH CHECK confirme la validité des INSERT/UPDATE
DROP POLICY IF EXISTS "staff access grades of own org" ON public.grades;
create policy "staff access grades of own org" on public.grades
  for all using (
    exists (select 1 from public.students st
            join public.schools s on s.id = st.school_id
            where st.id = grades.student_id
            and s.organization_id = public.current_org_id())
  ) with check (
    exists (select 1 from public.students st
            join public.schools s on s.id = st.school_id
            where st.id = grades.student_id
            and s.organization_id = public.current_org_id())
  );

alter table public.invoices enable row level security;

-- invoices : staff via l'école de l'élève; la clause WITH CHECK confirme la validité des INSERT/UPDATE
DROP POLICY IF EXISTS "staff access invoices of own org" ON public.invoices;
create policy "staff access invoices of own org" on public.invoices
  for all using (
    exists (select 1 from public.students st
            join public.schools s on s.id = st.school_id
            where st.id = invoices.student_id
            and s.organization_id = public.current_org_id())
  ) with check (
    exists (select 1 from public.students st
            join public.schools s on s.id = st.school_id
            where st.id = invoices.student_id
            and s.organization_id = public.current_org_id())
  );

alter table public.payments enable row level security;

-- payments : staff via l'école de l'élève (facture -> élève); la clause WITH CHECK confirme la validité des INSERT/UPDATE
DROP POLICY IF EXISTS "staff access payments of own org" ON public.payments;
create policy "staff access payments of own org" on public.payments
  for all using (
    exists (select 1 from public.invoices inv
            join public.students st on st.id = inv.student_id
            join public.schools s on s.id = st.school_id
            where inv.id = payments.invoice_id
            and s.organization_id = public.current_org_id())
  ) with check (
    exists (select 1 from public.invoices inv
            join public.students st on st.id = inv.student_id
            join public.schools s on s.id = st.school_id
            where inv.id = payments.invoice_id
            and s.organization_id = public.current_org_id())
  );
