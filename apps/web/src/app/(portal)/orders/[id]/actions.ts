'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function reorderFromOrder(orderId: string): Promise<{ quoteId: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: orgMember } = await supabase
    .from('org_members')
    .select('organization_id')
    .eq('profile_id', user.id)
    .limit(1)
    .single()
  if (!orgMember) throw new Error('No organisation found')

  // Fetch the order and its lines
  const { data: order } = await supabase
    .from('orders')
    .select(`
      id, customer_org_id, customer_reference, notes,
      order_lines ( description, material, material_type, quantity, unit_price, lead_time, sort_order )
    `)
    .eq('id', orderId)
    .eq('customer_org_id', orgMember.organization_id)
    .single()

  if (!order) throw new Error('Order not found')

  const lines = (order.order_lines as any[]) || []

  // Create a new quote in draft status
  const { data: quote, error: quoteError } = await supabase
    .from('quotes')
    .insert({
      customer_org_id: orgMember.organization_id,
      contact_id: user.id,
      status: 'submitted',
      customer_reference: order.customer_reference ? `Re-order: ${order.customer_reference}` : null,
      notes: order.notes,
      quote_date: new Date().toISOString().split('T')[0],
      subtotal: 0,
      vat_rate: 20,
      vat_amount: 0,
      total_amount: 0,
    })
    .select('id')
    .single()

  if (quoteError) throw new Error('Failed to create quote: ' + quoteError.message)

  // Copy order lines into quote items
  if (lines.length > 0) {
    const quoteItems = lines
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((line: any, idx: number) => ({
        quote_id: quote.id,
        description: line.description,
        material: line.material,
        material_type: line.material_type,
        quantity: line.quantity,
        unit_price: 0, // Pricing will be set by admin
        total_price: 0,
        lead_time: line.lead_time,
        sort_order: idx,
      }))

    const { error: itemsError } = await supabase.from('quote_items').insert(quoteItems)
    if (itemsError) console.error('Failed to copy quote items:', itemsError)
  }

  revalidatePath('/quotes')
  return { quoteId: quote.id }
}
