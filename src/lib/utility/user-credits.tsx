import type { CreditType } from '@/types/core'
import { createClient } from '@/lib/supabase/client'

class DynamicCreditService {
  private supabase = createClient()
  private creditTypes: CreditType[] = []
  
  async initialize() {
    // Load credit types from database
    const { data } = await this.supabase
      .from('credit_types')
      .select('*')
      .eq('is_active', true)
    
    this.creditTypes = data ?? []
  }
  
  async getUserCredits(userId: string): Promise<Record<string, number>> {
    const { data } = await this.supabase
      .from('user_credits')
      .select('credits')
      .eq('user_id', userId)
      .single()
    
    return data?.credits ?? {}
  }
  
  async consumeCredit(
    userId: string,
    creditType: string,
    amount: number = 1
  ): Promise<number> {
    // Validate against loaded credit types
    if (!this.creditTypes.find(ct => ct.id === creditType)) {
      throw new Error(`Invalid credit type: ${creditType}`)
    }
    
    const { data } = await this.supabase.rpc('consume_credit', {
      p_user_id: userId,
      p_credit_type: creditType,
      p_amount: amount
    })
    
    return data
  }
  
  // Dynamically generate methods for each credit type
  generateTypedMethods() {
    this.creditTypes.forEach(ct => {
      // @ts-ignore - Dynamic method generation
      this[`consume${ct.id.charAt(0).toUpperCase() + ct.id.slice(1)}`] = 
        (userId: string) => this.consumeCredit(userId, ct.id, 1)
    })
  }
}

// Usage
const creditService = new DynamicCreditService()
await creditService.initialize()
creditService.generateTypedMethods()

// Now you can call dynamically generated methods
// creditService.consumeRoast(userId)
// creditService.consumeDeck(userId)
