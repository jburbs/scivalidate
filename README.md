# SciValidate

## Scientific Validation Architecture for the Modern Age

SciValidate is a proposed system for authenticating scientific expertise and verifying scientific claims across communication platforms. This project aims to create a trust framework that maintains scientific rigor in online discourse while adapting to contemporary communication patterns.

> **Note:** SciValidate is currently in the prototype/proof-of-concept stage. The code in this repository represents early exploratory work and is shared to encourage collaboration and feedback.

## The Challenge

Scientific communication today faces multiple critical challenges:

1. **Trust crisis:** Public trust in scientific institutions and expertise is eroding
2. **Information overload:** Research publication volume is overwhelming traditional peer review
3. **Platform fragmentation:** Scientific discourse is scattered across platforms that weren't designed for it
4. **Paper mills and fraud:** Organized production of fraudulent research threatens the integrity of scientific literature
5. **Inadequate feedback mechanisms:** Binary like/dislike systems don't capture the nuance of scientific agreement

SciValidate proposes a solution that allows verified scientific expertise to flow across platforms while maintaining rigor and accessibility.

## Project Vision

SciValidate seeks to create:

1. A **verification system** that authenticates scientific expertise through public credentials
2. A **reputation network** that tracks verified accomplishments while respecting domain specificity
3. A **cross-platform identity layer** that allows consistent verification of identity and claims
4. An **evidence framework** for linking concise social media posts to their full scientific foundation
5. A **visual indication system** that makes the state of scientific consensus instantly understandable

![Concept Visualization](docs/images/scivalidate-concept.png)

## Current State of Development

The current repository contains:

1. **Data collection tools**: Scripts for gathering faculty information and publication data
2. **Database infrastructure**: Systems for storing researcher profiles, publications, and expertise metrics
3. **Analysis components**: Tools for identifying research networks and expertise domains
4. **Expertise classification**: Methods for determining field-specific expertise scores
5. **Web interface prototype**: Early implementation demonstrating core concepts

Our development so far has focused on creating a small-scale prototype working with a single academic department (RPI Chemistry) to test core concepts.

## Code Organization

The repository is organized as follows:

```
scivalidate/
├── CONTRIBUTING.md
├── LICENSE
├── README.md
├── api.py
├── database-schema.md
├── requirements.txt
├── scivalidate.db
│
├── docs/                             # Project documentation
│   ├── api_documentation.md
│   ├── challenges.md
│   ├── database_schema.md
│   ├── getting_started.md
│   ├── images/                       # Documentation images
│   │   ├── comparison.png
│   │   ├── favicon.png
│   │   ├── favicon.svg
│   │   ├── scivalidate-concept.png
│   │   └── scivalidate-concept.svg
│   ├── overview.md
│   └── verification_badges.md
│
├── src/                              # Source code
│   ├── analysis/                     # Scientific expertise analysis
│   │   ├── analysis_results/
│   │   │   ├── topic_fields.json
│   │   │   └── topic_relationships.json
│   │   ├── author_analysis_config.json
│   │   ├── author_analyzer.py
│   │   ├── config.json
│   │   ├── fields.json
│   │   ├── impact_factor_cache.json
│   │   └── process_faculty.py
│   │
│   ├── analysis_results/
│   │   ├── topic_fields.json
│   │   └── topic_relationships.json
│   │
│   ├── author_analysis_config.json
│   ├── column_removal_script.sql
│   │
│   ├── data_collection/              # Faculty and researcher data acquisition
│   │   ├── faculty_data_emails.json  # Structured faculty information
│   │   └── scraper.py                # Web scraping implementation
│   │
│   └── database/                     # Data persistence and modeling
│       ├── database_cleanup.py
│       ├── database_populator_4.py   # Database schema and population logic
│       ├── test.py
│       └── test_cases.json
│
├── tests/                            # Test suite
│   └── test_name_parsing.py          # Unit tests for name parsing functionality
│
└── web/                              # Web interface components
    ├── apps/                         # Multiple web applications
    │   ├── about/                    # About page application
    │   ├── example/                  # Example application
    │   ├── home/                     # Home page application
    │   ├── mock/                     # Mock/demo application
    │   ├── signup/                   # Signup page application
    │   └── thanks/                   # Thanks page application
    │
    ├── dist/                         # Compiled distribution files
    │
    ├── packages/                     # Shared packages
    │   ├── api-client/               # API client library
    │   ├── config/                   # Shared configuration
    │   ├── ui/                       # Shared UI components
    │   └── utilities/                # Shared utility functions
    │
    ├── netlify.toml                  # Netlify deployment configuration
    ├── package.json                  # Project dependencies
    └── turbo.json                    # Turborepo configuration
```

## Web Interface

The SciValidate project includes a web interface prototype demonstrating the core verification concepts and providing interactive visualizations of scientific expertise networks.

### Demo Website

A live demonstration of the idea on Mastodon is available at [scivalidate.org/mock](https://scivalidate.org/mock), which showcases:

- Interactive network visualization of scientific collaboration relationships
- Researcher profiles with expertise domain indicators
- Example verification badges that could be integrated across platforms
- Interactive exploration of evidence chains for scientific claims
- Prototype consensus visualization for selected scientific topics

### Technical Implementation

The web interface is built using:
- HTML5, CSS3, and JavaScript
- D3.js for network and tree visualizations
- Bootstrap for responsive layout and components
- Integration with the SQLite database generated by the analysis components
- Modular design for easy extension and contribution

### Web Feature Roadmap

The web interface development is focused on:
- Enhancing the visualization capabilities for complex scientific networks
- Implementing user authentication for verified researchers
- Creating a robust API for third-party verification services
- Developing browser extensions for major platforms
- Building profile management and credential verification tools

### Contributing to the Web Interface

We welcome contributions to improve the web implementation, particularly in:
- Accessibility enhancements
- Visualization techniques for scientific expertise
- User experience design
- Platform-specific integration examples
- Performance optimizations for large network visualizations

To contribute to the web interface:
1. Explore the existing implementation in the `web/` directory
2. Reference the API documentation in `docs/api_documentation.md`
3. Create or modify components following the modular architecture
4. Test your changes against the sample data in the repository
5. Submit a pull request with your enhancements

## Key Challenges

We're actively seeking collaborators to help address several significant challenges:

### 1. Network Scale and Seeding

Starting with the RPI Chemistry Department (32 faculty), 15 were identified with ORCID identifiers and substantial publication records, with connections to over 3,000 coauthors. Creating a comprehensive "tree of expertise" that identifies the top field experts in each domain requires technical solutions and academic outreach.

### 2. Platform Integration

The verification system must work across platforms where scientific discourse occurs. Most major platforms (Twitter/X, LinkedIn, etc.) are proprietary and have limited API access. We need innovative approaches to create a universal verification layer without requiring direct platform integration.

### 3. Critical Mass and Network Effects

Achieving sufficient adoption requires demonstrating immediate value to early users. We need strategies for overcoming the initial adoption barriers, potentially through institutional partnerships or focused scholarly communities.

### 4. Reputation Measurement

Designing a system to evaluate scientific reputation that balances traditional metrics (citations, h-index) with domain-specific considerations and resists gaming or manipulation remains a complex challenge.

## Getting Started

### Prerequisites

- Python 3.8+
- SQLite3
- Required Python packages listed in `requirements.txt`

### Installation

1. Clone the repository:

```bash
git clone https://github.com/jburbs/scivalidate.git
cd scivalidate
```

2. Install required packages:

```bash
pip install -r requirements.txt
```

3. Run the data scraper to collect faculty information:

```bash
python src/data_collection/scraper.py
```

4. Process faculty data to populate the database:

```bash
python src/database/process_faculty.py
```

5. Analyze author expertise:

```bash
python src/analysis/author_analyzer.py --db scivalidate.db
```

6. Launch the web interface locally:

```bash
# From the project root directory
cd web
python -m http.server 8000
```

7. Open your browser and navigate to `http://localhost:8000` to explore the interface.

## How to Contribute

We welcome contributions in several areas:

1. **Code Development**: Improving existing systems or adding new components
2. **Documentation**: Enhancing explanations and user guides
3. **Testing**: Developing robust test cases and validation procedures
4. **Use Cases**: Suggesting and developing specific applications
5. **Outreach**: Helping connect with scientific communities for testing and feedback
6. **Web Interface**: Enhancing visualizations and user experience

To contribute:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some feature'`)
5. Push to the branch (`git push origin feature/your-feature`)
6. Open a Pull Request

## Background Reading

For more context on the SciValidate concept, see these articles:

- [Beyond DeSci: A Modern Architecture for Scientific Trust](https://open.substack.com/pub/healingearth/p/beyond-desci-a-modern-architecture)
- [Beyond DeSci Part 2: Starting Small](https://open.substack.com/pub/healingearth/p/beyond-desci-part-2-starting-small)
- [Beyond DeSci Part 3: From Concept to Code]([https://open.substack.com/pub/healingearth/p/beyond-desci-part-2-starting-small])

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

If you're interested in collaborating or have questions, please reach out to jonathan@scivalidate.org
