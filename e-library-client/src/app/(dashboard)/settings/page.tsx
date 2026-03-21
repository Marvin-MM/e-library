"use client";

import { useRole, useLogout } from "@/hooks/useAuth";
import { useUIStore } from "@/stores/uiStore";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor, LogOut, ShieldCheck } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <p className="text-[11px] uppercase text-zinc-400 dark:text-zinc-500 font-semibold px-1 mb-3">
                {title}
            </p>
            <div className="rounded overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                {children}
            </div>
        </div>
    );
}

function Row({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn("flex items-center justify-between px-5 py-4 gap-4", className)}>
            {children}
        </div>
    );
}

function RowLabel({ label, hint }: { label: string; hint?: string }) {
    return (
        <div className="space-y-0.5">
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{label}</p>
            {hint && <p className="text-xs text-zinc-400 dark:text-zinc-500">{hint}</p>}
        </div>
    );
}

const ROLE_STYLES: Record<string, string> = {
    ADMIN: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
    STAFF: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
    USER: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

export default function SettingsPage() {
    const { user, role } = useRole();
    const { mutate: logout, isPending } = useLogout();
    const { reducedMotion, setReducedMotion } = useUIStore();
    const { theme, setTheme } = useTheme();

    const themeOptions = [
        { value: "light", icon: Sun },
        { value: "dark", icon: Moon },
        { value: "system", icon: Monitor },
    ] as const;

    return (
        <div className="mx-auto py-2 px-4 space-y-8">
            {/* Profile */}
            <Section title="Account">
                <Row>
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 shrink-0">
                            <AvatarImage src={user?.avatar} />
                            <AvatarFallback className="text-sm font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                                {user ? getInitials(`${user.firstName} ${user.lastName}`) : "?"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">
                                {user?.email}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {user?.isVerified && (
                            <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        )}
                        <span className={cn(
                            "text-[11px] font-semibold px-2 py-0.5 rounded-full",
                            ROLE_STYLES[role ?? "USER"]
                        )}>
                            {role}
                        </span>
                    </div>
                </Row>
                <Row>
                    <RowLabel label="Email" hint={user?.email} />
                </Row>
                <Row>
                    <RowLabel label="Password" hint="Last changed 30 days ago" />
                </Row>
            </Section>

            {/* Appearance */}
            <Section title="Appearance">
                <Row>
                    <RowLabel label="Theme" hint="Choose your preferred colour scheme" />
                    <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
                        {themeOptions.map(({ value, icon: Icon }) => (
                            <button
                                key={value}
                                onClick={() => setTheme(value)}
                                className={cn(
                                    "p-2 rounded-lg transition-all",
                                    theme === value
                                        ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100"
                                        : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                            </button>
                        ))}
                    </div>
                </Row>
                <Row>
                    <RowLabel
                        label="Reduce Motion"
                        hint="Minimise animations for accessibility"
                    />
                    <Switch checked={reducedMotion} onCheckedChange={setReducedMotion} />
                </Row>
            </Section>

            {/* Notifications */}
            <Section title="Notifications">
                <Row className="opacity-50 cursor-not-allowed">
                    <RowLabel
                        label="Push Notifications"
                        hint="Receive updates about your requests"
                    />
                    <Switch disabled />
                </Row>
            </Section>

            {/* Session */}
            <Section title="Session">
                <Row>
                    <RowLabel label="Sign out" hint="End your current session" />
                    <button
                        onClick={() => logout()}
                        disabled={isPending}
                        className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                    >
                        <LogOut className="h-4 w-4" />
                        {isPending ? "Signing out…" : "Sign out"}
                    </button>
                </Row>
            </Section>

        </div>
    );
}