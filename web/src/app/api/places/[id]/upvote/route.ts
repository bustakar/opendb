import { requireAuth } from '@/lib/api/auth';
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(request);
  if (authResult.response) return authResult.response;

  const { id: placeId } = await params;
  const user = authResult.user!;
  const supabase = await createClient();

  // Check if already upvoted
  const { data: existingUpvote } = await supabase
    .from('place_upvotes')
    .select('id')
    .eq('place_id', placeId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existingUpvote) {
    // Remove upvote
    const { error } = await supabase
      .from('place_upvotes')
      .delete()
      .eq('id', existingUpvote.id);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ upvoted: false });
  } else {
    // Add upvote
    const { error } = await supabase.from('place_upvotes').insert({
      place_id: placeId,
      user_id: user.id,
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ upvoted: true });
  }
}
