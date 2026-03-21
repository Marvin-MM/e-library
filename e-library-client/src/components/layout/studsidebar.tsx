"use client";

import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { DiscoverySearchModal } from '@/components/modals/DiscoverySearchModal';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { useLogout } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { useDepartments } from '@/hooks/useCourses';
import { useDepartmentStore } from '@/stores/departmentStore';

import {
  BookAIcon, BoxSelectIcon, ChevronRight, ChevronsUpDown, Film, HandCoins, Heart,
  Library, LogOut, Moon, MoreVertical, Palette, Settings, Sun, User, Zap, Building2, Loader2
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isCollapsed = false }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);

  const { user } = useAuthStore();
  const logoutMutation = useLogout();
  const userName = user?.firstName || user?.name || "Student";
  const userAvatar = user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}`;

  const { selectedSources, setSelectedSources } = useDiscoveryStore();
  
  // Fetch dynamic departments & hook up to global store
  const { data: departments, isLoading: isDeptsLoading } = useDepartments();
  const { selectedDepartment, setSelectedDepartment } = useDepartmentStore();

  const profileRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);

  // Auto-select first department if none is selected yet
  useEffect(() => {
    if (departments && departments.length > 0 && !selectedDepartment) {
      setSelectedDepartment(departments[0]);
    }
  }, [departments, selectedDepartment, setSelectedDepartment]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
        setActiveSubMenu(null);
      }
      if (workspaceRef.current && !workspaceRef.current.contains(event.target as Node)) {
        setIsWorkspaceOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuGroups = [
    {
      title: "Home",
      items: [
        { id: '/dashboard', label: 'Discover', icon: Film },
        { id: "/students/library", label: "My Library", icon: Library, badge: "12" },
      ]
    },
    {
      title: "Resources",
      items: [
        { id: '/course-dissertations', label: 'Course Dissertations', icon: HandCoins }, // Updated link
        { id: '/resources', label: 'Resources', icon: BoxSelectIcon },
        { id: '/students/favourites', label: 'Favourites', icon: Heart },
      ]
    }
  ];

  return (
    <aside className={cn(
      "flex flex-col h-screen border-r border-zinc-200 fixed inset-y-0 left-0 overflow-hidden transition-all duration-300 ease-in-out z-40 bg-white shadow-sm",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header / Workspace Changer */}
      <div className="p-3 relative" ref={workspaceRef}>
        <button
          onClick={() => !isCollapsed && setIsWorkspaceOpen(!isWorkspaceOpen)}
          disabled={isDeptsLoading}
          className={cn(
            "w-full flex items-center justify-between p-2 rounded-lg bg-white border border-zinc-200 transition-all",
            !isCollapsed && "hover:bg-zinc-50"
          )}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center shrink-0">
               {isDeptsLoading ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : <Building2 className="w-3.5 h-3.5 text-white" />}
            </div>
            {!isCollapsed && (
                <span className="text-sm font-semibold text-zinc-900 truncate">
                    {selectedDepartment || "Loading Departments..."}
                </span>
            )}
          </div>
          {!isCollapsed && <ChevronsUpDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />}
        </button>

        <AnimatePresence>
          {isWorkspaceOpen && departments && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              className="absolute top-full left-3 right-3 mt-1 bg-white border border-zinc-200 rounded-xl overflow-hidden z-50 py-1 shadow-xl"
            >
              <div className="px-1 space-y-0.5 border-b border-zinc-100 pb-1 mb-1 max-h-60 overflow-y-auto custom-scrollbar">
                {departments.map((dept) => (
                  <button
                    key={dept}
                    onClick={() => {
                      setSelectedDepartment(dept);
                      setIsWorkspaceOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-2 py-1.5 rounded text-sm transition-colors text-left",
                      selectedDepartment === dept
                        ? "bg-zinc-100 text-zinc-900 font-semibold"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded flex items-center justify-center shrink-0",
                      selectedDepartment === dept ? "bg-blue-800" : "bg-zinc-200"
                    )}>
                      <Building2 className={cn("w-3 h-3", selectedDepartment === dept ? "text-white" : "text-zinc-500")} />
                    </div>
                    <span className="truncate">{dept}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto scrollbar-hide py-6 px-3">
        {menuGroups.map((group) => (
          <div key={group.title} className="mb-6">
            {!isCollapsed && <h3 className="px-2 text-[14px] text-zinc-500 mb-2">{group.title}</h3>}
            <nav className="space-y-1.5">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-2 py-2 rounded transition-all group",
                    activeTab === item.id ? "bg-blue-800 text-white shadow-sm" : "text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900",
                    isCollapsed && "justify-center px-0"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <div className={cn("flex items-center gap-2.5", isCollapsed && "gap-0")}>
                    <item.icon className={cn("w-4 h-4 shrink-0", activeTab === item.id ? "text-white" : "text-zinc-500 group-hover:text-zinc-700")} />
                    {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                  </div>
                </button>
              ))}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer User Area (Kept original logic for brevity) */}
      <div className="p-3 mt-auto border-t border-zinc-200 relative" ref={profileRef}>
         <button onClick={() => logoutMutation.mutate()} className="w-full flex items-center justify-center p-2 rounded hover:bg-zinc-100 text-zinc-500 transition">
             <LogOut className="w-4 h-4" /> {!isCollapsed && <span className="ml-2 text-sm font-bold">Logout</span>}
         </button>
      </div>
    </aside>
  );
};

export default Sidebar;