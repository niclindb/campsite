// Checks the booking database functions in db/schema.sql against an
// in-memory Postgres (PGlite). Run with: npm run test:db
import { PGlite } from '@electric-sql/pglite'
import { readFileSync } from 'node:fs'
const db = new PGlite()
await db.exec(readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8"))
await db.exec(readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8")) // re-runnable
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
// a full refund cancels a confirmed booking (same update as api/stripe-webhook.ts)
const r = await hold('2027-09-01', '2027-09-02', 5)
await db.query(`select * from confirm_booking($1,'cs_r')`, [r])
ok(String(await hold('2027-09-01', '2027-09-02', 1)).includes('sold_out'), 'confirmed booking holds its sites')
await db.query(`update bookings set status = 'cancelled' where id = $1 and status = 'confirmed'`, [r])
ok(!String(await hold('2027-09-01', '2027-09-02', 1)).startsWith('ERR'), 'refund cancel frees sites')
const again = await db.query(`select * from confirm_booking($1,'cs_r')`, [r])
ok(again.rows.length === 0, 'cancelled booking stays cancelled')
if (process.exitCode) console.log('\nSome checks failed.')
else console.log('\nAll booking database checks passed.')

// Rental limits (hold_booking with p_limits)
const limits = JSON.stringify({ Canoe: 3, Hammock: 1 })
const rent = (a, d, extras) => db.query(
  `select hold_booking($1,$2,1,2,0,$3::jsonb,100,'n','e@x.com',null,null,5,2,$4::jsonb,30) as id`, [a, d, JSON.stringify(extras), limits])
  .then(r => r.rows[0].id).catch(e => 'ERR:' + e.message)
ok(!String(await rent('2027-09-01','2027-09-04',[{name:'Canoe',price:20,qty:2},{name:'Hammock',price:25,qty:1}])).startsWith('ERR'),'rent 2 canoes + hammock')
ok(String(await rent('2027-09-03','2027-09-05',[{name:'Hammock',price:25,qty:1}])).includes('item_sold_out:Hammock'),'hammock taken that night')
ok(!String(await rent('2027-09-04','2027-09-05',[{name:'Hammock',price:25,qty:1}])).startsWith('ERR'),'hammock free on checkout day')
ok(String(await rent('2027-09-02','2027-09-03',[{name:'Canoe',price:20,qty:2}])).includes('item_sold_out:Canoe'),'4th canoe blocked')
ok(!String(await rent('2027-09-02','2027-09-03',[{name:'Canoe',price:20,qty:1},{name:'Firewood bundle',price:8,qty:5}])).startsWith('ERR'),'3rd canoe ok, firewood unlimited')
const iu = await db.query(`select item, used from item_usage('2027-09-02','2027-09-03') where item='Canoe'`)
ok(iu.rows[0]?.used === 3, 'item_usage counts canoes')
if (process.exitCode) console.log('\nSome rental checks failed.')

// Page views (record_page_view)
await db.query(`select record_page_view('2027-01-01', '/', 'google.com')`)
await db.query(`select record_page_view('2027-01-01', '/', null)`)
await db.query(`select record_page_view('2027-01-01', '/book', null)`)
await db.query(`select record_page_view('2027-01-01', '/book', 'direct')`)
const pv = await db.query(`select path, views, visits from page_views where day = '2027-01-01' order by path`)
ok(pv.rows[0]?.views === 2 && pv.rows[0]?.visits === 1 && pv.rows[1]?.views === 2 && pv.rows[1]?.visits === 1, 'page views and visits counted')
const vs = await db.query(`select source, visits from visit_sources where day = '2027-01-01' order by source`)
ok(vs.rows.length === 2 && vs.rows.every((r) => r.visits === 1), 'visit sources counted')
if (process.exitCode) console.log('\nSome page view checks failed.')

// Host dashboard: blocking a run of nights (same SQL as api/host-block.ts)
const block = (from, end, sites, note) => db.query(
  `insert into blocked_nights (night, sites, note)
   select d::date, $3, $4 from generate_series($1::date, $2::date - 1, interval '1 day') as d
   on conflict (night) do update set sites = excluded.sites, note = excluded.note
   returning night`, [from, end, sites, note])
ok((await block('2027-10-01', '2027-10-04', 5, 'Family')).rows.length === 3, 'block 3 nights')
ok((await block('2027-10-03', '2027-10-05', 2, null)).rows.length === 2, 'reblock overlapping nights')
ok(String(await hold('2027-10-02', '2027-10-03', 1)).includes('sold_out'), 'blocked nights are full')
ok(!String(await hold('2027-10-03', '2027-10-04', 3)).startsWith('ERR'), 'partly blocked night has room')
const un = await db.query(`delete from blocked_nights where night >= $1 and night < $2 returning night`, ['2027-10-01', '2027-10-03'])
ok(un.rows.length === 2 && !String(await hold('2027-10-02', '2027-10-03', 1)).startsWith('ERR'), 'unblock frees nights')
// Refund bookkeeping (same SQL as api/_lib/refund.ts)
const rb = await hold('2027-11-01', '2027-11-02', 1)
await db.query(`select * from confirm_booking($1,'cs_rb')`, [rb])
const rec = (cents, full) => db.query(`update bookings set refunded_cents = greatest(refunded_cents, $2),
  status = case when $3 and status = 'confirmed' then 'cancelled' else status end where id = $1`, [rb, cents, full])
await rec(50, false)
let st = (await db.query('select status, refunded_cents from bookings where id = $1', [rb])).rows[0]
ok(st.status === 'confirmed' && st.refunded_cents === 50, 'partial refund keeps booking')
await rec(100, true)
st = (await db.query('select status, refunded_cents from bookings where id = $1', [rb])).rows[0]
ok(st.status === 'cancelled' && st.refunded_cents === 100, 'full refund cancels booking')
if (process.exitCode) console.log('\nSome dashboard checks failed.')

// Host dashboard alerts: nights where bookings alone go past capacity (same SQL as api/_lib/host-alerts.ts)
await db.query(`insert into bookings (status, arrive, depart, sites, guests, total_cents, name, email)
  values ('confirmed', '2028-01-10', '2028-01-12', 4, 2, 100, 'a', 'a@x.com'), ('confirmed', '2028-01-11', '2028-01-12', 2, 2, 100, 'b', 'b@x.com')`)
const ob = await db.query(`select d::date::text as night, sum(b.sites)::int as sites, sum(b.hookups)::int as hookups
     from generate_series($1::date, $2::date, interval '1 day') as d
     join bookings b on b.arrive <= d::date and b.depart > d::date
      and (b.status = 'confirmed' or (b.status = 'held' and b.hold_expires_at > now()))
    group by d having sum(b.sites) > $3 or sum(b.hookups) > $4 order by d`, ['2028-01-01', '2028-02-01', 5, 2])
ok(ob.rows.length === 1 && ob.rows[0].night === '2028-01-11' && ob.rows[0].sites === 6, 'overbooked night found')
if (process.exitCode) console.log('\nSome alert checks failed.')
