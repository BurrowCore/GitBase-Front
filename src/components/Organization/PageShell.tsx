import type { ReactNode } from 'react';
import { DashboardNavbar } from '../Dashboard/DashboardNavbar';

/** Standard page chrome for the organization pages. */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gitbase-dark via-gitbase-secondary to-gitbase-dark">
      <DashboardNavbar />
      <main className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
