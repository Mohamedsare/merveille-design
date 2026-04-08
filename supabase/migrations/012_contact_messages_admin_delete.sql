-- Suppression des messages contact réservée aux admins (RLS)
drop policy if exists "Contact messages delete admin" on public.contact_messages;
create policy "Contact messages delete admin"
on public.contact_messages
for delete
to authenticated
using (public.is_admin());
