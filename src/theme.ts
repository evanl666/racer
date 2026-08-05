/** Every colour the game draws. Nothing else should hard-code a hex value. */
export const COLORS = {
  water: '#163D52',
  waterDeep: '#102F42',
  waterLine: 'rgba(255,255,255,0.045)',
  land: '#A8BE79',
  landLight: '#C0CF91',
  landDark: '#7F995F',
  roadShadow: 'rgba(5,14,20,0.48)',
  roadEdge: '#20282D',
  curbLight: '#F1E9D7',
  curbRed: '#D86A59',
  road: '#58636A',
  /** Every other lane, so the channels read without dashed dividers. */
  roadAlt: '#6E7B83',
  roadHighlight: 'rgba(255,255,255,0.045)',
  lane: 'rgba(246,242,226,0.55)',
  player: '#F05A47',
  playerLight: '#FF8D73',
  playerStripe: '#FFF4D8',
  window: '#C8EDF1',
  ai: '#161B1E',
  aiLight: '#31383C',
  aiWindow: '#69777D',
  text: '#F7F4EA',
  muted: 'rgba(247,244,234,0.66)',
  accent: '#57D5CB',
  accentLight: '#C5FFF7',
  button: 'rgba(8,17,25,0.82)',
  buttonActive: 'rgba(87,213,203,0.30)',
  buttonDisabled: 'rgba(8,17,25,0.42)',
  buttonEdge: 'rgba(247,244,234,0.28)'
} as const;

/**
 * Menu and result-screen palette.
 *
 * The race keeps its muted marine look, but the screens around it are built the
 * way the popular WeChat casual games are: cream cards on a saturated ground,
 * heavy dark outlines, hard offset shadows instead of blurs, and one loud warm
 * colour reserved for the primary action.
 */
export const UI = {
  ground: '#12384E',
  groundDeep: '#0A2233',
  groundStripe: 'rgba(255,255,255,0.028)',
  card: '#FFF6E4',
  cardAlt: '#FFEDCC',
  ink: '#22323F',
  inkSoft: '#6C7C88',
  outline: '#152532',
  primary: '#FFB43C',
  primaryDeep: '#E38C15',
  good: '#5FCF80',
  bad: '#FF6B5E',
  chip: '#1B3F55'
} as const;
