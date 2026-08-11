import React from 'react';
import { useAppSelector } from '../features/store';
import { DashboardNavbar } from '../components/Dashboard/DashboardNavbar';
import { UserInfoDisplay } from '../components/Dashboard/UserInfoDisplay';
import { QuickActions } from '../components/Dashboard/QuickActions';
import { ActivityFeed } from '../components/Dashboard/ActivityFeed';

const Dashboard: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gitbase-dark via-gitbase-secondary to-gitbase-dark">
      <DashboardNavbar />

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="grid gap-6 md:grid-cols-2">
            {user && <UserInfoDisplay user={user} />}
            <div className="space-y-6">
              <QuickActions />
              <ActivityFeed />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;