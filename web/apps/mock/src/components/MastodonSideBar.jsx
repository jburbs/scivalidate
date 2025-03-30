import React from 'react';
import { Home, Bell, Search, Globe, BookmarkPlus, Star, List, Settings, MoreHorizontal, AtSign } from 'lucide-react';

const MastodonSidebar = ({ activeView, setActiveView, activePerspective }) => {
  const navItems = [
    { id: 'timeline', icon: 
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" className="icon icon-home column-link__icon" aria-hidden="true">
        <path d="M160-120v-480l320-240 320 240v480H560v-280H400v280H160Z" fill="currentColor"></path>
      </svg>, 
      label: 'Home' 
    },
    { id: 'notifications', icon: 
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" className="icon icon-bell column-link__icon" aria-hidden="true">
        <path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z" fill="currentColor"></path>
      </svg>, 
      label: 'Notifications' 
    },
    { id: 'explore', icon: 
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" className="icon icon-explore column-link__icon" aria-hidden="true">
        <path d="m260-260 300-140 140-300-300 140-140 300Zm220-180q-17 0-28.5-11.5T440-480q0-17 11.5-28.5T480-520q17 0 28.5 11.5T520-480q0 17-11.5 28.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" fill="currentColor"></path>
      </svg>, 
      label: 'Explore' 
    },
    { id: 'community', icon: 
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" className="icon icon-globe column-link__icon" aria-hidden="true">
        <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm-40-82v-78q-33 0-56.5-23.5T360-320v-40L168-552q-3 18-5.5 36t-2.5 36q0 121 79.5 212T440-162Zm276-102q20-22 36-47.5t26.5-53q10.5-27.5 16-56.5t5.5-59q0-98-54.5-179T600-776v16q0 33-23.5 56.5T520-680h-80v80q0 17-11.5 28.5T400-560h-80v80h240q17 0 28.5 11.5T600-440v120h40q26 0 47 15.5t29 40.5Z" fill="currentColor"></path>
      </svg>, 
      label: 'Live feeds' 
    },
    { id: 'mentions', icon: 
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" className="icon icon-at column-link__icon" aria-hidden="true">
        <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480v58q0 59-40.5 100.5T740-280q-35 0-66-15t-52-43q-29 29-65.5 43.5T480-280q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480v58q0 26 17 44t43 18q26 0 43-18t17-44v-58q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93h200v80H480Zm0-280q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35Z" fill="currentColor"></path>
      </svg>, 
      label: 'Private mentions' 
    },
    { id: 'bookmarks', icon: 
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" className="icon icon-bookmarks column-link__icon" aria-hidden="true">
        <path d="M160-80v-560q0-33 23.5-56.5T240-720h320q33 0 56.5 23.5T640-640v560L400-200 160-80Zm80-121 160-86 160 86v-439H240v439Zm480-39v-560H280v-80h440q33 0 56.5 23.5T800-800v560h-80ZM240-640h320-320Z" fill="currentColor"></path>
      </svg>, 
      label: 'Bookmarks' 
    },
    { id: 'favorites', icon: 
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" className="icon icon-star column-link__icon" aria-hidden="true">
        <path d="m354-287 126-76 126 77-33-144 111-96-146-13-58-136-58 135-146 13 111 97-33 143ZM233-120l65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Zm247-350Z" fill="currentColor"></path>
      </svg>, 
      label: 'Favorites' 
    },
    { id: 'lists', icon: 
      <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" className="icon icon-list-ul column-link__icon" aria-hidden="true">
        <path d="M320-280q17 0 28.5-11.5T360-320q0-17-11.5-28.5T320-360q-17 0-28.5 11.5T280-320q0 17 11.5 28.5T320-280Zm0-160q17 0 28.5-11.5T360-480q0-17-11.5-28.5T320-520q-17 0-28.5 11.5T280-480q0 17 11.5 28.5T320-440Zm0-160q17 0 28.5-11.5T360-640q0-17-11.5-28.5T320-680q-17 0-28.5 11.5T280-640q0 17 11.5 28.5T320-600Zm120 320h240v-80H440v80Zm0-160h240v-80H440v80Zm0-160h240v-80H440v80ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z" fill="currentColor"></path>
      </svg>, 
      label: 'Lists' 
    },
  ];
  
  // Add admin-specific menu items
  if (activePerspective === 'admin') {
    navItems.push(
      { id: 'verifications', icon: 
        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" className="icon icon-cog column-link__icon" aria-hidden="true">
          <path d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm70-80h79l14-106q31-8 57.5-23.5T639-327l99 41 39-68-86-65q5-14 7-29.5t2-31.5q0-16-2-31.5t-7-29.5l86-65-39-68-99 42q-22-23-48.5-38.5T533-694l-13-106h-79l-14 106q-31 8-57.5 23.5T321-633l-99-41-39 68 86 64q-5 15-7 30t-2 32q0 16 2 31t7 30l-86 65 39 68 99-42q22 23 48.5 38.5T427-266l13 106Zm42-180q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Zm-2-140Z" fill="currentColor"></path>
        </svg>, 
        label: 'Verifications' 
      }
    );
  }

  return (
    <div className="navigation-panel h-screen sticky top-0 pt-2 flex flex-col w-[72px] lg:w-[240px] border-r border-[#2e3338]">
      <div className="navigation-panel__logo mb-4">
        <a className="column-link column-link--logo flex items-center px-3 py-2" href="#">


          {/* Mobile logo (icon only) */}
          <div className="lg:hidden w-10 h-10 flex items-center justify-center">

          </div>
        </a>
      </div>

      <nav className="navigation-panel__menu flex flex-col gap-1 px-2">
        {navItems.map((item) => (
          <a
            key={item.id}
            className={`column-link column-link--transparent flex items-center py-3 px-3 rounded-full transition-colors ${
              activeView === item.id
                ? 'active font-bold text-[#e6eef9]'
                : 'text-[#e6eef9] hover:bg-[#181818]'
            }`}
            onClick={(e) => {
              e.preventDefault();
              setActiveView(item.id);
            }}
            href="#"
          >
            <span className="column-link__icon flex-shrink-0">{item.icon}</span>
            <span className="ml-4 text-lg hidden lg:block">{item.label}</span>
          </a>
        ))}
      </nav>
      
      <hr className="my-3 border-[#2e3338] mx-3 lg:block hidden" />
      
      <a
        className="column-link column-link--transparent flex items-center py-3 px-3 rounded-full transition-colors text-[#e6eef9] hover:bg-[#181818]"
        onClick={(e) => {
          e.preventDefault();
        }}
        href="#"
      >
        <span className="column-link__icon flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" className="icon icon-ellipsis-h column-link__icon" aria-hidden="true" fill="currentColor">
            <path d="M240-400q-33 0-56.5-23.5T160-480q0-33 23.5-56.5T240-560q33 0 56.5 23.5T320-480q0 33-23.5 56.5T240-400Zm240 0q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm240 0q-33 0-56.5-23.5T640-480q0-33 23.5-56.5T720-560q33 0 56.5 23.5T800-480q0 33-23.5 56.5T720-400Z"></path>
          </svg>
        </span>
        <span className="ml-4 text-lg hidden lg:block">About</span>
      </a>
      
      <div className="flex-spacer flex-grow"></div>
      
      {/* New Post button */}
      {activePerspective !== 'reader' && (
        <div className="px-3 mb-4">
          <button className="w-11 h-11 lg:w-full bg-[#595aff] hover:bg-[#4a4aee] text-white rounded-full flex items-center justify-center lg:justify-center font-medium transition-colors py-2">
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="currentColor" className="lg:mr-2">
              <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"></path>
            </svg>
            <span className="hidden lg:inline">New post</span>
          </button>
        </div>
      )}
      

    </div>
  );
};

export default MastodonSidebar;