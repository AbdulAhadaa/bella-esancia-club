export interface ShopifyProduct {
  id: string;
  title: string;
  description: string;
  handle: string;
  vendor: string;
  productType: string;
  tags: string[];
  featuredImage?: {
    url: string;
    altText: string;
  };
  images?: {
    edges: Array<{
      node: {
        url: string;
        altText: string;
      };
    }>;
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        price: {
          amount: string;
          currencyCode: string;
        };
        availableForSale: boolean;
      };
    }>;
  };
}

export interface ProductFilter {
  brand?: string;
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export interface CategoryConfig {
  name: string;
  slug: string;
  subcategories: SubcategoryConfig[];
}

export interface SubcategoryConfig {
  name: string;
  slug: string;
  tags: string[];
}

export const CATEGORIES: CategoryConfig[] = [
  {
    name: 'Skincare',
    slug: 'skincare',
    subcategories: [
      { name: 'Limpiadores', slug: 'limpiadores', tags: ['cleanser', 'cleansing', 'limpiador'] },
      { name: 'Exfoliantes', slug: 'exfoliantes', tags: ['exfoliant', 'scrub', 'exfoliante'] },
      { name: 'Tónicos', slug: 'tonicos', tags: ['toner', 'tonic', 'tonico'] },
      { name: 'Esencias', slug: 'esencias', tags: ['essence', 'esencia'] },
      { name: 'Sérums/Ampollas', slug: 'serums-ampollas', tags: ['serum', 'ampoule', 'ampolla'] },
      { name: 'Mascarillas', slug: 'mascarillas', tags: ['mask', 'sheet mask', 'mascarilla'] },
      { name: 'Contorno de ojos', slug: 'contorno-ojos', tags: ['eye cream', 'eye care', 'contorno'] },
      { name: 'Cremas', slug: 'cremas', tags: ['moisturizer', 'cream', 'crema'] },
      { name: 'Protectores solares', slug: 'protectores-solares', tags: ['sunscreen', 'spf', 'protector solar'] },
      { name: 'Beauty Tools', slug: 'beauty-tools', tags: ['tool', 'device', 'herramienta'] },
      { name: 'Miniaturas', slug: 'miniaturas', tags: ['mini', 'travel size', 'miniatura'] }
    ]
  },
  {
    name: 'Makeup',
    slug: 'makeup',
    subcategories: [
      { name: 'Rostro', slug: 'rostro', tags: ['foundation', 'concealer', 'powder'] },
      { name: 'Ojos', slug: 'ojos', tags: ['eyeshadow', 'eyeliner', 'mascara'] },
      { name: 'Labios', slug: 'labios', tags: ['lipstick', 'lip gloss', 'lip tint'] },
      { name: 'Cejas', slug: 'cejas', tags: ['brow', 'eyebrow'] }
    ]
  },
  {
    name: 'Hair',
    slug: 'hair',
    subcategories: [
      { name: 'Shampoo', slug: 'shampoo', tags: ['shampoo'] },
      { name: 'Acondicionador', slug: 'acondicionador', tags: ['conditioner'] },
      { name: 'Mascarillas', slug: 'mascarillas-cabello', tags: ['hair mask'] },
      { name: 'Tratamientos', slug: 'tratamientos-cabello', tags: ['hair treatment'] }
    ]
  },
  {
    name: 'Body',
    slug: 'body',
    subcategories: [
      { name: 'Manos', slug: 'manos', tags: ['hand cream', 'hand care'] },
      { name: 'Pies', slug: 'pies', tags: ['foot cream', 'foot care'] },
      { name: 'Cuerpo', slug: 'cuerpo', tags: ['body lotion', 'body care'] },
      { name: 'Tratamientos corporales', slug: 'tratamientos-corporales', tags: ['body treatment'] }
    ]
  }
];