// GET /api/keepalive, run once a day by Vercel Cron (vercel.json).
// Supabase pauses free projects after a week without use; this keeps the
// bookings database awake through the quiet winter months.

import { db, handle, json } from './_lib/server.js'

export const GET = () =>
  handle(async () => {
    const { error } = await db().from('bookings').select('id', { head: true, count: 'exact' }).limit(1)
    if (error) throw error
    return json({ ok: true })
  })
