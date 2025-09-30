'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SKILL_LEVELS } from '@/lib/constants';
import { useAuth } from '@/lib/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { SkillDialog } from './skill-dialog';

type Skill = {
  id: string;
  title: string;
  description: string;
  level: string;
  difficulty: number;
  muscle_groups: string[];
  equipment: string[];
};

export function SkillsTab() {
  const { isAdmin } = useAuth();
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<'view' | 'edit' | 'create'>(
    'view'
  );

  // Filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [minDifficulty, setMinDifficulty] = useState<string>('1');
  const [maxDifficulty, setMaxDifficulty] = useState<string>('10');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading } = useQuery({
    queryKey: [
      'skills',
      searchTerm,
      levelFilter,
      minDifficulty,
      maxDifficulty,
      page,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: ((page - 1) * limit).toString(),
      });
      if (searchTerm) params.append('search', searchTerm);
      if (levelFilter !== 'all') params.append('level', levelFilter);
      if (minDifficulty) params.append('minDifficulty', minDifficulty);
      if (maxDifficulty) params.append('maxDifficulty', maxDifficulty);

      const res = await fetch(`/api/skills?${params}`);
      if (!res.ok) throw new Error('Failed to fetch skills');
      return res.json();
    },
  });

  const skills: Skill[] = data?.data || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Skills</h2>
          <p className="text-sm text-muted-foreground">
            {total} skill{total !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setSelectedSkill(null);
              setDialogMode('create');
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            {isAdmin ? 'Add Skill' : 'Submit Skill'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search skills..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={levelFilter}
          onValueChange={(value) => {
            setLevelFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {SKILL_LEVELS.map((level) => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Difficulty:</span>
          <Input
            type="number"
            min="1"
            max="10"
            value={minDifficulty}
            onChange={(e) => {
              setMinDifficulty(e.target.value);
              setPage(1);
            }}
            className="w-16"
          />
          <span className="text-sm text-muted-foreground">to</span>
          <Input
            type="number"
            min="1"
            max="10"
            value={maxDifficulty}
            onChange={(e) => {
              setMaxDifficulty(e.target.value);
              setPage(1);
            }}
            className="w-16"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : skills.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No skills found
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Muscle Groups</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {skills.map((skill) => (
                <TableRow key={skill.id}>
                  <TableCell className="font-medium">{skill.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{skill.level}</Badge>
                  </TableCell>
                  <TableCell>{skill.difficulty}/10</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {skill.muscle_groups.slice(0, 2).map((group) => (
                        <Badge
                          key={group}
                          variant="secondary"
                          className="text-xs"
                        >
                          {group}
                        </Badge>
                      ))}
                      {skill.muscle_groups.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{skill.muscle_groups.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedSkill(skill.id);
                          setDialogMode('view');
                        }}
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedSkill(skill.id);
                          setDialogMode('edit');
                        }}
                      >
                        {isAdmin ? 'Edit' : 'Submit Edit'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <SkillDialog
        skillId={selectedSkill || undefined}
        open={!!selectedSkill || dialogMode === 'create'}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedSkill(null);
            setDialogMode('view');
          }
        }}
        mode={dialogMode}
      />
    </div>
  );
}
