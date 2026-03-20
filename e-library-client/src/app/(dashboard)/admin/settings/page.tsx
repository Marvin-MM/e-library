"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/hooks/useAuth";
import { useSystemSettings, useEmailSettings, useUpdateEmailProvider, useUpdateSetting, useInitializeSettings } from "@/hooks/useAdminSettings";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, RotateCcw, Settings, Mail, Globe, Shield, Activity } from "lucide-react";

export default function AdminSettingsPage() {
    const router = useRouter();
    const { isAdmin } = useRole();

    const { data: systemSettings, isLoading: isSettingsLoading } = useSystemSettings();
    const { data: emailSettings, isLoading: isEmailLoading } = useEmailSettings();

    const updateEmailProvider = useUpdateEmailProvider();
    const updateSetting = useUpdateSetting();
    const initializeSettings = useInitializeSettings();

    useEffect(() => {
        if (!isAdmin) {
            router.replace("/dashboard");
        }
    }, [isAdmin, router]);

    if (!isAdmin) return null;

    const handleProviderChange = (value: string) => {
        updateEmailProvider.mutate(value);
    };

    const handleSettingUpdate = (key: string, value: any) => {
        updateSetting.mutate({ key, value });
    };

    const handleInitialize = () => {
        if (confirm("Are you sure you want to initialize/reset all settings? This will restore defaults.")) {
            initializeSettings.mutate();
        }
    };

    if (isSettingsLoading || isEmailLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] animate-pulse">
                <Loader2 className="h-10 w-10 animate-spin text-zinc-300 mb-4" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Syncing System Registry</p>
            </div>
        );
    }

    const emailData = emailSettings?.data;
    const settingsData = systemSettings?.data || {};

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col gap-6 overflow-hidden animate-in fade-in duration-700 font-titillium">

            {/* TOP ROW: Z-Pattern Start */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                <div className="flex flex-col justify-center gap-1">
                    <h2 className="text-lg md:text-xl font-bold tracking-tight text-zinc-900 pl-3">
                        System Configuration
                    </h2>
                    <p className="text-xs text-zinc-500 pl-4 font-semibold uppercase tracking-widest text-[9px]">
                        Global settings, email registry, and infrastructure preferences
                    </p>
                </div>

                <div className="flex items-center gap-3 px-2">
                    <Button
                        variant="outline"
                        onClick={handleInitialize}
                        disabled={initializeSettings.isPending}
                        className="h-10 border-2 border-zinc-100 shadow-none bg-white rounded flex items-center gap-2 hover:bg-red-50 hover:text-red-900 hover:border-red-100 transition-all font-bold text-[10px] uppercase tracking-widest px-4 group"
                    >
                        {initializeSettings.isPending
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <RotateCcw className="h-3.5 w-3.5 group-hover:rotate-180 transition-transform duration-500" />
                        }
                        Factory Reset Defaults
                    </Button>
                </div>
            </div>

            {/* MIDDLE BODY: Z-Pattern Flow */}
            <div className="flex-1 overflow-hidden flex flex-col bg-white border-2 border-zinc-100 rounded relative shadow-sm">
                <Tabs defaultValue="email" className="flex-1 flex flex-col h-full overflow-hidden">
                    <div className="p-2 border-b-2 border-zinc-100 bg-zinc-50/50 flex items-center shrink-0 overflow-x-auto scroller-hidden">
                        <TabsList className="bg-white border-2 border-zinc-200 h-10 p-1 rounded gap-1 shadow-none w-fit">
                            <TabsTrigger value="email" className="text-[9px] uppercase font-bold tracking-widest data-[state=active]:bg-zinc-900 data-[state=active]:text-white transition-all h-full px-6 rounded">
                                <Mail className="h-3 w-3 mr-2" /> Email Logic
                            </TabsTrigger>
                            <TabsTrigger value="general" className="text-[9px] uppercase font-bold tracking-widest data-[state=active]:bg-zinc-900 data-[state=active]:text-white transition-all h-full px-6 rounded">
                                <Settings className="h-3 w-3 mr-2" /> General Config
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="p-8 max-w-4xl">

                            <TabsContent value="email" className="mt-0 outline-none space-y-8 animate-in slide-in-from-left-2 duration-300">
                                <div className="space-y-6">
                                    <div className="flex flex-col gap-2">
                                        <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2 uppercase tracking-wide">
                                            <Shield className="h-4 w-4 text-zinc-400" />
                                            Transmission Authority
                                        </h3>
                                        <p className="text-xs text-zinc-500 leading-relaxed font-medium pl-6">Configure the underlying engine for sending system notifications and OTPs.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pl-6 border-l-4 border-zinc-50">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 block">Active Provider Registry</Label>
                                            <Select
                                                value={emailData?.provider}
                                                onValueChange={handleProviderChange}
                                                disabled={updateEmailProvider.isPending}
                                            >
                                                <SelectTrigger className="h-12 border-2 border-zinc-100 shadow-none bg-zinc-50/50 rounded focus:ring-0 uppercase text-xs font-bold tracking-wider text-zinc-700 hover:border-zinc-300 transition-all cursor-pointer">
                                                    <SelectValue placeholder="SELECT ENTITY" />
                                                </SelectTrigger>
                                                <SelectContent className="border-2 border-zinc-100 shadow-xl rounded">
                                                    <SelectItem value="console" className="text-xs font-bold uppercase tracking-widest py-3">Console Authority (DEV)</SelectItem>
                                                    <SelectItem value="resend" className="text-xs font-bold uppercase tracking-widest py-3">Resend.io (SAAS)</SelectItem>
                                                    <SelectItem value="nodemailer" className="text-xs font-bold uppercase tracking-widest py-3">SMTP / Nodemailer</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50/50 border border-blue-100/50 rounded w-fit">
                                                <Activity className="h-3 w-3 text-blue-600 animate-pulse" />
                                                <span className="text-[9px] font-bold uppercase tracking-widest text-blue-900">Live Status: {emailData?.provider}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 block">Sender Identity Mask</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
                                                <Input
                                                    defaultValue={emailData?.fromEmail}
                                                    disabled={true}
                                                    placeholder="noreply@e-library.edu"
                                                    className="h-12 pl-10 border-2 border-zinc-100 bg-zinc-50 font-bold text-zinc-400 rounded focus-visible:ring-0 shadow-none"
                                                />
                                            </div>
                                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tight italic">Managed via system environment variables (.ENV)</p>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="general" className="mt-0 outline-none space-y-8 animate-in slide-in-from-right-2 duration-300">
                                <div className="space-y-6">
                                    <div className="flex flex-col gap-2">
                                        <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2 uppercase tracking-wide">
                                            <Globe className="h-4 w-4 text-zinc-400" />
                                            Platform Global Registry
                                        </h3>
                                        <p className="text-xs text-zinc-500 leading-relaxed font-medium pl-6">Review and override core system-wide behavioral logic.</p>
                                    </div>

                                    <div className="space-y-4 pl-6">
                                        {Object.entries(settingsData).map(([key, setting]: [string, any]) => (
                                            <div key={key} className="flex flex-col gap-3 p-4 bg-zinc-50/30 border-2 border-transparent hover:border-zinc-100 hover:bg-white rounded transition-all group">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex flex-col gap-1">
                                                        <Label htmlFor={key} className="text-xs font-bold uppercase tracking-widest text-zinc-600 group-hover:text-zinc-900 transition-colors">
                                                            {key.replace(/_/g, ' ')}
                                                        </Label>
                                                        <span className="text-[10px] font-medium text-zinc-400 leading-tight">
                                                            {setting.description || 'Core system instruction set.'}
                                                        </span>
                                                    </div>

                                                    {setting.type === 'BOOLEAN' ? (
                                                        <Switch
                                                            id={key}
                                                            checked={!!setting.value}
                                                            onCheckedChange={(checked) => handleSettingUpdate(key, checked)}
                                                            disabled={updateSetting.isPending}
                                                            className="data-[state=checked]:bg-blue-900 border-2 border-transparent"
                                                        />
                                                    ) : (
                                                        <Input
                                                            id={key}
                                                            defaultValue={String(setting.value)}
                                                            onBlur={(e) => {
                                                                if (String(setting.value) !== e.target.value) {
                                                                    handleSettingUpdate(key, e.target.value);
                                                                }
                                                            }}
                                                            disabled={updateSetting.isPending}
                                                            className="w-[280px] h-10 border-2 border-zinc-100 bg-white font-bold text-xs rounded focus-visible:ring-0 focus-visible:border-zinc-900 transition-all shadow-none"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {Object.keys(settingsData).length === 0 && (
                                            <div className="flex flex-col items-center justify-center py-20 opacity-40">
                                                <Settings className="h-10 w-10 text-zinc-300 mb-4" />
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Empty logical registry</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>
                        </div>
                    </ScrollArea>
                </Tabs>
            </div>

            {/* Logic to lock viewport remains consistent with Users page */}
        </div>
    );
}
