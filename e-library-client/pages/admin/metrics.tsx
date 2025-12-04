import { useEffect } from "react";
import { useRouter } from "next/router";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useRole } from "@/hooks/useAuth";
import { useAdminMetrics } from "@/hooks/useAdmin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  Users,
  FileText,
  Download,
  ClipboardList,
  TrendingUp,
  UserPlus,
  BarChart3,
  Search,
  Clock,
  Award,
  Activity,
  Eye,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default function AdminMetricsPage() {
  const router = useRouter();
  const { isAdmin } = useRole();
  const { data: metricsData, isLoading } = useAdminMetrics();

  useEffect(() => {
    if (!isAdmin) {
      router.replace("/dashboard");
    }
  }, [isAdmin, router]);

  if (!isAdmin) {
    return null;
  }

  const metrics = metricsData?.data;

  const stats = [
    { 
      name: "Total Users", 
      value: metrics?.users?.total || 0, 
      icon: Users, 
      color: "text-blue-500",
      description: "Registered users"
    },
    { 
      name: "Total Resources", 
      value: metrics?.resources?.total || 0, 
      icon: FileText, 
      color: "text-green-500",
      description: "Uploaded resources"
    },
    { 
      name: "Total Downloads", 
      value: metrics?.downloads?.total || 0, 
      icon: Download, 
      color: "text-purple-500",
      description: "All-time downloads"
    },
    { 
      name: "Recent Downloads", 
      value: metrics?.downloads?.recent || 0, 
      icon: TrendingUp, 
      color: "text-indigo-500",
      description: "Recent activity"
    },
    { 
      name: "Pending Requests", 
      value: metrics?.requests?.pending || 0, 
      icon: ClipboardList, 
      color: "text-orange-500",
      description: "Awaiting review"
    },
    { 
      name: "Total Searches", 
      value: metrics?.searches?.total || 0, 
      icon: Search, 
      color: "text-cyan-500",
      description: "Search queries"
    },
  ];

  const userRoles = metrics?.users?.byRole || {};
  const topResources = metrics?.resources?.topResources || [];
  const topSearchTerms = metrics?.searches?.topTerms || [];

  return (
    <DashboardLayout title="Admin Metrics">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Platform Analytics</h2>
            <p className="text-muted-foreground">
              Real-time metrics and platform insights
            </p>
          </div>
          {metrics?.generatedAt && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Updated {formatDate(metrics.generatedAt, true)}
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.name}
                      </p>
                      {isLoading ? (
                        <Skeleton className="h-8 w-20" />
                      ) : (
                        <p className="text-3xl font-bold">
                          {stat.value.toLocaleString()}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {stat.description}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.color.replace('text-', 'bg-')} bg-opacity-10`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* User Roles Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Roles Distribution
              </CardTitle>
              <CardDescription>
                Breakdown of users by their roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : Object.keys(userRoles).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(userRoles).map(([role, count], index) => (
                    <motion.div
                      key={role}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-primary/10">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium capitalize">{role.toLowerCase()}</p>
                          <p className="text-sm text-muted-foreground">
                            {(count / metrics.users.total * 100).toFixed(1)}% of total
                          </p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        {count}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No user data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Search Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Top Search Terms
              </CardTitle>
              <CardDescription>
                Most searched terms by users
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : topSearchTerms.length > 0 ? (
                <div className="space-y-3">
                  {topSearchTerms.map((term, index) => (
                    <motion.div
                      key={term.query}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-lg font-bold px-2 py-1">
                          #{index + 1}
                        </Badge>
                        <div className="font-medium truncate">
                          "{term.query}"
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Activity className="h-4 w-4" />
                        <span className="font-semibold">{term.count}</span>
                        <span className="text-sm">searches</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No search data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Resources */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Top Resources by Downloads
              </CardTitle>
              <CardDescription>
                Most downloaded resources on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <Skeleton className="h-8 w-20" />
                    </div>
                  ))}
                </div>
              ) : topResources.length > 0 ? (
                <div className="space-y-4">
                  {topResources.map((resource, index) => (
                    <motion.div
                      key={resource.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={index === 0 ? "default" : "secondary"} 
                          className="text-lg font-bold w-8 h-8 flex items-center justify-center"
                        >
                          {index + 1}
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link 
                          href={`/resources/${resource.id}`}
                          className="font-medium truncate hover:text-primary transition-colors block"
                        >
                          {resource.title}
                        </Link>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            <span>{resource.downloadCount} downloads</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{resource.viewCount} views</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {resource.downloadCount}
                          </div>
                          <div className="text-xs text-muted-foreground">downloads</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-semibold">
                            {resource.viewCount}
                          </div>
                          <div className="text-xs text-muted-foreground">views</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No resource data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity Summary */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity Summary
              </CardTitle>
              <CardDescription>
                Overview of recent platform activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="p-4 rounded-lg border bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20"
                  >
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {metrics?.downloads?.recent || 0}
                    </div>
                    <div className="text-sm font-medium mt-1">Recent Downloads</div>
                    <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 rounded-lg border bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20"
                  >
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {metrics?.searches?.recent || 0}
                    </div>
                    <div className="text-sm font-medium mt-1">Recent Searches</div>
                    <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 rounded-lg border bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20"
                  >
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {metrics?.requests?.pending || 0}
                    </div>
                    <div className="text-sm font-medium mt-1">Pending Requests</div>
                    <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="p-4 rounded-lg border bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20"
                  >
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {metrics?.resources?.total || 0}
                    </div>
                    <div className="text-sm font-medium mt-1">Active Resources</div>
                    <p className="text-xs text-muted-foreground mt-1">Total available</p>
                  </motion.div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}