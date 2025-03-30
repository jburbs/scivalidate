import React, { useState } from 'react';
import ReputationBadge from './ReputationBadge';

const BadgeVerificationModal = ({ onClose }) => {
  const [pendingClaims, setPendingClaims] = useState([
    {
      id: 1,
      user: {
        id: 'dr_johnson',
        displayName: 'Dr. Johnson',
        username: 'johnson@research.org',
        avatar: 'https://i.pravatar.cc/150?img=2'
      },
      type: 'expertise',
      name: 'AI Researcher',
      evidence: 'I am a Principal Researcher at TechLab AI with 7 years of experience in the field. My publications can be found at: research.org/johnson and I have presented at major conferences including NeurIPS and ICML.',
      submittedDate: '2025-02-15'
    },
    {
      id: 2,
      user: {
        id: 'tech_writer',
        displayName: 'Tech Writer',
        username: 'writer@techblog.com',
        avatar: 'https://i.pravatar.cc/150?img=4'
      },
      type: 'cross_platform',
      name: 'Cross-Platform Identity',
      evidence: 'I maintain accounts on Twitter (@techwriter), GitHub (github.com/techwriter), and LinkedIn (linkedin.com/in/techwriter). All accounts link back to my personal website at techwriter.com which verifies my Mastodon identity.',
      submittedDate: '2025-02-17'
    }
  ]);
  
  const [activeClaim, setActiveClaim] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  
  const handleApprove = (claimId) => {
    // In a real implementation, this would call your verification API
    setPendingClaims(pendingClaims.filter(claim => claim.id !== claimId));
    setActiveClaim(null);
  };
  
  const handleReject = (claimId) => {
    // In a real implementation, this would call your verification API
    setPendingClaims(pendingClaims.filter(claim => claim.id !== claimId));
    setActiveClaim(null);
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#2b303b] rounded-lg w-full max-w-3xl p-6 max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-[#d9e1e8]">Badge Verification Queue</h3>
          <button 
            className="text-[#9baec8] hover:text-[#d9e1e8]"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        
        {pendingClaims.length === 0 ? (
          <div className="text-center py-8 text-[#9baec8]">
            <p className="text-lg">No pending badge claims to review</p>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex">
            {/* Left side - list of pending claims */}
            <div className="w-1/3 border-r border-[#313543] overflow-y-auto pr-3">
              <h4 className="text-[#9baec8] font-medium mb-3">Pending Claims</h4>
              
              {pendingClaims.map(claim => (
                <div 
                  key={claim.id}
                  className={`p-3 mb-2 rounded cursor-pointer transition-colors ${
                    activeClaim?.id === claim.id 
                      ? 'bg-[#2b90d9]/20 border border-[#2b90d9]/50' 
                      : 'bg-[#313543] hover:bg-[#414656]'
                  }`}
                  onClick={() => setActiveClaim(claim)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <img 
                      src={claim.user.avatar} 
                      alt={claim.user.displayName}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <div className="text-[#d9e1e8] font-medium">{claim.user.displayName}</div>
                      <div className="text-xs text-[#9baec8]">@{claim.user.username}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <ReputationBadge 
                      badge={{ type: claim.type, status: 'pending', name: claim.name }}
                      size="small"
                      authorId={claim.user.id}
                      mode="user"
                    />
                    <span className="text-[#d9e1e8] text-sm">{claim.name}</span>
                  </div>
                  
                  <div className="text-xs text-[#9baec8] mt-2">
                    Submitted: {new Date(claim.submittedDate).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Right side - claim details and verification actions */}
            <div className="w-2/3 pl-4 flex flex-col overflow-hidden">
              {activeClaim ? (
                <>
                  <div className="flex-1 overflow-y-auto">
                    <div className="flex items-center gap-3 mb-4">
                      <img 
                        src={activeClaim.user.avatar} 
                        alt={activeClaim.user.displayName}
                        className="w-12 h-12 rounded-full"
                      />
                      <div>
                        <div className="text-[#d9e1e8] font-bold text-lg">{activeClaim.user.displayName}</div>
                        <div className="text-[#9baec8]">@{activeClaim.user.username}</div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-[#9baec8] text-sm mb-1">Badge Claim</h4>
                      <div className="flex items-center gap-2 bg-[#313543] p-3 rounded">
                        <ReputationBadge 
                          badge={{ type: activeClaim.type, status: 'pending', name: activeClaim.name }}
                          size="medium"
                          authorId={activeClaim.user.id}
                          mode="user"
                        />
                        <span className="text-[#d9e1e8] font-medium">{activeClaim.name}</span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-[#9baec8] text-sm mb-1">Evidence Provided</h4>
                      <div className="bg-[#313543] p-3 rounded text-[#d9e1e8]">
                        {activeClaim.evidence}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-[#9baec8] text-sm mb-1">Verification Feedback</h4>
                      <textarea
                        className="w-full bg-[#313543] border border-[#414656] rounded p-2 text-[#d9e1e8]"
                        rows={3}
                        placeholder="Optional feedback or reason for approval/rejection"
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                      ></textarea>
                    </div>
                  </div>
                  
                  <div className="border-t border-[#313543] pt-4 mt-2 flex justify-between">
                    <button 
                      className="px-4 py-2 rounded-lg border border-[#414656] text-[#d9e1e8]"
                      onClick={() => setActiveClaim(null)}
                    >
                      Back to List
                    </button>
                    
                    <div className="flex gap-3">
                      <button 
                        className="px-4 py-2 rounded-lg bg-[#eb5c6e] text-white font-medium"
                        onClick={() => handleReject(activeClaim.id)}
                      >
                        Reject
                      </button>
                      
                      <button 
                        className="px-4 py-2 rounded-lg bg-[#2fc72e] text-white font-medium"
                        onClick={() => handleApprove(activeClaim.id)}
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-[#9baec8]">
                  <p>Select a claim to review</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgeVerificationModal;