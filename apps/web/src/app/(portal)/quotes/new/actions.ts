'use server'

import { createClient } from '@/utils/supabase/server'

export interface PartInput {
  name: string        // maps to QuotePartData.description
  service: string
  material?: string
  materialType?: string
  quantity: number
  finish?: string
  tolerance?: string
  notes?: string
}

export interface QuoteInput {
  projectName: string
  customerReference: string
  leadTime: string
  notes: string
  parts: PartInput[]
}

export async function submitQuoteRequest(input: QuoteInput): Promise<{ quoteId: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // Validate parts up front
  if (!input.parts || input.parts.length === 0) {
    throw new Error('At least one part is required')
  }

  // Get user's org membership
  const { data: orgMember } = await supabase
    .from('org_members')
    .select('organization_id')
    .eq('profile_id', user.id)
    .limit(1)
    .single()

  if (!orgMember) {
    throw new Error('You must be part of an organisation to submit a quote request')
  }

  const notes = [
    input.projectName ? `Project: ${input.projectName}` : '',
    input.notes || '',
  ].filter(Boolean).join('\n') || null

  // Insert quote
  const { data: quote, error: quoteError } = await supabase
    .from('quotes')
    .insert({
      customer_org_id: orgMember.organization_id,
      contact_id: user.id,
      status: 'submitted',
      customer_reference: input.customerReference || null,
      notes,
      quote_date: new Date().toISOString().split('T')[0],
      valid_until: null,
      subtotal: 0,
      vat_rate: 20,
      vat_amount: 0,
      total_amount: 0,
    })
    .select('id')
    .single()

  if (quoteError) throw new Error('Failed to create quote: ' + quoteError.message)

  // Insert quote items
  const quoteItems = input.parts.map((part, idx) => ({
    quote_id: quote.id,
    description: part.name || `Part ${idx + 1}`,
    material: part.material || null,
    material_type: part.materialType || null,
    quantity: part.quantity || 1,
    unit_price: 0,
    total_price: 0,
    lead_time: part.leadTime || input.leadTime || null,
    sort_order: idx,
    specifications: JSON.stringify({
      service: part.service,
      finish: part.finish,
      tolerance: part.tolerance,
      fileName: part.fileName,
    }),
  }))

  const { error: itemsError } = await supabase
    .from('quote_items')
    .insert(quoteItems)

  if (itemsError) {
    // Quote was created — rollback by deleting it, then throw
    await supabase.from('quotes').delete().eq('id', quote.id)
    throw new Error('Failed to save parts: ' + itemsError.message)
  }

  return { quoteId: quote.id }
}
