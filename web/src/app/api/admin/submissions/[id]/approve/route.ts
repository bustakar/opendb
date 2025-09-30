import { requireAdmin } from '@/lib/api/auth';
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminResult = await requireAdmin(request);
  if (adminResult.response) return adminResult.response;

  const { id } = await params;
  const user = adminResult.user!;
  const supabase = await createClient();

  // Call the database function to approve submission
  const { data, error } = await supabase.rpc('approve_submission', {
    submission_id: id,
    reviewer_id: user.id,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  if (!data.success) {
    return Response.json({ error: data.error }, { status: 400 });
  }

  return Response.json(data);
}
