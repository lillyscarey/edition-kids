/**
 * Run the papers table migration against your Supabase project.
 *
 * Usage:
 *   SUPABASE_SERVICE_KEY=<your-service-role-key> node scripts/migrate.mjs
 *
 * Find your service role key at:
 *   https://supabase.com/dashboard/project/pfbndojmukibhtcerdkv/settings/api
 *   → "Project API keys" → "service_role" (reveal and copy)
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = 'https://pfbndojmukibhtcerdkv.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SERVICE_KEY) {
  console.error('\n❌  Missing SUPABASE_SERVICE_KEY environment variable.')
  console.error('\n   Get it from:')
  console.error('   https://supabase.com/dashboard/project/pfbndojmukibhtcerdkv/settings/api')
  console.error('   → Project API keys → service_role → Reveal → Copy\n')
  console.error('   Then run:')
  console.error('   SUPABASE_SERVICE_KEY=eyJ... node scripts/migrate.mjs\n')
  process.exit(1)
}

const migrations = [
  '001_papers.sql',
  '002_archived_briefings.sql',
  '003_shared_briefing.sql',
]

const sql = migrations
  .map(f => readFileSync(join(__dirname, '../supabase/migrations', f), 'utf8'))
  .join('\n\n')

console.log('🔄  Running migrations: ' + migrations.join(', ') + ' …')

const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
  },
  body: JSON.stringify({ sql }),
}).catch(() => null)

// exec_sql RPC may not exist — fall back to the SQL API endpoint
if (!res || !res.ok) {
  const res2 = await fetch(`${SUPABASE_URL}/sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  })

  if (res2.ok) {
    console.log('✅  Migration applied successfully!\n')
    process.exit(0)
  }

  const body = await res2.text()
  // Table already exists is fine
  if (body.includes('already exists')) {
    console.log('✅  Migration already applied (table exists).\n')
    process.exit(0)
  }

  console.error('❌  Migration failed:', body)
  console.error('\n   If the script API is blocked, paste the SQL directly into:')
  console.error(`   https://supabase.com/dashboard/project/pfbndojmukibhtcerdkv/sql/new\n`)
  process.exit(1)
}

console.log('✅  Migration applied successfully!\n')
