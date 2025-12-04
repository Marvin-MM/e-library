import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useMyRequests, useCreateRequest } from "@/hooks/useRequests";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { ClipboardList, Plus, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createRequestSchema, type CreateRequestFormData } from "@/schemas/requests";
import { categoryOptions } from "@/schemas/resources";
import { formatDate } from "@/lib/utils";

export default function RequestsPage() {
  const { data: requestsData, isLoading } = useMyRequests();
  const { mutate: createRequest, isPending } = useCreateRequest();
  const [dialogOpen, setDialogOpen] = useState(false);

  const requests = requestsData || [];

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateRequestFormData>({
    resolver: zodResolver(createRequestSchema),
  });

  const onSubmit = (data: CreateRequestFormData) => {
    // Map frontend field names to backend field names
    const requestData = {
      title: data.title,
      authors: data.authors || undefined,
      reason: data.reason, // Changed from description to reason
      category: data.category,
    };

    createRequest(requestData, {
      onSuccess: () => {
        setDialogOpen(false);
        reset();
      },
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return "default";
      case "REJECTED":
        return "destructive";
      case "IN_PROGRESS":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <DashboardLayout title="My Requests">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">My Requests</h2>
            <p className="text-muted-foreground">
              Track your resource requests and their status
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Request</DialogTitle>
                <DialogDescription>
                  Request a resource that you need. Our team will review and fulfill it.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="What resource do you need?"
                    {...register("title")}
                    className={errors.title ? "border-destructive" : ""}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="authors">Authors (Optional)</Label>
                  <Input
                    id="authors"
                    placeholder="e.g., John Doe, Jane Smith"
                    {...register("authors")}
                    className={errors.authors ? "border-destructive" : ""}
                  />
                  {errors.authors && (
                    <p className="text-sm text-destructive">{errors.authors.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason/Description</Label>
                  <Textarea
                    id="reason"
                    placeholder="Describe what you're looking for in detail..."
                    rows={4}
                    {...register("reason")}
                    className={errors.reason ? "border-destructive" : ""}
                  />
                  {errors.reason && (
                    <p className="text-sm text-destructive">{errors.reason.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Category (Optional)</Label>
                  <Select onValueChange={(value) => setValue("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Request
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-10 w-10 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : requests && requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                        <ClipboardList className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <h3 className="font-semibold">{request.title}</h3>
                          <div className="flex gap-2">
                            <Badge variant={getStatusVariant(request.status)}>
                              {request.status.replace("_", " ")}
                            </Badge>
                          </div>
                        </div>
                        
                        {request.authors && (
                          <p className="text-sm text-muted-foreground mb-1">
                            <strong>Authors:</strong> {request.authors}
                          </p>
                        )}
                        
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
                          <strong>Reason:</strong> {request.reason}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {request.category && <span>{request.category}</span>}
                          <span>Created {formatDate(request.createdAt)}</span>
                          {request.resolvedAt && (
                            <span>Resolved {formatDate(request.resolvedAt)}</span>
                          )}
                        </div>
                        
                        {request.adminReply && (
                          <div className="mt-3 p-3 bg-muted rounded-lg">
                            <p className="text-sm font-medium mb-1">Admin Reply:</p>
                            <p className="text-sm text-muted-foreground">{request.adminReply}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No requests yet</h3>
              <p className="text-muted-foreground text-center max-w-sm mb-4">
                You haven&apos;t made any resource requests yet. Create one to get started.
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Request
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}