import { requireAuth } from '@/lib/api/auth';
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult.response) return authResult.response;

  const searchParams = request.nextUrl.searchParams;
  const location = searchParams.get('location');
  const amenities = searchParams.get('amenities')?.split(',');
  const equipment = searchParams.get('equipment')?.split(',');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  const supabase = await createClient();
  let query = supabase
    .from('places')
    .select('*, upvote_count:place_upvote_counts(upvote_count)', {
      count: 'exact',
    });

  // Apply filters
  if (location) {
    query = query.ilike('location', `%${location}%`);
  }
  if (amenities && amenities.length > 0) {
    query = query.overlaps('amenities', amenities);
  }
  if (equipment && equipment.length > 0) {
    query = query.overlaps('equipment', equipment);
  }

  // Apply pagination
  query = query
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    data,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
    },
  });
}
