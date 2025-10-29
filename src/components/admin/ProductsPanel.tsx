'use client'

import { AlertCircle, Package, Plus, Save, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { GlowingEffect } from '@/components/ui/glowEffect'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'

interface Product {
  id: string
  key: string
  name: string
  description: string | null
  link: string
  image_url: string | null
  category: string | null
  is_active: boolean
  sort_order: number
  created_at: string
}

export function ProductsPanel() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadProducts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('sort_order', { ascending: true })

      if (error) throw error

      setProducts(data || [])
    } catch (err) {
      console.error('Error loading products:', err)
      setError(err instanceof Error ? err.message : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: `temp-${Date.now()}`,
      key: `product-${Date.now()}`,
      name: '',
      description: null,
      link: '',
      image_url: null,
      category: null,
      is_active: true,
      sort_order: products.length,
      created_at: new Date().toISOString(),
    }
    setProducts([...products, newProduct])
  }

  const handleUpdateProduct = (id: string, field: keyof Product, value: any) => {
    setProducts(products.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
  }

  const handleSaveProduct = async (product: Product) => {
    setSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const isNew = product.id.startsWith('temp-')

      if (isNew) {
        // Insert new product
        const response = await fetch('/api/admin/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            key: product.key,
            name: product.name,
            description: product.description,
            link: product.link,
            image_url: product.image_url,
            category: product.category,
            is_active: product.is_active,
            sort_order: product.sort_order,
          }),
        })

        const data = await response.json()
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to create product')
        }

        setSuccessMessage('Product created successfully!')
        setTimeout(() => setSuccessMessage(null), 3000)

        // Reload to get the real ID
        await loadProducts()
      } else {
        // Update existing product
        const response = await fetch('/api/admin/products', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            id: product.id,
            key: product.key,
            name: product.name,
            description: product.description,
            link: product.link,
            image_url: product.image_url,
            category: product.category,
            is_active: product.is_active,
            sort_order: product.sort_order,
          }),
        })

        const data = await response.json()
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to update product')
        }

        setSuccessMessage('Product updated successfully!')
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    } catch (err) {
      console.error('Save error:', err)
      setError(err instanceof Error ? err.message : 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    setError(null)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete product')
      }

      setProducts(products.filter((p) => p.id !== id))
    } catch (err) {
      console.error('Delete error:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete product')
    }
  }

  if (loading) {
    return (
      <div className="relative rounded-2xl border p-2 md:rounded-3xl md:p-3">
        <GlowingEffect
          blur={0}
          borderWidth={3}
          spread={80}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
        />
        <Card className="card-glass border-0 relative">
          <CardContent className="py-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-tinted border-t-transparent rounded-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="p-4 bg-green-500/10 border border-green-500 rounded-lg">
          <p className="text-sm text-green-500">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button onClick={handleAddProduct} className="btn-tinted-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {error && (
        <div className="relative rounded-2xl border border-destructive/50 p-2 md:rounded-3xl md:p-3">
          <GlowingEffect
            blur={0}
            borderWidth={3}
            spread={80}
            glow={true}
            disabled={false}
            proximity={64}
            inactiveZone={0.01}
          />
          <Card className="border-0 bg-destructive/10 relative">
            <CardContent className="py-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm">{error}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Accordion type="multiple" className="space-y-4">
        {products.map((product) => (
          <AccordionItem key={product.id} value={product.id} className="border-none">
            <div className="relative rounded-2xl border p-2 md:rounded-3xl md:p-3">
              <GlowingEffect
                blur={0}
                borderWidth={3}
                spread={80}
                glow={true}
                disabled={false}
                proximity={64}
                inactiveZone={0.01}
              />
              <Card className="card-glass border-0 relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <AccordionTrigger className="hover:no-underline flex-1">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      <span className="text-lg font-semibold">{product.name || 'New Product'}</span>
                      {product.category && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                          {product.category}
                        </span>
                      )}
                      {!product.is_active && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/20 text-gray-400">
                          Inactive
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      onClick={() => handleSaveProduct(product)}
                      disabled={saving || !product.name || !product.link}
                      className="btn-tinted-primary"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteProduct(product.id)}
                      disabled={saving}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <AccordionContent>
                <CardContent className="space-y-4 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`name-${product.id}`}>Product Name *</Label>
                      <Input
                        id={`name-${product.id}`}
                        value={product.name}
                        onChange={(e) => handleUpdateProduct(product.id, 'name', e.target.value)}
                        placeholder="e.g., DefCat Playmat"
                        className="input-tinted"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`key-${product.id}`}>Product Key</Label>
                      <Input
                        id={`key-${product.id}`}
                        value={product.key}
                        onChange={(e) => handleUpdateProduct(product.id, 'key', e.target.value)}
                        placeholder="e.g., defcat-playmat"
                        className="input-tinted"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`link-${product.id}`}>Product Link *</Label>
                    <Input
                      id={`link-${product.id}`}
                      value={product.link}
                      onChange={(e) => handleUpdateProduct(product.id, 'link', e.target.value)}
                      placeholder="https://defcat-mtg-dzo-shop.fourthwall.com/products/..."
                      className="input-tinted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`description-${product.id}`}>Description</Label>
                    <Textarea
                      id={`description-${product.id}`}
                      value={product.description || ''}
                      onChange={(e) =>
                        handleUpdateProduct(product.id, 'description', e.target.value)
                      }
                      placeholder="Product description..."
                      className="input-tinted min-h-[80px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`image-${product.id}`}>Image URL</Label>
                      <Input
                        id={`image-${product.id}`}
                        value={product.image_url || ''}
                        onChange={(e) =>
                          handleUpdateProduct(product.id, 'image_url', e.target.value)
                        }
                        placeholder="https://..."
                        className="input-tinted"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`category-${product.id}`}>Category</Label>
                      <Input
                        id={`category-${product.id}`}
                        value={product.category || ''}
                        onChange={(e) =>
                          handleUpdateProduct(product.id, 'category', e.target.value)
                        }
                        placeholder="e.g., merchandise"
                        className="input-tinted"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`sort-${product.id}`}>Sort Order</Label>
                      <Input
                        id={`sort-${product.id}`}
                        type="number"
                        value={product.sort_order}
                        onChange={(e) =>
                          handleUpdateProduct(
                            product.id,
                            'sort_order',
                            parseInt(e.target.value, 10)
                          )
                        }
                        className="input-tinted"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`active-${product.id}`}
                      checked={product.is_active}
                      onChange={(e) =>
                        handleUpdateProduct(product.id, 'is_active', e.target.checked)
                      }
                      className="h-4 w-4"
                    />
                    <Label htmlFor={`active-${product.id}`}>Active (visible on store page)</Label>
                  </div>
                </CardContent>
              </AccordionContent>
            </Card>
            </div>
          </AccordionItem>
        ))}
      </Accordion>

      {products.length === 0 && (
        <div className="relative rounded-2xl border p-2 md:rounded-3xl md:p-3">
          <GlowingEffect
            blur={0}
            borderWidth={3}
            spread={80}
            glow={true}
            disabled={false}
            proximity={64}
            inactiveZone={0.01}
          />
          <Card className="card-glass border-0 relative">
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No products yet. Click "Add Product" to get started.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
