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

  // Get skill with variants and prerequisites
  const { data: skill, error } = await supabase
    .from('skills')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 404 });
  }

  // Get variants
  const { data: variants } = await supabase
    .from('skill_variants')
    .select('variant_skill_id, skills:variant_skill_id(*)')
    .eq('skill_id', id);

  // Get prerequisites
  const { data: prerequisites } = await supabase
    .from('skill_prerequisites')
    .select('prerequisite_skill_id, skills:prerequisite_skill_id(*)')
    .eq('skill_id', id);

  return Response.json({
    ...skill,
    variants: variants?.map((v) => (v as { skills: unknown }).skills) || [],
    prerequisites:
      prerequisites?.map((p) => (p as { skills: unknown }).skills) || [],
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

  const { variants, prerequisites, ...skillData } = body;

  // Update skill
  const { data, error } = await supabase
    .from('skills')
    .update({
      ...skillData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Update variants
  if (variants) {
    await supabase.from('skill_variants').delete().eq('skill_id', id);
    if (variants.length > 0) {
      await supabase.from('skill_variants').insert(
        variants.map((variantId: string) => ({
          skill_id: id,
          variant_skill_id: variantId,
        }))
      );
    }
  }

  // Update prerequisites
  if (prerequisites) {
    await supabase.from('skill_prerequisites').delete().eq('skill_id', id);
    if (prerequisites.length > 0) {
      await supabase.from('skill_prerequisites').insert(
        prerequisites.map((prereqId: string) => ({
          skill_id: id,
          prerequisite_skill_id: prereqId,
        }))
      );
    }
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

  const { error } = await supabase.from('skills').delete().eq('id', id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
