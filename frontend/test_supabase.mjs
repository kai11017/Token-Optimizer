import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://nllhlhhovickbclochys.supabase.co', 'sb_publishable_OG7KJLcuyGIJiT8ejb371w_Cy8gJNgH');

supabase.from('conversations').select('*').limit(1).then(({ data, error }) => {
  if (error) {
    console.error('ERROR CONNECTING TO SUPABASE:', error.message);
    process.exit(1);
  }
  console.log('SUCCESS! Successfully connected to Supabase.');
  console.log('Fetched data:', data);
});
