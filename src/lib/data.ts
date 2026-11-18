export const company = {
  name: "Marine Supply",
  email: "info@marinesupply.example",
  phone: "",
  address: "",
  intro:
    "We help customers find marine equipment and coordinate their orders through direct, personal communication."
};

export type Product = {
  id: string;
  name: string;
  partNumber: string;
  category: string;
  description: string;
  specifications: Record<string, string>;
  sellingUnit: string;
  stock: number;
  lowStockThreshold: number;
  published: boolean;
  archived: boolean;
  image: string;
};

export const categories = [
  "Safety equipment",
  "Deck equipment",
  "Engine parts",
  "Electrical equipment"
];

export const demoProducts: Product[] = [
  {
    id: "life-ring-01",
    name: "SOLAS Life Ring",
    partNumber: "LR-750-OR",
    category: "Safety equipment",
    description: "High-visibility marine life ring for commercial and recreational vessels.",
    specifications: { Diameter: "750 mm", Material: "UV-resistant polyethylene", Approval: "SOLAS style" },
    sellingUnit: "piece",
    stock: 18,
    lowStockThreshold: 5,
    published: true,
    archived: false,
    image: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: "mooring-rope-01",
    name: "Double-Braided Mooring Rope",
    partNumber: "MBR-16-50",
    category: "Deck equipment",
    description: "Flexible and durable mooring rope with excellent handling characteristics.",
    specifications: { Diameter: "16 mm", Length: "50 m", Construction: "Double braid" },
    sellingUnit: "coil",
    stock: 9,
    lowStockThreshold: 3,
    published: true,
    archived: false,
    image: "https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: "fuel-filter-01",
    name: "Marine Fuel Filter",
    partNumber: "FF-10-2MIC",
    category: "Engine parts",
    description: "Replacement fuel filtration element for compatible marine engine systems.",
    specifications: { Filtration: "2 micron", Port: "10 mm", Service: "Replaceable element" },
    sellingUnit: "piece",
    stock: 3,
    lowStockThreshold: 5,
    published: true,
    archived: false,
    image: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: "nav-light-01",
    name: "LED Navigation Light",
    partNumber: "NL-LED-12",
    category: "Electrical equipment",
    description: "Low-power LED navigation light with a compact marine housing.",
    specifications: { Voltage: "12-24 VDC", Wattage: "8 W", Mount: "Deck or bracket" },
    sellingUnit: "piece",
    stock: 0,
    lowStockThreshold: 4,
    published: true,
    archived: false,
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85"
  }
];
