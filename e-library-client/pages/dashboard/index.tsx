// import { useEffect } from "react";
// import { useRouter } from "next/router";
// import { DashboardLayout } from "@/components/layout/DashboardLayout";
// import { useRole } from "@/hooks/useAuth";
// import { useLatestResources, useTrendingResources } from "@/hooks/useResources";
// import { useMyRequests } from "@/hooks/useRequests";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Skeleton } from "@/components/ui/skeleton";
// import Link from "next/link";
// import { motion } from "framer-motion";
// import {
//   FileText,
//   TrendingUp,
//   Clock,
//   ArrowRight,
//   Upload,
//   Search,
//   BookOpen,
//   ClipboardList,
// } from "lucide-react";

// export default function DashboardPage() {
//   const router = useRouter();
//   const { user, isAdmin, isStaffOrAdmin, can } = useRole();
//   const { data: latestResources, isLoading: loadingLatest } = useLatestResources();
//   const { data: trendingResources, isLoading: loadingTrending } = useTrendingResources();
//   const { data: myRequests, isLoading: loadingRequests } = useMyRequests();

//   useEffect(() => {
//     if (isAdmin) {
//       router.replace("/dashboard/admin");
//     }
//   }, [isAdmin, router]);

//   const quickActions = [
//     { name: "Browse Resources", href: "/resources", icon: BookOpen, color: "bg-blue-500" },
//     // { name: "Search", href: "/search", icon: Search, color: "bg-purple-500" },
//     { name: "My Requests", href: "/requests", icon: ClipboardList, color: "bg-orange-500" },
//   ];

//   if (isStaffOrAdmin) {
//     quickActions.push({
//       name: "Upload Resource",
//       href: "/resources/upload",
//       icon: Upload,
//       color: "bg-green-500",
//     });
//   }

//   return (
//     <DashboardLayout title="Dashboard">
//       <div className="space-y-8">
//         <div>
//           <h2 className="text-3xl font-bold tracking-tight">
//             Welcome back, {user?.firstName}!
//           </h2>
//           <p className="text-muted-foreground mt-1">
//             Here&apos;s what&apos;s happening with your resources today.
//           </p>
//         </div>
//         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//           {quickActions.map((action, index) => (
//             <motion.div
//               key={action.name}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: index * 0.1 }}
//             >
//               <Link href={action.href}>
//                 <Card className="hover:shadow-md transition-shadow cursor-pointer">
//                   <CardContent className="flex items-center gap-4 p-6">
//                     <div className={`p-3 rounded-lg ${action.color}`}>
//                       <action.icon className="h-6 w-6 text-white" />
//                     </div>
//                     <div>
//                       <p className="font-medium">{action.name}</p>
//                       <p className="text-sm text-muted-foreground">Quick access</p>
//                     </div>
//                   </CardContent>
//                 </Card>
//               </Link>
//             </motion.div>
//           ))}
//         </div>
//         <div className="grid gap-6 lg:grid-cols-2">
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between">
//               <div>
//                 <CardTitle className="flex items-center gap-2">
//                   <TrendingUp className="h-5 w-5 text-primary" />
//                   Trending Resources
//                 </CardTitle>
//                 <CardDescription>Most popular resources this week</CardDescription>
//               </div>
//               <Button variant="ghost" size="sm" asChild>
//                 <Link href="/resources">
//                   View all
//                   <ArrowRight className="ml-2 h-4 w-4" />
//                 </Link>
//               </Button>
//             </CardHeader>
//             <CardContent>
//               {loadingTrending ? (
//                 <div className="space-y-3">
//                   {[1, 2, 3].map((i) => (
//                     <div key={i} className="flex items-center gap-3">
//                       <Skeleton className="h-10 w-10 rounded" />
//                       <div className="flex-1">
//                         <Skeleton className="h-4 w-3/4 mb-2" />
//                         <Skeleton className="h-3 w-1/2" />
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : trendingResources && trendingResources.length > 0 ? (
//                 <div className="space-y-3">
//                   {trendingResources.slice(0, 5).map((resource) => (
//                     <Link
//                       key={resource.id}
//                       href={`/resources/${resource.id}`}
//                       className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
//                     >
//                       <div className="p-2 bg-primary/10 rounded">
//                         <FileText className="h-5 w-5 text-primary" />
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <p className="font-medium truncate">{resource.title}</p>
//                         <p className="text-sm text-muted-foreground">
//                           {resource.downloadCount} downloads
//                         </p>
//                       </div>
//                       <Badge variant="secondary">{resource.type}</Badge>
//                     </Link>
//                   ))}
//                 </div>
//               ) : (
//                 <p className="text-muted-foreground text-center py-4">
//                   No trending resources yet
//                 </p>
//               )}
//             </CardContent>
//           </Card>
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between">
//               <div>
//                 <CardTitle className="flex items-center gap-2">
//                   <Clock className="h-5 w-5 text-primary" />
//                   Latest Resources
//                 </CardTitle>
//                 <CardDescription>Recently added resources</CardDescription>
//               </div>
//               <Button variant="ghost" size="sm" asChild>
//                 <Link href="/resources">
//                   View all
//                   <ArrowRight className="ml-2 h-4 w-4" />
//                 </Link>
//               </Button>
//             </CardHeader>
//             <CardContent>
//               {loadingLatest ? (
//                 <div className="space-y-3">
//                   {[1, 2, 3].map((i) => (
//                     <div key={i} className="flex items-center gap-3">
//                       <Skeleton className="h-10 w-10 rounded" />
//                       <div className="flex-1">
//                         <Skeleton className="h-4 w-3/4 mb-2" />
//                         <Skeleton className="h-3 w-1/2" />
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : latestResources && latestResources.length > 0 ? (
//                 <div className="space-y-3">
//                   {latestResources.slice(0, 5).map((resource) => (
//                     <Link
//                       key={resource.id}
//                       href={`/resources/${resource.id}`}
//                       className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
//                     >
//                       <div className="p-2 bg-primary/10 rounded">
//                         <FileText className="h-5 w-5 text-primary" />
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <p className="font-medium truncate">{resource.title}</p>
//                         <p className="text-sm text-muted-foreground">{resource.category}</p>
//                       </div>
//                       <Badge variant="secondary">{resource.type}</Badge>
//                     </Link>
//                   ))}
//                 </div>
//               ) : (
//                 <p className="text-muted-foreground text-center py-4">
//                   No resources yet
//                 </p>
//               )}
//             </CardContent>
//           </Card>
//         </div>
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between">
//             <div>
//               <CardTitle className="flex items-center gap-2">
//                 <ClipboardList className="h-5 w-5 text-primary" />
//                 My Recent Requests
//               </CardTitle>
//               <CardDescription>Track your resource requests</CardDescription>
//             </div>
//             <Button variant="ghost" size="sm" asChild>
//               <Link href="/requests">
//                 View all
//                 <ArrowRight className="ml-2 h-4 w-4" />
//               </Link>
//             </Button>
//           </CardHeader>
//           <CardContent>
//             {loadingRequests ? (
//               <div className="space-y-3">
//                 {[1, 2, 3].map((i) => (
//                   <div key={i} className="flex items-center gap-3">
//                     <Skeleton className="h-10 w-10 rounded" />
//                     <div className="flex-1">
//                       <Skeleton className="h-4 w-3/4 mb-2" />
//                       <Skeleton className="h-3 w-1/2" />
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : myRequests && myRequests.length > 0 ? (
//               <div className="space-y-3">
//                 {myRequests.slice(0, 5).map((request) => (
//                   <div
//                     key={request.id}
//                     className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
//                   >
//                     <div className="p-2 bg-primary/10 rounded">
//                       <ClipboardList className="h-5 w-5 text-primary" />
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <p className="font-medium truncate">{request.title}</p>
//                       <p className="text-sm text-muted-foreground">{request.category}</p>
//                     </div>
//                     <Badge
//                       variant={
//                         request.status === "RESOLVED"
//                           ? "success"
//                           : request.status === "REJECTED"
//                           ? "destructive"
//                           : request.status === "IN_PROGRESS"
//                           ? "warning"
//                           : "secondary"
//                       }
//                     >
//                       {request.status.replace("_", " ")}
//                     </Badge>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-8">
//                 <p className="text-muted-foreground mb-4">
//                   You haven&apos;t made any requests yet
//                 </p>
//                 <Button asChild>
//                   <Link href="/requests/new">Create Request</Link>
//                 </Button>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     </DashboardLayout>
//   );
// }



// pages/dashboard/index.tsx - Updated Dashboard Page
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SearchModal } from "@/components/modals/SearchModal";
import { useRole } from "@/hooks/useAuth";
import { useLatestResources, useTrendingResources } from "@/hooks/useResources";
import { useMyRequests } from "@/hooks/useRequests";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  TrendingUp,
  Clock,
  ArrowRight,
  Upload,
  Search,
  BookOpen,
  ClipboardList,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAdmin, isStaffOrAdmin } = useRole();
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  
  const { data: latestResources, isLoading: loadingLatest } = useLatestResources();
  const { data: trendingResources, isLoading: loadingTrending } = useTrendingResources();
  const { data: myRequests, isLoading: loadingRequests } = useMyRequests();

  useEffect(() => {
    if (isAdmin) {
      router.replace("/dashboard/admin");
    }
  }, [isAdmin, router]);

  const quickActions = [
    { name: "Browse Resources", href: "/resources", icon: BookOpen, color: "bg-blue-500" },
    { name: "My Requests", href: "/requests", icon: ClipboardList, color: "bg-orange-500" },
  ];

  if (isStaffOrAdmin) {
    quickActions.push({
      name: "Upload Resource",
      href: "/resources/upload",
      icon: Upload,
      color: "bg-green-500",
    });
  }

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.name}!
          </h2>
          <p className="text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with your resources today.
          </p>
        </div>

        {/* Search Field */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search for resources, courses..."
                className="pl-10 h-12 text-lg cursor-pointer"
                onClick={() => setSearchModalOpen(true)}
                readOnly
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={action.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className={`p-3 rounded-lg ${action.color}`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{action.name}</p>
                      <p className="text-sm text-muted-foreground">Quick access</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Trending and Latest Resources */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Trending Resources
                </CardTitle>
                <CardDescription>Most popular resources this week</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/resources">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loadingTrending ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : trendingResources && trendingResources.length > 0 ? (
                <div className="space-y-3">
                  {trendingResources.slice(0, 5).map((resource) => (
                    <Link
                      key={resource.id}
                      href={`/resources/${resource.id}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="p-2 bg-primary/10 rounded">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{resource.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {resource.downloadCount} downloads
                        </p>
                      </div>
                      <Badge variant="secondary">{resource.type}</Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No trending resources yet
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Latest Resources
                </CardTitle>
                <CardDescription>Recently added resources</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/resources">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loadingLatest ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : latestResources && latestResources.length > 0 ? (
                <div className="space-y-3">
                  {latestResources.slice(0, 5).map((resource) => (
                    <Link
                      key={resource.id}
                      href={`/resources/${resource.id}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="p-2 bg-primary/10 rounded">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{resource.title}</p>
                        <p className="text-sm text-muted-foreground">{resource.category}</p>
                      </div>
                      <Badge variant="secondary">{resource.type}</Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No resources yet
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* My Recent Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                My Recent Requests
              </CardTitle>
              <CardDescription>Track your resource requests</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/requests">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loadingRequests ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : myRequests && myRequests.length > 0 ? (
              <div className="space-y-3">
                {myRequests.slice(0, 5).map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="p-2 bg-primary/10 rounded">
                      <ClipboardList className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{request.title}</p>
                      <p className="text-sm text-muted-foreground">{request.category}</p>
                    </div>
                    <Badge
                      variant={
                        request.status === "RESOLVED"
                          ? "success"
                          : request.status === "REJECTED"
                          ? "destructive"
                          : request.status === "IN_PROGRESS"
                          ? "warning"
                          : "secondary"
                      }
                    >
                      {request.status.replace("_", " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  You haven&apos;t made any requests yet
                </p>
                <Button asChild>
                  <Link href="/requests/new">Create Request</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Search Modal */}
      <SearchModal open={searchModalOpen} onOpenChange={setSearchModalOpen} />
    </DashboardLayout>
  );
}