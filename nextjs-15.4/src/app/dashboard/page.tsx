import { DashboardLayout } from '@/components/dashboard/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Activity, TrendingUp, Clock } from 'lucide-react';

const stats = [
  {
    title: 'Total Users',
    value: '2,847',
    change: '+12%',
    icon: Users,
  },
  {
    title: 'Active Sessions',
    value: '1,234',
    change: '+8%',
    icon: Activity,
  },
  {
    title: 'Growth Rate',
    value: '23.5%',
    change: '+4.2%',
    icon: TrendingUp,
  },
  {
    title: 'Avg. Session',
    value: '4m 32s',
    change: '+1.8%',
    icon: Clock,
  },
];

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening with your application.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{stat.change}</span> from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest actions in your application</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">User registered</p>
                      <p className="text-xs text-muted-foreground">2 minutes ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks to get things done</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <button className="w-full text-left p-3 rounded-md hover:bg-accent transition-colors">
                  <div className="font-medium">Create new user</div>
                  <div className="text-sm text-muted-foreground">Add a new user to the system</div>
                </button>
                <button className="w-full text-left p-3 rounded-md hover:bg-accent transition-colors">
                  <div className="font-medium">Generate report</div>
                  <div className="text-sm text-muted-foreground">Create analytics report</div>
                </button>
                <button className="w-full text-left p-3 rounded-md hover:bg-accent transition-colors">
                  <div className="font-medium">System settings</div>
                  <div className="text-sm text-muted-foreground">Configure application settings</div>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}