export const SERVICE_WAGE_TYPES = {
  HOURLY: 'HOURLY',
  PER_TREE: 'PER_TREE',
  PER_SQFT: 'PER_SQFT',
  PER_POINT: 'PER_POINT',
  PER_FOOT: 'PER_FOOT',
  DAILY_WAGE: 'DAILY_WAGE',
  FIXED_VISIT: 'FIXED_VISIT',
  CUSTOM_PROJECT: 'CUSTOM_PROJECT',
} as const;

export type ServiceWageType = (typeof SERVICE_WAGE_TYPES)[keyof typeof SERVICE_WAGE_TYPES];

export interface ServiceSpecificationConfig {
  name: string;
  category: string;
  description: string;
  features: string[];
  icon: string;
  image?: string;
  wageType: ServiceWageType;
  unitLabel: string;
  baseCustomerRate: number;
  baseWorkerWage: number;
  minUnits: number;
  priceRange: string;
  duration: string;
  sortOrder: number;
  specifications: Record<string, any>;
}

export const KK_STANDARD_SERVICE_SPECS: ServiceSpecificationConfig[] = [
  {
    name: 'Coconut Palm Tree Plucking & Crown Cleaning',
    category: 'Agriculture & Cococare',
    description:
      'Professional coconut palm tree maintenance, crown cleaning, pest control, and skilled yield harvesting by certified field climbers across Kerala.',
    features: [
      'Certified climbers with full ergonomic harness equipment',
      'Crown cleaning, dead frond pruning & rhinoceros beetle treatment',
      'Nut yield estimation and selective harvesting',
      'Organic plantation waste disposal and mulch spreading',
    ],
    icon: 'Palmtree',
    image: '/Banners/coco.png',
    wageType: 'PER_TREE',
    unitLabel: 'Tree',
    baseCustomerRate: 120,
    baseWorkerWage: 80,
    minUnits: 5,
    priceRange: '₹80 - ₹150 / Tree',
    duration: '1 - 3 Hours',
    sortOrder: 1,
    specifications: {
      treeCounterEnabled: true,
      crownCleaningIncluded: true,
      beetleTreatmentAvailable: true,
      heightHazardAllowance: 20,
      minTreeCountNotice: 5,
    },
  },
  {
    name: 'JCB Heavy Machinery & Earth Excavation',
    category: 'Excavation & Heavy Equipment',
    description:
      'High-performance JCB backhoe loaders, tracked excavators, site grading, trenching, pond restoration, and basement foundation excavation.',
    features: [
      'Verified licensed operators with 5+ years field experience',
      'Deep trench excavation, basement dig & boundary leveling',
      'Drainage channel clearing & rainwater pond development',
      'Available on hourly, daily, or turnkey project contracts',
    ],
    icon: 'Tractor',
    image: '/Banners/jcb.png',
    wageType: 'HOURLY',
    unitLabel: 'Hour',
    baseCustomerRate: 1600,
    baseWorkerWage: 900,
    minUnits: 2,
    priceRange: '₹1,400 - ₹1,800 / Hour',
    duration: 'Shift Basis (4-8 Hours)',
    sortOrder: 2,
    specifications: {
      hourMeterEnabled: true,
      liveTimerSupported: true,
      minOperatingHours: 2,
      dieselPolicy: 'OPERATOR_OR_CLIENT',
      machineTypeOptions: ['JCB 3DX', 'Tracked Excavator 200', 'Mini Digger'],
    },
  },
  {
    name: 'Exterior & Interior Plastering Squads',
    category: 'Plastering & Wall Rendering',
    description:
      'Specialized plastering squads for exterior weather-shield cement plastering, interior smooth finish, gypsum plastering, and crack repair with laser plumb-line leveling.',
    features: [
      'Double-coat waterproof exterior cement plastering with graded sand',
      'Smooth sponge and putty-finish interior plaster rendering',
      'Laser-guided wall leveling, corner bead alignment & plumb-line calibration',
      'Anti-shrinkage fiber reinforced mortar for crack prevention',
    ],
    icon: 'Layers',
    image: '/Banners/plastering.png',
    wageType: 'DAILY_WAGE',
    unitLabel: 'Day / Shift',
    baseCustomerRate: 1500,
    baseWorkerWage: 1050,
    minUnits: 1,
    priceRange: '₹1,400 - ₹1,700 / Day',
    duration: 'Project Basis',
    sortOrder: 3,
    specifications: {
      shiftHoursStandard: 8,
      spongeFinishIncluded: true,
      doubleCoatExternal: true,
      overtimeRatePerHour: 200,
    },
  },
  {
    name: 'Commercial & Residential Painting',
    category: 'Surface Finishing & Painting',
    description:
      'Full-scale interior and exterior painting squads with mechanized surface preparation, anti-fungal treatment, and weather-guard coating.',
    features: [
      'High-pressure water jet washing & acrylic putty skimming',
      'Weather-proof exterior emulsion with 5-year anti-algal warranty',
      'Interior luxury velvet & royal sheen roller application',
      'Authentic Asian Paints, Berger, and Dulux certified materials',
    ],
    icon: 'Paintbrush',
    image: '/Banners/painting.png',
    wageType: 'PER_SQFT',
    unitLabel: 'Sq. Ft.',
    baseCustomerRate: 24,
    baseWorkerWage: 14,
    minUnits: 150,
    priceRange: '₹18 - ₹35 / Sq. Ft.',
    duration: '3 - 7 Days',
    sortOrder: 4,
    specifications: {
      areaSqFtMeasurement: true,
      primerCoatsDefault: 1,
      topCoatsDefault: 2,
      scaffoldingTierRequired: true,
    },
  },
  {
    name: 'Tile, Marble & Granite Laying',
    category: 'Flooring & Surfaces',
    description:
      'Precision floor, wall, and bathroom tiling squads specialized in large-format vitrified tiles, natural granite slabs, and Italian marble installation.',
    features: [
      'Laser-guided leveling with anti-lippage spacer systems',
      'Epoxy waterproof grout filling for chemical resistance',
      'Diamond abrasive pad polishing and edge chamfering',
      'Staircase bullnosing & custom kitchen countertop fabrication',
    ],
    icon: 'Sparkles',
    image: '/Banners/tiling.png',
    wageType: 'PER_SQFT',
    unitLabel: 'Sq. Ft.',
    baseCustomerRate: 45,
    baseWorkerWage: 28,
    minUnits: 100,
    priceRange: '₹28 - ₹65 / Sq. Ft.',
    duration: '2 - 5 Days',
    sortOrder: 5,
    specifications: {
      areaSqFtMeasurement: true,
      epoxyGroutingSupported: true,
      antiLippageSpacers: true,
      skirtingRatePerRft: 20,
    },
  },
  {
    name: 'Industrial & Domestic Electrical MEP Systems',
    category: 'Electrical & Power Systems',
    description:
      'Licensed wiremen and MEP electrical teams for concealed conduit wiring, three-phase distribution boards, solar inverter tie-ins, and industrial switchgear.',
    features: [
      'Kerala State Electricity Board (KSEB) compliant wiring standards',
      'FR-LSH copper cabling with MCB, RCCB and surge protection',
      'Chemical copper plate earth pit installation with low-resistance backfill',
      'Generator changeover systems, high-load AC & EV charger points',
    ],
    icon: 'Zap',
    image: '/Banners/electrical.png',
    wageType: 'PER_POINT',
    unitLabel: 'Point',
    baseCustomerRate: 450,
    baseWorkerWage: 260,
    minUnits: 4,
    priceRange: '₹350 - ₹550 / Point',
    duration: 'Same Day / Project',
    sortOrder: 6,
    specifications: {
      pointCounterEnabled: true,
      mainDbDressingRate: 1500,
      earthPitSetupRate: 2800,
      conduitCuttingPerMeter: 35,
    },
  },
  {
    name: 'Pipeline Trenching & Sanitary Plumbing',
    category: 'Plumbing & Sanitary Utilities',
    description:
      'Turnkey plumbing installations, CPVC/UPVC pressurized water lines, underground drainage networks, overhead tank setups, and luxury fixture installations.',
    features: [
      'Electrofusion & solvent weld joints with hydrostatic pressure testing',
      'Overhead multi-layer tank installation with automatic float controllers',
      'Concealed diverters, rain showers & sanitary fixture installation',
      'Submersible pump plumbing, sump automation & rainwater harvesting',
    ],
    icon: 'Wrench',
    image: '/Banners/plumbing.png',
    wageType: 'FIXED_VISIT',
    unitLabel: 'Visit / Inspection',
    baseCustomerRate: 350,
    baseWorkerWage: 220,
    minUnits: 1,
    priceRange: '₹350 Visit / Estimate',
    duration: 'Same Day Dispatch',
    sortOrder: 7,
    specifications: {
      visitChargeBase: 350,
      pipePointRate: 300,
      tankCleaningRate: 850,
    },
  },
  {
    name: 'Precision Borewell Drilling & Water Survey',
    category: 'Water Engineering & Borewells',
    description:
      'Advanced rotary and DTH rig borewell drilling, geophysical water vein surveys, MS/PVC casing pipe insertion, and accredited lab water potability tests.',
    features: [
      'Geological sensor scanning for optimal aquifer detection',
      'High-diameter heavy rig drilling up to 1,200 ft depth',
      'Food-grade heavy wall casing pipes with pea gravel packing',
      'Certified 16-parameter chemical & microbiological water report',
    ],
    icon: 'Droplets',
    image: '/Banners/borewell.png',
    wageType: 'PER_FOOT',
    unitLabel: 'Foot',
    baseCustomerRate: 115,
    baseWorkerWage: 65,
    minUnits: 100,
    priceRange: '₹95 - ₹140 / Foot',
    duration: '1 - 2 Days',
    sortOrder: 8,
    specifications: {
      depthFootageTracking: true,
      casingPipeRatePerFoot: 240,
      geophysicalSurveyFee: 2500,
    },
  },
  {
    name: 'Structural Masonry & Brick Construction',
    category: 'Civil & Masonry Works',
    description:
      'Master masonry crews for residential and commercial brickwork, stone foundation building, lintel casting, compound walls, and structural alterations.',
    features: [
      'Traditional Kerala laterite stone masonry & modern AAC block laying',
      'Precision water-level alignment and plumb-line calibration',
      'Compound wall construction, retaining walls & architectural arches',
      'Foundation excavation, PCC bed casting & reinforced lintel works',
    ],
    icon: 'Layers',
    image: '/Banners/masonry.png',
    wageType: 'DAILY_WAGE',
    unitLabel: 'Day / Shift',
    baseCustomerRate: 1600,
    baseWorkerWage: 1100,
    minUnits: 1,
    priceRange: '₹1,500 - ₹1,800 / Day',
    duration: 'Project Milestones',
    sortOrder: 9,
    specifications: {
      shiftHoursStandard: 8,
      dailyBataAllowance: 150,
      helperWageIncluded: false,
      overtimeRatePerHour: 200,
    },
  },
];

/**
 * Accurately resolve service specification, wage type, unit label, and rates
 * from service name or explicit wage type.
 * Never defaults every service to HOURLY.
 */
export function resolveServiceSpec(
  serviceName: string,
  explicitWageType?: string | null,
): ServiceSpecificationConfig {
  const s = (serviceName || '').toLowerCase();

  // If explicit wageType is provided and is NOT generic HOURLY (or if it's HOURLY and actually machinery), respect it:
  if (explicitWageType && explicitWageType !== 'HOURLY') {
    const matched = KK_STANDARD_SERVICE_SPECS.find((spec) => spec.wageType === explicitWageType);
    if (matched) return matched;
  }

  // 1. Coconut & Palm Tree Harvesting / Pruning -> PER_TREE
  if (
    s.includes('coconut') ||
    s.includes('cococare') ||
    s.includes('palm') ||
    s.includes('കയറ്റം') ||
    s.includes('തെങ്ങ്')
  ) {
    return KK_STANDARD_SERVICE_SPECS.find((spec) => spec.wageType === 'PER_TREE')!;
  }

  // 2. Heavy Machinery & Excavation (JCB, Excavator, Crane, Earthmoving) -> HOURLY
  if (
    s.includes('jcb') ||
    s.includes('excavat') ||
    s.includes('crane') ||
    s.includes('earthmoving') ||
    s.includes('trench') ||
    s.includes('grader') ||
    s.includes('loader') ||
    s.includes('ജെസിബി') ||
    s.includes('എസ്കവേറ്റർ') ||
    s.includes('ക്രെയിൻ') ||
    s.includes('മണ്ണെടുക്കൽ')
  ) {
    return KK_STANDARD_SERVICE_SPECS.find((spec) => spec.wageType === 'HOURLY')!;
  }

  // 3. Tile, Marble & Granite Laying -> PER_SQFT
  if (
    s.includes('tile') ||
    s.includes('marble') ||
    s.includes('granite') ||
    s.includes('floor') ||
    s.includes('ടൈൽ') ||
    s.includes('മാർബിൾ')
  ) {
    return KK_STANDARD_SERVICE_SPECS.find(
      (spec) => spec.wageType === 'PER_SQFT' && spec.name.toLowerCase().includes('tile'),
    )!;
  }

  // 4. Painting & Putty -> PER_SQFT
  if (
    s.includes('paint') ||
    s.includes('putty') ||
    s.includes('wall') ||
    s.includes('പെയിന്റിംഗ്')
  ) {
    return KK_STANDARD_SERVICE_SPECS.find(
      (spec) => spec.wageType === 'PER_SQFT' && spec.name.toLowerCase().includes('paint'),
    )!;
  }

  // 5. Electrical & Wiring -> PER_POINT
  if (
    s.includes('electr') ||
    s.includes('wire') ||
    s.includes('wiring') ||
    s.includes('kseb') ||
    s.includes('ഇലക്ട്രിക്കൽ') ||
    s.includes('വയറിംഗ്')
  ) {
    return KK_STANDARD_SERVICE_SPECS.find((spec) => spec.wageType === 'PER_POINT')!;
  }

  // 6. Borewell Drilling & Piling -> PER_FOOT
  if (
    s.includes('bore') ||
    s.includes('drill') ||
    s.includes('piling') ||
    s.includes('കുഴൽക്കിണർ') ||
    s.includes('ഡ്രില്ലിംഗ്')
  ) {
    return KK_STANDARD_SERVICE_SPECS.find((spec) => spec.wageType === 'PER_FOOT')!;
  }

  // 7. Plastering & Wall Rendering
  if (
    s.includes('plaster') ||
    s.includes('തേപ്പ്')
  ) {
    return (
      KK_STANDARD_SERVICE_SPECS.find((spec) => spec.name.toLowerCase().includes('plaster')) ||
      KK_STANDARD_SERVICE_SPECS.find((spec) => spec.wageType === 'DAILY_WAGE')!
    );
  }

  // 8. Masonry & Construction -> DAILY_WAGE
  if (
    s.includes('mason') ||
    s.includes('brick') ||
    s.includes('concrete') ||
    s.includes('കൊത്തുപണി') ||
    s.includes('മേസ്തിരി') ||
    s.includes('കട്ടകെട്ട്')
  ) {
    return (
      KK_STANDARD_SERVICE_SPECS.find((spec) => spec.name.toLowerCase().includes('masonry')) ||
      KK_STANDARD_SERVICE_SPECS.find((spec) => spec.wageType === 'DAILY_WAGE')!
    );
  }

  // 9. Plumbing & Inspection / Visit -> FIXED_VISIT
  if (
    s.includes('plumb') ||
    s.includes('pipe') ||
    s.includes('leak') ||
    s.includes('clean') ||
    s.includes('inspect') ||
    s.includes('ടാങ്ക്') ||
    s.includes('പ്ലംബിംഗ്')
  ) {
    return KK_STANDARD_SERVICE_SPECS.find((spec) => spec.wageType === 'FIXED_VISIT')!;
  }

  // Default: FIXED_VISIT
  return (
    KK_STANDARD_SERVICE_SPECS.find((spec) => spec.wageType === 'FIXED_VISIT') ||
    KK_STANDARD_SERVICE_SPECS[0]
  );
}

