"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/hooks/useAuth";
import { useAdminUsers, useUpdateUserRole, useDeleteUser } from "@/hooks/useAdmin";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
    Users,
    Search,
    MoreHorizontal,
    Shield,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Mail,
    Calendar,
    Settings
} from "lucide-react";
import { getInitials, formatDate } from "@/lib/utils";
import type { User, UserRole } from "@/types/api";

export default function AdminUsersPage() {
    const router = useRouter();
    const { isAdmin, user: currentUser } = useRole();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [roleDialogOpen, setRoleDialogOpen] = useState(false);
    const [newRole, setNewRole] = useState<UserRole>("STUDENT");

    const { data, isLoading } = useAdminUsers({
        page,
        limit: 20,
        search: search || undefined,
        role: roleFilter === "all" ? undefined : roleFilter,
    });
    const { mutate: updateRole, isPending: updatingRole } = useUpdateUserRole();
    const { mutate: deleteUser, isPending: deletingUser } = useDeleteUser();

    const users = data?.data || [];
    const pagination = data?.pagination;

    useEffect(() => {
        if (!isAdmin) {
            router.replace("/dashboard");
        }
    }, [isAdmin, router]);

    if (!isAdmin) {
        return null;
    }

    const handleUpdateRole = () => {
        if (selectedUser) {
            updateRole(
                { id: selectedUser.id, data: { role: newRole } },
                {
                    onSuccess: () => {
                        setRoleDialogOpen(false);
                        setSelectedUser(null);
                    },
                }
            );
        }
    };

    const handleDeleteUser = () => {
        if (selectedUser) {
            deleteUser(selectedUser.id, {
                onSuccess: () => {
                    setDeleteDialogOpen(false);
                    setSelectedUser(null);
                },
            });
        }
    };

    const canDeleteUser = (user: User) => {
        return user.id !== currentUser?.id && user.role !== "ADMIN";
    };

    const getRoleBadgeVariant = (role: UserRole) => {
        switch (role) {
            case "ADMIN":
                return "destructive";
            case "STAFF":
                return "default";
            default:
                return "secondary";
        }
    };

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col gap-6 overflow-hidden animate-in fade-in duration-700 font-titillium">

            {/* TOP ROW: Z-Pattern Start */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
                <div className="flex flex-col justify-center gap-2">
                    <h2 className="text-lg md:text-xl font-bold tracking-tight text-zinc-900 pl-3">
                        User Management
                    </h2>
                    <p className="text-xs text-zinc-500 pl-4 font-semibold text-[10px]">
                        Manage roles, permissions, & accounts
                    </p>
                </div>

                {/* Z-Pattern Top Right: Actions & Tools */}
                <div className="flex items-center justify-end gap-3 px-2">
                    <div className="relative w-64 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-blue-900 transition-colors" />
                        <Input
                            placeholder="Search by name or email..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="pl-9 h-11 border-2 border-zinc-100 shadow-none bg-white focus-visible:ring-0 focus-visible:border-blue-900 transition-all rounded"
                        />
                    </div>
                    <Select
                        value={roleFilter}
                        onValueChange={(value) => {
                            setRoleFilter(value);
                            setPage(1);
                        }}
                    >
                        <SelectTrigger className="w-[140px] h-11 border-2 border-zinc-100 shadow-none bg-white rounded focus:ring-0 uppercase text-[10px] font-bold tracking-wider text-zinc-600 hover:border-zinc-300 transition-all cursor-pointer">
                            <SelectValue placeholder="ALL ROLES" />
                        </SelectTrigger>
                        <SelectContent className="border-2 border-zinc-100 shadow-xl rounded">
                            <SelectItem value="all" className="text-xs uppercase font-bold tracking-widest py-3">All Roles</SelectItem>
                            <SelectItem value="ADMIN" className="text-xs uppercase font-bold tracking-widest text-red-600 py-3">Admin</SelectItem>
                            <SelectItem value="STAFF" className="text-xs uppercase font-bold tracking-widest text-blue-600 py-3">Staff</SelectItem>
                            <SelectItem value="STUDENT" className="text-xs uppercase font-bold tracking-widest text-zinc-600 py-3">Student</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* MIDDLE BODY: Z-Pattern Diagonal Flow -> Main Content */}
            <div className="flex-1 overflow-hidden flex flex-col bg-white rounded relative shadow-sm">

                {/* Header Row for Table */}
                <div className="grid grid-cols-12 gap-4 p-4 border-b-2 border-zinc-100 bg-zinc-50/50 text-[10px] font-bold uppercase tracking-widest text-zinc-400 shrink-0">
                    <div className="col-span-5 pl-4">User Details</div>
                    <div className="col-span-3 hidden sm:block">Email Address</div>
                    <div className="col-span-2 hidden md:block">Joined Date</div>
                    <div className="col-span-1">Role</div>
                    <div className="col-span-1 text-right pr-4">Actions</div>
                </div>

                {/* Users List Wrapper */}
                <ScrollArea className="flex-1">
                    {isLoading ? (
                        <div className="divide-y divide-zinc-100">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="grid grid-cols-12 gap-4 p-4 items-center animate-pulse">
                                    <div className="col-span-5 flex flex-row items-center gap-4 pl-4">
                                        <Skeleton className="h-10 w-10 border-2 border-zinc-100 rounded-full shrink-0" />
                                        <div className="flex flex-col gap-2 w-full max-w-[200px]">
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-3 w-2/3" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : users.length > 0 ? (
                        <div className="divide-y divide-zinc-100/60 pb-20">
                            {users.map((user) => (
                                <div
                                    key={user.id}
                                    className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-blue-50/30 transition-all group"
                                >
                                    {/* User Block */}
                                    <div className="col-span-11 sm:col-span-5 flex flex-row items-center gap-4 pl-2">
                                        <Avatar className="h-11 w-11 border-2 border-white shadow-sm ring-2 ring-zinc-50 group-hover:ring-blue-100 transition-all shrink-0">
                                            <AvatarImage src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.firstName + ' ' + user.lastName)}`} />
                                            <AvatarFallback className="bg-zinc-100 text-zinc-600 font-bold">
                                                {getInitials(`${user.firstName} ${user.lastName}`)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col min-w-0 pr-4">
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-zinc-900 text-sm truncate group-hover:text-blue-900 transition-colors">
                                                    {user.firstName} {user.lastName}
                                                </p>
                                            </div>
                                            {!user.isVerified && (
                                                <Badge variant="outline" className="text-[9px] uppercase tracking-widest bg-orange-50 text-orange-600 border-none w-fit mt-1 px-1.5 py-0 h-4">
                                                    Unverified
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Email Block */}
                                    <div className="col-span-3 hidden sm:flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                        <Mail className="h-3.5 w-3.5 text-zinc-400" />
                                        <p className="text-xs text-zinc-600 truncate font-medium">
                                            {user.email}
                                        </p>
                                    </div>

                                    {/* Joined Block */}
                                    <div className="col-span-2 hidden md:flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                        <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                                        <p className="text-[11px] text-zinc-500 font-medium whitespace-nowrap">
                                            {formatDate(user.createdAt)}
                                        </p>
                                    </div>

                                    {/* Role Block */}
                                    <div className="col-span-1 hidden sm:flex items-center">
                                        <Badge
                                            variant={getRoleBadgeVariant(user.role)}
                                            className="text-[9px] uppercase tracking-widest font-bold shadow-none rounded shrink-0 h-5"
                                        >
                                            {user.role}
                                        </Badge>
                                    </div>

                                    {/* Actions Block */}
                                    <div className="col-span-1 sm:col-span-1 flex justify-end pr-2">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-zinc-100 border-2 border-transparent hover:border-zinc-200 transition-all opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100">
                                                    <Settings className="h-4 w-4 text-zinc-600" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="border-2 border-zinc-100 shadow-xl rounded-xl w-48 p-1">
                                                <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold px-3 py-2">Manage User</DropdownMenuLabel>
                                                <DropdownMenuSeparator className="bg-zinc-100" />
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setNewRole(user.role);
                                                        setRoleDialogOpen(true);
                                                    }}
                                                    className="rounded-lg cursor-pointer text-xs font-semibold py-2.5 outline-none focus:bg-blue-50 focus:text-blue-900 transition-colors"
                                                >
                                                    <Shield className="mr-2 h-4 w-4 opacity-70" />
                                                    Change Role
                                                </DropdownMenuItem>
                                                {canDeleteUser(user) && (
                                                    <>
                                                        <DropdownMenuSeparator className="bg-zinc-100" />
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                setDeleteDialogOpen(true);
                                                            }}
                                                            className="rounded-lg cursor-pointer text-xs font-semibold py-2.5 outline-none focus:bg-red-50 focus:text-red-900 text-red-600 transition-colors"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4 opacity-70" />
                                                            Delete User
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 opacity-50">
                            <Users className="h-16 w-16 text-zinc-300 mb-6" />
                            <h3 className="text-xl font-bold tracking-tight text-zinc-900 mb-2">No users found</h3>
                            <p className="text-sm text-zinc-500 text-center max-w-sm">
                                {search || roleFilter !== "all"
                                    ? "0 users match your current filters. Try relaxing your search criteria."
                                    : "There are absolutely no users registered on the platform yet."}
                            </p>
                        </div>
                    )}
                </ScrollArea>
            </div>

            {/* BOTTOM ROW: Z-Pattern End (Pagination) */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-auto mb-2 px-2 shrink-0 bg-white p-3 rounded-2xl border-2 border-zinc-100">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 pl-2 hidden sm:block">
                        Showing Page <span className="text-zinc-800">{pagination.page}</span> of <span className="text-zinc-800">{pagination.totalPages}</span>
                    </span>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-2 border-zinc-100 shadow-none hover:bg-zinc-50 rounded-xl h-9 px-4 text-xs font-bold transition-all"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={!pagination.hasPrev}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-2 border-zinc-100 shadow-none hover:bg-zinc-50 rounded-xl h-9 px-4 text-xs font-bold transition-all bg-zinc-900 text-white hover:text-zinc-900 hover:border-zinc-300 border-zinc-900"
                            onClick={() => setPage((p) => p + 1)}
                            disabled={!pagination.hasNext}
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Modals remain structurally the same but styled better if needed */}
            <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
                <DialogContent className="border-2 border-zinc-100 shadow-2xl rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Manage Role</DialogTitle>
                        <DialogDescription className="text-sm text-zinc-500">
                            Adjust permissions for <span className="font-bold text-zinc-900">{selectedUser?.firstName} {selectedUser?.lastName}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Select value={newRole} onValueChange={(v) => setNewRole(v as UserRole)}>
                            <SelectTrigger className="w-full h-11 border-2 border-zinc-100 shadow-none bg-zinc-50 rounded-xl focus:ring-0 uppercase text-xs font-bold tracking-wider text-zinc-700 hover:border-zinc-300 transition-all cursor-pointer">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="border-2 border-zinc-100 shadow-xl rounded-xl">
                                <SelectItem value="STUDENT" className="text-xs uppercase font-bold tracking-widest text-zinc-600 py-3">Student Level</SelectItem>
                                <SelectItem value="STAFF" className="text-xs uppercase font-bold tracking-widest text-blue-600 py-3">Staff / Faculty Level</SelectItem>
                                <SelectItem value="ADMIN" className="text-xs uppercase font-bold tracking-widest text-red-600 py-3">Administrator Level</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" className="rounded-xl font-bold text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900" onClick={() => setRoleDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button className="rounded-xl font-bold border-2 border-blue-900 bg-blue-900 text-white shadow-none hover:bg-blue-800 transition-colors" onClick={handleUpdateRole} disabled={updatingRole}>
                            {updatingRole && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="border-2 border-red-50 shadow-2xl rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-red-600">Terminate Account</DialogTitle>
                        <DialogDescription className="text-sm text-zinc-500">
                            Are you absolutely certain you want to permanently delete <span className="font-bold text-zinc-900">{selectedUser?.firstName} {selectedUser?.lastName}</span>? This action is irreversible and all associated data will be annihilated.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button variant="ghost" className="rounded-xl font-bold text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900" onClick={() => setDeleteDialogOpen(false)}>
                            Abort
                        </Button>
                        <Button variant="destructive" className="rounded-xl font-bold shadow-none" onClick={handleDeleteUser} disabled={deletingUser}>
                            {deletingUser && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Terminate User
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
