import React, { useState } from 'react';

/**
 * VerificationInterface component
 * 
 * This component displays detailed verification information when a user clicks on
 * a verification badge. It shows both researcher credentials and content validation 
 * status to establish the scientific credibility of the source and claim.
 */
const VerificationInterface = ({ contentType = 'active' }) => {
  const [activeTab, setActiveTab] = useState('researcher');

  // Sample researcher data - in production this would come from an API call
  const researcherData = {
    name: "Dr. Jane Smith",
    institution: "Rensselaer Polytechnic Institute",
    department: "Chemistry and Chemical Biology",
    orcid: "0000-0002-1825-0097",
    verificationLevel: "institutional",
    h_index: 24,
    citations: 1876,
    profileImage: "https://via.placeholder.com/150",
    expertise: [
      { field: "Organic Chemistry", score: 0.92 },
      { field: "Medicinal Chemistry", score: 0.78 },
      { field: "Biochemistry", score: 0.63 },
      { field: "Nanotechnology", score: 0.41 }
    ],
    publications: [
      {
        title: "Novel Catalytic Mechanisms in Organic Synthesis",
        journal: "Journal of Organic Chemistry",
        year: 2023,
        citations: 42,
        doi: "10.1021/joc.2023.01.123"
      },
      {
        title: "Sustainable Approaches to Complex Molecule Synthesis",
        journal: "Green Chemistry",
        year: 2022,
        citations: 87,
        doi: "10.1039/gc-2022-00654"
      },
      {
        title: "Enzymatic Catalysis in Non-Aqueous Media",
        journal: "ACS Catalysis",
        year: 2021,
        citations: 124,
        doi: "10.1021/acscatal.2021.09.012"
      }
    ]
  };

  // Content validation data - would also come from API in production
  const contentValidationData = {
    // Different validation states based on content type
    new: {
      status: "awaiting_validation",
      title: "Quantum computation predicts cancer cure",
      statusText: "Awaiting Community Validation",
      description: "This claim is new and hasn't yet been evaluated by sufficient experts in the field.",
      color: "yellow",
      icon: "❓", // Question mark
      experts: [],
      evidence: {
        supporting: 0,
        neutral: 0,
        opposing: 0
      },
      community: "This claim needs review from experts in quantum computing and oncology."
    },
    active: {
      status: "active_discussion",
      title: "Dark matter alternative theory",
      statusText: "Active Scientific Discussion",
      description: "This topic is an active area of research with multiple scientific viewpoints.",
      color: "blue",
      icon: "😐", // Neutral face
      experts: [
        { name: "Dr. Lisa Chen", institution: "CalTech", position: "supporting" },
        { name: "Dr. James Wilson", institution: "MIT", position: "neutral" },
        { name: "Dr. Sarah Keller", institution: "CERN", position: "opposing" }
      ],
      evidence: {
        supporting: 12,
        neutral: 8,
        opposing: 15
      },
      community: "The scientific community is actively researching and debating this theory."
    },
    established: {
      status: "consensus",
      title: "Greenhouse gas climate effects",
      statusText: "Strong Evidence-Based Consensus",
      description: "This claim reflects established scientific understanding with strong supporting evidence.",
      color: "green",
      icon: "😊", // Smiling face
      experts: [
        { name: "Dr. Michael Johnson", institution: "NASA", position: "supporting" },
        { name: "Dr. Emma Roberts", institution: "Oxford University", position: "supporting" },
        { name: "Dr. David Chang", institution: "Max Planck Institute", position: "supporting" }
      ],
      evidence: {
        supporting: 87,
        neutral: 11,
        opposing: 2
      },
      community: "There is overwhelming scientific consensus on this topic based on decades of research."
    },
    contradictory: {
      status: "opposition",
      title: "Earth is flat",
      statusText: "Strong Evidence-Based Opposition",
      description: "This claim contradicts established scientific understanding.",
      color: "red",
      icon: "😟", // Concerned face
      experts: [
        { name: "Dr. Robert Phillips", institution: "NASA", position: "opposing" },
        { name: "Dr. Maria Gonzalez", institution: "European Space Agency", position: "opposing" },
        { name: "Dr. Thomas Lee", institution: "Royal Observatory", position: "opposing" }
      ],
      evidence: {
        supporting: 0,
        neutral: 1,
        opposing: 98
      },
      community: "The scientific community strongly refutes this claim based on multiple independent lines of evidence."
    }
  };

  // Get the current content data based on contentType prop
  const contentData = contentValidationData[contentType];

  // Render expertise score bars with color indicators
  const renderExpertiseScore = (score) => {
    // Determine color based on score
    let color = "bg-gray-200";
    if (score > 0.8) color = "bg-green-500";
    else if (score > 0.6) color = "bg-blue-500";
    else if (score > 0.4) color = "bg-yellow-500";
    
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`${color} h-2.5 rounded-full`} 
          style={{ width: `${score * 100}%` }}
        ></div>
      </div>
    );
  };

  // Render evidence distribution bar
  const renderEvidenceBar = () => {
    const { supporting, neutral, opposing } = contentData.evidence;
    const total = supporting + neutral + opposing;
    
    const supportingPct = (supporting / total) * 100;
    const neutralPct = (neutral / total) * 100;
    const opposingPct = (opposing / total) * 100;
    
    return (
      <div className="w-full h-4 flex rounded-full overflow-hidden">
        <div 
          className="bg-green-500 h-full" 
          style={{ width: `${supportingPct}%` }}
          title={`Supporting: ${supporting} studies (${supportingPct.toFixed(0)}%)`}
        ></div>
        <div 
          className="bg-yellow-500 h-full" 
          style={{ width: `${neutralPct}%` }}
          title={`Neutral: ${neutral} studies (${neutralPct.toFixed(0)}%)`}
        ></div>
        <div 
          className="bg-red-500 h-full" 
          style={{ width: `${opposingPct}%` }}
          title={`Opposing: ${opposing} studies (${opposingPct.toFixed(0)}%)`}
        ></div>
      </div>
    );
  };

  // Get the appropriate colors for the content validation state
  const getStatusColors = () => {
    const colors = {
      awaiting_validation: {
        bg: "bg-yellow-50",
        text: "text-yellow-800",
        border: "border-yellow-200"
      },
      active_discussion: {
        bg: "bg-blue-50",
        text: "text-blue-800",
        border: "border-blue-200"
      },
      consensus: {
        bg: "bg-green-50",
        text: "text-green-800",
        border: "border-green-200"
      },
      opposition: {
        bg: "bg-red-50",
        text: "text-red-800",
        border: "border-red-200"
      }
    };
    
    return colors[contentData.status];
  };

  const statusColors = getStatusColors();

  return (
    <div className="w-full max-w-2xl bg-white rounded-lg overflow-hidden">
      {/* Header with claim title */}
      <div className={`p-4 ${statusColors.bg} ${statusColors.border} border-b`}>
        <div className="flex items-center">
          <div className="mr-3 text-2xl">{contentData.icon}</div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{contentData.title}</h2>
            <div className="flex items-center mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
                {contentData.statusText}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          <button
            onClick={() => setActiveTab('researcher')}
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'researcher'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Researcher Profile
          </button>
          <button
            onClick={() => setActiveTab('validation')}
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'validation'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Content Validation
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === 'evidence'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Evidence
          </button>
        </nav>
      </div>
      
      {/* Tab content */}
      <div className="p-6">
        {/* Researcher Profile Tab */}
        {activeTab === 'researcher' && (
          <div>
            <div className="flex mb-6">
              <img 
                src={researcherData.profileImage} 
                alt={researcherData.name} 
                className="w-20 h-20 rounded-full mr-4"
              />
              <div>
                <h3 className="text-xl font-bold text-gray-900">{researcherData.name}</h3>
                <p className="text-gray-600">{researcherData.department}</p>
                <p className="text-gray-600">{researcherData.institution}</p>
                <div className="mt-2 flex items-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Verified Researcher
                  </span>
                  <span className="ml-2 text-xs text-gray-500">
                    ORCID: {researcherData.orcid}
                  </span>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-medium text-gray-900 mb-4">Field Expertise</h3>
            <div className="space-y-4">
              {researcherData.expertise.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{item.field}</span>
                    <span className="text-sm font-medium text-gray-700">
                      {(item.score * 100).toFixed(0)}%
                    </span>
                  </div>
                  {renderExpertiseScore(item.score)}
                </div>
              ))}
            </div>
            
            <div className="mt-6 bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Understanding Expertise Scores</h4>
              <p className="text-sm text-blue-700">
                Expertise scores are calculated based on publication history, citation patterns, 
                and peer recognition in specific fields. Scores above 80% indicate recognized expertise, 
                60-80% indicate solid knowledge, and 40-60% indicate familiarity with the field.
              </p>
            </div>
          </div>
        )}
        
        {/* Content Validation Tab */}
        {activeTab === 'validation' && (
          <div>
            <div className={`${statusColors.bg} rounded-lg p-4 mb-6`}>
              <h3 className={`font-medium ${statusColors.text} mb-2`}>Validation Status: {contentData.statusText}</h3>
              <p className={`text-sm ${statusColors.text}`}>
                {contentData.description}
              </p>
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-4">Expert Perspectives</h3>
            
            {contentData.experts.length > 0 ? (
              <div className="space-y-4">
                {contentData.experts.map((expert, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-center">
                      <div 
                        className={`w-3 h-3 rounded-full mr-2 ${
                          expert.position === 'supporting' ? 'bg-green-500' : 
                          expert.position === 'neutral' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                      ></div>
                      <div>
                        <h4 className="font-medium text-gray-900">{expert.name}</h4>
                        <p className="text-sm text-gray-600">{expert.institution}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 italic">No expert opinions have been recorded for this claim yet.</p>
            )}
            
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Community Assessment</h3>
              <p className="text-gray-600 mb-4">{contentData.community}</p>
              
              {(contentData.evidence.supporting + contentData.evidence.neutral + contentData.evidence.opposing) > 0 && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-green-700">Supporting</span>
                    <span className="text-yellow-700">Neutral</span>
                    <span className="text-red-700">Opposing</span>
                  </div>
                  {renderEvidenceBar()}
                  <div className="mt-2 text-xs text-gray-500 text-center">
                    Evidence distribution from {contentData.evidence.supporting + contentData.evidence.neutral + contentData.evidence.opposing} studies
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Evidence Tab */}
        {activeTab === 'evidence' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Evidence Summary</h3>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className={`bg-green-50 rounded-lg p-4 text-center`}>
                <div className="text-2xl font-bold text-green-800">{contentData.evidence.supporting}</div>
                <div className="text-sm text-green-700">Supporting Studies</div>
              </div>
              <div className={`bg-yellow-50 rounded-lg p-4 text-center`}>
                <div className="text-2xl font-bold text-yellow-800">{contentData.evidence.neutral}</div>
                <div className="text-sm text-yellow-700">Neutral Studies</div>
              </div>
              <div className={`bg-red-50 rounded-lg p-4 text-center`}>
                <div className="text-2xl font-bold text-red-800">{contentData.evidence.opposing}</div>
                <div className="text-sm text-red-700">Opposing Studies</div>
              </div>
            </div>
            
            {contentData.status === 'active_discussion' && (
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-800 mb-2">About Active Research Areas</h4>
                <p className="text-sm text-blue-700">
                  When a topic is an active area of research, it means experts are still investigating
                  key questions. Multiple viewpoints may exist in the scientific literature, and a
                  consensus may not yet have formed. This is a normal part of the scientific process.
                </p>
              </div>
            )}
            
            {contentData.status === 'consensus' && (
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-green-800 mb-2">About Scientific Consensus</h4>
                <p className="text-sm text-green-700">
                  Scientific consensus represents the collective judgment of the scientific community
                  based on multiple independent lines of evidence. While individual studies may occasionally
                  present contradictory findings, the weight of evidence strongly supports this conclusion.
                </p>
              </div>
            )}
            
            {contentData.status === 'opposition' && (
              <div className="bg-red-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-red-800 mb-2">About Evidence-Based Opposition</h4>
                <p className="text-sm text-red-700">
                  When a claim faces strong evidence-based opposition, it means multiple studies and
                  lines of evidence contradict it. The scientific community has thoroughly investigated
                  the claim and found it incompatible with established understanding based on empirical evidence.
                </p>
              </div>
            )}
            
            {contentData.status === 'awaiting_validation' && (
              <div className="bg-yellow-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-yellow-800 mb-2">About New Claims</h4>
                <p className="text-sm text-yellow-700">
                  New claims require time for the scientific community to evaluate. The lack of validation
                  doesn't mean the claim is false - it simply hasn't been subject to sufficient scientific
                  scrutiny yet. Consider this an invitation for relevant experts to weigh in.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Footer with verification info */}
      <div className="bg-gray-50 px-6 py-4 text-center">
        <p className="text-xs text-gray-500">
          Verification provided by SciValidate on {new Date().toLocaleDateString()} 
          • Data sourced from scientific literature
        </p>
        <a 
          href="https://scivalidate.org" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:underline"
        >
          Learn more about our validation process
        </a>
      </div>
    </div>
  );
};

export default VerificationInterface;