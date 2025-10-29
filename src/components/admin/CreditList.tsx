// components/admin/CreditTypesList.tsx
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Edit, Plus, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'

export function CreditTypesList() {
  const supabase = createClient()
  const [creditTypes, setCreditTypes] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    id: '',
    display_name: '',
    description: '',
  })

  useEffect(() => {
    loadCreditTypes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadCreditTypes() {
    const { data } = await supabase
      .from('credit_types')
      .select('*')
      .eq('is_active', true)
      .order('id')

    setCreditTypes(data || [])
  }

  async function handleAdd() {
    const { error } = await supabase.rpc('add_credit_type', {
      p_id: formData.id.toLowerCase().replace(/\s+/g, '_'),
      p_display_name: formData.display_name,
      p_description: formData.description,
    })

    if (!error) {
      setOpen(false)
      loadCreditTypes()
      setFormData({ id: '', display_name: '', description: '' })
    }
  }

  return (
    <>
      <Card className="card-tinted-glass">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Credit Types</CardTitle>
            <CardDescription>Manage available credit types</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="btn-tinted-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Credit Type
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Credit Type</DialogTitle>
                <DialogDescription>
                  Create a new type of credit that can be distributed to users
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      display_name: e.target.value,
                      id: e.target.value.toLowerCase().replace(/\s+/g, '_')
                    }))}
                    placeholder="Review Credits"
                    className="input-tinted"
                  />
                </div>
                <div>
                  <Label htmlFor="id">ID (auto-generated)</Label>
                  <Input
                    id="id"
                    value={formData.id}
                    disabled
                    className="input-tinted"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Credits for detailed deck reviews"
                    className="input-tinted"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAdd} className="btn-tinted-primary">
                  Add Credit Type
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {creditTypes.map(credit => (
              <div
                key={credit.id}
                className="flex items-center justify-between p-4 rounded-lg bg-tinted hover:bg-accent-tinted transition-all"
              >
                <div>
                  <h4 className="font-medium">{credit.display_name}</h4>
                  <p className="text-sm text-muted-foreground">{credit.description}</p>
                  <code className="text-xs text-tinted mt-1">ID: {credit.id}</code>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  )
}