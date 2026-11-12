// Checks the booking database functions in supabase/schema.sql against an
// in-memory Postgres (PGlite). Run with: npm run test:db
import { PGlite } from '@electric-sql/pglite'
import { readFileSync } from 'node:fs'
const db = new PGlite()
await db.exec(readFileSync(new URL("../supabase/schema.sql", import.meta.url), "utf8"))
await db.exec(readFileSync(new URL("../supabase/schema.sql", import.meta.url), "utf8")) // re-runnable
const hold = (a, d, sites, hookups = 0) => db.query(
  `select hold_booking($1,$2,$3,2,$4,'[]'::jsonb,100,'n','e@x.com',null,null,5,2,30) as id`, [a, d, sites, hookups])
  .then(r => r.rows[0].id).catch(e => 'ERR:' + e.message)
const ok = (c, m) => { if (!c) { console.log('FAIL', m); process.exitCode = 1 } else console.log('ok', m) }
const a = await hold('2027-07-09', '2027-07-12', 3, 1)
ok(!String(a).startsWith('ERR'), 'first hold')
ok(String(await hold('2027-07-10', '2027-07-11', 3)).includes('sold_out'), 'oversell blocked')
const b = await hold('2027-07-11', '2027-07-13', 2, 1)
ok(!String(b).startsWith('ERR'), 'fills to 5')
ok(String(await hold('2027-07-11', '2027-07-12', 1, 0)).includes('sold_out'), 'full night')
ok(!String(await hold('2027-07-12', '2027-07-13', 3, 0)).startsWith('ERR'), 'checkout day free')
ok(String(await hold('2027-07-12', '2027-07-13', 0 + 0 || 0, 1)).startsWith('ERR'), 'sites must be > 0')
// hookups: 07-12 has b(1 hookup); add another booking w hookup on 07-14
ok(!String(await hold('2027-07-14','2027-07-15',1,1)).startsWith('ERR'),'hookup 1')
ok(!String(await hold('2027-07-14','2027-07-15',1,1)).startsWith('ERR'),'hookup 2')
ok(String(await hold('2027-07-14','2027-07-15',1,1)).includes('hookups_sold_out'),'hookup 3 blocked')
// expiry frees space
await db.query(`update bookings set hold_expires_at = now() - interval '1 minute' where id = $1`, [a])
ok(!String(await hold('2027-07-10', '2027-07-11', 3)).startsWith('ERR'), 'expired hold frees sites')
// confirm returns once
const c1 = await db.query(`select * from confirm_booking($1,'cs_1')`, [b]); const c2 = await db.query(`select * from confirm_booking($1,'cs_1')`, [b])
ok(c1.rows.length === 1 && c2.rows.length === 0, 'confirm idempotent')
// blocked nights
await db.query(`insert into blocked_nights(night, sites) values ('2027-08-01', 4)`)
ok(String(await hold('2027-08-01','2027-08-02',2)).includes('sold_out'),'blocked night counts')
if (process.exitCode) console.log('\nSome checks failed.')
else console.log('\nAll booking database checks passed.')
