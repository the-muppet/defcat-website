export type ProductCategory = 'Apparel' | 'MTG Accessories' | 'Gaming Accessories' | 'Luxury Items'

export interface Product {
  id: string
  name: string
  category: ProductCategory
  description: string
  discountCode?: string
  link: string
  imageUrl?: string
  isActive?: boolean
}

/**
 * Product catalog for the discount store
 *
 * To add products:
 * 1. Go to /admin/settings and add affiliate links
 * 2. Add products to this array with those links
 *
 * Example:
 * {
 *   id: "playmat-bundle",
 *   name: "MTG Playmat Bundle",
 *   category: "MTG Accessories",
 *   description: "Premium playmats with discount code",
 *   discountCode: "DEFCAT20",
 *   link: process.env.NEXT_PUBLIC_PLAYMAT_LINK || "#",
 *   isActive: true
 * }
 */
export const products: Product[] = []
