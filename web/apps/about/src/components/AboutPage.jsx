import React from 'react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <header className="mb-16 text-center">
          <h1 className="text-4xl font-bold mb-4 text-blue-800 dark:text-blue-400">About SciValidate</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            SciValidate is an open-source initiative to create a new architecture for scientific trust in the digital age.
          </p>
        </header>

        {/* Mission Statement */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-blue-700 dark:text-blue-400 text-center">Our Mission</h2>
          <div className="bg-blue-50 dark:bg-blue-900 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
            <p className="text-gray-800 dark:text-gray-200 text-lg mb-4 text-center">
              SciValidate seeks to transform how scientific expertise is verified and communicated online by:
            </p>
            <ul className="list-disc pl-6 space-y-3 text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              <li>Creating a transparent system that authenticates scientific expertise across platforms</li>
              <li>Developing visual indicators that make scientific consensus and disagreement clear to everyone</li>
              <li>Building a framework that values constructive scientific debate, not just agreement</li>
              <li>Establishing a network of trust that extends beyond traditional academic metrics</li>
              <li>Combating the spread of scientific misinformation and fraud</li>
            </ul>
          </div>
        </section>

        {/* Background Articles */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-blue-700 dark:text-blue-400 text-center">Background and Development</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6 text-center">
            The SciValidate concept has evolved through a series of articles published on Substack, detailing the 
            problem, proposed architecture, and implementation strategy. Read the complete background:
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <a href="https://open.substack.com/pub/healingearth/p/beyond-desci-a-modern-architecture" 
               target="_blank" 
               rel="noopener noreferrer"
               className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow transition-all">
              <h3 className="text-lg font-medium mb-2 text-center">Beyond DeSci: A Modern Architecture for Scientific Trust</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
                The initial proposal outlining the need for a new approach to scientific validation online.
              </p>
              <div className="flex justify-between items-center">
                <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">February 7, 2025</span>
                <div className="w-6 h-6">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-orange-500 dark:text-orange-400 fill-current">
                    <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
                  </svg>
                </div>
              </div>
            </a>
            
            <a href="https://open.substack.com/pub/healingearth/p/beyond-desci-part-2-starting-small" 
               target="_blank" 
               rel="noopener noreferrer"
               className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow transition-all">
              <h3 className="text-lg font-medium mb-2 text-center">Beyond DeSci Part 2: Starting Small</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
                A detailed examination of scientific misconduct and SciValidate's implementation strategy.
              </p>
              <div className="flex justify-between items-center">
                <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">February 21, 2025</span>
                <div className="w-6 h-6">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-orange-500 dark:text-orange-400 fill-current">
                    <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
                  </svg>
                </div>
              </div>
            </a>
            
            <a href="https://open.substack.com/pub/healingearth/p/beyond-desci-part-3-from-concept" 
               target="_blank" 
               rel="noopener noreferrer"
               className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow transition-all">
              <h3 className="text-lg font-medium mb-2 text-center">Beyond DeSci Part 3: From Concept to Code</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
                The transition from theoretical discussions to practical implementation.
              </p>
              <div className="flex justify-between items-center">
                <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">March 7, 2025</span>
                <div className="w-6 h-6">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-orange-500 dark:text-orange-400 fill-current">
                    <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
                  </svg>
                </div>
              </div>
            </a>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
            <div className="flex items-center justify-center mb-3">
              <svg viewBox="0 0 24 24" className="w-8 h-8 mr-3 text-orange-500 dark:text-orange-400 fill-current">
                <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
              </svg>
              <h3 className="text-lg font-medium">Substack Articles</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Follow the complete series on "Healing the Earth with Technology" for additional context and climate science discussions.
            </p>
            <a href="https://healingearth.substack.com" 
               target="_blank" 
               rel="noopener noreferrer"
               className="inline-block text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
              Visit Healing Earth Substack →
            </a>
          </div>
        </section>

        {/* LinkedIn Posts */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-blue-700 dark:text-blue-400 text-center">LinkedIn Discussions</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6 text-center">
            Follow the conversation and development updates on LinkedIn:
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <a href="https://www.linkedin.com/posts/jburbaum_bringing-trustworthy-science-to-social-media-activity-7294735618972999681-m3H_" 
               target="_blank" 
               rel="noopener noreferrer"
               className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow transition-all">
              <h3 className="text-lg font-medium mb-2 text-center">Bringing Trustworthy Science to Social Media</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
                An overview of how SciValidate aims to transform scientific trust architecture for social platforms.
              </p>
              <div className="flex items-center justify-center">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-blue-700 dark:text-blue-400 font-bold">in</span>
                </div>
                <span className="ml-2 text-gray-500 dark:text-gray-400">LinkedIn Post</span>
              </div>
            </a>
            
            <a href="https://www.linkedin.com/posts/jburbaum_activity-7299903424903405568-rot0" 
               target="_blank" 
               rel="noopener noreferrer"
               className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow transition-all">
              <h3 className="text-lg font-medium mb-2 text-center">Charting a Path to Expand the Concept</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
                Updates on the technical progress and open-source development of the SciValidate prototype.
              </p>
              <div className="flex items-center justify-center">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-blue-700 dark:text-blue-400 font-bold">in</span>
                </div>
                <span className="ml-2 text-gray-500 dark:text-gray-400">LinkedIn Post</span>
              </div>
            </a>

            <a href="https://www.linkedin.com/pulse/beyond-desci-part-3-from-concept-code-jonathan-burbaum-i7jqe"
               target="_blank" 
               rel="noopener noreferrer"
               className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow transition-all">
              <h3 className="text-lg font-medium mb-2 text-center">From Concept to Implementation</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">
                Actual code development and technical challenges faced in building the SciValidate prototype.
              </p>
              <div className="flex items-center justify-center">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-blue-700 dark:text-blue-400 font-bold">in</span>
                </div>
                <span className="ml-2 text-gray-500 dark:text-gray-400">LinkedIn Post</span>
              </div>
            </a>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-700 dark:text-blue-400 font-bold">in</span>
              </div>
              <h3 className="text-lg font-medium">Connect on LinkedIn</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Follow Jonathan Burbaum for regular updates on SciValidate and discussions about scientific integrity.
            </p>
            <a href="https://linkedin.com/in/jburbaum" 
               target="_blank" 
               rel="noopener noreferrer"
               className="inline-block text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
              View LinkedIn Profile →
            </a>
          </div>
        </section>

        {/* GitHub Repository */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-blue-700 dark:text-blue-400 text-center">Open Source Development</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6 text-center">
            SciValidate's code is publicly available on GitHub. The repository includes:
          </p>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-8">
            <ul className="list-disc pl-6 space-y-3 text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              <li><strong>Data Collection Tools:</strong> Scripts for gathering faculty information and publication data</li>
              <li><strong>Database Components:</strong> Systems for organizing researcher profiles, publication records, and expertise metrics</li>
              <li><strong>Analysis Modules:</strong> Algorithms for calculating reputation scores and building collaboration networks</li>
              <li><strong>Web Interface:</strong> The working verification badge system and interactive validation interface</li>
              <li><strong>Documentation:</strong> Detailed explanations of the technical challenges and architecture</li>
            </ul>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
            <h3 className="text-lg font-medium mb-3 text-center">Technical Architecture</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4 text-center">
              The current prototype focuses on creating a small-scale demonstration using:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-4 max-w-3xl mx-auto">
              <li>ORCID identifiers for unique researcher identification</li>
              <li>OpenAlex API for accessing publication metadata</li>
              <li>SQLite database for storing expertise and publication records</li>
              <li>Python for data processing and analysis</li>
              <li>JavaScript for web interface components</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 text-center">
              The system calculates field-specific expertise scores based on publication history, citation metrics, 
              and collaboration networks, then visualizes these relationships through interactive interfaces.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center bg-blue-600 text-white p-6 rounded-lg">
            <div className="mb-4 md:mb-0 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start mb-2">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="w-8 h-8 mr-2 fill-current text-white">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.463 2 11.97c0 4.404 2.865 8.14 6.839 9.458.5.092.682-.216.682-.48 0-.236-.008-.864-.013-1.695-2.782.602-3.369-1.337-3.369-1.337-.454-1.151-1.11-1.458-1.11-1.458-.908-.618.069-.606.069-.606 1.003.07 1.531 1.027 1.531 1.027.892 1.524 2.341 1.084 2.91.828.092-.643.35-1.083.636-1.332-2.22-.251-4.555-1.107-4.555-4.927 0-1.088.39-1.979 1.029-2.675-.103-.252-.446-1.266.098-2.638 0 0 .84-.268 2.75 1.022A9.607 9.607 0 0112 6.82c.85.004 1.705.114 2.504.336 1.909-1.29 2.747-1.022 2.747-1.022.546 1.372.202 2.386.1 2.638.64.696 1.028 1.587 1.028 2.675 0 3.83-2.339 4.673-4.566 4.92.359.307.678.915.678 1.846 0 1.332-.012 2.407-.012 2.734 0 .267.18.577.688.48C19.137 20.107 22 16.373 22 11.969 22 6.463 17.522 2 12 2z"></path>
                </svg>
                <h3 className="text-xl font-medium">Contribute to SciValidate</h3>
              </div>
              <p className="text-blue-100">
                Help build the future of scientific trust online. The code is open for contributions.
              </p>
            </div>
            <a href="https://github.com/jburbs/scivalidate" 
               target="_blank" 
               rel="noopener noreferrer"
               className="bg-white text-blue-600 hover:bg-blue-50 font-medium py-2 px-6 rounded">
              View GitHub Repository
            </a>
          </div>
        </section>

        {/* Key Challenges */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-blue-700 dark:text-blue-400 text-center">Current Challenges</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6 text-center">
            The SciValidate project faces several significant challenges that require collaborative solutions:
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
              <h3 className="text-lg font-medium mb-3">Network Scale</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Starting with just one academic department quickly expanded to thousands of potential connections. 
                Building a comprehensive expertise network requires efficient data collection strategies and 
                institutional partnerships.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
              <h3 className="text-lg font-medium mb-3">Platform Integration</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Most major platforms (Twitter/X, LinkedIn, etc.) are proprietary with limited API access. 
                We need innovative approaches to create a verification layer that works universally.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
              <h3 className="text-lg font-medium mb-3">Critical Mass</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Achieving sufficient adoption requires demonstrating immediate value to early users. 
                We need strategies for overcoming initial adoption barriers.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
              <h3 className="text-lg font-medium mb-3">Reputation Measurement</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Designing a reputation system that balances traditional metrics with domain expertise 
                while resisting manipulation remains complex.
              </p>
            </div>
          </div>
        </section>

        {/* Ways to Contribute */}
        <section className="mb-16 bg-blue-50 dark:bg-blue-900 p-8 rounded-lg border border-blue-200 dark:border-blue-700">
          <h2 className="text-2xl font-semibold mb-6 text-center text-blue-700 dark:text-blue-300">How You Can Help</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-8 text-center max-w-3xl mx-auto">
            SciValidate needs contributors across multiple disciplines to turn this vision into reality.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
              <h3 className="text-lg font-medium mb-3 text-blue-600 dark:text-blue-400">Technical Contributions</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-4 text-left">
                <li>Code development</li>
                <li>Database architecture</li>
                <li>UI/UX design</li>
                <li>API integration</li>
                <li>Testing and validation</li>
              </ul>
              <a href="https://github.com/jburbs/scivalidate" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
                Explore the codebase →
              </a>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
              <h3 className="text-lg font-medium mb-3 text-blue-600 dark:text-blue-400">Scientific Contributions</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-4 text-left">
                <li>Testing the prototype</li>
                <li>Refining taxonomies</li>
                <li>Evaluating metrics</li>
                <li>Identifying use cases</li>
                <li>Outreach to institutions</li>
              </ul>
              <a href="/signup" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
                Join as a researcher →
              </a>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
              <h3 className="text-lg font-medium mb-3 text-blue-600 dark:text-blue-400">Community Support</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300 mb-4 text-left">
                <li>Financial contributions</li>
                <li>Spreading awareness</li>
                <li>Feedback and testing</li>
                <li>Connecting resources</li>
                <li>Documentation help</li>
              </ul>
              <a href="/signup" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
                Support the project →
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0 text-center md:text-left">
              <a href="/" className="text-2xl font-bold text-blue-800 dark:text-blue-400">SciValidate</a>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Building scientific trust for the digital age</p>
            </div>
            
            <div className="flex space-x-6">
              <a href="https://github.com/jburbs/scivalidate" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                GitHub
              </a>
              <a href="https://healingearth.substack.com" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                Substack
              </a>
              <a href="https://linkedin.com/in/jburbaum" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                LinkedIn
              </a>
              <a href="mailto:jonathan@scivalidate.org" 
                 className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                Contact
              </a>
            </div>
          </div>
          
          <div className="text-center text-gray-600 dark:text-gray-400 text-sm mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p>© 2025 SciValidate. All rights reserved.</p>
            <p className="mt-2">SciValidate is an open-source project under the MIT License.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AboutPage;