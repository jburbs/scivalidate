import React from 'react';
import { Info, HelpCircle } from 'lucide-react';

const DemoControls = ({ activePerspective, onChangePerspective }) => {
  return (
    <div className="w-72 p-4 border-l border-[#313543] hidden lg:block">
      <div className="sticky top-20">
        <div className="bg-[#313543] rounded-lg p-4 mb-4">
          <h3 className="text-[#d9e1e8] font-bold flex items-center gap-2 mb-3">
            <Info size={18} />
            About This Demo
          </h3>
          <p className="text-[#9baec8] text-sm">
            This demonstration showcases how a reputation badge system could integrate with Mastodon, enhancing trust and credibility in the Fediverse.
          </p>
        </div>
        
        <div className="bg-[#313543] rounded-lg p-4 mb-4">
          <h3 className="text-[#d9e1e8] font-bold mb-3">Perspective Controls</h3>
          <div className="flex flex-col gap-2">
            <button 
              className={`py-2 px-3 rounded text-left ${
                activePerspective === 'reader' 
                  ? 'bg-[#2b90d9] text-white' 
                  : 'text-[#9baec8] bg-[#232731] hover:bg-[#2b303b]'
              }`}
              onClick={() => onChangePerspective('reader')}
            >
              Reader View
              <p className="text-xs mt-1 font-normal">See badges as a regular Mastodon user</p>
            </button>
            
            <button 
              className={`py-2 px-3 rounded text-left ${
                activePerspective === 'poster' 
                  ? 'bg-[#2b90d9] text-white' 
                  : 'text-[#9baec8] bg-[#232731] hover:bg-[#2b303b]'
              }`}
              onClick={() => onChangePerspective('poster')}
            >
              Poster View
              <p className="text-xs mt-1 font-normal">Experience claiming and managing badges</p>
            </button>
            
            <button 
              className={`py-2 px-3 rounded text-left ${
                activePerspective === 'admin' 
                  ? 'bg-[#2b90d9] text-white' 
                  : 'text-[#9baec8] bg-[#232731] hover:bg-[#2b303b]'
              }`}
              onClick={() => onChangePerspective('admin')}
            >
              Admin View
              <p className="text-xs mt-1 font-normal">See the verification and administration tools</p>
            </button>
          </div>
        </div>
        
        <div className="bg-[#313543] rounded-lg p-4">
          <h3 className="text-[#d9e1e8] font-bold flex items-center gap-2 mb-3">
            <HelpCircle size={18} />
            How To Use This Demo
          </h3>
          <ul className="text-[#9baec8] text-sm space-y-2">
            <li>• Click on user profiles to see their reputation badges</li>
            <li>• Switch perspectives using the dropdown in the top bar</li>
            <li>• Try the verification process in the Poster view</li>
            <li>• Review badge claims in the Admin view</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DemoControls;