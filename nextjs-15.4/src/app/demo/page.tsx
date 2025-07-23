import { DashboardLayout } from '@/components/dashboard/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Shield, 
  Smartphone, 
  Database, 
  Mail, 
  MessageSquare,
  Upload,
  Palette
} from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Server Actions',
    description: 'Form submissions without custom APIs',
    status: 'Active',
    progress: 100,
  },
  {
    icon: Shield,
    title: 'Authentication',
    description: 'Email/password + OAuth ready',
    status: 'Active',
    progress: 100,
  },
  {
    icon: Database,
    title: 'SQLite + Drizzle',
    description: 'Type-safe database operations',
    status: 'Active',
    progress: 100,
  },
  {
    icon: Smartphone,
    title: 'Mobile Responsive',
    description: 'Perfect on all device sizes',
    status: 'Active',
    progress: 100,
  },
  {
    icon: Palette,
    title: 'Dark/Light Theme',
    description: 'Theme switching with persistence',
    status: 'Active',
    progress: 100,
  },
  {
    icon: Mail,
    title: 'Email System',
    description: 'SMTP + React Email templates',
    status: 'Coming Soon',
    progress: 60,
  },
  {
    icon: MessageSquare,
    title: 'SMS Integration',
    description: 'Twilio SMS notifications',
    status: 'Coming Soon',
    progress: 40,
  },
  {
    icon: Upload,
    title: 'File Uploads',
    description: 'Multer-based file handling',
    status: 'Coming Soon',
    progress: 30,
  },
];

export default function DemoPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Demo & Features</h1>
          <p className="text-muted-foreground">
            Explore the features and capabilities of this opinionated Next.js starter.
          </p>
        </div>

        {/* Feature Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <Card key={index} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <feature.icon className="h-6 w-6 text-primary" />
                  <Badge 
                    variant={feature.status === 'Active' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {feature.status}
                  </Badge>
                </div>
                <CardTitle className="text-base">{feature.title}</CardTitle>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Implementation</span>
                    <span>{feature.progress}%</span>
                  </div>
                  <Progress value={feature.progress} className="h-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Demo Components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Interactive Demo</CardTitle>
              <CardDescription>Test the various components and features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Theme Switching</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  The theme toggle in the sidebar switches between light and dark modes
                </p>
                <Button variant="outline" size="sm">
                  Toggle Theme (Check Sidebar)
                </Button>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Responsive Layout</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Resize your browser or check on mobile - the sidebar collapses automatically
                </p>
                <Button variant="outline" size="sm">
                  Perfect Mobile Experience
                </Button>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Server Actions</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  All forms use Server Actions instead of API routes for better performance
                </p>
                <Button variant="outline" size="sm">
                  Form Submission Demo
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tech Stack</CardTitle>
              <CardDescription>Technologies powering this application</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="font-medium">Frontend</div>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Next.js 15.4</li>
                    <li>• React 19</li>
                    <li>• TypeScript</li>
                    <li>• Tailwind CSS</li>
                    <li>• shadcn/ui</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <div className="font-medium">Backend</div>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Server Actions</li>
                    <li>• SQLite</li>
                    <li>• Drizzle ORM</li>
                    <li>• bcryptjs</li>
                    <li>• Session Auth</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started */}
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Quick steps to customize this starter for your needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="font-medium text-sm">1. Customize Branding</div>
                <p className="text-xs text-muted-foreground">
                  Update the logo, colors, and app name in the layout components
                </p>
              </div>
              <div className="space-y-2">
                <div className="font-medium text-sm">2. Add Your Features</div>
                <p className="text-xs text-muted-foreground">
                  Create new pages and components in the src/app directory
                </p>
              </div>
              <div className="space-y-2">
                <div className="font-medium text-sm">3. Configure Services</div>
                <p className="text-xs text-muted-foreground">
                  Set up email, SMS, and other integrations via environment variables
                </p>
              </div>
              <div className="space-y-2">
                <div className="font-medium text-sm">4. Deploy</div>
                <p className="text-xs text-muted-foreground">
                  Use the included Docker configuration for easy deployment
                </p>
              </div>
              <div className="space-y-2">
                <div className="font-medium text-sm">5. Scale</div>
                <p className="text-xs text-muted-foreground">
                  Add OAuth providers, payment processing, and advanced features
                </p>
              </div>
              <div className="space-y-2">
                <div className="font-medium text-sm">6. Monitor</div>
                <p className="text-xs text-muted-foreground">
                  Implement analytics and monitoring for production usage
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}