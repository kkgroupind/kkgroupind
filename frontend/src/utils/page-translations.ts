export interface PageTranslationsType {
  about: {
    kicker: string;
    headline: string;
    subheadline: string;
    storyBadge: string;
    storyTitle: string;
    storyP1: string;
    storyP2: string;
    stats: {
      districts: string;
      districtsLabel: string;
      operatives: string;
      operativesLabel: string;
      projects: string;
      projectsLabel: string;
      uptime: string;
      uptimeLabel: string;
    };
    pillarsBadge: string;
    pillarsTitle: string;
    pillarsSubtitle: string;
    pillars: Array<{
      title: string;
      desc: string;
      tag: string;
    }>;
    coverageBadge: string;
    coverageTitle: string;
    coverageDesc: string;
    leadershipBadge: string;
    leadershipTitle: string;
    leaders: Array<{
      name: string;
      role: string;
      bio: string;
      district: string;
      image: string;
    }>;
    ctaTitle: string;
    ctaSubtitle: string;
    ctaBtn: string;
    callBtn: string;
  };
  services: {
    kicker: string;
    headline: string;
    subheadline: string;
    filterAll: string;
    categories: Record<string, string>;
    serviceList: Array<{
      id: string;
      category: string;
      name: string;
      tag: string;
      desc: string;
      specs: string[];
      squadInfo: string;
      priceGuide: string;
      turnaround: string;
      image: string;
    }>;
    workflowBadge: string;
    workflowTitle: string;
    workflowSubtitle: string;
    steps: Array<{
      stepNumber: string;
      title: string;
      desc: string;
    }>;
    guaranteesBadge: string;
    guaranteesTitle: string;
    guarantees: Array<{
      title: string;
      desc: string;
    }>;
    bookBtn: string;
    viewDetailsBtn: string;
    enquireForService: string;
  };
  projects: {
    kicker: string;
    headline: string;
    subheadline: string;
    filterAll: string;
    filters: Record<string, string>;
    items: Array<{
      id: string;
      title: string;
      district: string;
      districtTag: string;
      category: string;
      categoryTag: string;
      client: string;
      scope: string;
      duration: string;
      equipment: string;
      impact: string;
      quote: string;
      clientRole: string;
      image: string;
    }>;
    statsBadge: string;
    statsTitle: string;
    stats: Array<{
      val: string;
      label: string;
      sub: string;
    }>;
    ctaTitle: string;
    ctaSubtitle: string;
    ctaBtn: string;
  };
  businesses: {
    kicker: string;
    headline: string;
    subheadline: string;
    divisionsBadge: string;
    divisionsTitle: string;
    divisions: Array<{
      id: string;
      name: string;
      divisionTag: string;
      tagline: string;
      desc: string;
      highlights: string[];
      metrics: {
        val1: string;
        lbl1: string;
        val2: string;
        lbl2: string;
      };
      leadFleet: string;
      serviceTarget: string;
      image: string;
    }>;
    synergyBadge: string;
    synergyTitle: string;
    synergySubtitle: string;
    synergies: Array<{
      title: string;
      desc: string;
    }>;
    b2bBadge: string;
    b2bTitle: string;
    b2bDesc: string;
    b2bBtn: string;
    b2bCall: string;
  };
  contact: {
    kicker: string;
    headline: string;
    subheadline: string;
    channelsTitle: string;
    channelsSubtitle: string;
    phoneLabel: string;
    phoneVal: string;
    phoneSub: string;
    whatsappLabel: string;
    whatsappVal: string;
    whatsappSub: string;
    emailLabel: string;
    emailVal: string;
    emailSub: string;
    deskLabel: string;
    deskVal: string;
    deskSub: string;
    formTitle: string;
    formSubtitle: string;
    serviceLabel: string;
    servicePlaceholder: string;
    nameLabel: string;
    namePlaceholder: string;
    phoneInputLabel: string;
    phoneInputPlaceholder: string;
    districtLabel: string;
    districtPlaceholder: string;
    dateLabel: string;
    notesLabel: string;
    notesPlaceholder: string;
    submitBtn: string;
    submittingBtn: string;
    successTitle: string;
    successMsg: string;
    depotsBadge: string;
    depotsTitle: string;
    depotsSubtitle: string;
    depots: Array<{
      name: string;
      hubTag: string;
      address: string;
      phone: string;
      timing: string;
      mapUrl: string;
    }>;
    faqBadge: string;
    faqTitle: string;
    faqs: Array<{
      q: string;
      a: string;
    }>;
  };
}

export const pageTranslations: {
  en: PageTranslationsType;
  ml: PageTranslationsType;
} = {
  en: {
    about: {
      kicker: 'KASARAGOD’S FIELDWORK & FLEET COLLECTIVE',
      headline: 'Engineering Kasaragod’s Fieldwork & Machinery Revolution',
      subheadline:
        'From high-reach coconut tree maintenance in Hosdurg to heavy earthmoving across Kanhangad and turnkey construction in Kasaragod Town, KK Group delivers 500+ verified professionals and precision heavy equipment across all 4 taluks of Kasaragod district.',
      storyBadge: 'OUR FOUNDING ODYSSEY',
      storyTitle: 'Bridging Traditional Field Labor with Modern Mechanized Excellence in Kasaragod',
      storyP1:
        'Rooted in Kasaragod district, KK Group emerged from a critical realization: landowners, farmers, and builders across Kasaragod, Kanhangad, Nileshwaram, and Uppala struggled to find reliable, safety-equipped field workers and heavy machinery operators on transparent terms.',
      storyP2:
        'We eliminated arbitrary pricing, unannounced work cancellations, and hazardous manual practices by creating an integrated, digitally-managed workforce. Today, KK Group coordinates certified climbing squads, modern JCB fleets, and master finishing masons backed by a 24/7 central dispatch desk serving all Kasaragod taluks.',
      stats: {
        districts: '4/4',
        districtsLabel: 'Kasaragod Taluks Covered (Hosdurg, Kasaragod, Manjeshwaram, Vellarikundu)',
        operatives: '500+',
        operativesLabel: 'Certified Active Crew Members',
        projects: '15,000+',
        projectsLabel: 'Completed Projects & Deployments',
        uptime: '99.4%',
        uptimeLabel: 'On-Time Field Execution SLA',
      },
      pillarsBadge: 'OPERATIONAL PILLARS',
      pillarsTitle: 'The Standards That Set KK Group Apart in Kasaragod',
      pillarsSubtitle: 'Every squad member, machine, and project adheres to our non-negotiable field protocols.',
      pillars: [
        {
          title: 'CSPRNG & Strict Field Vetting',
          desc: 'All tree climbers, machine pilots, and masonry artisans undergo thorough background verification and skills testing.',
          tag: 'Verified Workforce',
        },
        {
          title: 'Mechanized Safety & Zero Compromise',
          desc: 'Industrial-grade climbing harnesses, certified helmet PPE, and JCB laser-guided levels eliminate workplace risk.',
          tag: 'Safety First',
        },
        {
          title: 'Transparent Fixed Shift Billing',
          desc: 'Clear upfront daily and hourly rates with zero hidden logistics fees, surprise surcharges, or arbitrary bargaining.',
          tag: 'Honest Pricing',
        },
        {
          title: '15-Minute Response Dispatch Desk',
          desc: 'Our coordinator network in Kasaragod Town & Kanhangad confirms machine availability and squad deployment within minutes.',
          tag: 'Rapid Response',
        },
      ],
      coverageBadge: 'DISTRICT-WIDE OPERATIONS',
      coverageTitle: 'Across Kasaragod: From Manjeshwaram to Trikaripur',
      coverageDesc:
        'With regional machinery and crew yards in Kasaragod Town, Kanhangad, Nileshwaram, and Uppala, our squads reach any plantation, plot, or construction site in Kasaragod within 1 to 4 hours.',
      leadershipBadge: 'OPERATIONS COMMAND',
      leadershipTitle: 'Experienced Field Leaders & Directors',
      leaders: [
        {
          name: 'K. Krishnankutty',
          role: 'Managing Director & Founder',
          bio: '30+ years orchestrating agro-industrial services, machinery logistics, and agricultural transformation across Kasaragod and North Malabar.',
          district: 'Kasaragod Town HQ',
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
        },
        {
          name: 'Radhakrishnan Nair',
          role: 'Chief of Fleet Operations (JCB & Earthmoving)',
          bio: 'Veteran machinery commander managing 40+ JCB excavators and commercial equipment deployments throughout Kasaragod district.',
          district: 'Kanhangad Fleet Base',
          image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
        },
        {
          name: 'Suresh Kumar P.',
          role: 'Director of Cococare & Agricultural Services',
          bio: 'Pioneer of mechanized coconut harvesting techniques, safety harness training, and organic crown disease management across Hosdurg and coastal groves.',
          district: 'Hosdurg Agro Division',
          image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop&q=80',
        },
      ],
      ctaTitle: 'Need a Verified Crew or Heavy Machine in Kasaragod?',
      ctaSubtitle: 'Contact our Kasaragod central dispatch now for immediate availability and customized shift estimates.',
      ctaBtn: 'Request Service Enquiry',
      callBtn: 'Call Kasaragod Operations',
    },
    services: {
      kicker: 'CERTIFIED SERVICES & MACHINERY',
      headline: 'Precision Field Services & Heavy Machinery on Demand',
      subheadline:
        'Deploy verified workforce squads and modern earthmoving equipment across Kerala. Transparent daily shift rates, certified operators, and guaranteed timely execution.',
      filterAll: 'All Services',
      categories: {
        all: 'All Services',
        agriculture: 'Agriculture & Cococare',
        machinery: 'Earthmoving & Machinery',
        masonry: 'Construction & Masonry',
        finishing: 'Finishing & Painting',
        utilities: 'MEP & Borewell Drilling',
      },
      serviceList: [
        {
          id: 'cococare',
          category: 'agriculture',
          name: 'Cococare - Palm Harvesting & Crown Cleaning',
          tag: 'Agro-Care Squad',
          desc: 'Mechanical tree climbing, thorough crown cleaning, rhinoceros beetle pest management, and coconut harvest gathering by certified climbers.',
          specs: [
            'Safety harness-equipped climbers',
            'Full crown cleaning & debris drop',
            'Organic anti-pest medicine application',
            'Harvest counting & ground gathering',
          ],
          squadInfo: 'Squad of 2-4 Certified Climbers',
          priceGuide: 'From ₹4,500 / 50 Palms',
          turnaround: '24-48 Hours Notice',
          image: '/Banners/coco.png',
        },
        {
          id: 'jcb',
          category: 'machinery',
          name: 'JCB 3DX Heavy Excavation & Site Clearing',
          tag: 'Heavy Machinery Fleet',
          desc: 'Powerful backhoe loaders and excavators for foundation digging, boundary wall trenching, land leveling, and bulk soil transport.',
          specs: [
            'JCB 3DX with certified machine pilot',
            'High-capacity front loader & backhoe',
            'Trenching, pit digging & rock clearing',
            'Diesel fuel and logistics inclusive options',
          ],
          squadInfo: 'Heavy Machine + Certified Pilot',
          priceGuide: 'From ₹9,600 / 8-Hour Shift',
          turnaround: 'Immediate to 24 Hours',
          image: '/Banners/jcb.png',
        },
        {
          id: 'plastering',
          category: 'masonry',
          name: 'Exterior & Interior Plastering Squads',
          tag: 'Civil Construction',
          desc: 'Skilled masons for smooth cement wall rendering, sponge finishes, brick/AAC block masonry, and concrete repair works.',
          specs: [
            'Senior master mason + helper team',
            'Laser-leveling for laser-straight walls',
            'Exterior weather-resistant finishes',
            'Crack prevention mesh integration',
          ],
          squadInfo: 'Squad of 3-5 Masons & Helpers',
          priceGuide: 'From ₹5,800 / Daily Shift',
          turnaround: '24-48 Hours Notice',
          image: '/Banners/plastering.png',
        },
        {
          id: 'painting',
          category: 'finishing',
          name: 'Commercial & Residential Painting Squads',
          tag: 'Surface Finishing',
          desc: 'High-speed exterior anti-fungal weatherproofing, luxury interior emulsion coating, airless spray painting, and wood polishing.',
          specs: [
            'Airless spray and precision roller painting',
            'Surface dampness testing & primer barrier',
            'Exterior UV & monsoon resistant coatings',
            'Daily clean-up and masking protection',
          ],
          squadInfo: 'Squad of 3-6 Certified Painters',
          priceGuide: 'From ₹5,200 / Daily Shift',
          turnaround: '48 Hours Notice',
          image: '/Banners/painting.png',
        },
        {
          id: 'tile',
          category: 'finishing',
          name: 'Tile, Marble & Granite Precision Laying',
          tag: 'Precision Masonry',
          desc: 'Master tile setters specializing in large-format porcelain slabs, Italian marble polishing, bathroom waterproofing, and stain-proof epoxy grouting.',
          specs: [
            'Laser-guided leveling & lippage prevention',
            'Italian marble diamond-pad polishing',
            '100% waterproof sub-layer inspection',
            'High-durability epoxy tile grouting',
          ],
          squadInfo: 'Master Tiler + Skilled Assistant',
          priceGuide: 'From ₹6,200 / Daily Shift',
          turnaround: '24-48 Hours Notice',
          image: '/Banners/tiling.png',
        },
        {
          id: 'electrical',
          category: 'utilities',
          name: 'Industrial & Residential Electrical Systems',
          tag: 'Licensed MEP Squad',
          desc: 'Licensed ‘A’ and ‘B’ class electricians for 3-phase commercial panel boards, domestic conduit wiring, inverter backups, and lighting automation.',
          specs: [
            'Certified KSEB-compliant installations',
            'Short circuit detection & megger testing',
            '3-phase DB panel dressing & balancing',
            'Solar power and inverter integration',
          ],
          squadInfo: 'Licensed Electrician + Wireman',
          priceGuide: 'From ₹3,800 / Daily Shift',
          turnaround: 'Immediate to 24 Hours',
          image: '/Banners/electrical.png',
        },
        {
          id: 'plumbing',
          category: 'utilities',
          name: 'Pipeline Trenching, Drainage & Sanitary Plumbing',
          tag: 'Infrastructure MEP',
          desc: 'Heavy-duty septic pipeline trenching, UPVC/CPVC high-pressure water supply, multi-story drainage stacks, and pump station setups.',
          specs: [
            'Underground trenching & septic pipe laying',
            'Pressure testing with zero leak sign-off',
            'Rainwater harvesting piping network',
            'Submersible and booster pump assembly',
          ],
          squadInfo: 'Master Plumber + Trenching Helper',
          priceGuide: 'From ₹3,600 / Daily Shift',
          turnaround: 'Immediate to 24 Hours',
          image: '/Banners/plumbing.png',
        },
        {
          id: 'borewell',
          category: 'utilities',
          name: 'Precision Borewell Drilling & Aquifer Testing',
          tag: 'Water Engineering',
          desc: 'High-pressure rotary rig borewell drilling, scientific groundwater mapping, high-grade PVC casing pipes, and multi-stage submersible pump deployment.',
          specs: [
            'Geological aquifer yield analysis',
            'Deep rock hydraulic rotary drilling',
            'Heavy-gauge certified casing pipe',
            'Yield discharge flow rate testing',
          ],
          squadInfo: 'Rig Machine Crew & Hydro-Geologist',
          priceGuide: 'From ₹115 / Foot + Casing',
          turnaround: 'Scheduled Deployment (3-5 Days)',
          image: '/Banners/borewell.png',
        },
      ],
      workflowBadge: 'SIMPLE DEPLOYMENT PROCESS',
      workflowTitle: 'How We Deploy Crews & Machinery to Your Site',
      workflowSubtitle: 'A structured 4-step workflow that ensures transparency, punctuality, and quality results.',
      steps: [
        {
          stepNumber: '01',
          title: 'Submit Online Enquiry',
          desc: 'Select your required service squad or equipment, preferred dates, and job location in Kerala.',
        },
        {
          stepNumber: '02',
          title: 'Coordinator Confirmation',
          desc: 'Our Palakkad/Kochi dispatch hub calls within 15 minutes to review site access and lock machine scheduling.',
        },
        {
          stepNumber: '03',
          title: 'Direct Site Deployment',
          desc: 'Certified crew arrives promptly with verified safety gear, calibrated tools, and supervisor coordination.',
        },
        {
          stepNumber: '04',
          title: 'Milestone Sign-Off',
          desc: 'Inspect the completed work, receive digital shift log, and make payments with transparent fixed billing.',
        },
      ],
      guaranteesBadge: 'OUR COMMITMENT',
      guaranteesTitle: 'Guaranteed Standards on Every Kerala Site',
      guarantees: [
        {
          title: 'Zero Hidden Logistics Charges',
          desc: 'The agreed quote includes fuel, operator allowances, and mobilization. No end-of-day surprise bills.',
        },
        {
          title: 'Comprehensive Safety Compliance',
          desc: 'All workers are equipped with PPE and follow verified safety protocols to eliminate homeowner liability.',
        },
        {
          title: 'On-Time Shift Guarantee',
          desc: 'Our squads arrive on the booked time. If delays occur due to our logistics, we credit proportional shift hours.',
        },
        {
          title: 'Central Support Line',
          desc: 'A dedicated client relationship manager remains available throughout your project duration.',
        },
      ],
      bookBtn: 'Book Service Squad',
      viewDetailsBtn: 'Detailed Specifications',
      enquireForService: 'Enquire for This Service',
    },
    projects: {
      kicker: 'PROVEN KASARAGOD PROJECTS',
      headline: 'Real Projects Across Kasaragod. Verified Quality. Transformed Sites.',
      subheadline:
        'Explore our portfolio of completed coconut grove modernizations, heavy earthmoving contracts, luxury villa finishes, and civil infrastructure across Kasaragod district.',
      filterAll: 'All Kasaragod Regions',
      filters: {
        all: 'All Kasaragod',
        kanhangad: 'Kanhangad & Hosdurg',
        kasaragod: 'Kasaragod Town & Kumbla',
        nileshwar: 'Nileshwar & Trikaripur',
        uppala: 'Uppala & Manjeshwar',
        vellarikundu: 'Vellarikundu & Hill Tracts',
      },
      items: [
        {
          id: 'proj-1',
          title: 'Hosdurg Coastal Coconut Grove Modernization (1,200 Palms)',
          district: 'Kanhangad, Hosdurg Taluk',
          districtTag: 'kanhangad',
          category: 'Agro-Care Squad',
          categoryTag: 'agriculture',
          client: 'Hosdurg Coconut Growers Cooperative',
          scope: 'Complete mechanical tree climbing, crown beetle pest treatment, dry frond clearing, and harvest gathering.',
          duration: '6 Days (Shift Rotation)',
          equipment: '8 Certified Climbers + 2 Agricultural Supervisors',
          impact: 'Yield increased by 28% after organic crown maintenance with zero trunk damage.',
          quote: 'KK Group’s squads finished our entire 1,200 tree plantation in Hosdurg in 6 days. Highly organized and respectful.',
          clientRole: 'Cooperative President',
          image: '/Banners/coco.png',
        },
        {
          id: 'proj-2',
          title: 'Bekal Waterfront Commercial Earthmoving & Site Leveling',
          district: 'Bekal, Kasaragod',
          districtTag: 'kasaragod',
          category: 'Earthmoving & Machinery',
          categoryTag: 'machinery',
          client: 'Bekal Horizon Eco-Resorts',
          scope: '45,000 sq.ft uneven coastal terrain excavation, site leveling, deep foundation trenching, and debris transport.',
          duration: '72 Hours Continuous Shifts',
          equipment: '3x JCB 3DX Excavators + 6 Tipper Haulers',
          impact: 'Completed 18 hours ahead of schedule, saving the main contractor significant idle charges.',
          quote: 'Their JCB machine pilots are master operators. Precision leveling saved our concrete pouring timeline.',
          clientRole: 'Chief Project Engineer',
          image: '/Banners/jcb.png',
        },
        {
          id: 'proj-3',
          title: 'Nileshwaram Heritage Villa Plastering & Italian Marble Laying',
          district: 'Nileshwaram, Kasaragod',
          districtTag: 'nileshwar',
          category: 'Finishing & Masonry',
          categoryTag: 'finishing',
          client: 'Dr. K. Balakrishnan & Family',
          scope: '5,200 sq.ft smooth sponge plastering, laser-aligned Italian Statuario marble laying, and anti-dampness priming.',
          duration: '14 Working Days',
          equipment: 'Master Mason Team (6 Craftsmen) + Laser Levels',
          impact: 'Laser straight wall deviations under 1mm; mirror-finish Italian marble with epoxy sealing.',
          quote: 'Flawless work. The plastering walls feel like glass, and the marble polishing is breathtaking.',
          clientRole: 'Homeowner',
          image: '/Banners/tiling.png',
        },
        {
          id: 'proj-4',
          title: 'Kasaragod Town Commercial Complex 3-Phase Electrical Installation',
          district: 'Bank Road, Kasaragod Town',
          districtTag: 'kasaragod',
          category: 'Electrical MEP',
          categoryTag: 'utilities',
          client: 'Malabar Commercial Plaza',
          scope: 'Complete 3-phase automated DB panel installation, high-bay LED floodlighting, generator changeover, and grounding.',
          duration: '5 Days',
          equipment: 'Licensed A-Grade Electricians + Wiremen',
          impact: 'Passed KSEB electrical inspectorate scrutiny on the first trial with zero rework.',
          quote: 'Clean panel dressing and thorough insulation megger tests. True professionals.',
          clientRole: 'Operations Director',
          image: '/Banners/electrical.png',
        },
        {
          id: 'proj-5',
          title: 'Vellarikundu Hillside Drainage Trenching & Soil Stabilization',
          district: 'Vellarikundu Hill Tracts, Kasaragod',
          districtTag: 'vellarikundu',
          category: 'Drainage & Earthmoving',
          categoryTag: 'machinery',
          client: 'Malom Highland Spices & Rubber',
          scope: '800 meters of deep hillside monsoon trenching, boulder retention wall excavation, and UPVC drainage placement.',
          duration: '4 Days',
          equipment: 'JCB 3DX Narrow Bucket + 4 Trench Masons',
          impact: 'Prevented estate soil erosion and runoff damage during torrential South-West monsoon rains.',
          quote: 'They safely operated heavy machinery on steep hill gradients without damaging pepper and rubber crops.',
          clientRole: 'Plantation Director',
          image: '/Banners/plumbing.png',
        },
        {
          id: 'proj-6',
          title: 'Trikaripur Coastal High-Yield Borewell & Irrigation',
          district: 'Trikaripur, Kasaragod',
          districtTag: 'nileshwar',
          category: 'Water Engineering',
          categoryTag: 'utilities',
          client: 'North Trikaripur Agro Producers',
          scope: 'Geophysical aquifer detection, 480ft deep rotary drilling, high-pressure casing, and 5HP solar submersible installation.',
          duration: '3 Days',
          equipment: 'Hydraulic Rotary Rig + Hydro-Geologist Team',
          impact: 'Continuous 4,800 LPH crystal-clear drinking aquifer tapped, powering 15 acres of drip lines.',
          quote: 'Two other drilling contractors failed on this rocky terrain. KK Group struck water at 420ft.',
          clientRole: 'Society Secretary',
          image: '/Banners/borewell.png',
        },
      ],
      statsBadge: 'PROVEN NUMBERS',
      statsTitle: 'District-Wide Impact in Kasaragod',
      stats: [
        { val: '280,000+', label: 'Palms Maintained', sub: 'Across 4 Kasaragod taluks' },
        { val: '18,500+', label: 'JCB Machine Hours', sub: 'Logged with zero fatal incidents' },
        { val: '1.2M+', label: 'Sq.Ft Plastered & Tiled', sub: 'Across Kasaragod projects' },
        { val: '99.4%', label: 'Client Satisfaction', sub: 'Based on 3,400+ verified ratings' },
      ],
      ctaTitle: 'Have a Project in Kasaragod District?',
      ctaSubtitle: 'Discuss your site requirements with our Kasaragod field coordinators for an immediate plan.',
      ctaBtn: 'Book Consultation / Enquiry',
    },
    businesses: {
      kicker: 'OUR ENTERPRISE VERTICALS',
      headline: 'Four Specialized Divisions. One Uncompromising Standard.',
      subheadline:
        'KK Group operates distinct, focused enterprises spanning agriculture, heavy equipment logistics, civil construction, and water infrastructure across Kerala.',
      divisionsBadge: 'BUSINESS SECTORS',
      divisionsTitle: 'Integrated Capabilities for Every Scale of Work',
      divisions: [
        {
          id: 'cococare',
          name: 'KK Cococare & Agri-Tech Innovations',
          divisionTag: 'Agro-Care Enterprise',
          tagline: 'Kerala’s Most Trusted Mechanized Coconut Palm Management Network',
          desc: 'Modernized mechanical tree harvesting, scientific pest eradication, crown cleaning, and high-quality copra processing. We provide individual farm owners and vast estates with organized harvesting contracts and verified climbers.',
          highlights: [
            '250,000+ coconut palms serviced annually',
            'Certified safety harness equipment & insurance',
            'Organic crown beetle bio-treatments',
            'Bulk copra and whole coconut direct procurement',
          ],
          metrics: {
            val1: '120+',
            lbl1: 'Certified Climbers',
            val2: '14 Districts',
            lbl2: 'Year-Round Active',
          },
          leadFleet: 'Mechanical climbing rigs, crown blowers, safety harness sets',
          serviceTarget: 'Estate owners, farmers, residential homeowners',
          image: '/Banners/coco.png',
        },
        {
          id: 'earthmovers',
          name: 'KK Heavy Earthmovers & Machinery Logistics',
          divisionTag: 'Machinery Division',
          tagline: 'High-Power Earthmoving Fleets with Certified Machine Pilots',
          desc: 'Dedicated commercial fleet of JCB 3DX backhoes, tracked excavators, hydraulic rock breakers, and dump trucks. Managed with real-time GPS telemetry and rapid trailer transport across districts.',
          highlights: [
            'Modern JCB 3DX & mini-excavator fleet',
            'Experienced pilots with 5,000+ machine hours',
            'Foundation digging, road leveling, pond dredging',
            'Guaranteed fuel & maintenance inclusive plans',
          ],
          metrics: {
            val1: '40+',
            lbl1: 'Heavy Machines',
            val2: '24h',
            lbl2: 'Deployment SLA',
          },
          leadFleet: 'JCB 3DX, Kubota Mini Diggers, 10-Wheel Tippers',
          serviceTarget: 'Civil builders, road contractors, private landowners',
          image: '/Banners/jcb.png',
        },
        {
          id: 'construction',
          name: 'KK Construction Squads & Architectural Finishing',
          divisionTag: 'Finishing & Masonry',
          tagline: 'Master Craftsmen for Turnkey Civil & Interior Wall Finishing',
          desc: 'Specialized workforce squads for structural masonry, precision exterior/interior plastering, Italian marble and large slab tile laying, and luxury weather-guard painting.',
          highlights: [
            'Master masons, tile setters, and airless spray painters',
            'Laser-calibrated leveling on every project',
            'Waterproofing and crack-prevention mesh',
            'Structured milestone billing with supervisor sign-off',
          ],
          metrics: {
            val1: '250+',
            lbl1: 'Skilled Artisans',
            val2: '950+',
            lbl2: 'Villas Finished',
          },
          leadFleet: 'Laser levels, mortar sprayers, airless paint rigs, slab cutters',
          serviceTarget: 'Architects, general contractors, luxury homeowners',
          image: '/Banners/plastering.png',
        },
        {
          id: 'water-tech',
          name: 'KK Engineering, Borewells & Water Technologies',
          divisionTag: 'Water Infrastructure',
          tagline: 'Scientific Groundwater Detection, Precision Drilling & Drainage',
          desc: 'Equipped with heavy hydraulic rotary drilling rigs, geological survey tools, and specialized plumbers for agricultural borewells, municipal drainage, and rainwater harvesting installations.',
          highlights: [
            'Deep rock hydraulic borewell drilling up to 800ft',
            'Scientific geophysical aquifer analysis',
            'Commercial CPVC/UPVC high-pressure drainage pipelines',
            'Turnkey solar and grid submersible pumping stations',
          ],
          metrics: {
            val1: '94%',
            lbl1: 'Aquifer Strike Rate',
            val2: '450+',
            lbl2: 'Wells Drilled',
          },
          leadFleet: 'Hydraulic Rotary Rigs, Casing Installers, Hydro-Testers',
          serviceTarget: 'Farms, residential complexes, industrial facilities',
          image: '/Banners/borewell.png',
        },
      ],
      synergyBadge: 'ENTERPRISE ADVANTAGE',
      synergyTitle: 'Why Choose KK Group’s Integrated Collective?',
      synergySubtitle: 'One contract, zero intermediary markup, and coordinated execution across all project stages.',
      synergies: [
        {
          title: 'Single-Vendor Accountability',
          desc: 'No finger-pointing between earthmovers, masons, and plumbers. KK Group takes full responsibility for end-to-end site delivery.',
        },
        {
          title: '20-30% Savings on Logistics & Shift Scheduling',
          desc: 'By sharing equipment transport and regional supervisors across verticals, we pass substantial cost savings directly to clients.',
        },
        {
          title: 'Standardized Field Protocols Across Kasaragod',
          desc: 'Whether your site is in Manjeshwar, Kasaragod Town, Kanhangad, or Trikaripur, expect the same safety helmets, digital logs, and verified professionalism.',
        },
      ],
      b2bBadge: 'COMMERCIAL PARTNERSHIPS',
      b2bTitle: 'Corporate & Contractor Fleet Partnerships in Kasaragod',
      b2bDesc:
        'Are you a construction firm, agricultural cooperative, or resort group in Kasaragod needing long-term workforce or equipment retainers? Partner with KK Group for discounted contract pricing and priority dispatch.',
      b2bBtn: 'Inquire for Enterprise Retainer',
      b2bCall: 'Call Enterprise Desk',
    },
    contact: {
      kicker: 'KASARAGOD COMMUNICATIONS & DISPATCH',
      headline: 'Ready to Deploy in Kasaragod. Reach Our Operations Command.',
      subheadline:
        'Whether you need an immediate JCB excavator in Kanhangad, a coconut harvesting squad in Hosdurg, or turnkey construction in Kasaragod Town, our operations desk is ready to assist you.',
      channelsTitle: 'Direct Communication Channels',
      channelsSubtitle: 'Reach us via your preferred medium. Kasaragod central dispatch monitors all lines 24/7.',
      phoneLabel: 'Central Operations Hotline',
      phoneVal: '+91 94470 12345',
      phoneSub: 'Available 24/7 for urgent machine & squad dispatch across Kasaragod',
      whatsappLabel: 'WhatsApp Quick Connect',
      whatsappVal: '+91 98460 54321',
      whatsappSub: 'Instant photo sharing, site location pins & crew quotes',
      emailLabel: 'Official Dispatch Email',
      emailVal: 'dispatch@kkgroupkerala.com',
      emailSub: 'Corporate tenders, billings, and enterprise inquiries',
      deskLabel: 'Central Operational SLA',
      deskVal: '< 15 Minutes Response',
      deskSub: 'Average coordinator callback time for online enquiries',
      formTitle: 'Direct Service Booking & Inquiries',
      formSubtitle: 'Fill out this quick form and our Kasaragod Town / Kanhangad dispatch hub will call to confirm crew availability.',
      serviceLabel: 'Select Service Required *',
      servicePlaceholder: 'Choose workforce or machinery service...',
      nameLabel: 'Your Full Name *',
      namePlaceholder: 'e.g. Anand R. Menon',
      phoneInputLabel: 'Phone / WhatsApp Number *',
      phoneInputPlaceholder: '98765 43210',
      districtLabel: 'Project Location / District *',
      districtPlaceholder: 'e.g. Kanhangad, Kasaragod',
      dateLabel: 'Preferred Start Date',
      notesLabel: 'Site Requirements & Details (Optional)',
      notesPlaceholder: 'Mention squad size, number of trees, site area, or machine hours needed...',
      submitBtn: 'Dispatch Service Request',
      submittingBtn: 'Sending to Operations Desk...',
      successTitle: 'Enquiry Dispatched Successfully!',
      successMsg:
        'Thank you! Your service request has been routed to our Kasaragod coordinator. We will call you within 15 minutes.',
      depotsBadge: 'KASARAGOD OPERATIONS DEPOTS',
      depotsTitle: 'Visit Our Kasaragod Operations Centers & Yards',
      depotsSubtitle: 'Machinery yards, equipment inspection, and regional field offices across Kasaragod district.',
      depots: [
        {
          name: 'Kasaragod Town Headquarters & Fleet Depot',
          hubTag: 'Main District Logistics HQ',
          address: 'KK Complex, NH-66 Old Bus Stand Road, Near Clock Tower, Kasaragod Town, Kerala 671121',
          phone: '+91 94470 12345',
          timing: 'Monday - Saturday: 7:00 AM - 8:30 PM',
          mapUrl: 'https://maps.google.com/?q=Kasaragod,Kerala',
        },
        {
          name: 'Kanhangad Central Machinery & Earthmoving Base',
          hubTag: 'Earthmoving Fleet Hub',
          address: 'Kotikulam - Kanhangad Highway, Near Hosdurg Fort Junction, Kanhangad, Kerala 671315',
          phone: '+91 98460 54321',
          timing: 'Open 24 Hours for Fleet Maintenance & Dispatch',
          mapUrl: 'https://maps.google.com/?q=Kanhangad,Kerala',
        },
        {
          name: 'Nileshwaram Agro-Care & Finishing Depot',
          hubTag: 'Agro & Civil Division',
          address: 'Market Road, Near Nileshwaram Railway Station, Nileshwaram, Kerala 671314',
          phone: '+91 94471 67890',
          timing: 'Monday - Saturday: 8:00 AM - 7:00 PM',
          mapUrl: 'https://maps.google.com/?q=Nileshwaram,Kerala',
        },
        {
          name: 'Uppala Northern Fleet & Machinery Depot',
          hubTag: 'North Kasaragod Hub',
          address: 'NH-66 Commercial Corridor, Uppala, Manjeshwaram Taluk, Kasaragod, Kerala 671322',
          phone: '+91 98462 13579',
          timing: 'Monday - Saturday: 8:00 AM - 7:30 PM',
          mapUrl: 'https://maps.google.com/?q=Uppala,Kerala',
        },
      ],
      faqBadge: 'COMMON INQUIRIES',
      faqTitle: 'Frequently Asked Questions',
      faqs: [
        {
          q: 'How fast can a JCB machine or squad reach my site in Kasaragod?',
          a: 'For urgent requirements within Kanhangad, Kasaragod Town, Nileshwaram, Uppala, or Trikaripur, we can deploy within 1 to 3 hours. For hill tracts like Vellarikundu or Panathur, we deploy within 3 to 4 hours.',
        },
        {
          q: 'Are workers insured and safety-certified?',
          a: 'Yes. All KK Group tree climbers, JCB pilots, and masons are vetted, equipped with certified safety PPE/harnesses, and covered under our operational group safety policies, protecting property owners from liabilities.',
        },
        {
          q: 'What is the payment structure and billing method?',
          a: 'We offer fixed daily shift rates or hourly machine billing with zero hidden logistics add-ons. Payments can be made via UPI, bank transfer, or cash upon shift completion and supervisor sign-off.',
        },
        {
          q: 'Do you take up projects across all towns and taluks of Kasaragod?',
          a: 'Yes! We cover all 4 taluks (Kasaragod, Hosdurg, Manjeshwaram, Vellarikundu) and all 21+ towns and panchayats from Manjeshwaram in the north to Trikaripur in the south.',
        },
      ],
    },
  },
  ml: {
    about: {
      kicker: 'കാസർഗോഡിന്റെ സ്വന്തം കരുത്ത്',
      headline: 'കാസർഗോഡിന്റെ വികസനത്തിന് ആധുനിക കരുത്തും കൃത്യതയും',
      subheadline:
        'ഹോസ്ദുർഗിലെ തെങ്ങുകയറ്റവും കൊക്കോ കെയറും മുതൽ കാഞ്ഞങ്ങാട്, കാസർഗോഡ്, നീലേശ്വരം, ഉപ്പള എന്നിവിടങ്ങളിലെ ജെസിബി എർത്ത്മൂവിംഗും നിർമ്മാണ ജോലികളും വരെ — കാസർഗോഡ് ജില്ലയിലെ 4 താലൂക്കുകളിലും 500-ലധികം വിദഗ്ദ്ധ തൊഴിലാളികളും ആധുനിക മെഷീനറികളും കെകെ ഗ്രൂപ്പിലൂടെ ലഭ്യമാണ്.',
      storyBadge: 'ഞങ്ങളുടെ തുടക്കം',
      storyTitle: 'കാസർഗോഡിന്റെ മണ്ണിൽ പരമ്പരാഗത തൊഴിലിന് ആധുനിക സാങ്കേതിക കരുത്ത്',
      storyP1:
        'കാസർഗോഡ് ജില്ലയിൽ വേരുകളുള്ള കെകെ ഗ്രൂപ്പ്, ജില്ലയിലെ കർഷകർക്കും വീട്ടുടമകൾക്കും കോൺട്രാക്ടർമാർക്കും വിശ്വസ്തരായ തൊഴിലാളികളെയും യന്ത്രസാമഗ്രികളെയും ലഭ്യമാക്കാനാണ് രൂപീകരിക്കപ്പെട്ടത്. വിദഗ്ദ്ധ തൊഴിലാളികളുടെ ദൗർലഭ്യവും അനിയന്ത്രിതമായ നിരക്കുകളും പരിഹരിക്കാൻ ഞങ്ങൾ മുന്നിട്ടിറങ്ങി.',
      storyP2:
        'സാങ്കേതിക പരിശീലനം ലഭിച്ച തെങ്ങുകയറ്റ തൊഴിലാളികൾ, സുരക്ഷിതമായ ജെസിബി പൈലറ്റുമാർ, വിദഗ്ദ്ധ പ്ലാസ്റ്ററിംഗ് മേസൺമാർ എന്നിവരെ ഒരൊറ്റ കുടക്കീഴിൽ അണിനിരത്തി കാസർഗോഡ് ടൗണിലും കാഞ്ഞങ്ങാട്ടുമുള്ള കൺട്രോൾ റൂമുകളിലൂടെ ഞങ്ങൾ സേവനം ഉറപ്പാക്കുന്നു.',
      stats: {
        districts: '4/4',
        districtsLabel: 'കാസർഗോഡ് താലൂക്കുകളിൽ സേവനം (ഹോസ്ദുർഗ്, കാസർഗോഡ്, മഞ്ചേശ്വരം, വെള്ളരിക്കുണ്ട്)',
        operatives: '500+',
        operativesLabel: 'അംഗീകൃത വിദഗ്ദ്ധ തൊഴിലാളികൾ',
        projects: '15,000+',
        projectsLabel: 'പൂർത്തിയാക്കിയ പ്രോജക്റ്റുകൾ',
        uptime: '99.4%',
        uptimeLabel: 'കൃത്യസമയത്തുള്ള സേവന ഉറപ്പ്',
      },
      pillarsBadge: 'പ്രവർത്തന തത്വങ്ങൾ',
      pillarsTitle: 'കെകെ ഗ്രൂപ്പിനെ വ്യത്യസ്തമാക്കുന്ന ഗുണമേന്മകൾ',
      pillarsSubtitle: 'ഓരോ തൊഴിലാളിയും യന്ത്രോപകരണങ്ങളും കർശനമായ ഗുണനിലവാര മാനദണ്ഡങ്ങൾ പാലിക്കുന്നു.',
      pillars: [
        {
          title: 'പരിശോധിച്ചുറപ്പിച്ച തൊഴിലാളികൾ',
          desc: 'എല്ലാ തെങ്ങുകയറ്റ തൊഴിലാളികളും മെഷീൻ പൈലറ്റുമാരും കൃത്യമായ പശ്ചാത്തല പരിശോധനയ്ക്കും പ്രായോഗിക ടെസ്റ്റുകൾക്കും ശേഷമാണ് സേവനത്തിനെത്തുന്നത്.',
          tag: 'വിദഗ്ദ്ധ തൊഴിലാളികൾ',
        },
        {
          title: 'സുരക്ഷാ ഉപകരണങ്ങൾ & മുൻകരുതൽ',
          desc: 'സുരക്ഷാ ബെൽറ്റുകൾ, ഹെൽമെറ്റുകൾ, ലേസർ ലെവലറുകൾ എന്നിവയിലൂടെ അപകടരഹിതമായ തൊഴിൽ അന്തരീക്ഷം ഉറപ്പാക്കുന്നു.',
          tag: 'സുരക്ഷ ഒന്നാമത്',
        },
        {
          title: 'സുതാര്യമായ നിശ്ചിത നിരക്കുകൾ',
          desc: 'മറഞ്ഞിരിക്കുന്ന നിരക്കുകളോ അധിക ചാർജ്ജുകളോ ഇല്ലാതെ മുൻകൂട്ടി നിശ്ചയിച്ച കൃത്യമായ ദിവസക്കൂലിയും മെഷീൻ വാടകയും.',
          tag: 'സുതാര്യമായ നിരക്ക്',
        },
        {
          title: '15 മിനിറ്റ് പ്രതികരണ സമയം',
          desc: 'കാസർഗോഡ് ടൗൺ & കാഞ്ഞങ്ങാട് ഡിസ്പാച്ച് സെന്ററുകൾ വഴി ഓൺലൈൻ അന്വേഷണങ്ങൾക്ക് 15 മിനിറ്റിനുള്ളിൽ മറുപടിയും തീയതി സ്ഥിരീകരണവും.',
          tag: 'തത്സമയ സേവനം',
        },
      ],
      coverageBadge: 'ജില്ലാതല പ്രവർത്തന ശൃംഖല',
      coverageTitle: 'മഞ്ചേശ്വരം മുതൽ തൃക്കരിപ്പൂർ വരെ: എവിടെയും ഞങ്ങൾ എത്തുന്നു',
      coverageDesc:
        'കാസർഗോഡ് ടൗൺ, കാഞ്ഞങ്ങാട്, നീലേശ്വരം, ഉപ്പള എന്നീ പ്രധാന കേന്ദ്രങ്ങളിൽ നിന്നുമുള്ള മെഷീനറികളും സ്ക്വാഡുകളും ജില്ലയിലെവിടെയും 1 മുതൽ 4 മണിക്കൂറിനുള്ളിൽ വിന്യസിക്കാൻ ഞങ്ങൾ സജ്ജമാണ്.',
      leadershipBadge: 'നേതൃത്വം',
      leadershipTitle: 'അനുഭവസമ്പന്നരായ നേതൃനിര',
      leaders: [
        {
          name: 'കെ. കൃഷ്ണൻകുട്ടി',
          role: 'മാനേജിംഗ് ഡയറക്ടർ & സ്ഥാപകൻ',
          bio: 'കാസർഗോഡും വടക്കൻ മലബാറിലുമായി കാർഷിക-യന്ത്രവൽക്കരണ രംഗത്തും ലേബർ മാനേജ്‌മെന്റിലും 30 വർഷത്തിലധികം സേവന പരിചയം.',
          district: 'കാസർഗോഡ് ആസ്ഥാനം',
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
        },
        {
          name: 'രാധാകൃഷ്ണൻ നായർ',
          role: 'ചീഫ് ഓഫ് ഫ്ലീറ്റ് ഓപ്പറേഷൻസ് (ജെസിബി)',
          bio: 'കാസർഗോഡ് ജില്ലയിലുടനീളം 40-ലധികം ജെസിബികളുടെയും കൺസ്ട്രക്ഷൻ മെഷീനറികളുടെയും വിന്യാസം നിയന്ത്രിക്കുന്ന വിദഗ്ദ്ധൻ.',
          district: 'കാഞ്ഞങ്ങാട് ഫ്ലീറ്റ് ബേസ്',
          image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
        },
        {
          name: 'സുരേഷ് കുമാർ പി.',
          role: 'ഡയറക്ടർ - കൊക്കോ കെയർ & അഗ്രി സർവീസസ്',
          bio: 'ഹോസ്ദുർഗ്ഗിലെയും തീരദേശ തോട്ടങ്ങളിലെയും യന്ത്രവൽക്കൃത തെങ്ങുകയറ്റ പരിശീലനത്തിലും കീടനിയന്ത്രണത്തിലും മുൻനിര വിദഗ്ദ്ധൻ.',
          district: 'ഹോസ്ദുർഗ് അഗ്രോ ഡിവിഷൻ',
          image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop&q=80',
        },
      ],
      ctaTitle: 'കാസർഗോഡ് ജില്ലയിൽ തൊഴിലാളികളെയോ മെഷീനറിയോ ആവശ്യമുണ്ടോ?',
      ctaSubtitle: 'നിങ്ങളുടെ സൈറ്റിനായുള്ള നിരക്കുകളും തൊഴിലാളികളുടെ ലഭ്യതയും ഉടൻ അറിയാൻ ഞങ്ങളുടെ കാസർഗോഡ് കൺട്രോൾ റൂമുമായി ബന്ധപ്പെടുക.',
      ctaBtn: 'സേവനത്തിനായി അന്വേഷിക്കുക',
      callBtn: 'കാസർഗോഡ് കൺട്രോൾ റൂമിലേക്ക് വിളിക്കുക',
    },
    services: {
      kicker: 'അംഗീകൃത സേവനങ്ങളും മെഷീനറികളും',
      headline: 'വിദഗ്ദ്ധ തൊഴിലാളികളും ഹെവി മെഷീനറികളും വിരൽത്തുമ്പിൽ',
      subheadline:
        'കാസർഗോഡ് ജില്ലയിലുടനീളം തത്സമയം ബുക്ക് ചെയ്യാവുന്ന വിശ്വസ്ത സേവനങ്ങൾ. മുൻകൂട്ടി നിശ്ചയിച്ച സുതാര്യമായ നിരക്ക്, പരിചയസമ്പന്നരായ തൊഴിലാളികൾ, കൃത്യസമയത്ത് ജോലി പൂർത്തിയാക്കൽ.',
      filterAll: 'എല്ലാ സേവനങ്ങളും',
      categories: {
        all: 'എല്ലാ സേവനങ്ങളും',
        agriculture: 'കൃഷിയും തെങ്ങുകയറ്റവും',
        machinery: 'ജെസിബിയും മെഷീനറികളും',
        masonry: 'നിർമ്മാണവും മേസൺ പണികളും',
        finishing: 'പെയിന്റിംഗും ടൈൽ ജോലികളും',
        utilities: 'പ്ലംബിംഗ്, ഇലക്ട്രിക്കൽ, ബോർവെൽ',
      },
      serviceList: [
        {
          id: 'cococare',
          category: 'agriculture',
          name: 'കൊക്കോ കെയർ - തെങ്ങുകയറ്റവും മണ്ട വൃത്തിയാക്കലും',
          tag: 'അഗ്രോ കെയർ സ്ക്വാഡ്',
          desc: 'മെക്കാനിക്കൽ തെങ്ങുകയറ്റം, മണ്ടയിലെ ഉണക്കമടലുകൾ മാറ്റൽ, കൊമ്പൻചെല്ലിക്ക് ജൈവ മരുന്ന് വെക്കൽ, തേങ്ങയിടലും ശേഖരിക്കലും.',
          specs: [
            'സുരക്ഷാ ബെൽറ്റ് ധരിച്ച തൊഴിലാളികൾ',
            'മണ്ടയിലെ കീടബാധ പരിശോധനയും വൃത്തിയാക്കലും',
            'ഓർഗാനിക് കീടനാശിനി പരിചരണം',
            'തേങ്ങ എണ്ണി തിട്ടപ്പെടുത്തി ശേഖരിക്കൽ',
          ],
          squadInfo: '2 മുതൽ 4 വരെ തൊഴിലാളികൾ',
          priceGuide: '₹4,500 മുതൽ / 50 തെങ്ങ്',
          turnaround: '24-48 മണിക്കൂർ സമയം',
          image: '/Banners/coco.png',
        },
        {
          id: 'jcb',
          category: 'machinery',
          name: 'ജെസിബി 3DX ഹെവി എക്സ്കവേഷൻ & സൈറ്റ് ക്ലിയറിംഗ്',
          tag: 'ഹെവി മെഷീനറി ഫ്ലീറ്റ്',
          desc: 'പുരയിടം നിരപ്പാക്കൽ, അടിത്തറ കുഴിയെടുക്കൽ, മണ്ണ് മാറ്റൽ, കുളം നിർമ്മാണം എന്നിവയ്ക്കായി മികച്ച ഡ്രൈവർമാരുള്ള ജെസിബികൾ.',
          specs: [
            'പരിചയസമ്പന്നനായ പൈലറ്റോടുകൂടിയ JCB 3DX',
            'വലിയ ബക്കറ്റും ലോഡറും ഉൾപ്പെടുന്ന മെഷീൻ',
            'അതിർത്തി കുഴിയെടുക്കലും കാടുവെട്ടലും',
            'ഡീസലും ഉൾപ്പെടുന്ന സുതാര്യമായ ഷിഫ്റ്റ് നിരക്ക്',
          ],
          squadInfo: 'മെഷീൻ + ലൈസൻസ്ഡ് പൈലറ്റ്',
          priceGuide: '₹9,600 മുതൽ / 8 മണിക്കൂർ ഷിഫ്റ്റ്',
          turnaround: 'ഉടനടി മുതൽ 24 മണിക്കൂർ വരെ',
          image: '/Banners/jcb.png',
        },
        {
          id: 'plastering',
          category: 'masonry',
          name: 'പ്ലാസ്റ്ററിംഗ് & ചുവർ നിർമ്മാണ മേസൺമാർ',
          tag: 'സിവിൽ കൺസ്ട്രക്ഷൻ',
          desc: 'വീടുകളുടെയും കെട്ടിടങ്ങളുടെയും ആന്തരികവും ബാഹ്യവുമായ പ്ലാസ്റ്ററിംഗ്, കട്ടകെട്ടൽ, സിമന്റ് ഫിനിഷിംഗ് എന്നിവയ്ക്കുള്ള വിദഗ്ദ്ധ സംഘം.',
          specs: [
            'പ്രധാന മേസൺമാരും സഹായികളും അടങ്ങുന്ന ടീം',
            'ലേസർ ലെവലർ ഉപയോഗിച്ചുള്ള തുല്യമായ ഫിനിഷിംഗ്',
            'മഴക്കാലത്ത് ഈർപ്പം തടയുന്ന വാട്ടർപ്രൂഫിംഗ്',
            'വിള്ളലുകൾ തടയുന്ന മെഷ് ഘടിപ്പിക്കൽ',
          ],
          squadInfo: '3 മുതൽ 5 വരെ തൊഴിലാളികൾ',
          priceGuide: '₹5,800 മുതൽ / ദിവസേന',
          turnaround: '24-48 മണിക്കൂർ സമയം',
          image: '/Banners/plastering.png',
        },
        {
          id: 'painting',
          category: 'finishing',
          name: 'പ്രൊഫഷണൽ പെയിന്റിംഗ് & വെതർപ്രൂഫിംഗ്',
          tag: 'സർഫേസ് ഫിനിഷിംഗ്',
          desc: 'ഫംഗസ് പ്രതിരോധിക്കുന്ന എക്സ്റ്റീരിയർ പെയിന്റിംഗ്, ഇന്റീരിയർ റോയൽ എമൽഷൻ, സ്പ്രേ പെയിന്റിംഗ്, വാട്ടർപ്രൂഫ് പ്രൈമിംഗ്.',
          specs: [
            'എയർലെസ്സ് സ്പ്രേ മെഷീനും റോളർ പെയിന്റിംഗും',
            'ഭിത്തിയിലെ ഈർപ്പം പരിശോധിച്ചുള്ള പ്രൈമിംഗ്',
            'അൾട്രാവയലറ്റ് & മഴ പ്രതിരോധ പെയിന്റുകൾ',
            'ഫ്ലോർ സുരക്ഷിതമായി മൂടിയുള്ള പെയിന്റിംഗ്',
          ],
          squadInfo: '3 മുതൽ 6 വരെ പെയിന്റർമാർ',
          priceGuide: '₹5,200 മുതൽ / ദിവസേന',
          turnaround: '48 മണിക്കൂർ സമയം',
          image: '/Banners/painting.png',
        },
        {
          id: 'tile',
          category: 'finishing',
          name: 'ടൈൽ, മാർബിൾ & ഗ്രാനൈറ്റ് ലേയിംഗ്',
          tag: 'പ്രിസിഷൻ മേസൺസ്',
          desc: 'ലാർജ് ഫോർമാറ്റ് ടൈലുകൾ, ഇറ്റാലിയൻ മാർബിൾ പോളിഷിംഗ്, കിച്ചൻ ഗ്രാനൈറ്റ് വർക്കുകൾ, വാട്ടർപ്രൂഫ് എപോക്സി ഗ്രൗട്ടിംഗ്.',
          specs: [
            'ലേസർ ലെവലർ അടിസ്ഥാനമാക്കിയുള്ള ടൈൽ നിരപ്പാക്കൽ',
            'ഡയമണ്ട് പാഡ് ഉപയോഗിച്ചുള്ള മാർബിൾ പോളിഷ്',
            '100% വാട്ടർപ്രൂഫ് അണ്ടർ ലെയർ പരിശോധന',
            'ഈടുനിൽക്കുന്ന എപോക്സി ഗ്രൗണ്ട് ഫില്ലിംഗ്',
          ],
          squadInfo: 'പ്രധാന ടൈൽ മേസ്തിരി + സഹായി',
          priceGuide: '₹6,200 മുതൽ / ദിവസേന',
          turnaround: '24-48 മണിക്കൂർ സമയം',
          image: '/Banners/tiling.png',
        },
        {
          id: 'electrical',
          category: 'utilities',
          name: 'ഇൻഡസ്ട്രിയൽ & റസിഡൻഷ്യൽ ഇലക്ട്രിക്കൽ ജോലികൾ',
          tag: 'ലൈസൻസ്ഡ് ഇലക്ട്രീഷ്യൻമാർ',
          desc: '3-ഫേസ് പാനൽ ബോർഡ് വയറിംഗ്, ഇൻവെർട്ടർ സജ്ജീകരണം, പൈപ്പ് ഇടൽ, കെ.എസ്.ഇ.ബി സുരക്ഷാ മാനദണ്ഡങ്ങൾ പാലിച്ചുള്ള ജോലികൾ.',
          specs: [
            'KSEB അംഗീകൃത ലൈസൻസുള്ള ഇലക്ട്രീഷ്യൻമാർ',
            'ഷോർട്ട് സർക്യൂട്ട് പരിശോധനയും മെഗ്ഗർ ടെസ്റ്റും',
            '3-ഫേസ് DB ബോർഡ് ഡ്രസ്സിംഗ്',
            'സോളാർ & ഇൻവെർട്ടർ പവർ കണക്ഷനുകൾ',
          ],
          squadInfo: 'ഇലക്ട്രീഷ്യൻ + വയർമാൻ',
          priceGuide: '₹3,800 മുതൽ / ദിവസേന',
          turnaround: 'ഉടനടി മുതൽ 24 മണിക്കൂർ വരെ',
          image: '/Banners/electrical.png',
        },
        {
          id: 'plumbing',
          category: 'utilities',
          name: 'പ്ലംബിംഗ്, പൈപ്പ് ലൈൻ & ഡ്രെയിനേജ് ജോലികൾ',
          tag: 'ഇൻഫ്രാസ്ട്രക്ചർ MEP',
          desc: 'സെപ്റ്റിക് ടാങ്ക് ലൈനുകൾ, CPVC/UPVC ഉയർന്ന മർദ്ദമുള്ള പൈപ്പിംഗ്, ഡ്രെയിനേജ് ട്രെഞ്ചുകൾ, വാട്ടർ ടാങ്ക് കണക്ഷനുകൾ.',
          specs: [
            'ഭൂഗർഭ പൈപ്പ് ലൈൻ കുഴിയെടുക്കലും ഫിറ്റിംഗും',
            'പ്രഷർ ടെസ്റ്റിംഗ് വഴി ചോർച്ചയില്ലെന്ന് ഉറപ്പാക്കൽ',
            'മഴവെള്ള സംഭരണ പൈപ്പ് നെറ്റ്‌വർക്ക്',
            'സബ്മേഴ്സിബിൾ പമ്പ് ഇൻസ്റ്റാളേഷൻ',
          ],
          squadInfo: 'പ്രധാന പ്ലംബർ + ട്രെഞ്ചിംഗ് സഹായി',
          priceGuide: '₹3,600 മുതൽ / ദിവസേന',
          turnaround: 'ഉടനടി മുതൽ 24 മണിക്കൂർ വരെ',
          image: '/Banners/plumbing.png',
        },
        {
          id: 'borewell',
          category: 'utilities',
          name: 'ബോർവെൽ കുഴിക്കലും അക്വിഫർ പരിശോധനയും',
          tag: 'വാട്ടർ എൻജിനീയറിംഗ്',
          desc: 'ഹൈഡ്രോളിക് റോട്ടറി റിഗ് ഉപയോഗിച്ചുള്ള ബോർവെൽ നിർമ്മാണം, ശാസ്ത്രീയ ഭൂഗർഭ ജല പരിശോധന, ഗുണനിലവാരമുള്ള പിവിസി കെയ്‌സിംഗ്.',
          specs: [
            'ശാസ്ത്രീയ ഭൂഗർഭ ജല സാന്നിധ്യ നിർണ്ണയം',
            'കരിമ്പാറകളിലും ശക്തമായ ഡ്രില്ലിംഗ് റിഗ്ഗുകൾ',
            'ഉയർന്ന ഗുണനിലവാരമുള്ള കെയ്സിംഗ് പൈപ്പുകൾ',
            'വെള്ളത്തിന്റെ അളവും ഗുണനിലവാരവും പരിശോധിക്കൽ',
          ],
          squadInfo: 'റിഗ് മെഷീൻ ക്രൂ & ജിയോളജിസ്റ്റ്',
          priceGuide: '₹115 മുതൽ / അടി + കെയ്സിംഗ്',
          turnaround: 'മുൻകൂട്ടി ബുക്ക് ചെയ്യുക (3-5 ദിവസം)',
          image: '/Banners/borewell.png',
        },
      ],
      workflowBadge: 'ലളിതമായ ബുക്കിംഗ് രീതി',
      workflowTitle: 'നിങ്ങളുടെ സൈറ്റിലേക്ക് തൊഴിലാളികളെ എത്തിക്കുന്ന രീതി',
      workflowSubtitle: 'സുതാര്യവും സമയബന്ധിതവുമായ 4 ഘട്ടങ്ങളിലൂടെ സേവനം ലഭ്യമാക്കുന്നു.',
      steps: [
        {
          stepNumber: '01',
          title: 'ഓൺലൈൻ അന്വേഷണം നൽകുക',
          desc: 'ആവശ്യമായ സർവീസും സ്ഥലവും തീയതിയും തിരഞ്ഞെടുത്ത് വെബ്‌സൈറ്റ് വഴി സബ്മിറ്റ് ചെയ്യുക.',
        },
        {
          stepNumber: '02',
          title: 'ഓപ്പറേഷൻസ് സ്ഥിരീകരണം',
          desc: '15 മിനിറ്റിനുള്ളിൽ ഞങ്ങളുടെ കോർഡിനേറ്റർ നിങ്ങളെ വിളിച്ച് ആവശ്യങ്ങൾ മനസ്സിലാക്കി സമയം ഉറപ്പിക്കുന്നു.',
        },
        {
          stepNumber: '03',
          title: 'സൈറ്റിൽ തൊഴിലാളികൾ എത്തുന്നു',
          desc: 'കൃത്യസമയത്ത് എല്ലാ സുരക്ഷാ ഉപകരണങ്ങളോടും യന്ത്രങ്ങളോടും കൂടി ടീം നിങ്ങളുടെ സൈറ്റിലെത്തുന്നു.',
        },
        {
          stepNumber: '04',
          title: 'ജോലി വിലയിരുത്തലും പേയ്മെന്റും',
          desc: 'ജോലി തൃപ്തികരമായി പൂർത്തിയായ ശേഷം മുൻകൂട്ടി നിശ്ചയിച്ച നിരക്കിൽ പണം കൈമാറുക.',
        },
      ],
      guaranteesBadge: 'ഞങ്ങളുടെ ഉറപ്പ്',
      guaranteesTitle: 'ഓരോ പ്രോജക്റ്റിലും ഞങ്ങൾ നൽകുന്ന വാഗ്ദാനങ്ങൾ',
      guarantees: [
        {
          title: 'മറഞ്ഞിരിക്കുന്ന നിരക്കുകളില്ല',
          desc: 'മുൻകൂട്ടി പറയുന്ന വാടകയിലും കൂലിയിലും മാറ്റമുണ്ടാകില്ല. യാത്രാച്ചെലവുകളുടെ പേരിൽ അധിക പണം വാങ്ങുന്നതല്ല.',
        },
        {
          title: 'പൂർണ്ണ സുരക്ഷാ മുൻകരുതലുകൾ',
          desc: 'എല്ലാ തൊഴിലാളികൾക്കും ഇൻഷുറൻസും ആധുനിക സുരക്ഷാ ഉപകരണങ്ങളും ഉള്ളതിനാൽ ഉടമയ്ക്ക് ആശങ്കകൾ വേണ്ടതില്ല.',
        },
        {
          title: 'സമയപാലനം ഉറപ്പ്',
          desc: 'പറഞ്ഞ സമയത്ത് തന്നെ തൊഴിലാളികളും മെഷീനുകളും സൈറ്റിലെത്തി പണി ആരംഭിക്കുന്നു.',
        },
        {
          title: 'കസ്റ്റമർ സപ്പോർട്ട് ലൈൻ',
          desc: 'ജോലി പൂർത്തിയാകുന്നതുവരെ എപ്പോൾ വേണമെങ്കിലും ബന്ധപ്പെടാവുന്ന കൺട്രോൾ റൂം സൗകര്യം.',
        },
      ],
      bookBtn: 'സേവന സംഘത്തെ ബുക്ക് ചെയ്യുക',
      viewDetailsBtn: 'കൂടുതൽ വിവരങ്ങൾ',
      enquireForService: 'ഈ സേവനത്തിനായി അന്വേഷിക്കുക',
    },
    projects: {
      kicker: 'കാസർഗോഡിലെ പ്രോജക്റ്റുകൾ',
      headline: 'കാസർഗോഡ് ജില്ലയിലുടനീളം പൂർത്തിയാക്കിയ മുൻനിര പ്രോജക്റ്റുകൾ',
      subheadline:
        'ഹോസ്ദുർഗിലെ തെങ്ങിൻതോപ്പുകളുടെ ആധുനികവൽക്കരണം, ബേക്കലിലെ സൈറ്റ് ലെവലിംഗ്, നീലേശ്വരത്തെ വില്ല നിർമ്മാണം എന്നിവയിൽ ഞങ്ങൾ കൈവരിച്ച വിജയങ്ങൾ കാണുക.',
      filterAll: 'മുഴുവൻ കാസർഗോഡും',
      filters: {
        all: 'മുഴുവൻ കാസർഗോഡും',
        kanhangad: 'കാഞ്ഞങ്ങാട് & ഹോസ്ദുർഗ്',
        kasaragod: 'കാസർഗോഡ് ടൗൺ & കുമ്പള',
        nileshwar: 'നീലേശ്വരം & തൃക്കരിപ്പൂർ',
        uppala: 'ഉപ്പള & മഞ്ചേശ്വരം',
        vellarikundu: 'വെള്ളരിക്കുണ്ട് & മലയോര മേഖല',
      },
      items: [
        {
          id: 'proj-1',
          title: 'ഹോസ്ദുർഗ് തീരദേശ തെങ്ങിൻതോട്ടം ആധുനികവൽക്കരണം (1,200 തെങ്ങുകൾ)',
          district: 'കാഞ്ഞങ്ങാട്, ഹോസ്ദുർഗ് താലൂക്ക്',
          districtTag: 'kanhangad',
          category: 'അഗ്രോ കെയർ സ്ക്വാഡ്',
          categoryTag: 'agriculture',
          client: 'ഹോസ്ദുർഗ് കോക്കനട്ട് ഗ്രോവേഴ്സ് സൊസൈറ്റി',
          scope: 'മെക്കാനിക്കൽ തെങ്ങുകയറ്റം, കൊമ്പൻചെല്ലി നിവാരണ ജൈവ പരിചരണം, മണ്ട വൃത്തിയാക്കൽ, തേങ്ങ ശേഖരിക്കൽ.',
          duration: '6 ദിവസങ്ങൾ',
          equipment: '8 അംഗീകൃത തൊഴിലാളികൾ + 2 സൂപ്പർവൈസർമാർ',
          impact: 'മണ്ട പരിചരണത്തിലൂടെ വിളവിൽ 28% വർദ്ധനവ്; തടികൾക്ക് യാതൊരുവിധ കേടുപാടുകളും സംഭവിച്ചില്ല.',
          quote: 'കെകെ ഗ്രൂപ്പിന്റെ ടീം 1200 തെങ്ങുകളുള്ള ഞങ്ങളുടെ വലിയ തോട്ടം വെറും 6 ദിവസം കൊണ്ട് അതിമനോഹരമായി പൂർത്തിയാക്കി.',
          clientRole: 'സൊസൈറ്റി പ്രസിഡന്റ്',
          image: '/Banners/coco.png',
        },
        {
          id: 'proj-2',
          title: 'ബേക്കൽ വാട്ടർഫ്രണ്ട് റിസോർട്ട് സൈറ്റ് ലെവലിംഗും എർത്ത്മൂവിംഗും',
          district: 'ബേക്കൽ, കാസർഗോഡ്',
          districtTag: 'kasaragod',
          category: 'എർത്ത്മൂവിംഗ് & മെഷീനറി',
          categoryTag: 'machinery',
          client: 'ബേക്കൽ ഹൊറൈസൺ റിസോർട്സ്',
          scope: '45,000 ചതുരശ്രയടി വിസ്തീർണ്ണമുള്ള തീരദേശ പ്രദേശം നിരപ്പാക്കൽ, അടിത്തറ കുഴിയെടുക്കൽ, മണ്ണ് നീക്കം ചെയ്യൽ.',
          duration: '72 മണിക്കൂർ തുടർച്ചയായ ഷിഫ്റ്റുകൾ',
          equipment: '3x JCB 3DX എക്സ്കവേറ്ററുകൾ + 6 ടിപ്പർ ലോറികൾ',
          impact: 'നിശ്ചയിച്ച സമയത്തിന് 18 മണിക്കൂർ മുമ്പ് പണി പൂർത്തിയാക്കി ചെലവ് ഗണ്യമായി കുറച്ചു.',
          quote: 'അവരുടെ ഡ്രൈവർമാർക്ക് അസാമാന്യ പ്രാവീണ്യമുണ്ട്. കൃത്യമായ പ്ലാനിംഗിലൂടെ അവർ സൈറ്റ് ലെവൽ ചെയ്തു തന്നു.',
          clientRole: 'ചീഫ് പ്രോജക്റ്റ് എൻജിനീയർ',
          image: '/Banners/jcb.png',
        },
        {
          id: 'proj-3',
          title: 'നീലേശ്വരം ലക്ഷ്വറി വില്ല പ്ലാസ്റ്ററിംഗും ഇറ്റാലിയൻ മാർബിൾ ലേയിംഗും',
          district: 'നീലേശ്വരം, കാസർഗോഡ്',
          districtTag: 'nileshwar',
          category: 'ഫിനിഷിംഗ് & മേസൺ',
          categoryTag: 'finishing',
          client: 'ഡോ. കെ. ബാലകൃഷ്ണൻ & കുടുംബം',
          scope: '5,200 ചതുരശ്രയടി ഭിത്തികളിൽ സ്മൂത്ത് പ്ലാസ്റ്ററിംഗ്, ലേസർ ലെവലിൽ ഇറ്റാലിയൻ മാർബിൾ പാകൽ, ഈർപ്പ പ്രതിരോധം.',
          duration: '14 പ്രവൃത്തി ദിനങ്ങൾ',
          equipment: '6 വിദഗ്ദ്ധ മേസ്തിരിമാർ + ലേസർ ലെവലറുകൾ',
          impact: 'കണ്ണാടി പോലുള്ള ഫിനിഷിംഗും ഈടുനിൽക്കുന്ന എപോക്സി സീലിംഗും നൽകി.',
          quote: 'ഭിത്തികൾ കണ്ണാടി പോലെ മിനുസമാർന്നതാണ്. മാർബിൾ പോളിഷിംഗ് തികച്ചും ലോകോത്തര നിലവാരം പുലർത്തുന്നു.',
          clientRole: 'വീട്ടുടമസ്ഥൻ',
          image: '/Banners/tiling.png',
        },
        {
          id: 'proj-4',
          title: 'കാസർഗോഡ് ടൗൺ കൊമേഴ്സ്യൽ കോംപ്ലക്സ് 3-ഫേസ് ഇലക്ട്രിക്കൽ',
          district: 'ബാങ്ക് റോഡ്, കാസർഗോഡ് ടൗൺ',
          districtTag: 'kasaragod',
          category: 'ഇലക്ട്രിക്കൽ MEP',
          categoryTag: 'utilities',
          client: 'മലബാർ കൊമേഴ്സ്യൽ പ്ലാസ',
          scope: '3-ഫേസ് ഓട്ടോമേറ്റഡ് ഡിസ്ട്രിബ്യൂഷൻ പാനൽ ബോർഡ്, ഹൈ-ബേ എൽഇഡി ലൈറ്റിംഗ്, ജനറേറ്റർ ചേഞ്ച്ഓവർ സംവിധാനം.',
          duration: '5 ദിവസങ്ങൾ',
          equipment: 'എ-ഗ്രേഡ് ലൈസൻസ്ഡ് ഇലക്ട്രീഷ്യൻമാർ + വയർമാൻമാർ',
          impact: 'കെ.എസ്.ഇ.ബി ഇലക്ട്രിക്കൽ ഇൻസ്പെക്ടറുടെ പരിശോധനയിൽ ആദ്യ തവണ തന്നെ അനുമതി നേടി.',
          quote: 'വളരെ വൃത്തിയുള്ള വയറിംഗും കൃത്യമായ പാനൽ ക്രമീകരണവും. യഥാർത്ഥ പ്രൊഫഷണലുകൾ.',
          clientRole: 'ഓപ്പറേഷൻസ് ഡയറക്ടർ',
          image: '/Banners/electrical.png',
        },
        {
          id: 'proj-5',
          title: 'വെള്ളരിക്കുണ്ട് മലഞ്ചെരുവ് ഡ്രെയിനേജ് ട്രെഞ്ചും മണ്ണൊലിപ്പ് തടയലും',
          district: 'വെള്ളരിക്കുണ്ട്, കാസർഗോഡ്',
          districtTag: 'vellarikundu',
          category: 'ഡ്രെയിനേജ് & എർത്ത്മൂവിംഗ്',
          categoryTag: 'machinery',
          client: 'മാലോം ഹൈലാൻഡ് സ്പൈസസ് & റബ്ബർ',
          scope: '800 മീറ്റർ നീളത്തിൽ മലഞ്ചെരുവിൽ ഡ്രെയിനേജ് ചാലുകൾ നിർമ്മിക്കൽ, വൻപാറകൾ മാറ്റി സൈറ്റ് സുരക്ഷിതമാക്കൽ.',
          duration: '4 ദിവസങ്ങൾ',
          equipment: 'ജെസിബി 3DX + ട്രെഞ്ചിംഗ് മേസൺമാർ',
          impact: 'കനത്ത കാലവർഷത്തിൽ തോട്ടത്തിലെ മണ്ണൊലിപ്പും വെള്ളപ്പൊക്കവും പൂർണ്ണമായും തടഞ്ഞു.',
          quote: 'കുത്തനെയുള്ള മലഞ്ചെരുവിൽ റബ്ബറിനും കുരുമുളകിനും കേടുപാടില്ലാതെ അവർ ഭംഗിയായി മെഷീൻ പ്രവർത്തിപ്പിച്ചു.',
          clientRole: 'പ്ലാന്റേഷൻ ഡയറക്ടർ',
          image: '/Banners/plumbing.png',
        },
        {
          id: 'proj-6',
          title: 'തൃക്കരിപ്പൂർ തീരദേശ ഹൈ-യീൽഡ് ബോർവെൽ നിർമ്മാണം',
          district: 'തൃക്കരിപ്പൂർ, കാസർഗോഡ്',
          districtTag: 'nileshwar',
          category: 'വാട്ടർ എൻജിനീയറിംഗ്',
          categoryTag: 'utilities',
          client: 'തൃക്കരിപ്പൂർ അഗ്രോ പ്രൊഡ്യൂസേഴ്സ്',
          scope: 'ഭൂഗർഭ ജല സാന്നിധ്യം കണ്ടെത്തൽ, 480 അടി ആഴത്തിൽ റിഗ് ഡ്രില്ലിംഗ്, സോളാർ സബ്മേഴ്സിബിൾ പമ്പ് ഇൻസ്റ്റാളേഷൻ.',
          duration: '3 ദിവസങ്ങൾ',
          equipment: 'ഹൈഡ്രോളിക് റോട്ടറി റിഗ് + ജിയോളജിസ്റ്റ് സംഘം',
          impact: 'മണിക്കൂറിൽ 4,800 ലിറ്റർ ശുദ്ധജലം ലഭ്യമാക്കുന്ന ഉറവ കണ്ടെത്തി 15 ഏക്കർ കൃഷിഭൂമി നനയ്ക്കാനായി.',
          quote: 'മറ്റ് പലരും പരാജയപ്പെട്ട പാറക്കെട്ടുകൾ നിറഞ്ഞ സ്ഥലത്ത് കെകെ ഗ്രൂപ്പ് 420 അടിയിൽ വറ്റാത്ത വെള്ളം കണ്ടെത്തി.',
          clientRole: 'സൊസൈറ്റി സെക്രട്ടറി',
          image: '/Banners/borewell.png',
        },
      ],
      statsBadge: 'പ്രവർത്തന കണക്കുകൾ',
      statsTitle: 'കാസർഗോഡ് ജില്ലയിലെ സേവന വ്യാപ്തി',
      stats: [
        { val: '280,000+', label: 'പരിപാലിച്ച തെങ്ങുകൾ', sub: 'കാസർഗോഡ് ജില്ലയിലെ 4 താലൂക്കുകളിലായി' },
        { val: '18,500+', label: 'ജെസിബി പ്രവർത്തന മണിക്കൂറുകൾ', sub: 'അപകടരഹിതമായി പൂർത്തിയാക്കിയത്' },
        { val: '12 ലക്ഷം+', label: 'ചതുരശ്രയടി പ്ലാസ്റ്ററിംഗ്', sub: 'വീടുകളിലും കൊമേഴ്സ്യൽ കെട്ടിടങ്ങളിലും' },
        { val: '99.4%', label: 'ഉപഭോക്തൃ സംതൃപ്തി', sub: '3,400+ ഉപഭോക്താക്കളുടെ അഭിപ്രായങ്ങൾ' },
      ],
      ctaTitle: 'കാസർഗോഡ് ജില്ലയിലെ പ്രോജക്റ്റുകൾക്കായി ചർച്ച ചെയ്യാൻ ആഗ്രഹിക്കുന്നുണ്ടോ?',
      ctaSubtitle: 'ഞങ്ങളുടെ കാസർഗോഡ് ഫീൽഡ് കോർഡിനേറ്റർമാരുമായി സംസാരിച്ച് സൈറ്റ് പ്ലാൻ തയ്യാറാക്കൂ.',
      ctaBtn: 'അന്വേഷണങ്ങൾക്കായി ബന്ധപ്പെടുക',
    },
    businesses: {
      kicker: 'ഞങ്ങളുടെ സ്ഥാപനങ്ങൾ',
      headline: 'നാല് പ്രത്യേക വിഭാഗങ്ങൾ. ഒരൊറ്റ ഉന്നത നിലവാരം.',
      subheadline:
        'കാർഷിക പരിചരണം, ഹെവി മെഷീനറി ലോജിസ്റ്റിക്സ്, സിവിൽ നിർമ്മാണം, വാട്ടർ ഇൻഫ്രാസ്ട്രക്ചർ എന്നീ 4 പ്രമുഖ മേഖലകളിൽ കെകെ ഗ്രൂപ്പ് പ്രവർത്തിക്കുന്നു.',
      divisionsBadge: 'ബിസിനസ്സ് വിഭാഗങ്ങൾ',
      divisionsTitle: 'ഏത് വലിയ ആവശ്യത്തിനും സംയോജിത സേവനങ്ങൾ',
      divisions: [
        {
          id: 'cococare',
          name: 'കെകെ കൊക്കോ കെയർ & അഗ്രി-ടെക് സൊല്യൂഷൻസ്',
          divisionTag: 'അഗ്രോ കെയർ ഡിവിഷൻ',
          tagline: 'കേരളത്തിലെ ഏറ്റവും വലിയ യന്ത്രവൽക്കൃത തെങ്ങുകയറ്റ സേവന ശൃംഖല',
          desc: 'ആധുനിക തെങ്ങുകയറ്റ ഉപകരണങ്ങൾ, ശാസ്ത്രീയ കീടനിയന്ത്രണം, മണ്ട വൃത്തിയാക്കൽ, കൊപ്ര ശേഖരണം എന്നിവയ്ക്കായി വ്യക്തിഗത ഉടമകൾക്കും വലിയ എസ്റ്റേറ്റുകൾക്കും വിശ്വസിക്കാവുന്ന കൂട്ടായ്മ.',
          highlights: [
            'പ്രതിവർഷം 2.5 ലക്ഷത്തിലധികം തെങ്ങുകളുടെ പരിചരണം',
            'സുരക്ഷാ ബെൽറ്റുകളും ഇൻഷുറൻസ് പരിരക്ഷയും',
            'കൊമ്പൻചെല്ലി പ്രതിരോധത്തിനായുള്ള ജൈവ മരുന്നുകൾ',
            'വൻതോതിലുള്ള തേങ്ങ & കൊപ്ര സംഭരണം',
          ],
          metrics: {
            val1: '120+',
            lbl1: 'വിദഗ്ദ്ധ തൊഴിലാളികൾ',
            val2: '14 ജില്ലകൾ',
            lbl2: 'മുഴുവൻ സമയ സേവനം',
          },
          leadFleet: 'മെക്കാനിക്കൽ ക്ലൈംബിംഗ് കിറ്റുകൾ, സുരക്ഷാ ബെൽറ്റുകൾ',
          serviceTarget: 'എസ്റ്റേറ്റ് ഉടമകൾ, കർഷകർ, വ്യക്തിഗത വീടുകൾ',
          image: '/Banners/coco.png',
        },
        {
          id: 'earthmovers',
          name: 'കെകെ ഹെവി എർത്ത്മൂവേഴ്സ് & മെഷീനറി ലോജിസ്റ്റിക്സ്',
          divisionTag: 'മെഷീനറി ഡിവിഷൻ',
          tagline: 'പരിശീലനം നേടിയ ഡ്രൈവർമാരുള്ള ഹെവി മെഷീനറി ഫ്ലീറ്റ്',
          desc: 'JCB 3DX ബാക്ക്ഹോ ലോഡറുകൾ, ട്രാക്ക്ഡ് എക്സ്കവേറ്ററുകൾ, റോക്ക് ബ്രേക്കറുകൾ, ടിപ്പർ ലോറികൾ എന്നിവ തത്സമയ ജിപിഎസ് നിരീക്ഷണത്തിലൂടെ ജില്ലകളിലുടനീളം വിന്യസിക്കുന്നു.',
          highlights: [
            'പുതിയ മോഡൽ JCB 3DX & മിനി എക്സ്കവേറ്ററുകൾ',
            '5,000 മണിക്കൂറിലധികം പരിചയമുള്ള ഡ്രൈവർമാർ',
            'അടിത്തറ കുഴിയെടുക്കൽ, റോഡ് നിർമ്മാണം, കുളം കുഴിക്കൽ',
            'ഡീസലും ഉൾപ്പെടുന്ന കൃത്യമായ ഷിഫ്റ്റ് പാക്കേജുകൾ',
          ],
          metrics: {
            val1: '40+',
            lbl1: 'ഹെവി മെഷീനറികൾ',
            val2: '24h',
            lbl2: 'തത്സമയ വിന്യാസം',
          },
          leadFleet: 'JCB 3DX, കുബോട്ട മിനി ഡിഗ്ഗറുകൾ, ടിപ്പർ ലോറികൾ',
          serviceTarget: 'സിവിൽ കോൺട്രാക്ടർമാർ, ബിൽഡർമാർ, വ്യക്തികൾ',
          image: '/Banners/jcb.png',
        },
        {
          id: 'construction',
          name: 'കെകെ കൺസ്ട്രക്ഷൻ സ്ക്വാഡ്സ് & ആർക്കിടെക്ചറൽ ഫിനിഷിംഗ്',
          divisionTag: 'നിർമ്മാണവും ഫിനിഷിംഗും',
          tagline: 'സിവിൽ വർക്കുകൾക്കും ഇൻഫ്രാസ്ട്രക്ചർ ഫിനിഷിംഗിനുമുള്ള വിദഗ്ദ്ധർ',
          desc: 'സ്മൂത്ത് പ്ലാസ്റ്ററിംഗ്, കട്ടകെട്ടൽ, ഇറ്റാലിയൻ മാർബിളും ലാർജ് സ്ലാബ് ടൈലുകളും പാകൽ, മഴക്കാല പ്രതിരോധ പെയിന്റിംഗ് എന്നിവയ്ക്കുള്ള പ്രൊഫഷണൽ സംഘം.',
          highlights: [
            'പ്രധാന മേസ്തിരിമാർ, ടൈൽ വിദഗ്ദ്ധർ, സ്പ്രേ പെയിന്റർമാർ',
            'എല്ലാ സൈറ്റുകളിലും ലേസർ ലെവൽ ഉപകരണങ്ങൾ',
            'വാട്ടർപ്രൂഫിംഗും ക്രാക്ക് പ്രിവൻഷൻ മെഷുകളും',
            'കൃത്യമായ ജോലി വിലയിരുത്തലുകൾ',
          ],
          metrics: {
            val1: '250+',
            lbl1: 'വിദഗ്ദ്ധ തൊഴിലാളികൾ',
            val2: '950+',
            lbl2: 'പൂർത്തിയാക്കിയ വില്ലകൾ',
          },
          leadFleet: 'ലേസർ ലെവലറുകൾ, എയർലെസ്സ് പെയിന്റ് റിഗ്ഗുകൾ, കട്ടറുകൾ',
          serviceTarget: 'ആർക്കിടെക്റ്റുകൾ, ജനറൽ കോൺട്രാക്ടർമാർ, വീട്ടുടമകൾ',
          image: '/Banners/plastering.png',
        },
        {
          id: 'water-tech',
          name: 'കെകെ എൻജിനീയറിംഗ്, ബോർവെൽസ് & വാട്ടർ സൊല്യൂഷൻസ്',
          divisionTag: 'വാട്ടർ ഇൻഫ്രാസ്ട്രക്ചർ',
          tagline: 'ശാസ്ത്രീയ ഭൂഗർഭ ജല സാന്നിധ്യം കണ്ടെത്തലും ഡ്രില്ലിംഗും',
          desc: 'ഹൈഡ്രോളിക് റോട്ടറി റിഗ്ഗുകൾ, ജിയോഫിസിക്കൽ സർവേ ഉപകരണങ്ങൾ, ഡ്രെയിനേജ് ട്രെഞ്ചിംഗ് പ്ലംബർമാർ എന്നിവരിലൂടെ ശുദ്ധജല ലഭ്യത ഉറപ്പാക്കുന്നു.',
          highlights: [
            '800 അടി വരെ ആഴത്തിൽ ഹൈഡ്രോളിക് ബോർവെൽ ഡ്രില്ലിംഗ്',
            'ശാസ്ത്രീയ ഭൂഗർഭ ജല ഉറവ പരിശോധന',
            'ഉയർന്ന മർദ്ദമുള്ള ഡ്രെയിനേജ് പൈപ്പ് ലൈൻ സജ്ജീകരണം',
            'സോളാർ & ഗ്രിഡ് സബ്മേഴ്സിബിൾ പമ്പ് ഇൻസ്റ്റാളേഷൻ',
          ],
          metrics: {
            val1: '94%',
            lbl1: 'വിജയ നിരക്ക്',
            val2: '450+',
            lbl2: 'കുഴിച്ച കിണറുകൾ',
          },
          leadFleet: 'റോട്ടറി ഡ്രില്ലിംഗ് റിഗ്ഗുകൾ, കെയ്സിംഗ് ഇൻസ്റ്റാളറുകൾ',
          serviceTarget: 'തോട്ടങ്ങൾ, റെസിഡൻഷ്യൽ സമുച്ചയങ്ങൾ, ഫാക്ടറികൾ',
          image: '/Banners/borewell.png',
        },
      ],
      synergyBadge: 'കെകെ ഗ്രൂപ്പിന്റെ മേന്മ',
      synergyTitle: 'എന്തുകൊണ്ട് കെകെ ഗ്രൂപ്പിന്റെ സംയോജിത സേവനങ്ങൾ തിരഞ്ഞെടുക്കണം?',
      synergySubtitle: 'ഒരൊറ്റ കരാറിലൂടെ ഇടനിലക്കാരില്ലാതെ കൃത്യമായ പ്ലാനിംഗോടെ പണി പൂർത്തിയാക്കാം.',
      synergies: [
        {
          title: 'ഒരൊറ്റ ഉത്തരവാദിത്തം',
          desc: 'എർത്ത്മൂവർമാരും മേസൺമാരും പ്ലംബർമാരും തമ്മിൽ പരസ്പരം പഴിചാരലുകളില്ലാതെ മുഴുവൻ ഉത്തരവാദിത്തവും കെകെ ഗ്രൂപ്പ് ഏറ്റെടുക്കുന്നു.',
        },
        {
          title: 'ചെലവിൽ 20-30% ലാഭം',
          desc: 'യന്ത്രസാമഗ്രികളും തൊഴിലാളികളും നേരിട്ട് ലഭ്യമാക്കുന്നതിലൂടെ ഇടനിലക്കാരുടെ കമ്മീഷൻ പൂർണ്ണമായും ഒഴിവാക്കാം.',
        },
        {
          title: 'കാസർഗോഡ് ജില്ലയിലുടനീളം ഒരേ ഗുണനിലവാരം',
          desc: 'മഞ്ചേശ്വരം ആയാലും കാഞ്ഞങ്ങാട് ആയാലും ഒരേ സുരക്ഷാ മാനദണ്ഡങ്ങളും പ്രൊഫഷണൽ രീതികളും.',
        },
      ],
      b2bBadge: 'കോർപ്പറേറ്റ് പങ്കാളിത്തം',
      b2bTitle: 'കാസർഗോഡിലെ കോൺട്രാക്ടർമാർക്കും സ്ഥാപനങ്ങൾക്കുമുള്ള പാക്കേജുകൾ',
      b2bDesc:
        'നിങ്ങൾ കാസർഗോഡിലെ നിർമ്മാണ കമ്പനിയോ, കാർഷിക സൊസൈറ്റിയോ, റിസോർട്ട് ഗ്രൂപ്പോ ആണോ? മുൻഗണനാ വിന്യാസത്തിനും പ്രത്യേക നിരക്കുകൾക്കുമായി ഞങ്ങളുമായി ദീർഘകാല പങ്കാളിത്തത്തിൽ ഏർപ്പെടാം.',
      b2bBtn: 'ബിസിനസ്സ് അക്കൗണ്ടിനായി അന്വേഷിക്കുക',
      b2bCall: 'കോർപ്പറേറ്റ് ഡെസ്കിലേക്ക് വിളിക്കുക',
    },
    contact: {
      kicker: 'കാസർഗോഡ് കൺട്രോൾ റൂമും സേവനങ്ങളും',
      headline: 'കാസർഗോഡിൽ ഞങ്ങളുടെ ടീമുമായി എപ്പോൾ വേണമെങ്കിലും ബന്ധപ്പെടാം',
      subheadline:
        'കാഞ്ഞങ്ങാട് ജെസിബി മെഷീനറികൾ, ഹോസ്ദുർഗിലെ തെങ്ങുകയറ്റ തൊഴിലാളികൾ, കാസർഗോഡ് ടൗണിലെ നിർമ്മാണ ജോലികൾ എന്നിവയ്ക്കായി ഞങ്ങളുടെ കേന്ദ്ര കൺട്രോൾ റൂം 24 മണിക്കൂറും സജ്ജമാണ്.',
      channelsTitle: 'നേരിട്ട് ബന്ധപ്പെടാനുള്ള മാർഗ്ഗങ്ങൾ',
      channelsSubtitle: 'നിങ്ങൾക്ക് അനുയോജ്യമായ മാധ്യമത്തിലൂടെ ഞങ്ങളുമായി സംസാരിക്കാം. കാസർഗോഡ് കൺട്രോൾ റൂം മുഴുവൻ സമയവും ലഭ്യമാണ്.',
      phoneLabel: 'സെൻട്രൽ ഓപ്പറേഷൻസ് ഹെൽപ്പ്‌ലൈൻ',
      phoneVal: '+91 94470 12345',
      phoneSub: 'കാസർഗോഡ് ജില്ലയിലുടനീളം അടിയന്തിര മെഷീൻ & തൊഴിലാളി ബുക്കിംഗിനായി 24 മണിക്കൂറും വിളിക്കാം',
      whatsappLabel: 'വാട്ട്‌സ്ആപ്പ് ക്വിക്ക് കണക്ട്',
      whatsappVal: '+91 98460 54321',
      whatsappSub: 'ഫോട്ടോകൾ അയക്കാനും ലൊക്കേഷൻ പങ്കുവെക്കാനും ക്ലിക്ക് ചെയ്യുക',
      emailLabel: 'ഔദ്യോഗിക ഇമെയിൽ',
      emailVal: 'dispatch@kkgroupkerala.com',
      emailSub: 'കോർപ്പറേറ്റ് ടെൻഡറുകൾക്കും ഔദ്യോഗിക കാര്യങ്ങൾക്കും',
      deskLabel: 'ശരാശരി പ്രതികരണ സമയം',
      deskVal: '< 15 മിനിറ്റ്',
      deskSub: 'ഓൺലൈൻ അന്വേഷണങ്ങൾക്ക് കോർഡിനേറ്റർ തിരിച്ചുവിളിക്കുന്ന സമയം',
      formTitle: 'തൊഴിലാളികൾക്കും മെഷീനുകൾക്കുമുള്ള നേരിട്ടുള്ള ബുക്കിംഗ്',
      formSubtitle: 'ഈ ഫോം പൂരിപ്പിക്കുക. ഞങ്ങളുടെ കാസർഗോഡ് റീജിയണൽ കോർഡിനേറ്റർ 15 മിനിറ്റിനുള്ളിൽ നിങ്ങളെ ബന്ധപ്പെടുന്നതാണ്.',
      serviceLabel: 'ആവശ്യമായ സർവീസ് തിരഞ്ഞെടുക്കുക *',
      servicePlaceholder: 'Select required service squad...',
      nameLabel: 'നിങ്ങളുടെ പേര് *',
      namePlaceholder: 'e.g. Anand R. Menon',
      phoneInputLabel: 'ഫോൺ നമ്പർ *',
      phoneInputPlaceholder: '98765 43210',
      districtLabel: 'സൈറ്റ് ഉള്ള സ്ഥലം / ജില്ല *',
      districtPlaceholder: 'e.g. Kanhangad, Kasaragod',
      dateLabel: 'ആവശ്യമുള്ള തീയതി',
      notesLabel: 'മറ്റ് ആവശ്യങ്ങൾ അല്ലെങ്കിൽ വിവരങ്ങൾ',
      notesPlaceholder: 'e.g. Mention squad size, number of trees, site area, or machine hours needed...',
      submitBtn: 'സേവന അഭ്യർത്ഥന സമർപ്പിക്കുക',
      submittingBtn: 'അഭ്യർത്ഥന അയക്കുന്നു...',
      successTitle: 'അന്വേഷണം വിജയകരമായി സമർപ്പിച്ചു!',
      successMsg:
        'നന്ദി! നിങ്ങളുടെ സേവന വിവരങ്ങൾ ഞങ്ങളുടെ കാസർഗോഡ് കോർഡിനേറ്റർക്ക് ലഭിച്ചു. 15 മിനിറ്റിനുള്ളിൽ നിങ്ങളെ തിരിച്ചുവിളിക്കുന്നതാണ്.',
      depotsBadge: 'കാസർഗോഡ് കേന്ദ്രങ്ങൾ',
      depotsTitle: 'ഞങ്ങളുടെ കാസർഗോഡ് ഓഫീസുകളും മെഷീനറി യാർഡുകളും',
      depotsSubtitle: 'കാസർഗോഡ് ജില്ലയിലെ പ്രധാന കേന്ദ്രങ്ങളിലുള്ള ഞങ്ങളുടെ പ്രവർത്തന താവളങ്ങൾ.',
      depots: [
        {
          name: 'കാസർഗോഡ് ടൗൺ ഹെഡ്ക്വാർട്ടേഴ്സ് & ഫ്ലീറ്റ് ഡിപ്പോ',
          hubTag: 'ജില്ലാ പ്രധാന ആസ്ഥാനം',
          address: 'കെകെ കോംപ്ലക്സ്, എൻഎച്ച്-66 പഴയ ബസ് സ്റ്റാൻഡ് റോഡ്, ക്ലോക്ക് ടവറിന് സമീപം, കാസർഗോഡ് ടൗൺ, കേരളം 671121',
          phone: '+91 94470 12345',
          timing: 'തിങ്കൾ - ശനി: 7:00 AM - 8:30 PM',
          mapUrl: 'https://maps.google.com/?q=Kasaragod,Kerala',
        },
        {
          name: 'കാഞ്ഞങ്ങാട് സെൻട്രൽ മെഷീനറി & എർത്ത്മൂവിംഗ് ബേസ്',
          hubTag: 'മെഷീനറി ഫ്ലീറ്റ് ഹബ്ബ്',
          address: 'കോട്ടിക്കുളം - കാഞ്ഞങ്ങാട് ഹൈവേ, ഹോസ്ദുർഗ് കോട്ട ജംഗ്ഷന് സമീപം, കാഞ്ഞങ്ങാട്, കേരളം 671315',
          phone: '+91 98460 54321',
          timing: 'മെഷീൻ മെയിന്റനൻസിനും വിന്യാസത്തിനുമായി 24 മണിക്കൂറും തുറന്നിരിക്കുന്നു',
          mapUrl: 'https://maps.google.com/?q=Kanhangad,Kerala',
        },
        {
          name: 'നീലേശ്വരം അഗ്രോ-കെയർ & ഫിനിഷിംഗ് ഡിപ്പോ',
          hubTag: 'അഗ്രോ & സിവിൽ ഡിവിഷൻ',
          address: 'മാർക്കറ്റ് റോഡ്, നീലേശ്വരം റെയിൽവേ സ്റ്റേഷന് സമീപം, നീലേശ്വരം, കേരളം 671314',
          phone: '+91 94471 67890',
          timing: 'തിങ്കൾ - ശനി: 8:00 AM - 7:00 PM',
          mapUrl: 'https://maps.google.com/?q=Nileshwaram,Kerala',
        },
        {
          name: 'ഉപ്പള നോർത്തേൺ ഫ്ലീറ്റ് & മെഷീനറി ഡിപ്പോ',
          hubTag: 'നോർത്ത് കാസർഗോഡ് ഹബ്ബ്',
          address: 'എൻഎച്ച്-66 കൊമേഴ്സ്യൽ കോറിഡോർ, ഉപ്പള, മഞ്ചേശ്വരം താലൂക്ക്, കാസർഗോഡ്, കേരളം 671322',
          phone: '+91 98462 13579',
          timing: 'തിങ്കൾ - ശനി: 8:00 AM - 7:30 PM',
          mapUrl: 'https://maps.google.com/?q=Uppala,Kerala',
        },
      ],
      faqBadge: 'സംശയങ്ങൾ',
      faqTitle: 'പതിവായി ചോദിക്കുന്ന ചോദ്യങ്ങൾ',
      faqs: [
        {
          q: 'ഒരു ജെസിബിയോ തൊഴിലാളിയോ എന്റെ കാസർഗോഡ് സൈറ്റിലെത്താൻ എത്ര സമയമെടുക്കും?',
          a: 'കാഞ്ഞങ്ങാട്, കാസർഗോഡ് ടൗൺ, നീലേശ്വരം, ഉപ്പള, തൃക്കരിപ്പൂർ മേഖലകളിൽ അടിയന്തിര ആവശ്യങ്ങൾക്ക് 1 മുതൽ 3 മണിക്കൂറിനുള്ളിൽ വിന്യസിക്കാം. വെള്ളരിക്കുണ്ട്, പാണത്തൂർ തുടങ്ങിയ മലയോര മേഖലകളിൽ 3 മുതൽ 4 മണിക്കൂറിനുള്ളിൽ എത്തിച്ചേരാനാകും.',
        },
        {
          q: 'തൊഴിലാളികൾക്ക് സുരക്ഷാ ഉപകരണങ്ങളും ഇൻഷുറൻസും ഉണ്ടോ?',
          a: 'ഉണ്ട്. കെകെ ഗ്രൂപ്പിലെ എല്ലാ തൊഴിലാളികൾക്കും ആവശ്യമായ സുരക്ഷാ ബെൽറ്റുകളും ഹെൽമെറ്റുകളും ഗ്രൂപ്പ് ഇൻഷുറൻസും ലഭ്യമാക്കിയിട്ടുള്ളതിനാൽ വീട്ടുടമസ്ഥർക്ക് യാതൊരു നിയമപരമായ ബാധ്യതകളും ഉണ്ടാകുന്നതല്ല.',
        },
        {
          q: 'പേയ്മെന്റ് രീതിയും നിരക്കുകളും എങ്ങനെയാണ്?',
          a: 'ദിവസക്കൂലി അല്ലെങ്കിൽ മണിക്കൂർ അടിസ്ഥാനമാക്കിയുള്ള സുതാര്യമായ നിരക്കാണ് ഞങ്ങൾ ഈടാക്കുന്നത്. മറഞ്ഞിരിക്കുന്ന ചാർജ്ജുകളില്ല. യുപിഐ, ബാങ്ക് ട്രാൻസ്ഫർ അല്ലെങ്കിൽ പണമായി ജോലി പൂർത്തിയായ ശേഷം നൽകാം.',
        },
        {
          q: 'കാസർഗോഡ് ജില്ലയിലെ എല്ലാ നഗരങ്ങളിലും ഗ്രാമങ്ങളിലും സേവനം ലഭിക്കുമോ?',
          a: 'തീർച്ചയായും. ജില്ലയിലെ 4 താലൂക്കുകളിലും (കാസർഗോഡ്, ഹോസ്ദുർഗ്, മഞ്ചേശ്വരം, വെള്ളരിക്കുണ്ട്), മഞ്ചേശ്വരം മുതൽ തെക്ക് തൃക്കരിപ്പൂർ വരെയുള്ള 21-ലധികം നഗരങ്ങളിലും തീരദേശ/മലയോര പഞ്ചായത്തുകളിലും ഞങ്ങളുടെ സേവനം ലഭ്യമാണ്.',
        },
      ],
    },
  },
};
