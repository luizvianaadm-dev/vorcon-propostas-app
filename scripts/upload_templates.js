
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Manually read .env.local
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim().replace(/"/g, ''); // Simple parse
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("Using URL:", supabaseUrl);
// console.log("Using Key:", supabaseKey); // Secure default

// Note: For upload, we might need SERVICE_ROLE_KEY if RLS policies are strict, 
// but user said "Authenticated users can upload". 
// Since we are running this script locally, we can simulates a login or just use the Service Key if available.
// However, .env.local usually only has ANON key. 
// If RLS allows Anon upload (unlikely) or if we can use a user token. 
// FOR NOW: I will try to use the ANON key. If it fails, I will ask user for SERVICE KEY or to change Policy.
// Actually, I can check if I can get a session or just use the Service Key if it was in the py script? 
// No, I don't see service key. I will assume I need to handle this. 
// Wait, I can try to just use the Anon key, maybe policies are open for 'templates' bucket?
// I created `storage.sql` earlier. Let's check permissions. 

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const TEMPLATES_DIR = path.join(__dirname, '../../templates_tagged');

async function uploadTemplates() {
  const files = fs.readdirSync(TEMPLATES_DIR);

  for (const file of files) {
    if (file.endsWith('.docx')) {
      const filePath = path.join(TEMPLATES_DIR, file);
      const fileBuffer = fs.readFileSync(filePath);

      let destinationName = file;

      // Mapping Logic
      if (file.includes('template_AC_202601AC5')) destinationName = 'template_ac_premium.docx';
      else if (file.includes('template_AUD_202404AUD01')) destinationName = 'template_aud_generic.docx';
      else if (file.includes('template_PPA_PPA')) destinationName = 'template_tsc_4400.docx';
      else if (file.includes('template_CON_202601CS1')) destinationName = 'template_consultoria.docx';
      else if (file.includes('template_ATS_202407ATS1')) destinationName = 'template_ats.docx';
      // else keep original name or skip if not needed? Just upload all for safety, but these are the key ones.

      console.log(`Uploading ${file} as ${destinationName}...`);

      const { data, error } = await supabase
        .storage
        .from('templates')
        .upload(destinationName, fileBuffer, {
          contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          upsert: true
        });

      if (error) {
        console.error(`Error uploading ${file}:`, error.message);
      } else {
        console.log(`Success: ${file}`);
      }
    }
  }
}

uploadTemplates();
