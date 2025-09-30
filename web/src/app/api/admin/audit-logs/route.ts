import { requireAuth } from '@/lib/api/auth';
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult.response) return authResult.response;

  const searchParams = request.nextUrl.searchParams;
  const entityType = searchParams.get('entityType');
  const action = searchParams.get('action');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = (page - 1) * limit;

  const supabase = await createClient();

  let query = supabase
    .from('audit_logs')
    .select('*, user:profiles(email)', { count: 'exact' });

  // Apply filters
  if (entityType) {
    query = query.eq('entity_type', entityType);
  }
  if (action) {
    query = query.eq('action', action);
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
