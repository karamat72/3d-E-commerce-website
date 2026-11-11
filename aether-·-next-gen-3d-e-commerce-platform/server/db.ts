import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'admin' | 'customer';
  passwordHash: string;
  createdAt: string;
  phone?: string;
  addresses?: Array<{
    id: string;
    label: string;
    recipient: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    isDefault?: boolean;
  }>;
  isActive: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  colorHex: string;
  finish: string;
  sku: string;
  inStock: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: 'audio' | 'wearables' | 'drones' | 'computing' | 'accessories';
  image: string;
  modelType: 'headset' | 'watch' | 'drone' | 'cyberdeck' | 'sphere' | 'glove';
  stock: number;
  rating: number;
  reviewCount: number;
  variants: ProductVariant[];
  specs: Record<string, string>;
  features: string[];
  isFeatured?: boolean;
  isNewArrival?: boolean;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  variantId?: string;
  variantName?: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode?: string;
  shippingAddress: {
    recipient: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  paymentMethod: 'credit_card' | 'crypto' | 'neural_pay';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  orderStatus: 'Processing' | 'Neural Assembly' | 'Quality Check' | 'Shipped' | 'Delivered' | 'Cancelled';
  trackingNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  amount: number;
  minOrderValue: number;
  validUntil: string;
  usageCount: number;
  isActive: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
  verifiedPurchase: boolean;
}

interface DatabaseSchema {
  users: User[];
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
  reviews: Review[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

class DatabaseStore {
  private data: DatabaseSchema = {
    users: [],
    products: [],
    orders: [],
    coupons: [],
    reviews: []
  };

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
        // Ensure default admin user always exists and has valid hash
        this.ensureAdminUser();
        // Ensure initial products exist
        this.ensureInitialProducts();
        return;
      } catch (err) {
        console.error('Failed to parse db.json, re-seeding...', err);
      }
    }

    this.seedInitialData();
    this.save();
  }

  private ensureAdminUser() {
    const adminIndex = this.data.users.findIndex(u => u.username === 'karamat');
    const salt = bcrypt.genSaltSync(10);
    const adminHash = bcrypt.hashSync('12345678', salt);

    if (adminIndex === -1) {
      this.data.users.push({
        id: 'usr_admin_karamat',
        username: 'karamat',
        email: 'karamat@aether.luxury',
        name: 'Karamat Raza',
        role: 'admin',
        passwordHash: adminHash,
        createdAt: new Date().toISOString(),
        isActive: true
      });
      this.save();
    }
  }

  private ensureInitialProducts() {
    if (this.data.products.length === 0) {
      this.seedProducts();
      this.save();
    }
  }

  private seedProducts() {
    this.data.products = [
      {
        id: 'prod_aether_x',
        name: 'AETHER-X Neural Headset',
        slug: 'aether-x-neural-headset',
        tagline: 'Zero-latency neural synaptic acoustic precision',
        description: 'Engineered with titanium acoustic cavities, bio-adaptive memory foam, and a 64-bit neural DSP core. Delivers studio master-grade holographic sound staging with zero perceptible latency.',
        price: 899,
        originalPrice: 1099,
        category: 'audio',
        image: '/src/assets/images/hero_neural_headset_1794404342271.jpg',
        modelType: 'headset',
        stock: 42,
        rating: 4.9,
        reviewCount: 128,
        isFeatured: true,
        isNewArrival: false,
        createdAt: new Date().toISOString(),
        variants: [
          { id: 'v_titanium', name: 'Obsidian Titanium', colorHex: '#1E293B', finish: 'Brushed PVD', sku: 'AETH-X-OBS', inStock: true },
          { id: 'v_cyan', name: 'Cyber Cyan', colorHex: '#06B6D4', finish: 'Anodized Gloss', sku: 'AETH-X-CYA', inStock: true },
          { id: 'v_silver', name: 'Stellar Silver', colorHex: '#E2E8F0', finish: 'Satin Chrome', sku: 'AETH-X-SLV', inStock: true },
          { id: 'v_amber', name: 'Ionized Amber', colorHex: '#F59E0B', finish: 'Electro-Bronze', sku: 'AETH-X-AMB', inStock: true }
        ],
        specs: {
          'Frequency Response': '2 Hz – 52,000 Hz',
          'Transducer': '50mm Beryllium-Graphite Planar',
          'Battery Life': '48 Hours Active Neural ANC',
          'Weight': '295 grams',
          'Connectivity': 'Ultra-Wideband RF & Quantum 6.0'
        },
        features: [
          'Direct bio-resonance spatial tracking',
          'Exploded multi-chamber acoustics',
          'Tactile haptic dial with digital resistance',
          'Medical-grade antimicrobial ear cushions'
        ]
      },
      {
        id: 'prod_chrono_pulse',
        name: 'CHRONO-PULSE Spatial Timepiece',
        slug: 'chrono-pulse-timepiece',
        tagline: 'Volumetric sapphire holographic horology',
        description: 'A fusion of haute horlogerie and quantum photonics. The CHRONO-PULSE projects a floating micro-hologram dial while housing a tourbillon movement encased in Grade-5 forged carbon and obsidian titanium.',
        price: 1450,
        originalPrice: 1750,
        category: 'wearables',
        image: '/src/assets/images/product_chrono_pulse_1794404341926.jpg',
        modelType: 'watch',
        stock: 18,
        rating: 4.95,
        reviewCount: 84,
        isFeatured: true,
        isNewArrival: true,
        createdAt: new Date().toISOString(),
        variants: [
          { id: 'v_obsidian', name: 'Obsidian Dark', colorHex: '#0F172A', finish: 'Forged Carbon', sku: 'CHRN-PL-OBS', inStock: true },
          { id: 'v_platinum', name: 'Liquid Platinum', colorHex: '#CBD5E1', finish: 'Mirror Polish', sku: 'CHRN-PL-PLT', inStock: true },
          { id: 'v_gold', name: 'Rose Gold Aureum', colorHex: '#D97706', finish: '18K Satin PVD', sku: 'CHRN-PL-GLD', inStock: true }
        ],
        specs: {
          'Display': '1.8-inch Micro-OLED + True Volumetric Lightfield',
          'Chassis': 'Obsidian Grade-5 Titanium',
          'Water Resistance': '10 ATM (100 meters)',
          'Sensors': 'ECG, Biometric Vitals, Neural Sync',
          'Runtime': '7 Days Neural Mode'
        },
        features: [
          'True 3D floating holographic dial',
          'Tourbillon mechanical escapement simulation',
          'Titanium mesh link bracelet with quick-swap latch',
          'Inductive ceramic wireless charging base'
        ]
      },
      {
        id: 'prod_nexus_drone',
        name: 'NEXUS Spatial Recon Drone',
        slug: 'nexus-spatial-recon-drone',
        tagline: 'Autonomous AI quad-rotor with dual LiDAR scanner',
        description: 'Designed for cinematic creators and geospatial explorers. Features toroidal carbon-fiber silent rotors, collision evasion sensors, and an optical 8K stabilized gimbal camera.',
        price: 2199,
        originalPrice: 2499,
        category: 'drones',
        image: '/src/assets/images/product_nexus_drone_1794404344490.jpg',
        modelType: 'drone',
        stock: 12,
        rating: 4.88,
        reviewCount: 62,
        isFeatured: true,
        isNewArrival: false,
        createdAt: new Date().toISOString(),
        variants: [
          { id: 'v_carbon', name: 'Stealth Carbon', colorHex: '#18181B', finish: '3K Twill Matte', sku: 'NX-DR-STH', inStock: true },
          { id: 'v_white', name: 'Arctic Ghost', colorHex: '#F8FAFC', finish: 'Ceramic Composite', sku: 'NX-DR-ARC', inStock: true }
        ],
        specs: {
          'Max Speed': '94 km/h (Sport Mode)',
          'Flight Time': '52 Minutes',
          'Sensor Array': '360° Solid-state LiDAR + ToF',
          'Transmission Range': '18 km Ultra-HD Link',
          'Payload Capacity': '1.2 kg'
        },
        features: [
          'Toroidal silent aerodynamic ducted rotors',
          'Autonomous waypoint follow & neural orbit',
          'Retractable magnetic landing gear',
          'Live 3D point-cloud spatial reconstruction'
        ]
      },
      {
        id: 'prod_cyber_deck',
        name: 'CYBER-SLATE Quantum Terminal',
        slug: 'cyber-slate-quantum-terminal',
        tagline: 'Tactile mechanical cyberdeck with holographic HUD',
        description: 'The definitive tool for hardware hackers, system architects, and creative coders. CNC-milled magnesium chassis with hot-swappable magnetic mechanical switches and floating heads-up display.',
        price: 1850,
        originalPrice: 2050,
        category: 'computing',
        image: '/src/assets/images/product_cyber_deck_1794404344239.jpg',
        modelType: 'cyberdeck',
        stock: 25,
        rating: 4.92,
        reviewCount: 76,
        isFeatured: true,
        isNewArrival: true,
        createdAt: new Date().toISOString(),
        variants: [
          { id: 'v_magnesium', name: 'Raw Magnesium', colorHex: '#334155', finish: 'Bead-Blasted', sku: 'CYB-SL-RAW', inStock: true },
          { id: 'v_deepblack', name: 'Vanta Night', colorHex: '#020617', finish: 'Micro-Anodized', sku: 'CYB-SL-VNT', inStock: true }
        ],
        specs: {
          'Processor': 'Aether Q-Engine Octa-Core',
          'Keycaps': 'Double-shot PBT low-profile linear',
          'Ports': '4x Thunderbolt 5, Dual SFP+ Optical, GPIO',
          'Battery': '99.8Wh Airline Safe Fast-Charge',
          'Display': '12.6" Transparent AMOLED 120Hz'
        },
        features: [
          'Customizable holographic status display',
          'Dual machined aluminum rotary encoders',
          'Integrated hardware crypto security enclave',
          'Magnetic expansion bay for sensor modules'
        ]
      },
      {
        id: 'prod_sphere_zero',
        name: 'SPHERE-ZERO Levitation Sound Orb',
        slug: 'sphere-zero-levitation-sound-orb',
        tagline: 'Zero-friction magnetic levitation acoustic sculpture',
        description: 'A centerpiece of acoustic engineering. The acoustic orb hovers seamlessly in magnetic suspension above its induction base, eradicating mechanical vibration distortion for pure omnidirectional 360 audio.',
        price: 649,
        originalPrice: 799,
        category: 'audio',
        image: '/src/assets/images/product_sphere_zero_1794404344238.jpg',
        modelType: 'sphere',
        stock: 35,
        rating: 4.85,
        reviewCount: 94,
        isFeatured: false,
        isNewArrival: false,
        createdAt: new Date().toISOString(),
        variants: [
          { id: 'v_smoked', name: 'Smoked Quartz', colorHex: '#475569', finish: 'Smoked Glass & Titanium', sku: 'SPH-0-SMK', inStock: true },
          { id: 'v_lunar', name: 'Lunar White', colorHex: '#F1F5F9', finish: 'Matte Ceramic', sku: 'SPH-0-LNR', inStock: true }
        ],
        specs: {
          'Acoustic Driver': '3.5" Neodymium Woofer + Dual Ribbon Tweeters',
          'Output Power': '80W RMS / 140W Peak',
          'Levitation Gap': '24mm Magnetic Air Gap',
          'Connectivity': 'Lossless Wi-Fi 7, AirPlay 3, Bluetooth 5.4',
          'Lighting': '360° Ambient Sound-Reactive Halo'
        },
        features: [
          'Zero contact chassis elimination of acoustic resonance',
          'Continuous wireless power induction',
          'Multi-room stereo pairing',
          'Gesture proximity volume & track control'
        ]
      },
      {
        id: 'prod_exo_arm',
        name: 'EXO-SYNAPSE Haptic Glove',
        slug: 'exo-synapse-haptic-glove',
        tagline: 'Sub-millimeter micro-hydraulic haptic feedback',
        description: 'Touch and manipulate digital objects as if physical. Titanium exoskeleton tendons provide variable resistance force feedback up to 40 Newtons per finger.',
        price: 1120,
        originalPrice: 1350,
        category: 'accessories',
        image: '/src/assets/images/hero_neural_headset_1794404342271.jpg',
        modelType: 'glove',
        stock: 15,
        rating: 4.79,
        reviewCount: 41,
        isFeatured: false,
        isNewArrival: true,
        createdAt: new Date().toISOString(),
        variants: [
          { id: 'v_stealth', name: 'Cyber Stealth', colorHex: '#1E293B', finish: 'Carbon & Polymer', sku: 'EXO-SYN-STL', inStock: true },
          { id: 'v_crimson', name: 'Apex Crimson', colorHex: '#991B1B', finish: 'Anodized Red', sku: 'EXO-SYN-RED', inStock: true }
        ],
        specs: {
          'Force Feedback': '40N Active Resistance per digit',
          'Tracking': '6DoF Optical + IMU Sub-millimeter',
          'Weight': '210 grams',
          'Compatibility': 'OpenXR, SteamVR, WebXR Native',
          'Battery': '14 Hours Continuous'
        },
        features: [
          'Micro-fluidic force feedback valves',
          'Thermal skin emulation (hot/cold sensations)',
          'Breathable conductive smart textile',
          'Quick-release magnetic wrist cuffs'
        ]
      }
    ];
  }

  private seedInitialData() {
    const salt = bcrypt.genSaltSync(10);
    const adminHash = bcrypt.hashSync('12345678', salt);
    const customerHash = bcrypt.hashSync('alex1234', salt);

    this.data.users = [
      {
        id: 'usr_admin_karamat',
        username: 'karamat',
        email: 'karamat@aether.luxury',
        name: 'Karamat Raza',
        role: 'admin',
        passwordHash: adminHash,
        createdAt: new Date('2026-01-10').toISOString(),
        isActive: true
      },
      {
        id: 'usr_cust_alex',
        username: 'alex_vance',
        email: 'alex@aether.luxury',
        name: 'Alex Vance',
        role: 'customer',
        passwordHash: customerHash,
        phone: '+1 (555) 234-8901',
        createdAt: new Date('2026-02-14').toISOString(),
        isActive: true,
        addresses: [
          {
            id: 'addr_1',
            label: 'Headquarters Lab',
            recipient: 'Alex Vance',
            street: '742 Cybernetic Way, Suite 400',
            city: 'San Francisco',
            state: 'CA',
            zip: '94107',
            country: 'United States',
            isDefault: true
          }
        ]
      }
    ];

    this.seedProducts();

    this.data.coupons = [
      {
        id: 'coup_cyber20',
        code: 'CYBER20',
        type: 'percentage',
        amount: 20,
        minOrderValue: 200,
        validUntil: '2026-12-31',
        usageCount: 45,
        isActive: true
      },
      {
        id: 'coup_neural50',
        code: 'NEURAL50',
        type: 'fixed',
        amount: 50,
        minOrderValue: 500,
        validUntil: '2026-12-31',
        usageCount: 19,
        isActive: true
      },
      {
        id: 'coup_welcome10',
        code: 'WELCOME10',
        type: 'percentage',
        amount: 10,
        minOrderValue: 100,
        validUntil: '2026-12-31',
        usageCount: 120,
        isActive: true
      }
    ];

    this.data.orders = [
      {
        id: 'ord_1001',
        orderNumber: 'AETH-98241',
        userId: 'usr_cust_alex',
        customerName: 'Alex Vance',
        customerEmail: 'alex@aether.luxury',
        items: [
          {
            productId: 'prod_aether_x',
            name: 'AETHER-X Neural Headset',
            image: '/src/assets/images/hero_neural_headset_1794404342271.jpg',
            variantId: 'v_titanium',
            variantName: 'Obsidian Titanium',
            price: 899,
            quantity: 1
          }
        ],
        subtotal: 899,
        discount: 179.8,
        shipping: 0,
        total: 719.2,
        couponCode: 'CYBER20',
        shippingAddress: {
          recipient: 'Alex Vance',
          street: '742 Cybernetic Way, Suite 400',
          city: 'San Francisco',
          state: 'CA',
          zip: '94107',
          country: 'United States'
        },
        paymentMethod: 'neural_pay',
        paymentStatus: 'paid',
        orderStatus: 'Delivered',
        trackingNumber: 'AETH-TRK-7849104',
        createdAt: new Date('2026-03-01T10:15:00Z').toISOString(),
        updatedAt: new Date('2026-03-04T14:30:00Z').toISOString()
      },
      {
        id: 'ord_1002',
        orderNumber: 'AETH-98319',
        userId: 'usr_cust_alex',
        customerName: 'Alex Vance',
        customerEmail: 'alex@aether.luxury',
        items: [
          {
            productId: 'prod_chrono_pulse',
            name: 'CHRONO-PULSE Spatial Timepiece',
            image: '/src/assets/images/product_chrono_pulse_1794404341926.jpg',
            variantId: 'v_obsidian',
            variantName: 'Obsidian Dark',
            price: 1450,
            quantity: 1
          }
        ],
        subtotal: 1450,
        discount: 0,
        shipping: 0,
        total: 1450,
        shippingAddress: {
          recipient: 'Alex Vance',
          street: '742 Cybernetic Way, Suite 400',
          city: 'San Francisco',
          state: 'CA',
          zip: '94107',
          country: 'United States'
        },
        paymentMethod: 'credit_card',
        paymentStatus: 'paid',
        orderStatus: 'Shipped',
        trackingNumber: 'AETH-TRK-8921345',
        createdAt: new Date('2026-03-08T09:40:00Z').toISOString(),
        updatedAt: new Date('2026-03-09T11:00:00Z').toISOString()
      },
      {
        id: 'ord_1003',
        orderNumber: 'AETH-98402',
        userId: 'usr_cust_alex',
        customerName: 'Alex Vance',
        customerEmail: 'alex@aether.luxury',
        items: [
          {
            productId: 'prod_sphere_zero',
            name: 'SPHERE-ZERO Levitation Sound Orb',
            image: '/src/assets/images/product_sphere_zero_1794404344238.jpg',
            variantId: 'v_smoked',
            variantName: 'Smoked Quartz',
            price: 649,
            quantity: 1
          }
        ],
        subtotal: 649,
        discount: 50,
        shipping: 0,
        total: 599,
        couponCode: 'NEURAL50',
        shippingAddress: {
          recipient: 'Alex Vance',
          street: '742 Cybernetic Way, Suite 400',
          city: 'San Francisco',
          state: 'CA',
          zip: '94107',
          country: 'United States'
        },
        paymentMethod: 'crypto',
        paymentStatus: 'paid',
        orderStatus: 'Neural Assembly',
        trackingNumber: 'AETH-TRK-9018423',
        createdAt: new Date('2026-03-10T16:20:00Z').toISOString(),
        updatedAt: new Date('2026-03-10T16:20:00Z').toISOString()
      }
    ];

    this.data.reviews = [
      {
        id: 'rev_1',
        productId: 'prod_aether_x',
        userId: 'usr_cust_alex',
        userName: 'Elena Rostova',
        rating: 5,
        title: 'Transformational holographic acoustic depth',
        comment: 'The sub-bass separation and neural latency compensation make standard studio monitors sound flat. The titanium architecture feels featherlight.',
        createdAt: new Date('2026-03-02').toISOString(),
        verifiedPurchase: true
      },
      {
        id: 'rev_2',
        productId: 'prod_aether_x',
        userId: 'usr_2',
        userName: 'Dr. Marcus Vance',
        rating: 5,
        title: 'Masterpiece of industrial design',
        comment: 'Inspected the exploded components in 3D prior to purchase. The actual physical unit matches the render with Swiss watch precision.',
        createdAt: new Date('2026-03-05').toISOString(),
        verifiedPurchase: true
      },
      {
        id: 'rev_3',
        productId: 'prod_chrono_pulse',
        userId: 'usr_3',
        userName: 'Kenji Takahashi',
        rating: 5,
        title: 'Floating holographic display is unreal',
        comment: 'People stop me constantly asking about the floating lightfield clock dial. High precision titanium finish and rapid magnetic charging.',
        createdAt: new Date('2026-03-06').toISOString(),
        verifiedPurchase: true
      }
    ];
  }

  public save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write to db.json:', err);
    }
  }

  // Collections access
  public getUsers() { return this.data.users; }
  public getProducts() { return this.data.products; }
  public getOrders() { return this.data.orders; }
  public getCoupons() { return this.data.coupons; }
  public getReviews() { return this.data.reviews; }
}

export const db = new DatabaseStore();
