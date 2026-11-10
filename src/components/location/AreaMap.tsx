// A drawn map of the area around the camp: the Lake Superior shore from
// Marquette to Pictured Rocks, the nearby towns and main roads, and dotted
// routes from the camp. The camp is only a wide circle over the general
// area; never put the exact location here.

const W = 1000
const LNG0 = -87.82
const LNG1 = -86.3
const LAT0 = 46.74
const kx = W / (LNG1 - LNG0)
const ky = kx / 0.688 // a degree of longitude is shorter than a degree of latitude up here
const H = Math.round((LAT0 - 46.33) * ky)

type Pt = readonly [number, number]
const P = (lat: number, lng: number): Pt => [(lng - LNG0) * kx, (LAT0 - lat) * ky]
const line = (pts: readonly Pt[]) => pts.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' ')

const shore = line([
  [46.9, -88.0], [46.88, -87.92], [46.86, -87.85], [46.84, -87.76], [46.80, -87.68], [46.75, -87.60],
  [46.70, -87.52], [46.66, -87.45], [46.62, -87.41], [46.59, -87.38], [46.565, -87.39], [46.545, -87.385],
  [46.52, -87.37], [46.50, -87.35], [46.47, -87.29], [46.46, -87.20], [46.47, -87.10], [46.45, -87.00],
  [46.43, -86.90], [46.43, -86.80], [46.42, -86.70], [46.41, -86.65], [46.43, -86.60], [46.47, -86.55],
  [46.50, -86.50], [46.53, -86.42], [46.56, -86.33], [46.60, -86.22], [46.64, -86.10], [46.67, -85.95],
].map(([a, b]) => P(a, b)))
const lake = `0,0 ${shore} ${W},0`
const grandIsland = line([
  [46.56, -86.70], [46.54, -86.64], [46.50, -86.62], [46.46, -86.64], [46.45, -86.68], [46.49, -86.71], [46.53, -86.72],
].map(([a, b]) => P(a, b)))

// Deliberately offset general area, matching the old map's circle.
const camp = P(46.56, -87.544)
const marquette = P(46.5436, -87.3954)
const negaunee = P(46.4991, -87.6118)
const ishpeming = P(46.4886, -87.6676)
const munising = P(46.4111, -86.6479)
const rocks = P(46.52, -86.45)
const shoreNear = P(46.6, -87.40)

// Roads drawn loosely: US 41 between the towns, M-28 east along the shore.
const us41 = [P(46.4886, -87.75), ishpeming, negaunee, P(46.52, -87.52), P(46.535, -87.45), marquette]
const m28 = [marquette, P(46.495, -87.36), P(46.47, -87.25), P(46.455, -87.10), P(46.44, -86.95), P(46.425, -86.80), munising]

const c = {
  land: '#f3ece2', lake: '#cfe0df', shore: '#8fb3b0', road: '#d9c9b4',
  text: '#020d22', soft: '#5b6470', rust: '#be3400', lakeText: '#3c6f6a',
}

const Label = ({ at, dx = 0, dy = 0, size = 20, weight = 600, fill = c.text, anchor = 'start', children }: {
  at: Pt; dx?: number; dy?: number; size?: number; weight?: number; fill?: string
  anchor?: 'start' | 'middle' | 'end'; children: string
}) => (
  <text x={at[0] + dx} y={at[1] + dy} fontSize={size} fontWeight={weight} fill={fill} textAnchor={anchor}
    fontFamily="'League Spartan', sans-serif" stroke={c.land} strokeWidth={4} paintOrder="stroke">
    {children}
  </text>
)

const Dot = ({ at }: { at: Pt }) => <circle cx={at[0]} cy={at[1]} r={5.5} fill={c.text} />

const AreaMap = () => (
  <svg className="area-map" viewBox={`0 0 ${W} ${H}`} role="img"
    aria-label="Map of the area: the camp sits between Marquette and Negaunee, south of Lake Superior, with Munising and Pictured Rocks to the east">
    <rect width={W} height={H} fill={c.land} />
    <polygon points={lake} fill={c.lake} />
    <polyline points={shore} fill="none" stroke={c.shore} strokeWidth={2} />
    <polygon points={grandIsland} fill={c.land} stroke={c.shore} strokeWidth={2} />
    <polyline points={line(us41)} fill="none" stroke={c.road} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
    <polyline points={line(m28)} fill="none" stroke={c.road} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />

    <text x={408} y={67} fontSize={30} letterSpacing={8} fill={c.lakeText} fontStyle="italic" fontFamily="'Cabin', sans-serif" textAnchor="middle">LAKE SUPERIOR</text>

    <g fill="none" stroke={c.rust} strokeWidth={3} strokeDasharray="2 9" strokeLinecap="round">
      <polyline points={line([camp, P(46.54, -87.47), marquette])} />
      <polyline points={line([camp, P(46.59, -87.47), shoreNear])} />
      <polyline points={line([camp, P(46.53, -87.45), ...m28.slice(1), P(46.47, -86.56), rocks])} />
    </g>

    <Dot at={marquette} /><Label at={marquette} dx={10} dy={22} size={23}>Marquette</Label>
    <Dot at={negaunee} /><Label at={negaunee} dx={-2} dy={24} anchor="middle">Negaunee</Label>
    <Dot at={ishpeming} /><Label at={ishpeming} dx={-10} dy={-10} anchor="end" fill={c.soft} weight={500}>Ishpeming</Label>
    <Dot at={munising} /><Label at={munising} dx={-6} dy={24} anchor="middle">Munising</Label>
    <path d={`M${rocks[0] - 8} ${rocks[1] + 8} l8 -16 8 16 Z`} fill={c.text} />
    <Label at={rocks} dx={-40} dy={32} size={23} anchor="middle">Pictured Rocks</Label>
    <Label at={negaunee} dx={30} dy={46} size={15} fill={c.soft} weight={500}>US 41</Label>
    <Label at={m28[3]} dy={24} size={15} fill={c.soft} weight={500}>M-28</Label>

    <circle cx={camp[0]} cy={camp[1]} r={30} fill={c.rust} fillOpacity={0.16} stroke={c.rust} strokeWidth={2} strokeDasharray="5 5" />
    <circle cx={camp[0]} cy={camp[1]} r={13} fill={c.rust} />
    <path d={`M${camp[0] - 7} ${camp[1] + 5} L${camp[0]} ${camp[1] - 7} L${camp[0] + 7} ${camp[1] + 5} Z`} fill="#fdf8f3" />
    <Label at={camp} dx={-4} dy={-40} size={25} weight={700} anchor="middle" fill={c.rust}>Northern Oasis</Label>
  </svg>
)

export default AreaMap
