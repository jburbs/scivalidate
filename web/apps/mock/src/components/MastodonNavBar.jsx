import React from 'react';
import { Search, Edit } from 'lucide-react';
import MastodonLogo from '../assets/logo-symbol-wordmark.svg';

const MastodonNavBar = ({ activePerspective, onChangePerspective }) => {
  return (
    <header className="bg-black/80 backdrop-blur-sm text-white py-2 px-3 pb-1 sticky top-20 z-40 w-full border-b border-[#2e3338]">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center">
          {/* Mastodon logo using external SVG file */}
          <a href="#" className="flex items-center">
            <img 
              src={MastodonLogo}
              alt="Mastodon"
              className="md:block h-8 w-auto"
            />
            <img 
              src={MastodonLogo}
              alt="Mastodon" 
              className="h-10 w-10 md:hidden"
            />
          </a>
        </div>
        
        <div className="flex-1 max-w-xl mx-auto px-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="bg-[#202327] text-white border border-[#2e3338] rounded-full px-4 py-2 pl-10 w-full focus:outline-none focus:ring-1 focus:ring-[#595AFF] focus:border-[#595AFF]"
            />
            <div className="absolute left-3 top-2.5 text-[#8899a6]">
              <Search size={18} />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <a 
              href="#"
              className="inline-flex items-center justify-center p-2 rounded-full bg-[#202327] text-[#e6eef9] hover:bg-[#2e3338] transition-colors"
              title="Search"
            >
              <Search size={18} />
            </a>
            
            <a 
              href="#"
              className="bg-[#595AFF] text-white rounded-full px-4 py-2 font-medium flex items-center gap-2 hover:bg-[#4949cc] transition-colors hidden md:flex"
            >
              <span>New post</span>
            </a>
            
            <a 
              href="#"
              className="bg-[#595AFF] text-white rounded-full p-2 font-medium flex md:hidden items-center justify-center hover:bg-[#4949cc] transition-colors"
              title="New post"
            >
              <Edit size={18} />
            </a>
          </div>
          
          <select 
            className="bg-[#202327] text-white border border-[#2e3338] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#595AFF]"
            value={activePerspective}
            onChange={(e) => onChangePerspective(e.target.value)}
          >
            <option value="reader">Reader View</option>
            <option value="poster">Poster View</option>
            <option value="admin">Admin View</option>
          </select>
          
          <a href="#" className="relative flex">
            <div 
              className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#595AFF]"
              title="Your Profile"
            >
              <img 
                src="https://i.pravatar.cc/150?img=69" 
                alt="Your avatar" 
                className="w-full h-full object-cover"
              />
            </div>
          </a>
        </div>
      </div>
    </header>
  );
};

export default MastodonNavBar;