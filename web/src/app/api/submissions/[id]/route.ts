import { requireAuth } from '@/lib/api/auth';
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(request);
  if (authResult.response) return authResult.response;

  const { id } = await params;
  const user = authResult.user!;
  const body = await request.json();
  const supabase = await createClient();

  // Check if submission exists and is owned by user and is pending
  const { data: existing } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', id)
    .eq('submitted_by', user.id)
    .eq('status', 'pending')
    .single();

  if (!existing) {
    return Response.json(
      { error: 'Submission not found or cannot be edited' },
      { status: 404 }
    );
  }

  const { data, error } = await supabase
    .from('submissions')
    .update({
      data: body.data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}
