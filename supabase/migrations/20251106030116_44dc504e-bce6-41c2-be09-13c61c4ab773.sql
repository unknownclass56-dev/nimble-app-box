-- Add rating and comment fields to support_tickets table
ALTER TABLE public.support_tickets
ADD COLUMN rating integer CHECK (rating >= 1 AND rating <= 5),
ADD COLUMN customer_comment text;