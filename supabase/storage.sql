
-- Create a private bucket for Templates
insert into storage.buckets (id, name, public)
values ('templates', 'templates', false);

-- Policy: Allow authenticated users to view/download templates
create policy "Authenticated users can view templates"
on storage.objects for select
using ( bucket_id = 'templates' and auth.role() = 'authenticated' );

-- Policy: Allow authenticated users to upload/update templates
create policy "Authenticated users can upload templates"
on storage.objects for insert
with check ( bucket_id = 'templates' and auth.role() = 'authenticated' );

create policy "Authenticated users can update templates"
on storage.objects for update
using ( bucket_id = 'templates' and auth.role() = 'authenticated' );
