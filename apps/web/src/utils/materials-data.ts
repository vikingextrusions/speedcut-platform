export interface MaterialGrade {
  name: string
  yieldStrength: string
  hardness: string
  description: string
}

export interface DFMGuide {
  minWallThickness: string
  minCornerRadius: string
  threadCompliance: string
  tolerances: string
  finishes: string[]
}

export interface MaterialData {
  id: string
  name: string
  slug: string
  category: 'Metals' | 'Speciality'
  description: string
  longDescription: string
  iconName: 'Gem' | 'Shield' | 'Cog' | 'Target' | 'Gauge' | 'Flame' | 'CircleDot' | 'Cpu'
  machinability: number       // 1 to 5
  strengthToWeight: number    // 1 to 5
  corrosionResistance: number // 1 to 5
  relativeCost: number        // 1 to 5
  grades: MaterialGrade[]
  dfm: DFMGuide
  applications: string[]
  processes: string[]
}

export const materialsData: Record<string, MaterialData> = {
  aluminium: {
    id: 'aluminium',
    name: 'Aluminium',
    slug: 'aluminium',
    category: 'Metals',
    description: 'Lightweight, versatile, and highly machinable. The go-to metal for a wide range of engineering prototypes and production parts.',
    longDescription: 'Aluminium is the most widely specified material in digital manufacturing. It exhibits an exceptional strength-to-weight ratio, is highly machinable, and offers solid natural corrosion resistance. By applying surface treatments like anodising, its surface hardness and aesthetic appeal can be dramatically improved. Perfect for structural, aerospace, thermal, and electronic housing parts.',
    iconName: 'Gem',
    machinability: 5,
    strengthToWeight: 4,
    corrosionResistance: 4,
    relativeCost: 1.5,
    grades: [
      {
        name: '6082-T6',
        yieldStrength: '250 - 280 MPa',
        hardness: '90 - 95 HB',
        description: 'The standard structural aluminium alloy in Europe. Excellent corrosion resistance, good weldability, and versatile machining characteristics.'
      },
      {
        name: '7075-T6',
        yieldStrength: '480 - 500 MPa',
        hardness: '150 HB',
        description: 'Aerospace-grade alloy. Harder and significantly stronger than 6082, comparable to some steels, but still lightweight. Fair corrosion resistance.'
      },
      {
        name: '2024-T3',
        yieldStrength: '280 - 320 MPa',
        hardness: '120 HB',
        description: 'High fatigue resistance and high strength. Widely used in aircraft structures, but has lower corrosion resistance and weldability.'
      }
    ],
    dfm: {
      minWallThickness: '0.8 mm',
      minCornerRadius: '1.0 mm (use larger for depth)',
      threadCompliance: 'M2 up to M24 standard threads',
      tolerances: '±0.1 mm standard, up to ±0.025 mm precision',
      finishes: ['As Machined', 'Bead Blast', 'Anodising (Clear/Coloured)', 'Hard Anodising', 'Powder Coating']
    },
    applications: ['Aircraft structural components', 'Electronic enclosures & heatsinks', 'Automotive suspension components', 'Custom engine mounts', 'Medical instrumentation frames'],
    processes: ['CNC Milling', 'CNC Turning']
  },
  'stainless-steel': {
    id: 'stainless-steel',
    name: 'Stainless Steel',
    slug: 'stainless-steel',
    category: 'Metals',
    description: 'Superior corrosion resistance, high tensile strength, and outstanding durability. Excellent for harsh environments.',
    longDescription: 'Stainless Steel alloys are characterised by a high chromium content (minimum 10.5%), which creates a self-healing passive oxide layer that prevents rusting. Offering excellent mechanical strength, toughness, and temperature tolerance, it is a staple in medical, food service, marine, and chemical processing industries.',
    iconName: 'Shield',
    machinability: 3,
    strengthToWeight: 3.5,
    corrosionResistance: 5,
    relativeCost: 2.5,
    grades: [
      {
        name: '304 (A2)',
        yieldStrength: '215 MPa',
        hardness: '170 - 200 HB',
        description: 'The most popular stainless grade globally. Exceptional corrosion resistance in fresh water and organic acids. Excellent formability.'
      },
      {
        name: '316 (A4)',
        yieldStrength: '290 MPa',
        hardness: '200 HB',
        description: 'Marine-grade stainless steel with added molybdenum. High resistance to chloride corrosion (sea water, salts) and industrial chemicals.'
      },
      {
        name: '303',
        yieldStrength: '190 MPa',
        hardness: '160 - 190 HB',
        description: 'Free-machining grade with added sulphur. Ideal for rapid CNC turning and high-volume screw machining, but has lower corrosion resistance.'
      }
    ],
    dfm: {
      minWallThickness: '1.0 mm',
      minCornerRadius: '1.5 mm',
      threadCompliance: 'M3 minimum, coarse threads preferred',
      tolerances: '±0.1 mm standard, up to ±0.03 mm precision',
      finishes: ['As Machined', 'Passivation', 'Electropolishing', 'Bead Blast', 'Satin Polish']
    },
    applications: ['Marine brackets and fittings', 'Medical surgical instruments', 'Food processing equipment', 'Chemical storage vessels', 'High-stress bolts and shafts'],
    processes: ['CNC Milling', 'CNC Turning', 'Wire EDM']
  },
  'mild-steel': {
    id: 'mild-steel',
    name: 'Mild Steel',
    slug: 'mild-steel',
    category: 'Metals',
    description: 'High strength, excellent weldability, and low cost. The workhorse material for structural and industrial machinery parts.',
    longDescription: 'Mild Steel (carbon steel) provides a cost-effective, high-strength structural material with superb magnetic properties and high weldability. Because it is highly susceptible to rust, it is commonly plated, galvanised, or powder-coated after machining to protect against environmental degradation.',
    iconName: 'Cog',
    machinability: 4,
    strengthToWeight: 3,
    corrosionResistance: 1,
    relativeCost: 1.0,
    grades: [
      {
        name: 'EN3B (070M20)',
        yieldStrength: '220 MPa',
        hardness: '110 - 140 HB',
        description: 'A standard low-carbon bright mild steel. High weldability and easy to machine, but has low wear resistance unless carburised.'
      },
      {
        name: 'EN8 (080M40)',
        yieldStrength: '280 - 460 MPa (heat-treated)',
        hardness: '200 - 250 HB',
        description: 'Medium carbon steel. Responds well to heat treatment, offering significantly higher strength and wear resistance than EN3B. Ideal for shafts and gears.'
      },
      {
        name: 'EN24 (817M40)',
        yieldStrength: '680 - 850 MPa',
        hardness: '250 - 300 HB',
        description: 'High-tensile alloy steel. Extremely strong and tough, widely used for high-performance automotive and aerospace gears, splines, and axles.'
      }
    ],
    dfm: {
      minWallThickness: '1.2 mm',
      minCornerRadius: '1.0 mm',
      threadCompliance: 'M2.5 up to M30 threads',
      tolerances: '±0.1 mm standard, up to ±0.03 mm precision',
      finishes: ['Black Oxide', 'Zinc Plating', 'Chemical Blacking', 'Powder Coating', 'As Machined']
    },
    applications: ['Industrial machinery brackets', 'Automotive gears and axles', 'Structural frames and jigs', 'Magnetic assemblies', 'Shafts and coupling pins'],
    processes: ['CNC Milling', 'CNC Turning']
  },
  'tool-steel': {
    id: 'tool-steel',
    name: 'Tool Steel',
    slug: 'tool-steel',
    category: 'Metals',
    description: 'Extreme hardness, abrasion resistance, and dimensional stability. Designed for tooling, dies, and wear components.',
    longDescription: 'Tool steels contain specific alloy concentrations (carbon, tungsten, molybdenum, chromium, vanadium) that permit extensive hardening through heat treatment. They exhibit exceptional resistance to deformation under load and maintain their sharp cutting edges, making them essential for tooling, forming dies, punches, and aerospace components.',
    iconName: 'Target',
    machinability: 2,
    strengthToWeight: 4.5,
    corrosionResistance: 2,
    relativeCost: 3.5,
    grades: [
      {
        name: 'D2',
        yieldStrength: '1500 - 2200 MPa (hardened)',
        hardness: '58 - 62 HRC',
        description: 'High-carbon, high-chromium cold work steel. Exceptional wear resistance and toughness. Retains shape after heat treatment.'
      },
      {
        name: 'H13',
        yieldStrength: '1200 - 1600 MPa (hardened)',
        hardness: '48 - 52 HRC',
        description: 'Chromium-molybdenum hot work steel. Outstanding resistance to thermal fatigue, cracking, and shock. Ideal for injection mould cavities.'
      },
      {
        name: 'O1',
        yieldStrength: '1000 - 1400 MPa (hardened)',
        hardness: '56 - 60 HRC',
        description: 'Oil-hardening cold work steel. Extremely stable during heat treatment with low distortion, making it perfect for custom fixtures.'
      }
    ],
    dfm: {
      minWallThickness: '1.5 mm',
      minCornerRadius: '2.0 mm (reduces stress concentration)',
      threadCompliance: 'M4 minimum, tap prior to hardening',
      tolerances: '±0.05 mm standard, up to ±0.015 mm precision',
      finishes: ['Heat Treatment (Hardening)', 'Black Oxide', 'Precision Grinding', 'As Machined']
    },
    applications: ['Injection mould inserts', 'Metal stamping and forming dies', 'High-wear industrial knives', 'Custom drill jigs', 'Punching tools'],
    processes: ['CNC Milling', 'Wire EDM', 'Spark Erosion']
  },
  titanium: {
    id: 'titanium',
    name: 'Titanium',
    slug: 'titanium',
    category: 'Metals',
    description: 'Exceptional strength-to-weight ratio, biocompatibility, and extreme corrosion resistance. Highly suited for extreme environments.',
    longDescription: 'Titanium is a premium engineering metal renowned for its high yield strength (comparable to high-strength steels), low density (45% lighter than steel), and total biological compatibility. Because it resists erosion and chemical attacks from saltwater, acids, and body fluids, it is the premier choice for aerospace components, medical implants, and high-performance racing.',
    iconName: 'Gauge',
    machinability: 1.5,
    strengthToWeight: 5,
    corrosionResistance: 5,
    relativeCost: 4.5,
    grades: [
      {
        name: 'Grade 5 (Ti-6Al-4V)',
        yieldStrength: '880 - 950 MPa',
        hardness: '320 - 350 HB (36 HRC)',
        description: 'The workhorse titanium alloy. Accounts for 50% of global titanium usage. Extreme mechanical strength, lightweight, and heat resistant.'
      },
      {
        name: 'Grade 2 (Commercially Pure)',
        yieldStrength: '275 - 350 MPa',
        hardness: '150 - 180 HB',
        description: 'Pure titanium. Highly formable with unparalleled corrosion resistance, although lower in strength compared to alloyed Grade 5. Biocompatible.'
      }
    ],
    dfm: {
      minWallThickness: '1.2 mm',
      minCornerRadius: '1.5 mm',
      threadCompliance: 'M3 minimum, custom thread pitch preferred',
      tolerances: '±0.1 mm standard, up to ±0.02 mm precision',
      finishes: ['As Machined', 'Bead Blast', 'Anodising (Type II / Color)', 'Polishing']
    },
    applications: ['Aerospace turbine blades', 'Biocompatible bone implants', 'Motorsport exhaust and engine valves', 'Deep-sea oil drilling valves', 'Premium wristwatch cases'],
    processes: ['CNC Milling', 'CNC Turning', 'Wire EDM']
  },
  inconel: {
    id: 'inconel',
    name: 'Inconel & Hastelloy',
    slug: 'inconel',
    category: 'Metals',
    description: 'High-temperature nickel-chromium superalloys. Retains full strength under extreme heat, oxidation, and high-pressure settings.',
    longDescription: 'Inconel superalloys are designed to survive the most abusive engineering applications. When heated, Inconel forms a thick, stable protective oxide layer that shields the underlying metal from thermal and corrosive degradation. It does not suffer from creep at high temperatures, making it a critical choice for gas turbine engines, nuclear reactors, and exhaust systems.',
    iconName: 'Flame',
    machinability: 1,
    strengthToWeight: 5,
    corrosionResistance: 5,
    relativeCost: 5.0,
    grades: [
      {
        name: 'Inconel 718',
        yieldStrength: '1000 - 1100 MPa (precipitation-hardened)',
        hardness: '360 - 400 HB (40 HRC)',
        description: 'High-strength nickel-chromium-iron alloy. Outstanding creep-rupture strength at temperatures up to 700°C. Excellent weldability.'
      },
      {
        name: 'Inconel 625',
        yieldStrength: '450 - 550 MPa',
        hardness: '200 - 240 HB',
        description: 'Highly resistant to pitting, crevice corrosion, and acid stress cracking. Best specified for high-temp exhaust systems and chemical vessels.'
      }
    ],
    dfm: {
      minWallThickness: '1.5 mm',
      minCornerRadius: '2.0 mm',
      threadCompliance: 'M4 minimum, tap with specialised tooling',
      tolerances: '±0.1 mm standard, up to ±0.03 mm precision',
      finishes: ['As Machined', 'Abrasive Blast', 'Passivation']
    },
    applications: ['Jet engine turbine blades', 'Rocket engine manifolds', 'Formula 1 exhaust systems', 'Nuclear reactor core components', 'Chemical processing valves'],
    processes: ['CNC Milling', 'Wire EDM', 'Spark Erosion']
  },
  'brass-copper': {
    id: 'brass-copper',
    name: 'Brass & Copper',
    slug: 'brass-copper',
    category: 'Metals',
    description: 'Unmatched electrical and thermal conductivity, low friction coefficients, and highly aesthetic golden/red appearances.',
    longDescription: 'Brass (copper-zinc alloy) and Copper represent the standard for conductive, decorative, and friction-reducing components. Pure Copper possesses class-leading electrical and thermal transport capabilities. Brass is highly machinable, spark-resistant, and provides excellent corrosion resistance and decorative appeal for gears, lock mechanisms, plumbing, and heatsinks.',
    iconName: 'CircleDot',
    machinability: 4.5,
    strengthToWeight: 2,
    corrosionResistance: 4,
    relativeCost: 2.2,
    grades: [
      {
        name: 'CZ121 (CW614N) Brass',
        yieldStrength: '180 - 250 MPa',
        hardness: '100 - 130 HB',
        description: 'Free-cutting leaded brass. The gold standard for rapid CNC turning. Extremely low wear on tooling. Non-magnetic.'
      },
      {
        name: 'C101 (CW004A) Copper',
        yieldStrength: '150 - 200 MPa',
        hardness: '65 - 90 HB',
        description: 'Oxygen-free high-conductivity pure copper. Superb electrical (101% IACS) and thermal performance. Highly ductile and sticky to machine.'
      }
    ],
    dfm: {
      minWallThickness: '0.8 mm (Brass) / 1.2 mm (Copper)',
      minCornerRadius: '0.8 mm',
      threadCompliance: 'M1.6 up to M24 standard threads',
      tolerances: '±0.08 mm standard, up to ±0.02 mm precision',
      finishes: ['As Machined', 'Polishing', 'Nickel Plating', 'Tin Plating', 'Clear Lacquering']
    },
    applications: ['Electrical busbars and connectors', 'Heat exchanger cores', 'Decorative architectural fittings', 'Precision low-friction gears', 'Musical instrument brackets'],
    processes: ['CNC Milling', 'CNC Turning', 'Wire EDM']
  },
  'engineering-plastics': {
    id: 'engineering-plastics',
    name: 'Engineering Plastics',
    slug: 'engineering-plastics',
    category: 'Speciality',
    description: 'Lightweight, low friction, chemical-resistant, and electrical-insulating. Extremely versatile for mechanical components.',
    longDescription: 'Advanced engineering polymers represent lightweight alternatives to metals, offering outstanding mechanical damping, high chemical resistance, self-lubrication, and excellent dielectric characteristics. Ranging from versatile Acetal/Delrin to aerospace-grade PEEK, these plastics are highly machinable and cost-effective.',
    iconName: 'Cpu',
    machinability: 5,
    strengthToWeight: 3.5, // relative to plastic density
    corrosionResistance: 5,
    relativeCost: 2.0, // varies from Delrin ($) to PEEK ($$$$$)
    grades: [
      {
        name: 'PEEK (Polyetheretherketone)',
        yieldStrength: '100 MPa (extreme for plastic)',
        hardness: 'M100 Rockwell',
        description: 'High-performance medical and aerospace polymer. Retains mechanical strength up to 250°C. Biocompatible, sterile, chemically inert.'
      },
      {
        name: 'Acetal / Delrin (POM)',
        yieldStrength: '65 MPa',
        hardness: 'M85 Rockwell',
        description: 'The premier CNC plastic. Highly rigid, dimensional stability, low water absorption, and low coefficient of friction. Easy to machine.'
      },
      {
        name: 'Nylon 6 (PA6)',
        yieldStrength: '80 MPa',
        hardness: 'R115 Rockwell',
        description: 'Tough, strong, and highly resistant to abrasion and impact. Tends to absorb moisture, leading to dimensional swelling over time.'
      },
      {
        name: 'PTFE (Teflon)',
        yieldStrength: '25 MPa',
        hardness: 'D55 Shore',
        description: 'Ultra-low friction coefficient, extreme operating temperature window (-200°C to +260°C), and absolute resistance to chemicals.'
      }
    ],
    dfm: {
      minWallThickness: '1.2 mm (prevents warping/deflection)',
      minCornerRadius: '0.8 mm',
      threadCompliance: 'M4 minimum, thread inserts (Helicoils) recommended for load-bearing applications',
      tolerances: '±0.15 mm standard (due to thermal expansion)',
      finishes: ['As Machined (satin, clean finish)', 'Vapour Polishing', 'Bead Blast']
    },
    applications: ['Low-friction guide rollers and bushings', 'PEEK surgical implant trials', 'Electrical insulation blocks', 'Chemical pump impellers', 'Prototyping mechanical gears'],
    processes: ['CNC Milling', 'CNC Turning']
  }
}
