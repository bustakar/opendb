import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export async function getAuthUser(_request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null, error: error?.message || 'Unauthorized' };
  }

  return { user, error: null };
}

export async function isAdmin(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return false;
  }

  return data.role === 'admin';
}

export async function requireAuth(request: NextRequest) {
  const { user, error } = await getAuthUser(request);
  if (!user) {
    return {
      error: error || 'Unauthorized',
      response: Response.json(
        { error: error || 'Unauthorized' },
        { status: 401 }
      ),
    };
  }
  return { user, error: null, response: null };
}

export async function requireAdmin(request: NextRequest) {
  const { user, error, response } = await requireAuth(request);
  if (response) return { error, response };

  const userIsAdmin = await isAdmin(user!.id);
  if (!userIsAdmin) {
    return {
      error: 'Forbidden',
      response: Response.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }

  return { user, error: null, response: null };
}
