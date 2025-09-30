'use client';

import { AuditLogsTab } from '@/components/dashboard/audit-logs-tab';
import { PlacesTab } from '@/components/dashboard/places-tab';
import { SkillsTab } from '@/components/dashboard/skills-tab';
import { SubmissionsTab } from '@/components/dashboard/submissions-tab';
import { NavBar } from '@/components/layout/nav-bar';
import { ProtectedRoute } from '@/components/layout/protected-route';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/hooks/use-auth';

export default function DashboardPage() {
  const { isAdmin } = useAuth();

  return (
    <ProtectedRoute>
      <NavBar />
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            {isAdmin
              ? 'Manage skills, places, and review submissions'
              : 'Browse skills, places, and track your submissions'}
          </p>
        </div>

        <Tabs defaultValue="skills" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="places">Places</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="skills" className="mt-6">
            <SkillsTab />
          </TabsContent>

          <TabsContent value="places" className="mt-6">
            <PlacesTab />
          </TabsContent>

          <TabsContent value="submissions" className="mt-6">
            <SubmissionsTab />
          </TabsContent>

          <TabsContent value="audit-logs" className="mt-6">
            <AuditLogsTab />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
