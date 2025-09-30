import { requireAdmin, requireAuth } from '@/lib/api/auth';
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(request);
  if (authResult.response) return authResult.response;

  const { id } = await params;
  const supabase = await createClient();
  const user = authResult.user!;

  // Get place
  const { data: place, error } = await supabase
    .from('places')
    .select('*, upvote_count:place_upvote_counts(upvote_count)')
    .eq('id', id)
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 404 });
  }

  // Check if user has upvoted
  const { data: upvote } = await supabase
    .from('place_upvotes')
    .select('id')
    .eq('place_id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  return Response.json({
    ...place,
    user_has_upvoted: !!upvote,
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminResult = await requireAdmin(request);
  if (adminResult.response) return adminResult.response;

  const { id } = await params;
  const body = await request.json();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('places')
    .update({
      ...body,
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminResult = await requireAdmin(request);
  if (adminResult.response) return adminResult.response;

  const { id } = await params;
  const supabase = await createClient();

  const { error } = await supabase.from('places').delete().eq('id', id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
