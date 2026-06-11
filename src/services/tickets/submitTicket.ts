// src/services/tickets/submitTicket.ts
import { supabase } from '@/services/supabase/config';

export interface TicketData {
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  steps_to_reproduce?: string;
  expected_behavior?: string;
  actual_behavior?: string;
  environment?: string;
}

export async function submitTicket(data: TicketData) {
  const { error } = await supabase.from('support_tickets').insert({
    name: data.name || 'Anonymous',
    email: data.email || 'no-reply@mobile',
    category: data.category,
    subject: data.subject,
    message: data.message,
    steps_to_reproduce: data.steps_to_reproduce || null,
    expected_behavior: data.expected_behavior || null,
    actual_behavior: data.actual_behavior || null,
    environment: data.environment || null,
    status: 'open',
    priority: 'medium',
  });

  if (error) return { success: false, message: error.message };
  return { success: true, message: 'Ticket submitted!' };
}