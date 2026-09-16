import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ynvoojootpssbuiigcyn.supabase.co'
const supabaseKey = 'sb_publishable_2-je2N4Azdqp9xBvGJpX5Q_9uptnLA-'

export const supabase = createClient(supabaseUrl, supabaseKey)