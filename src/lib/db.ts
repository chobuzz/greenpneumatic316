
import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'src/data/db.json');

export interface ProductModel {
    name: string;
    price: number;
    description?: string;
    quotationDisabled?: boolean;
}

export type MediaItemType = 'youtube' | 'embed' | 'link' | 'image';

export interface MediaItem {
    type: MediaItemType;
    url: string;
    title?: string;
    thumbnail?: string;
}

export interface ProductOptionGroup {
    name: string;
    allowMultiSelect: boolean;
    isRequired?: boolean; // Required vs Optional
    options: ProductOption[];
}

export interface ProductOption {
    name: string;
    price: number;
    description?: string;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    categoryIds?: string[]; // Multiple categories
    businessUnitIds?: string[]; // Multiple business units
    specifications?: string; // Markdown or HTML
    images: string[];
    models?: ProductModel[]; // Multiple model options with price
    optionGroups?: ProductOptionGroup[]; // Multiple groups of options
    specImages?: string[]; // Multiple detail/catalog images
    mediaItems?: MediaItem[]; // Rich media embeds
    mediaPosition?: 'top' | 'bottom'; // Position of media relative to spec images
}

export interface Inquiry {
    id: string;
    createdAt: string;
    name: string;
    company: string;
    phone: string;
    email: string;
    subject: string;
    message: string;
    marketingConsent: boolean;
}

export interface BusinessUnit {
    id: string;
    name: string;
    description: string;
    image: string;
    bannerImage?: string;
    homepageUrl?: string; // Add homepage link
    products: Product[];
    order?: number;
    color?: string; // Tailwind color class
}

export interface Category {
    id: string;
    name: string;
    businessUnitId: string;
    image?: string;
    icon?: string;
    order?: number;
    parentId?: string;
}

export interface Quotation {
    id: string;
    createdAt: string;
    customerName: string;
    company: string;
    phone: string;
    email: string;
    productName: string;
    modelName: string;
    selectedModel?: { name: string, price: number };
    selectedOptions: { groupName: string, name: string, price: number }[];
    quantity: number;
    totalPrice: number;
    unitName: string;
    marketingConsent: boolean;
}

export interface Insight {
    id: string;
    title: string;
    description: string;
    image: string;
    externalUrl?: string;
    businessUnitId?: string;
    createdAt: string;
    order?: number;
}

export interface EmailSettings {
    subject: string;
    body: string;
    senderAddress: string;
    senderPhone: string;
    isAd: boolean;
}

export interface Database {
    businessUnits: BusinessUnit[];
    categories: Category[];
    quotations: Quotation[];
    inquiries: Inquiry[];
    insights: Insight[];
    emailSettings: EmailSettings;
}

// Helper to read DB
export async function readDb(): Promise<Database> {
    try {
        const data = await fs.readFile(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist, return default structure (or create it)
        return {
            businessUnits: [],
            categories: [],
            quotations: [],
            inquiries: [],
            insights: [],
            emailSettings: {
                subject: "그린뉴메틱에서 소식을 전해드립니다",
                body: "안녕하세요, {name} 고객님.\n\n그린뉴메틱의 새로운 솔루션을 확인해보세요.",
                senderAddress: "경기도 양평군 다래길 27",
                senderPhone: "010-7392-9809",
                isAd: true
            }
        };
    }
}

// Helper to write DB
export async function writeDb(data: Database): Promise<void> {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}
