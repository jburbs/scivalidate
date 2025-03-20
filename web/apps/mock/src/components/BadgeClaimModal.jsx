import React, { useState } from 'react';

const BadgeClaimModal = ({ onClose }) => {
  const [badgeType, setBadgeType] = useState('expertise');
  const [evidence, setEvidence] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      onClose();
      
      // In a real implementation, this would call your Render API
      console.log('Badge claim submitted:', {
        type: badgeType,
        evidence,
        description
      });
    }, 1500);
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#2b303b] rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-[#d9e1e8]">Claim New Badge</h3>
          <button 
            className="text-[#9baec8] hover:text-[#d9e1e8]"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="badge-type" className="block text-[#9baec8] mb-2">
              Badge Type
            </label>
            <select 
              id="badge-type"
              className="w-full bg-[#313543] border border-[#414656] rounded p-2 text-[#d9e1e8]"
              value={badgeType}
              onChange={(e) => setBadgeType(e.target.value)}
            >
              <option value="identity">Identity Verification</option>
              <option value="expertise">Expertise/Credentials</option>
              <option value="contribution">Community Contribution</option>
              <option value="longevity">Account Longevity</option>
              <option value="cross_platform">Cross-Platform Identity</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-[#9baec8] mb-2">
              Description
            </label>
            <input
              type="text"
              id="description"
              className="w-full bg-[#313543] border border-[#414656] rounded p-2 text-[#d9e1e8]"
              placeholder="e.g., Computer Science Professor"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="evidence" className="block text-[#9baec8] mb-2">
              Evidence
            </label>
            <textarea
              id="evidence"
              className="w-full bg-[#313543] border border-[#414656] rounded p-2 text-[#d9e1e8]"
              rows={4}
              placeholder="Provide evidence to support your badge claim (e.g., links to credentials, publications, GitHub profiles)"
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
            ></textarea>
          </div>
          
          <div className="text-sm text-[#9baec8] mb-4">
            <p>Your claim will be reviewed by instance administrators or designated verifiers. You'll be notified when your badge is approved or if additional information is needed.</p>
          </div>
          
          <div className="flex gap-3 justify-end">
            <button 
              type="button"
              className="px-4 py-2 rounded-lg border border-[#414656] text-[#d9e1e8]"
              onClick={onClose}
            >
              Cancel
            </button>
            
            <button 
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#2b90d9] text-white font-medium disabled:opacity-50"
              disabled={submitting || !badgeType || !evidence}
            >
              {submitting ? 'Submitting...' : 'Submit Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BadgeClaimModal;