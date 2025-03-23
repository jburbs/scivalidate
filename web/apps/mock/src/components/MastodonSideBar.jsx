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
          {/* Full logo (wordmark) for larger screens */}
          <svg viewBox="0 0 261 66" className="logo logo--wordmark hidden lg:block h-8" role="img">
            <title>Mastodon</title>
            <path
              d="M256.85 40.73c-4.64 23.9-33.04 24.94-33.04 24.94-32.5.68-59.8-7.37-59.8-7.37 0 3.04-.17 5.93-.17 8.4 0 9.48 6.15 12.3 6.15 12.3 11.18 5.2 42.16 7.25 68.8-.86 0 0 12.22-4.37 12.22-19.9a71.76 71.76 0 005.83-17.5zM227.8 16.45c0-10.3-6.48-13.26-6.48-13.26C200.28-7.77 117.6-3.58 91.53 11.94c-8.46 5.03-8.34 24.68-8.34 24.68l2.62-.87v-8.64s9.7-11.57 46.13-13.6c0 0 20.4-1.35 32.7 9.34.08.06 3.9 3.14 4.06 10.14.1 4.62.1 9.27.1 13.68 5.3.05 11.28.18 17.5.5 0-5.75-.2-11.4-.2-16.4 0-5.18-1.86-9.5-1.86-9.5-5.55-12.4-27.93-11.68-27.93-11.68-40.34-2.03-62.84 8.7-62.84 8.7v-4.45s22.5-10.8 62.84-8.78c0 0 22.4-.73 27.94 11.68 0 0 1.85 4.32 1.85 9.5 0 5.05.2 10.5.2 16.34 4.92.28 9.9.67 14.77 1.17.05-6.18.33-16.18.33-21.87 0 0 .28-5.23-5.66-10.72 0 0-10.1-12.07-44.14-13.12 0 0-30.73-1.92-52.1 12.3-.07.05-5.28 3.03-5.28 8.6v24.49S81.35 29.1 92.55 20.77c0 0-1.35 2.38-1.38 8.63 0 9.94.4 45.53.4 50.86 0 12.67 8.32 16.43 8.32 16.43 15.4 7.18 57.58 10.2 93.7-1.1 0 0 16.95-5.93 17.03-29.27V52.7s-.43-7.17 9.2-10.67c0 0 8.9-3.06 19.08-3.77-.05-7.87-.26-15.62-.41-21.8-.14-1.13-2.98-21.86-42.16-23.43 0 0-31.55-1.3-55.75 9.14 0 0 .32-2.03.88-3.1C173.5-.6 227.8 3.74 227.8 16.46z"
              fill="#595aff"
            />
          </svg>

          {/* Mobile logo (icon only) */}
          <div className="lg:hidden w-10 h-10 flex items-center justify-center">
            <svg viewBox="0 0 32 32" className="h-8 w-8" role="img">
              <title>Mastodon</title>
              <path
                d="M16 0C7.16 0 0 7.16 0 16c0 8.84 7.16 16 16 16 8.84 0 16-7.16 16-16 0-8.84-7.16-16-16-16z"
                fill="#595aff"
              />
              <path
                d="M16 5.414c-3.142 0-5.71 2.434-5.71 5.414v6.652c0 2.98 2.568 5.414 5.71 5.414 3.142 0 5.71-2.434 5.71-5.414v-6.652c0-2.98-2.568-5.414-5.71-5.414z"
                fill="white"
              />
            </svg>
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
      
      {/* Trending section (for larger screens) */}
      <div className="navigation-panel__portal mt-auto hidden lg:block px-3 py-4">
        <div className="getting-started__trends bg-[#15181c] rounded-xl p-4">
          <h4 className="text-lg font-bold text-[#e6eef9] mb-3">
            <a href="#">Trending now</a>
          </h4>
          
          <div className="trends__item mb-3 pb-3 border-b border-[#2e3338]">
            <div className="trends__item__name">
              <a href="#" className="text-[#e6eef9] font-bold">#OpenScience</a>
              <div className="text-[#8899a6] text-sm mt-1">
                <strong>2,543</strong> people in the past 2 days
              </div>
            </div>
            <div className="trends__item__sparkline mt-1">
              <svg viewBox="0 0 50 28" preserveAspectRatio="none" className="w-full h-8">
                <g>
                  <path d="M2 26 C 3.9 26 7.7 26 9.6 26 C 11.6 26 15.4 26 17.3 26 C 19.2 26 23.1 26 25 26 C 26.9 26 30.7 26 32.7 26 C 34.6 26 38.4 26 40.3 26 C 42.2 26 46.1 2 48 2 L48 26 2 26 2 26" style={{stroke: "none", strokeWidth: 0, fillOpacity: 0.1, fill: "#6364ff"}} />
                  <path d="M2 26 C 3.9 26 7.7 26 9.6 26 C 11.6 26 15.4 26 17.3 26 C 19.2 26 23.1 26 25 26 C 26.9 26 30.7 26 32.7 26 C 34.6 26 38.4 26 40.3 26 C 42.2 26 46.1 2 48 2" style={{stroke: "#6364ff", strokeWidth: 1, fill: "none"}} />
                </g>
              </svg>
            </div>
          </div>
          
          <div className="trends__item mb-3 pb-3 border-b border-[#2e3338]">
            <div className="trends__item__name">
              <a href="#" className="text-[#e6eef9] font-bold">#PeerReview</a>
              <div className="text-[#8899a6] text-sm mt-1">
                <strong>1,892</strong> people in the past 2 days
              </div>
            </div>
            <div className="trends__item__sparkline mt-1">
              <svg viewBox="0 0 50 28" preserveAspectRatio="none" className="w-full h-8">
                <g>
                  <path d="M2 26 C 3.9 26 7.7 24 9.6 24 C 11.6 24 15.4 25 17.3 25 C 19.2 25 23.1 24 25 24 C 26.9 24 30.7 24 32.7 24 C 34.6 24 38.4 26 40.3 26 C 42.2 26 46.1 2 48 2 L48 26 2 26 2 26" style={{stroke: "none", strokeWidth: 0, fillOpacity: 0.1, fill: "#6364ff"}} />
                  <path d="M2 26 C 3.9 26 7.7 24 9.6 24 C 11.6 24 15.4 25 17.3 25 C 19.2 25 23.1 24 25 24 C 26.9 24 30.7 24 32.7 24 C 34.6 24 38.4 26 40.3 26 C 42.2 26 46.1 2 48 2" style={{stroke: "#6364ff", strokeWidth: 1, fill: "none"}} />
                </g>
              </svg>
            </div>
          </div>
          
          <div className="trends__item">
            <div className="trends__item__name">
              <a href="#" className="text-[#e6eef9] font-bold">#SciValidate</a>
              <div className="text-[#8899a6] text-sm mt-1">
                <strong>1,105</strong> people in the past 2 days
              </div>
            </div>
            <div className="trends__item__sparkline mt-1">
              <svg viewBox="0 0 50 28" preserveAspectRatio="none" className="w-full h-8">
                <g>
                  <path d="M2 26 C 3.9 26 7.7 26 9.6 26 C 11.6 26 15.4 25 17.3 25 C 19.2 25 23.1 26 25 26 C 26.9 26 30.7 25 32.7 25 C 34.6 25 38.4 26 40.3 26 C 42.2 26 46.1 2 48 2 L48 26 2 26 2 26" style={{stroke: "none", strokeWidth: 0, fillOpacity: 0.1, fill: "#6364ff"}} />
                  <path d="M2 26 C 3.9 26 7.7 26 9.6 26 C 11.6 26 15.4 25 17.3 25 C 19.2 25 23.1 26 25 26 C 26.9 26 30.7 25 32.7 25 C 34.6 25 38.4 26 40.3 26 C 42.2 26 46.1 2 48 2" style={{stroke: "#6364ff", strokeWidth: 1, fill: "none"}} />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MastodonSidebar;