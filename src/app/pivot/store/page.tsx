"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Tag, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { products, type ProductCategory } from "@/data/products"

const categories = ["All", "Apparel", "MTG Accessories", "Gaming Accessories", "Luxury Items"] as const
type Category = typeof categories[number]

export default function DiscountStorePage() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("All")

  const filteredProducts = useMemo(() => {
    const activeProducts = products.filter(p => p.isActive !== false)
    return selectedCategory === "All"
      ? activeProducts
      : activeProducts.filter(p => p.category === selectedCategory)
  }, [selectedCategory])

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(farthest-corner at 50% 0%, var(--bg-tinted) 0%, var(--background) 100%)'
        }}
      />

      <div className="relative">
        <section className="pt-24 pb-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <ShoppingBag className="h-12 w-12" style={{ color: 'var(--mana-color)' }} />
                <h1
                  className="text-5xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r"
                  style={{
                    backgroundImage: `linear-gradient(to right, var(--gradient-start), var(--gradient-end))`
                  }}
                >
                  DefCat's Discount Store
                </h1>
              </div>
              <p className="text-xl text-muted-foreground">
                Exclusive discounts on gaming gear and accessories
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    selectedCategory === category && "btn-tinted-primary shadow-tinted-glow"
                  )}
                >
                  {category}
                </Button>
              ))}
            </div>

            {/* Products Grid - 4 per row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="glass border-white/10 bg-card-tinted flex flex-col">
                  <CardHeader>
                    <div className="aspect-square bg-muted/30 rounded-lg mb-4 flex items-center justify-center">
                      <Tag className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription className="text-xs uppercase tracking-wider">
                      {product.category}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <p className="text-sm text-muted-foreground mb-4 flex-1">
                      {product.description}
                    </p>

                    {product.discountCode && (
                      <div className="mb-4 p-3 rounded-lg border border-white/10 bg-muted/20">
                        <p className="text-xs text-muted-foreground mb-1">Discount Code:</p>
                        <code className="text-sm font-bold" style={{ color: 'var(--mana-color)' }}>
                          {product.discountCode}
                        </code>
                      </div>
                    )}

                    <Button
                      asChild
                      className="w-full btn-tinted-primary"
                    >
                      <a href={product.link} target="_blank" rel="noopener noreferrer">
                        View Deal
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products found in this category.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
