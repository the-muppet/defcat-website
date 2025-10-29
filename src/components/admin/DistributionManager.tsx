// components/admin/DistributionManager.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function DistributionManager() {
  return (
    <Card className="card-tinted-glass">
      <CardHeader>
        <CardTitle>Credit Distribution</CardTitle>
        <CardDescription>
          Monitor and manage monthly credit distributions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-tinted">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Next Distribution</p>
              <p className="text-2xl font-bold text-tinted">
                {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-tinted">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Last Run</p>
              <p className="text-2xl font-bold">Success</p>
            </CardContent>
          </Card>
          <Card className="bg-tinted">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Users Affected</p>
              <p className="text-2xl font-bold">247</p>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex gap-2">
          <Button className="btn-tinted-primary">
            Preview Next Distribution
          </Button>
          <Button variant="outline">
            Run Manual Distribution
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}