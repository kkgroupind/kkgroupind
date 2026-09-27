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
    category: 'Agriculture',
    description:
      'Professional coconut palm tree maintenance, crown cleaning, pest control, and skilled yield harvesting by certified field climbers across Kerala.',
    features: [
      'Certified climbers with full ergonomic harness equipment',
      'Crown cleaning, dead frond pruning & rhinoceros beetle treatment',
      'Nut yield estimation and selective harvesting',
      'Organic plantation waste disposal and mulch spreading',
    ],
    icon: 'Palmtree',
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
    name: 'Masonry & Brick Construction',
    category: 'Civil & Construction',
    description:
      'Master masonry crews for residential and commercial brickwork, stone foundation building, exterior plastering, and structural repairs.',
    features: [
      'Traditional Kerala stone masonry & modern cement-block laying',
      'Precision water-level alignment and plumb-line calibration',
      'Double-coat waterproof cement plastering with sand grading',
      'Architectural arches, compound walls & elevation details',
    ],
    icon: 'Layers',
    wageType: 'DAILY_WAGE',
    unitLabel: 'Day / Shift',
    baseCustomerRate: 1600,
    baseWorkerWage: 1100,
    minUnits: 1,
    priceRange: '₹1,500 - ₹1,800 / Day',
    duration: 'Project Milestones',
    sortOrder: 3,
    specifications: {
      shiftHoursStandard: 8,
      dailyBataAllowance: 150,
      helperWageIncluded: false,
      overtimeRatePerHour: 200,
    },
  },
  {
    name: 'Commercial & Residential Painting',
    category: 'Finishing & Renovation',
    description:
      'Full-scale interior and exterior painting squads with mechanized surface preparation, anti-fungal treatment, and weather-guard coating.',
    features: [
      'High-pressure water jet washing & acrylic putty skimming',
      'Weather-proof exterior emulsion with 5-year anti-algal warranty',
      'Interior luxury velvet & royal sheen roller application',
      'Authentic Asian Paints, Berger, and Dulux certified materials',
    ],
    icon: 'Paintbrush',
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
    name: 'Electrical & Wiring Systems',
    category: 'MEP & Utilities',
    description:
      'Licensed wiremen and industrial electricians for complete concealed conduit wiring, main DB dressing, solar grid tie-ins, and three-phase balancing.',
    features: [
      'Kerala State Electricity Board (KSEB) compliant standards',
      'FR-LSH copper cabling with MCB/ELCB surge protection',
      'Copper plate earth pit installation with chemical backfill',
      'Generator changeover switches, UPS & high-load AC points',
    ],
    icon: 'Zap',
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
    name: 'Plumbing & High-Pressure Piping',
    category: 'MEP & Utilities',
    description:
      'Turnkey plumbing installations, CPVC/UPVC pressurized water lines, underground drainage networks, overhead tank setups, and fixture installations.',
    features: [
      'Electrofusion & solvent weld joints with hydrostatic testing',
      'Overhead multi-layer tank installation with automatic float valves',
      'Concealed diverters, shower columns & sanitary ware fixing',
      'Submersible pump wiring & rainwater harvesting connections',
    ],
    icon: 'Wrench',
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
    name: 'Borewell Drilling & Water Testing',
    category: 'Water & Irrigation',
    description:
      'Advanced rotary and DTH rig borewell drilling, geophysical water vein surveys, MS/PVC casing pipe insertion, and accredited lab water potability tests.',
    features: [
      'Geological sensor scanning for optimal aquifer detection',
      'High-diameter heavy rig drilling up to 1,200 ft depth',
      'Food-grade heavy wall casing pipes with pea gravel packing',
      'Certified 16-parameter chemical & microbiological water report',
    ],
    icon: 'Droplets',
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

  // 7. Masonry & Construction -> DAILY_WAGE
  if (
    s.includes('mason') ||
    s.includes('brick') ||
    s.includes('concrete') ||
    s.includes('plaster') ||
    s.includes('കൊത്തുപണി') ||
    s.includes('മേസ്തിരി')
  ) {
    return KK_STANDARD_SERVICE_SPECS.find((spec) => spec.wageType === 'DAILY_WAGE')!;
  }

  // 8. Plumbing & Inspection / Visit -> FIXED_VISIT
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

