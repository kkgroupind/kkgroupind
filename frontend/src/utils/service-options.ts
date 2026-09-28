import { CustomerDropdownOption } from '@/components/Common/CustomerDropdown';

export interface LocalizedServiceOption extends CustomerDropdownOption {
  id: string;
  name: string;
  nameMl: string;
  image: string;
}

export const CUSTOMER_SERVICES: LocalizedServiceOption[] = [
  {
    id: 'cococare',
    name: 'Cococare - Palm Harvesting & Crown Care',
    nameMl: 'തെങ്ങ് കയറ്റവും തെങ്ങ് വൃത്തിയാക്കലും',
    image: '/Banners/coco.png',
  },
  {
    id: 'jcb',
    name: 'JCB 3DX Heavy Excavation Squad',
    nameMl: 'ജെസിബി മണ്ണെടുപ്പും നിരപ്പാക്കലും',
    image: '/Banners/jcb.png',
  },
  {
    id: 'plastering',
    name: 'Exterior & Interior Plastering Squads',
    nameMl: 'തേപ്പ് പണിയും കട്ടകെട്ടും (പ്ലാസ്റ്ററിംഗ്)',
    image: '/Banners/plastering.png',
  },
  {
    id: 'painting',
    name: 'Commercial & Residential Painting',
    nameMl: 'വീടും കെട്ടിടങ്ങളും പെയിന്റിംഗ് പണികൾ',
    image: '/Banners/painting.png',
  },
  {
    id: 'tile',
    name: 'Tile, Marble & Granite Precision Laying',
    nameMl: 'ടൈൽ, മാർബിൾ & ഗ്രാനൈറ്റ് ഒട്ടിക്കൽ',
    image: '/Banners/tiling.png',
  },
  {
    id: 'electrical',
    name: 'Industrial & Residential Electrical MEP',
    nameMl: 'ഇലക്ട്രിക്കൽ വയറിംഗും ഫിറ്റിംഗും',
    image: '/Banners/electrical.png',
  },
  {
    id: 'plumbing',
    name: 'Pipeline Trenching & Sanitary Plumbing',
    nameMl: 'പ്ലംബിംഗ് & പൈപ്പ് ലൈൻ പണികൾ',
    image: '/Banners/plumbing.png',
  },
  {
    id: 'borewell',
    name: 'Precision Borewell Drilling & Water Survey',
    nameMl: 'കുഴൽക്കിണർ നിർമ്മാണവും വെള്ളം കണ്ടെത്തലും',
    image: '/Banners/borewell.png',
  },
  {
    id: 'masonry',
    name: 'Structural Masonry & Brick Construction',
    nameMl: 'കട്ടകെട്ടും മേസൺ പണികളും',
    image: '/Banners/masonry.png',
  },
];

export const SERVICE_ML_LOOKUP: Record<string, string> = {
  cococare: 'തെങ്ങ് കയറ്റവും തെങ്ങ് വൃത്തിയാക്കലും',
  coconut: 'തെങ്ങ് കയറ്റവും തെങ്ങ് വൃത്തിയാക്കലും',
  'coconut-plucking': 'തെങ്ങ് കയറ്റവും തെങ്ങ് വൃത്തിയാക്കലും',
  jcb: 'ജെസിബി മണ്ണെടുപ്പും നിരപ്പാക്കലും',
  'jcb-excavation': 'ജെസിബി മണ്ണെടുപ്പും നിരപ്പാക്കലും',
  plastering: 'തേപ്പ് പണിയും കട്ടകെട്ടും (പ്ലാസ്റ്ററിംഗ്)',
  'plastering-masonry': 'തേപ്പ് പണിയും കട്ടകെട്ടും (പ്ലാസ്റ്ററിംഗ്)',
  masonry: 'കട്ടകെട്ടും മേസൺ പണികളും',
  painting: 'വീടും കെട്ടിടങ്ങളും പെയിന്റിംഗ് പണികൾ',
  tile: 'ടൈൽ, മാർബിൾ & ഗ്രാനൈറ്റ് ഒട്ടിക്കൽ',
  tiling: 'ടൈൽ, മാർബിൾ & ഗ്രാനൈറ്റ് ഒട്ടിക്കൽ',
  electrical: 'ഇലക്ട്രിക്കൽ വയറിംഗും ഫിറ്റിംഗും',
  'electrical-mep': 'ഇലക്ട്രിക്കൽ വയറിംഗും ഫിറ്റിംഗും',
  plumbing: 'പ്ലംബിംഗ് & പൈപ്പ് ലൈൻ പണികൾ',
  borewell: 'കുഴൽക്കിണർ നിർമ്മാണവും വെള്ളം കണ്ടെത്തലും',
  'borewell-survey': 'കുഴൽക്കിണർ നിർമ്മാണവും വെള്ളം കണ്ടെത്തലും',
};

export const DEFAULT_SERVICE_BANNERS: Record<string, string> = {
  cococare: '/Banners/coco.png',
  coconut: '/Banners/coco.png',
  'coconut-plucking': '/Banners/coco.png',
  coco: '/Banners/coco.png',
  jcb: '/Banners/jcb.png',
  'jcb-excavation': '/Banners/jcb.png',
  excavation: '/Banners/jcb.png',
  plastering: '/Banners/plastering.png',
  'plastering-masonry': '/Banners/plastering.png',
  masonry: '/Banners/masonry.png',
  painting: '/Banners/painting.png',
  tile: '/Banners/tiling.png',
  tiling: '/Banners/tiling.png',
  marble: '/Banners/tiling.png',
  electrical: '/Banners/electrical.png',
  'electrical-mep': '/Banners/electrical.png',
  plumbing: '/Banners/plumbing.png',
  borewell: '/Banners/borewell.png',
  'borewell-survey': '/Banners/borewell.png',
};

export function getServiceBanner(identifier: string): string {
  const lower = (identifier || '').toLowerCase();
  if (DEFAULT_SERVICE_BANNERS[lower]) return DEFAULT_SERVICE_BANNERS[lower];
  if (lower.includes('coco') || lower.includes('palm') || lower.includes('തെങ്ങ്')) return '/Banners/coco.png';
  if (lower.includes('jcb') || lower.includes('excavat') || lower.includes('മണ്ണെടുപ്പ്')) return '/Banners/jcb.png';
  if (lower.includes('plaster') || lower.includes('തേപ്പ്')) return '/Banners/plastering.png';
  if (lower.includes('mason') || lower.includes('കട്ടകെട്ട്')) return '/Banners/masonry.png';
  if (lower.includes('paint') || lower.includes('പെയിന്റിംഗ്')) return '/Banners/painting.png';
  if (lower.includes('tile') || lower.includes('tiling') || lower.includes('marble') || lower.includes('granite') || lower.includes('ടൈൽ')) return '/Banners/tiling.png';
  if (lower.includes('electr') || lower.includes('വയറിംഗ്')) return '/Banners/electrical.png';
  if (lower.includes('plumb') || lower.includes('പ്ലംബിംഗ്')) return '/Banners/plumbing.png';
  if (lower.includes('bore') || lower.includes('well') || lower.includes('കുഴൽക്കിണർ')) return '/Banners/borewell.png';
  return '/Banners/coco.png';
}

export function getServiceMalayalamName(identifier: string): string {
  const lower = (identifier || '').toLowerCase();
  if (SERVICE_ML_LOOKUP[lower]) return SERVICE_ML_LOOKUP[lower];
  if (lower.includes('coco') || lower.includes('palm')) return 'തെങ്ങ് കയറ്റവും തെങ്ങ് വൃത്തിയാക്കലും';
  if (lower.includes('jcb') || lower.includes('excavat')) return 'ജെസിബി മണ്ണെടുപ്പും നിരപ്പാക്കലും';
  if (lower.includes('plaster')) return 'തേപ്പ് പണിയും കട്ടകെട്ടും (പ്ലാസ്റ്ററിംഗ്)';
  if (lower.includes('mason')) return 'കട്ടകെട്ടും മേസൺ പണികളും';
  if (lower.includes('paint')) return 'വീടും കെട്ടിടങ്ങളും പെയിന്റിംഗ് പണികൾ';
  if (lower.includes('tile') || lower.includes('marble') || lower.includes('granite')) return 'ടൈൽ, മാർബിൾ & ഗ്രാനൈറ്റ് ഒട്ടിക്കൽ';
  if (lower.includes('electr')) return 'ഇലക്ട്രിക്കൽ വയറിംഗും ഫിറ്റിംഗും';
  if (lower.includes('plumb')) return 'പ്ലംബിംഗ് & പൈപ്പ് ലൈൻ പണികൾ';
  if (lower.includes('bore') || lower.includes('well')) return 'കുഴൽക്കിണർ നിർമ്മാണവും വെള്ളം കണ്ടെത്തലും';
  return identifier;
}
