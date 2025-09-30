'use client';

import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { ProtectedRoute } from '@/components/layout/protected-route';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';

const data = {
  menuItems: [
    {
      title: 'Skills',
      url: '/dashboard/skills',
    },
    {
      title: 'Places',
      url: '/dashboard/places',
    },
    {
      title: 'Submissions',
      url: '/dashboard/submissions',
    },
  ],
  footerIterms: [
    {
      title: 'Audit Logs',
      url: '/dashboard/audit-logs',
    },
  ],
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <SidebarProvider defaultOpen={true}>
          <AppSidebar pathname={pathname} />
          <SidebarInset>
            <header className="bg-background sticky top-0 flex shrink-0 items-center gap-2 border-b p-4">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      {
                        data.menuItems.find((item) => item.url === pathname)
                          ?.title
                      }
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </ProtectedRoute>
  );
}
