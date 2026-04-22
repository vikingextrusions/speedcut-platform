'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function assignPartnerToQuote(quoteId: string, partnerOrgId: string) {
  const supabase = await createClient()

  // Check for an existing assignment to this partner
  const { data: existing } = await supabase
    .from('quote_assignments')
    .select('id')
    .eq('quote_id', quoteId)
    .eq('partner_org_id', partnerOrgId)
    .maybeSingle()

  if (existing) {
    throw new Error('This partner has already been assigned to this quote.')
  }

  // Create the assignment
  const { error: assignError } = await supabase
    .from('quote_assignments')
    .insert({
      quote_id: quoteId,
      partner_org_id: partnerOrgId,
      status: 'pending',
    })

  if (assignError) throw new Error('Failed to assign partner: ' + assignError.message)

  // Bump quote to 'reviewing' if it's still 'submitted'
  await supabase
    .from('quotes')
    .update({ status: 'reviewing' })
    .eq('id', quoteId)
    .eq('status', 'submitted')

  revalidatePath(`/quotes/${quoteId}`)
}

export async function removePartnerAssignment(quoteId: string, assignmentId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('quote_assignments')
    .delete()
    .eq('id', assignmentId)

  if (error) throw new Error('Failed to remove assignment: ' + error.message)

  revalidatePath(`/quotes/${quoteId}`)
}
