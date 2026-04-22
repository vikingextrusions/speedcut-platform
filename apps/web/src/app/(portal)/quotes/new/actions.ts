'use server'

import { createClient } from '@/utils/supabase/server'

export async function submitQuoteRequest(formData: FormData): Promise<{ quoteId: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
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

  const projectName = formData.get('project_name') as string
  const customerReference = formData.get('customer_reference') as string
  const notes = formData.get('notes') as string
  const partsJson = formData.get('parts_data') as string

  let parts: any[] = []
  try {
    parts = partsJson ? JSON.parse(partsJson) : []
  } catch {
    throw new Error('Invalid parts data')
  }

  if (parts.length === 0) {
    throw new Error('At least one part is required')
  }

  // Insert quote — let the DB sequence assign quote_number automatically
  const { data: quote, error: quoteError } = await supabase
    .from('quotes')
    .insert({
      customer_org_id: orgMember.organization_id,
      contact_id: user.id,
      status: 'submitted',
      customer_reference: customerReference || null,
      notes: [projectName ? `Project: ${projectName}` : '', notes || ''].filter(Boolean).join('\n') || null,
      quote_date: new Date().toISOString().split('T')[0],
      valid_until: null,
      subtotal: 0,
      vat_rate: 20,
      vat_amount: 0,
      total_amount: 0,
    })
    .select('id')
    .single()

  if (quoteError) {
    throw new Error('Failed to create quote: ' + quoteError.message)
  }

  // Insert quote items
  if (parts.length > 0) {
    const quoteItems = parts.map((part: any, idx: number) => ({
      quote_id: quote.id,
      description: part.name || `Part ${idx + 1}`,
      material: part.material || null,
      material_type: part.materialType || null,
      quantity: part.quantity || 1,
      unit_price: 0,
      total_price: 0,
      lead_time: part.leadTime || null,
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
      console.error('Failed to insert quote items:', itemsError)
    }
  }

  // Return the quote ID — let the client handle navigation.
  // DO NOT call redirect() here: it throws a special NEXT_REDIRECT error that
  // gets caught by the client's try/catch, producing the cryptic
  // "Server Components render" production error.
  return { quoteId: quote.id }
}
