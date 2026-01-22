
-- Create Clients Table
create table public.clients (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  cnpj text, -- Format: XX.XXX.XXX/XXXX-XX
  contact_name text,
  email text,
  phone text,
  address text,
  active boolean default true
);

-- Create Proposals Table
create table public.proposals (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  client_id uuid references public.clients(id) not null,

  code text not null, -- Ex: 202601AC83
  service_type text default 'AC', -- AC, NBC800, TSC4400, CON, VAL, TERC
  status text default 'DRAFT', -- DRAFT, GENERATED, SENT, APPROVED
  
  -- Flexible Input for diverse models
  input_data jsonb default '{}'::jsonb, -- Stores pages, folders, custom fields dynamically
  start_date date,
  end_date date,
  duration_months integer,
  pages_approx integer,
  folders_qty integer,
  
  -- Calculated Data
  base_value numeric,
  total_value numeric,
  discount_applied numeric,
  
  -- Output Files
  html_url text, -- Storage link
  docx_url text, -- Storage link
  
  unique(code)
);

-- Enable Row Level Security (RLS)
alter table public.clients enable row level security;
alter table public.proposals enable row level security;

-- Create Policy: Allow all authenticated users to read/write (for internal team tool)
create policy "Enable all access for authenticated users" on public.clients
  for all using (auth.role() = 'authenticated');

create policy "Enable all access for authenticated users" on public.proposals
  for all using (auth.role() = 'authenticated');
