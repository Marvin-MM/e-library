import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookAIcon,
  ChevronRight,
  ChevronsUpDown,
  Film,
  HandCoins,
  Headphones,
  Heart,
  Library,
  LogOut,
  Moon,
  MoreVertical,
  Palette,
  PlusCircle,
  Settings,
  Sun,
  User,
  Zap
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
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const [activeWorkspace, setActiveWorkspace] = useState({ id: 'Faculty of IT', name: 'Faculty of IT', icon: Zap });

  const profileRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);

  const workspaces = [
    //faculty
    { id: 'Faculty of IT', name: 'Faculty of IT', icon: Zap },
    { id: 'Faculty of Law', name: 'Faculty of Law', icon: BookAIcon },
    { id: 'Faculty of Medicine', name: 'Faculty of Medicine', icon: Palette },
    { id: 'Faculty of Science', name: 'Faculty of Science', icon: Palette },
    { id: 'Faculty of Business', name: 'Faculty of Business', icon: Palette },
    { id: 'Faculty of Education', name: 'Faculty of Education', icon: Palette },
    { id: 'Faculty of Arts', name: 'Faculty of Arts', icon: Palette },
  ];

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
        { id: '/students/dissertations', label: 'Dissertations', icon: HandCoins },
        { id: '/students/audio-books', label: 'Audio Books', icon: Headphones },
        { id: '/students/favourites', label: 'Favourites', icon: Heart },
      ]
    }
  ];

  const colors = [
    { name: 'red', color: '#ef4444' },
    { name: 'orange', color: '#f97316' },
    { name: 'amber', color: '#f59e0b' },
    { name: 'yellow', color: '#eab308' },
    { name: 'lime', color: '#84cc16' },
    { name: 'green', color: '#22c55e' },
    { name: 'emerald', color: '#10b981' },
    { name: 'teal', color: '#14b8a6' },
    { name: 'cyan', color: '#06b6d4' },
    { name: 'sky', color: '#0ea5e9' },
    { name: 'blue', color: '#3b82f6' },
    { name: 'indigo', color: '#6366f1' },
    { name: 'violet', color: '#8b5cf6' },
    { name: 'purple', color: '#a855f7' },
    { name: 'fuchsia', color: '#d946ef' },
    { name: 'pink', color: '#ec4899' },
    { name: 'rose', color: '#f43f5e' },
  ];



  const [minPrice, setMinPrice] = useState('1000');
  const [maxPrice, setMaxPrice] = useState('3800000');
  const [selectedLocation, setSelectedLocation] = useState('Kampala');
  const [selectedCondition, setSelectedCondition] = useState('New');

  const locations = [
    { name: 'Kampala', count: 12 },
    { name: 'Mbarara', count: 2 },
    { name: 'Gulu', count: 1 },
    { name: 'Jinja', count: 1 },
    { name: 'Kira', count: 1 },
  ];

  const conditions = [
    { name: 'New', count: 15 },
    { name: 'Used', count: 2 },
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
          className={cn(
            "w-full flex items-center justify-between p-2 rounded-lg bg-white border border-zinc-200 transition-all",
            !isCollapsed && "hover:bg-zinc-50"
          )}
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center shrink-0">
              <activeWorkspace.icon className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            {!isCollapsed && <span className="text-sm font-semibold text-zinc-900 truncate">{activeWorkspace.name}</span>}
          </div>
          {!isCollapsed && <ChevronsUpDown className="w-3.5 h-3.5 text-zinc-400" />}
        </button>

        <AnimatePresence>
          {isWorkspaceOpen && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              className="absolute top-full left-3 right-3 mt-1 bg-white border border-zinc-200 rounded-xl overflow-hidden z-50 py-1"
            >
              <div className="px-1 space-y-0.5 border-b border-zinc-100 pb-1 mb-1">
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      setActiveWorkspace(ws);
                      setIsWorkspaceOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-2 py-1.5 rounded text-sm transition-colors",
                      activeWorkspace.id === ws.id
                        ? "bg-zinc-100 text-zinc-900 font-semibold"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded flex items-center justify-center",
                      activeWorkspace.id === ws.id ? "bg-blue-800" : "bg-zinc-200"
                    )}>
                      <ws.icon className={cn(
                        "w-3 h-3",
                        activeWorkspace.id === ws.id ? "text-white fill-white" : "text-zinc-500"
                      )} />
                    </div>
                    <span>{ws.name}</span>
                  </button>
                ))}
              </div>
              <div className="px-1 space-y-0.5">

                <button className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors">
                  <Settings className="w-4 h-4 text-zinc-400" />
                  <span>Settings</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto scrollbar-hide py-6 px-3">
        {menuGroups.map((group) => (
          <div key={group.title} className="mb-6">
            {!isCollapsed && (
              <h3 className="px-2 text-[14px] text-zinc-500 mb-2">
                {group.title}
              </h3>
            )}
            <nav className="space-y-1.5">
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-2 py-2 rounded transition-all group",
                    activeTab === item.id
                      ? "bg-blue-800 text-white shadow-sm"
                      : "text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900",
                    isCollapsed && "justify-center px-0"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <div className={cn("flex items-center gap-2.5", isCollapsed && "gap-0")}>
                    <item.icon className={cn(
                      "w-4 h-4 shrink-0",
                      activeTab === item.id ? "text-white" : "text-zinc-500 group-hover:text-zinc-700"
                    )} />
                    {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                  </div>
                  {!isCollapsed && item.badge && (
                    <span className="text-[12px] font-medium px-1.5 py-0.5 rounded bg-white text-zinc-900 border border-zinc-200">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        ))}

        {/* Filters Section */}
        {!isCollapsed && (
          <div className="mt-4 border-t border-zinc-50 pt-6 px-2 space-y-4">
            {/* Location */}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {locations.map((loc) => (
                  <button
                    key={loc.name}
                    onClick={() => setSelectedLocation(loc.name)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-all",
                      selectedLocation === loc.name
                        ? "bg-blue-900 text-white border-blue-900"
                        : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
                    )}
                  >
                    <span>{loc.name}</span>
                    <span className={cn(
                      "text-[10px]",
                      selectedLocation === loc.name ? "text-zinc-400" : "text-zinc-400"
                    )}>({loc.count})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer / User */}
      <div className="p-3 mt-auto border-t border-zinc-200 relative" ref={profileRef}>
        <AnimatePresence>
          {isProfileOpen && !isCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-full left-3 right-3 mb-2 bg-white border border-zinc-200 rounded-xl shadow-xl overflow-hidden z-50 py-1"
            >
              {/* User Header */}
              <div className="px-3 py-2 flex items-center gap-2.5 border-b border-zinc-100 mb-1">
                <div className="w-8 h-8 rounded-full overflow-hidden ">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Benjamin"
                    alt="Profile"
                    className="w-full h-full object-cover bg-zinc-100"
                  />
                </div>
                <span className="text-sm font-semibold text-zinc-900">Canac</span>
              </div>

              {/* Group 1 */}
              <div className="px-1 space-y-0.5 border-b border-zinc-100 pb-1 mb-1">
                <button onClick={() => { setActiveTab('Profile'); setIsProfileOpen(false); }} className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors">
                  <User className="w-4 h-4 text-zinc-400" />
                  <span>Profile</span>
                </button>
                <button onClick={() => { setActiveTab('Settings'); setIsProfileOpen(false); }} className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors">
                  <Settings className="w-4 h-4 text-zinc-400" />
                  <span>Settings</span>
                </button>
              </div>

              {/* Group 2 */}
              <div className="px-1 space-y-0.5 border-b border-zinc-100 pb-1 mb-1">
                <div className="relative group/submenu">
                  <button
                    onMouseEnter={() => setActiveSubMenu('theme')}
                    className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Palette className="w-4 h-4 text-zinc-400" />
                      <span>Theme</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                  </button>

                  <AnimatePresence>
                    {(activeSubMenu === 'theme' || activeSubMenu === 'primary') && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="absolute left-full bottom-0 ml-2 w-48 bg-white border border-zinc-200 rounded-xl shadow-xl py-1 z-50"
                        onMouseLeave={() => setActiveSubMenu(null)}
                      >
                        <button
                          onMouseEnter={() => setActiveSubMenu('primary')}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-1.5 text-sm transition-colors",
                            activeSubMenu === 'primary' ? "bg-zinc-100 text-zinc-900" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-2 h-2 rounded-full border border-zinc-300" />
                            <span>Primary</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                        </button>
                        <button
                          onMouseEnter={() => setActiveSubMenu('theme')}
                          className="w-full flex items-center justify-between px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-2 h-2 rounded-full bg-zinc-500" />
                            <span>Neutral</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                        </button>

                        {/* Primary Colors Sub-menu */}
                        <AnimatePresence>
                          {activeSubMenu === 'primary' && (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              className="absolute left-full top-0 ml-2 w-40 bg-white border border-zinc-200 rounded-xl shadow-xl py-1 z-50 max-h-80 overflow-y-auto scrollbar-hide"
                            >
                              {colors.map((c) => (
                                <button key={c.name} className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900">
                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                                  <span>{c.name}</span>
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    {isDarkMode ? <Moon className="w-4 h-4 text-zinc-400" /> : <Sun className="w-4 h-4 text-zinc-400" />}
                    <span>Appearance</span>
                  </div>
                  <div className={cn(
                    "w-8 h-4 rounded-full transition-colors relative shrink-0",
                    isDarkMode ? "bg-zinc-900" : "bg-zinc-200"
                  )}>
                    <div className={cn(
                      "w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all shadow-sm",
                      isDarkMode ? "left-[18px]" : "left-[2px]"
                    )} />
                  </div>
                </button>

              </div>

              {/* Group 3 */}
              <div className="px-1 space-y-0.5">
                <button className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors">
                  <LogOut className="w-4 h-4 text-zinc-400" />
                  <span>Log out</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className={cn(
            "w-full flex items-center justify-between p-2 rounded-lg transition-colors",
            isProfileOpen ? "bg-zinc-200/50" : "hover:bg-zinc-200/50",
            isCollapsed && "justify-center px-0"
          )}
          title={isCollapsed ? "Canac" : undefined}
        >
          <div className={cn("flex items-center gap-2.5", isCollapsed && "gap-0")}>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-200 shadow-sm shrink-0">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Benjamin"
                alt="Profile"
                className="w-full h-full object-cover bg-zinc-100"
              />
            </div>
            {!isCollapsed && <span className="text-sm font-semibold text-zinc-900 truncate">Canac</span>}
          </div>
          {!isCollapsed && <MoreVertical className="w-4 h-4 text-zinc-500" />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
