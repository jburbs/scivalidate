import React from 'react';
import { Home, Search, Bell, Mail, Bookmark, User, Settings, List, BarChart } from 'lucide-react';

const MastodonSidebar = ({ activeView, setActiveView, activePerspective }) => {
  const navItems = [
    { id: 'timeline', icon: <Home size={24} />, label: 'Home' },
    { id: 'explore', icon: <Search size={24} />, label: 'Explore' },
    { id: 'notifications', icon: <Bell size={24} />, label: 'Notifications' },
    { id: 'messages', icon: <Mail size={24} />, label: 'Messages' },
    { id: 'bookmarks', icon: <Bookmark size={24} />, label: 'Bookmarks' },
    { id: 'profile', icon: <User size={24} />, label: 'Profile' },
  ];
  
  // Add admin-specific menu items
  if (activePerspective === 'admin') {
    navItems.push(
      { id: 'verifications', icon: <BarChart size={24} />, label: 'Verifications' },
      { id: 'settings', icon: <Settings size={24} />, label: 'Settings' }
    );
  }

  return (
    <div className="w-64 border-r border-[#313543] p-4 hidden md:block">
      <nav className="flex flex-col gap-6">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`flex items-center gap-3 text-left py-2 px-3 rounded-full transition-colors ${
              activeView === item.id
                ? 'bg-[#2b90d9] text-white'
                : 'text-[#9baec8] hover:bg-[#313543] hover:text-white'
            }`}
            onClick={() => setActiveView(item.id)}
          >
            {item.icon}
            <span className="text-lg">{item.label}</span>
          </button>
        ))}
      </nav>
      
      {/* Toot button */}
      {activePerspective !== 'reader' && (
        <button className="w-full bg-[#2b90d9] text-white rounded-full py-3 font-bold mt-8">
          Toot
        </button>
      )}
    </div>
  );
};

export default MastodonSidebar;