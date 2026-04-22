'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function respondToQuote(
  quoteId: string,
  response: 'accepted' | 'rejected',
  selectedLineIds: string[] = []
): Promise<{ orderId?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Verify org membership
  const { data: orgMember } = await supabase
    .from('org_members')
    .select('organization_id')
    .eq('profile_id', user.id)
    .limit(1)
    .single()
  if (!orgMember) throw new Error('No organisation found')

  // Verify quote belongs to their org and is in 'sent' status
  const { data: quote } = await supabase
    .from('quotes')
    .select('id, status, customer_org_id, quote_number, subtotal, vat_rate, vat_amount, total_amount, customer_reference, notes')
    .eq('id', quoteId)
    .eq('customer_org_id', orgMember.organization_id)
    .single()
  if (!quote) throw new Error('Quote not found')
  if (quote.status !== 'sent') throw new Error('This quote is no longer available to respond to')

  // Mark the quote as accepted/rejected
  const { error: quoteError } = await supabase
    .from('quotes')
    .update({ status: response })
    .eq('id', quoteId)
  if (quoteError) throw new Error('Failed to update quote: ' + quoteError.message)

  // If rejected, we're done
  if (response === 'rejected') {
    revalidatePath(`/quotes/${quoteId}`)
    return {}
  }

  // ── Create draft order from selected lines ──────────────────────────────

  // Fetch selected quote items
  const lineFilter = selectedLineIds.length > 0
    ? supabase.from('quote_items').select('*').eq('quote_id', quoteId).in('id', selectedLineIds)
    : supabase.from('quote_items').select('*').eq('quote_id', quoteId)

  const { data: quoteItems } = await lineFilter.order('sort_order')
  const items = quoteItems || []

  // Recalculate totals for selected lines only
  const subtotal = items.reduce((sum, i) => sum + Number(i.total_price ?? Number(i.unit_price) * i.quantity), 0)
  const vatRate = Number(quote.vat_rate) || 20
  const vatAmount = subtotal * (vatRate / 100)
  const totalAmount = subtotal + vatAmount

  // Create the order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_org_id: orgMember.organization_id,
      contact_id: user.id,
      quote_id: quoteId,
      status: 'confirmed',
      order_date: new Date().toISOString().split('T')[0],
      customer_reference: quote.customer_reference,
      notes: quote.notes,
      subtotal,
      vat_rate: vatRate,
      vat_amount: vatAmount,
      total_amount: totalAmount,
    })
    .select('id')
    .single()

  if (orderError) throw new Error('Failed to create order: ' + orderError.message)

  // Create order lines from selected quote items
  if (items.length > 0) {
    const orderLines = items.map((item, idx) => ({
      order_id: order.id,
      quote_item_id: item.id,
      description: item.description,
      material: item.material,
      material_type: item.material_type,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price ?? Number(item.unit_price) * item.quantity,
      lead_time: item.lead_time,
      line_status: 'outstanding',
      sort_order: idx,
    }))

    const { error: linesError } = await supabase.from('order_lines').insert(orderLines)
    if (linesError) console.error('Failed to insert order lines:', linesError)
  }

  revalidatePath(`/quotes/${quoteId}`)
  revalidatePath('/orders')

  return { orderId: order.id }
}
