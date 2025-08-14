import { Layout } from "@/components/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  BarChart3, 
  FileText, 
  Users, 
  Clock,
  TrendingUp,
  Activity,
  CheckCircle,
  AlertCircle
} from "lucide-react"

export default function DashboardPage() {
  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's an overview of your AI QA Assistant.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Collections</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                +2 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tests</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">
                +12% from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94.2%</div>
              <p className="text-xs text-muted-foreground">
                +1.1% from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed Tests</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">9</div>
              <p className="text-xs text-muted-foreground">
                -3 from last week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest test runs and collection updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: "User API Collection Updated",
                    description: "Added 5 new endpoints for user management",
                    time: "2 hours ago",
                    status: "success"
                  },
                  {
                    title: "Payment API Test Failed",
                    description: "3 tests failed due to timeout issues",
                    time: "4 hours ago",
                    status: "error"
                  },
                  {
                    title: "Product API Collection Created",
                    description: "New collection with 12 endpoints",
                    time: "1 day ago",
                    status: "success"
                  },
                  {
                    title: "Authentication Tests Completed",
                    description: "All 8 authentication tests passed",
                    time: "2 days ago",
                    status: "success"
                  }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {activity.time}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <button className="flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent">
                  <FileText className="h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">Create Collection</p>
                    <p className="text-xs text-muted-foreground">Start a new API collection</p>
                  </div>
                </button>
                
                <button className="flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent">
                  <BarChart3 className="h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">Run Tests</p>
                    <p className="text-xs text-muted-foreground">Execute all test suites</p>
                  </div>
                </button>
                
                <button className="flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent">
                  <Users className="h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">Team Overview</p>
                    <p className="text-xs text-muted-foreground">View team performance</p>
                  </div>
                </button>
                
                <button className="flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent">
                  <Clock className="h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">Schedule Tests</p>
                    <p className="text-xs text-muted-foreground">Set up automated testing</p>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
} 