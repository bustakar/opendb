import { isAdmin, requireAuth } from '@/lib/api/auth';
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult.response) return authResult.response;

  const user = authResult.user!;
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status');
  const entityType = searchParams.get('entityType');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = (page - 1) * limit;

  const supabase = await createClient();
  const userIsAdmin = await isAdmin(user.id);

  let query = supabase
    .from('submissions')
    .select('*, submitter:profiles!submissions_submitted_by_fkey(email)', {
      count: 'exact',
    });

  // Non-admins can only see their own submissions
  if (!userIsAdmin) {
    query = query.eq('submitted_by', user.id);
  }

  // Apply filters
  if (status) {
    query = query.eq('status', status);
  }
  if (entityType) {
    query = query.eq('entity_type', entityType);
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

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult.response) return authResult.response;

  const user = authResult.user!;
  const body = await request.json();
  const supabase = await createClient();

  const { entity_type, action, data, original_id } = body;

  const { data: submission, error } = await supabase
    .from('submissions')
    .insert({
      entity_type,
      action,
      data,
      original_id,
      submitted_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(submission);
}
