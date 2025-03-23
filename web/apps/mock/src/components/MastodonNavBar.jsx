import React from 'react';
import { Search, Edit } from 'lucide-react';

const MastodonNavBar = ({ activePerspective, onChangePerspective }) => {
  return (
    <header className="bg-black/80 backdrop-blur-sm text-white py-2 px-3 sticky top-0 z-40 w-full border-b border-[#2e3338]">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center">
          {/* Mastodon logo using the correct HTML structure */}
          <a href="#" className="flex items-center">
            <svg viewBox="0 0 261 66" className="hidden md:block h-8 w-auto" role="img">
              <title>Mastodon</title>
              <path
                d="M256.85 40.73c-4.64 23.9-33.04 24.94-33.04 24.94-32.5.68-59.8-7.37-59.8-7.37 0 3.04-.17 5.93-.17 8.4 0 9.48 6.15 12.3 6.15 12.3 11.18 5.2 42.16 7.25 68.8-.86 0 0 12.22-4.37 12.22-19.9a71.76 71.76 0 005.83-17.5zM227.8 16.45c0-10.3-6.48-13.26-6.48-13.26C200.28-7.77 117.6-3.58 91.53 11.94c-8.46 5.03-8.34 24.68-8.34 24.68l2.62-.87v-8.64s9.7-11.57 46.13-13.6c0 0 20.4-1.35 32.7 9.34.08.06 3.9 3.14 4.06 10.14.1 4.62.1 9.27.1 13.68 5.3.05 11.28.18 17.5.5 0-5.75-.2-11.4-.2-16.4 0-5.18-1.86-9.5-1.86-9.5-5.55-12.4-27.93-11.68-27.93-11.68-40.34-2.03-62.84 8.7-62.84 8.7v-4.45s22.5-10.8 62.84-8.78c0 0 22.4-.73 27.94 11.68 0 0 1.85 4.32 1.85 9.5 0 5.05.2 10.5.2 16.34 4.92.28 9.9.67 14.77 1.17.05-6.18.33-16.18.33-21.87 0 0 .28-5.23-5.66-10.72 0 0-10.1-12.07-44.14-13.12 0 0-30.73-1.92-52.1 12.3-.07.05-5.28 3.03-5.28 8.6v24.49S81.35 29.1 92.55 20.77c0 0-1.35 2.38-1.38 8.63 0 9.94.4 45.53.4 50.86 0 12.67 8.32 16.43 8.32 16.43 15.4 7.18 57.58 10.2 93.7-1.1 0 0 16.95-5.93 17.03-29.27V52.7s-.43-7.17 9.2-10.67c0 0 8.9-3.06 19.08-3.77-.05-7.87-.26-15.62-.41-21.8-.14-1.13-2.98-21.86-42.16-23.43 0 0-31.55-1.3-55.75 9.14 0 0 .32-2.03.88-3.1C173.5-.6 227.8 3.74 227.8 16.46z"
                fill="#595aff"
              />
            </svg>
            <img 
              src="/packs/media/images/logo-d4b5dc90fd3e117d141ae7053b157f58.svg" 
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
                src="https://i.pravatar.cc/150?img=1" 
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