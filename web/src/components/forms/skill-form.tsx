'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { EQUIPMENT, MUSCLE_GROUPS, SKILL_LEVELS } from '@/lib/constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const skillFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  level: z.enum(['beginner', 'intermediate', 'advanced', 'elite']),
  difficulty: z.number().min(1).max(10),
  muscle_groups: z.array(z.string()).min(1, 'Select at least one muscle group'),
  equipment: z.array(z.string()).min(1, 'Select at least one equipment'),
  video_urls: z.string().optional(),
});

type SkillFormValues = z.infer<typeof skillFormSchema>;

type SkillFormProps = {
  skillId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAdmin?: boolean;
};

export function SkillForm({
  skillId,
  open,
  onOpenChange,
  isAdmin = false,
}: SkillFormProps) {
  const queryClient = useQueryClient();

  // Fetch existing skill if editing
  const { data: existingSkill } = useQuery({
    queryKey: ['skill', skillId],
    queryFn: async () => {
      if (!skillId) return null;
      const res = await fetch(`/api/skills/${skillId}`);
      if (!res.ok) throw new Error('Failed to fetch skill');
      return res.json();
    },
    enabled: !!skillId,
  });

  const form = useForm<SkillFormValues>({
    resolver: zodResolver(skillFormSchema),
    defaultValues: {
      title: existingSkill?.title || '',
      description: existingSkill?.description || '',
      level: existingSkill?.level || 'beginner',
      difficulty: existingSkill?.difficulty || 5,
      muscle_groups: existingSkill?.muscle_groups || [],
      equipment: existingSkill?.equipment || [],
      video_urls: existingSkill?.video_urls?.join('\n') || '',
    },
  });

  // Reset form when existing skill data loads
  if (existingSkill && !form.formState.isDirty) {
    form.reset({
      title: existingSkill.title,
      description: existingSkill.description,
      level: existingSkill.level,
      difficulty: existingSkill.difficulty,
      muscle_groups: existingSkill.muscle_groups,
      equipment: existingSkill.equipment,
      video_urls: existingSkill.video_urls?.join('\n') || '',
    });
  }

  const mutation = useMutation({
    mutationFn: async (values: SkillFormValues) => {
      const payload = {
        ...values,
        video_urls:
          values.video_urls
            ?.split('\n')
            .map((url) => url.trim())
            .filter(Boolean) || [],
      };

      if (isAdmin && skillId) {
        // Admin direct edit
        const res = await fetch(`/api/skills/${skillId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to update skill');
        return res.json();
      } else {
        // User submission
        const res = await fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            entity_type: 'skill',
            action: skillId ? 'update' : 'create',
            data: payload,
            original_id: skillId || null,
          }),
        });
        if (!res.ok) throw new Error('Failed to create submission');
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      if (skillId) {
        queryClient.invalidateQueries({ queryKey: ['skill', skillId] });
      }
      toast.success(
        isAdmin
          ? skillId
            ? 'Skill updated'
            : 'Skill created'
          : 'Submission created'
      );
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  function onSubmit(values: SkillFormValues) {
    mutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isAdmin
              ? skillId
                ? 'Edit Skill'
                : 'Create Skill'
              : skillId
              ? 'Submit Edit for Skill'
              : 'Submit New Skill'}
          </DialogTitle>
          <DialogDescription>
            {isAdmin
              ? 'Changes will be applied immediately'
              : 'Your submission will be reviewed by an admin'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Muscle Up" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the skill..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SKILL_LEVELS.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty (1-10)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 5)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="muscle_groups"
              render={() => (
                <FormItem>
                  <FormLabel>Muscle Groups</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {MUSCLE_GROUPS.map((group) => (
                      <FormField
                        key={group}
                        control={form.control}
                        name="muscle_groups"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(group)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, group])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== group
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal cursor-pointer">
                              {group}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="equipment"
              render={() => (
                <FormItem>
                  <FormLabel>Equipment</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {EQUIPMENT.map((item) => (
                      <FormField
                        key={item}
                        control={form.control}
                        name="equipment"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, item])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== item
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal cursor-pointer">
                              {item.replace(/_/g, ' ')}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="video_urls"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video URLs (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="https://youtube.com/watch?v=..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>One URL per line</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending
                  ? 'Saving...'
                  : isAdmin
                  ? skillId
                    ? 'Update'
                    : 'Create'
                  : 'Submit'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
