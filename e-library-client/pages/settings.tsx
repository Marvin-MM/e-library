import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useRole, useLogout } from "@/hooks/useAuth";
import { useUIStore } from "@/stores/uiStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { User, Moon, Sun, Eye, LogOut, Shield } from "lucide-react";
import { getInitials } from "@/lib/utils";

export default function SettingsPage() {
  const { user, role } = useRole();
  const { mutate: logout, isPending } = useLogout();
  const { reducedMotion, setReducedMotion } = useUIStore();
  const { theme, setTheme } = useTheme();

  return (
    <DashboardLayout title="Settings">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="text-lg">
                    {user ? getInitials(`${user.firstName} ${user.lastName}`) : "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <p className="text-muted-foreground">{user?.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={role === "ADMIN" ? "destructive" : role === "STAFF" ? "default" : "secondary"}>
                      {role}
                    </Badge>
                    {user?.isVerified && (
                      <Badge variant="outline" className="gap-1">
                        <Shield className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription>Customize your display preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Toggle between light and dark themes
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-muted-foreground" />
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                  />
                  <Moon className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Reduce Motion</Label>
                  <p className="text-sm text-muted-foreground">
                    Minimize animations for accessibility
                  </p>
                </div>
                <Switch
                  checked={reducedMotion}
                  onCheckedChange={setReducedMotion}
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <LogOut className="h-5 w-5" />
                Session
              </CardTitle>
              <CardDescription>Manage your current session</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={() => logout()}
                disabled={isPending}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
