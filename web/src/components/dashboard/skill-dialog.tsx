'use client';

import { SkillForm } from '@/components/forms/skill-form';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/lib/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';

type SkillDialogProps = {
  skillId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: 'view' | 'edit' | 'create';
};

export function SkillDialog({
  skillId,
  open,
  onOpenChange,
  mode = 'view',
}: SkillDialogProps) {
  const { isAdmin } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['skill', skillId],
    queryFn: async () => {
      if (!skillId) return null;
      const res = await fetch(`/api/skills/${skillId}`);
      if (!res.ok) throw new Error('Failed to fetch skill');
      return res.json();
    },
    enabled: !!skillId,
  });

  // Use form for create/edit mode
  if (mode === 'create' || mode === 'edit') {
    return (
      <SkillForm
        skillId={skillId}
        open={open}
        onOpenChange={onOpenChange}
        isAdmin={isAdmin}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : data ? (
          <>
            <DialogHeader>
              <DialogTitle>{data.title}</DialogTitle>
              <DialogDescription>
                Skill details and information
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="flex gap-2">
                <Badge variant="outline">{data.level}</Badge>
                <Badge variant="secondary">
                  Difficulty: {data.difficulty}/10
                </Badge>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">
                  {data.description}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Muscle Groups</h3>
                <div className="flex flex-wrap gap-2">
                  {data.muscle_groups.map((group: string) => (
                    <Badge key={group} variant="secondary">
                      {group}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Equipment</h3>
                <div className="flex flex-wrap gap-2">
                  {data.equipment.map((item: string) => (
                    <Badge key={item} variant="outline">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>

              {data.variants && data.variants.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Variants</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {data.variants.map(
                        (variant: { id: string; title: string }) => (
                          <div key={variant.id} className="text-sm">
                            • {variant.title}
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {data.prerequisites && data.prerequisites.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Prerequisites</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {data.prerequisites.map(
                        (prereq: { id: string; title: string }) => (
                          <div key={prereq.id} className="text-sm">
                            • {prereq.title}
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {data.video_urls && data.video_urls.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Videos</h3>
                  <div className="space-y-2">
                    {data.video_urls.map((url: string, idx: number) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline block"
                      >
                        Video {idx + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-8">Skill not found</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
