"""
Core data structures and database management for the SciValidate academic research system.

This module contains the fundamental components for collecting, organizing, and analyzing 
academic researcher data, including:

1. Core data classes for representing researchers, publications, and metrics
2. Database management for storing and retrieving academic information
3. External API integration with ORCID and OpenAlex
4. Research metrics and reputation calculation
5. Field classification and expertise analysis

The system is designed to build a comprehensive network of academic expertise and reputation
by connecting researchers, their publications, and their collaboration networks.

Usage:
    This module is typically imported by process_faculty.py to populate and analyze the database.
    
    Example:
        processor = ResearcherProcessor('scivalidate.db', 'config.json')
        async with processor:
            await processor.process_researcher(faculty_data)
"""

# Standard library imports
from collections import defaultdict
from datetime import datetime
from enum import Enum
import json
import logging
from pathlib import Path
import sqlite3
from typing import Dict, List, Optional, Any, Tuple
from urllib.parse import quote
import uuid

# Third-party library imports
import aiohttp
import asyncio
from dataclasses import dataclass, field

# Note: No local imports needed since all classes are in this file

class MatchStatus(Enum):
    """
    Status codes for ORCID identifier matching attempts.
    
    These statuses help track the confidence level in matching a researcher
    to their ORCID identifier, which is critical for establishing researcher
    identity across platforms.
    
    Values:
        EXACT_MATCH_DISTINCTIVE: Single match with a distinctive name (high confidence)
        EXACT_MATCH_WITH_INSTITUTION: Single match confirmed by institution (highest confidence)
        EXACT_MATCH_COMMON_NAME: Single match but with a common name (medium confidence)
        MULTIPLE_MATCHES: Multiple potential matches found (low confidence)
        NO_MATCH: No matches found
        ERROR: Error occurred during matching process
    """
    EXACT_MATCH_DISTINCTIVE = "exact_match_distinctive"
    EXACT_MATCH_WITH_INSTITUTION = "exact_match_institution"
    EXACT_MATCH_COMMON_NAME = "exact_match_common"
    MULTIPLE_MATCHES = "multiple_matches"
    NO_MATCH = "no_match"
    ERROR = "error"

@dataclass
class ORCIDResult:
    """
    Container for results of an ORCID matching process for a faculty member.
    
    This class stores all relevant information about an attempt to match a faculty
    member to an ORCID identifier, including confidence levels, potential matches,
    and any retrieved metadata from the ORCID API.
    
    Attributes:
        faculty_id: Unique identifier for the faculty member
        faculty_name: Full name of the faculty member
        faculty_member: Dictionary containing all faculty member details
        distinctiveness_score: How distinctive the name is (0-1 scale)
        status: MatchStatus enum indicating match result confidence
        potential_matches: List of potential ORCID matches when ambiguous
        orcid: Matched ORCID identifier if found with sufficient confidence
        affiliations: List of institutional affiliations from ORCID record
        recent_works: List of recent publications from ORCID record
        message: Additional information about the match result (for debugging)
    """
    faculty_id: str
    faculty_name: str
    faculty_member: dict
    distinctiveness_score: float
    status: MatchStatus
    potential_matches: List[dict]
    orcid: Optional[str] = None
    affiliations: List[str] = field(default_factory=list)
    recent_works: List[dict] = field(default_factory=list)
    message: str = ""

@dataclass
class VenueMetrics:
    """
    Container for publication venue metrics from OpenAlex API.
    
    Stores impact and quality metrics for journals, conferences, and other
    publication venues to help evaluate the significance of publications.
    
    Attributes:
        venue_id: OpenAlex venue identifier
        name: Display name of the venue
        type: Type of venue (journal, conference, etc.)
        works_count: Total number of publications in this venue
        cited_by_count: Total number of citations to this venue
        citations_per_work: Average citations per work (impact measure)
        h_index: H-index of the venue if available
        subjects: List of subject areas covered by this venue
    """
    venue_id: str
    name: str
    type: str
    works_count: int
    cited_by_count: int
    citations_per_work: float
    h_index: Optional[int] = None
    subjects: List[str] = field(default_factory=list)
    
    @classmethod
    async def from_openalex(cls, venue_id: str, session: aiohttp.ClientSession) -> Optional['VenueMetrics']:
        """
        Create a VenueMetrics instance by fetching data from the OpenAlex API.
        
        This method handles the API request and parsing of the venue information
        to create a standardized VenueMetrics object.
        
        Args:
            venue_id: OpenAlex venue identifier
            session: Async HTTP session for API calls
            
        Returns:
            VenueMetrics object if successful, None if error occurs
        """
        try:
            # Construct and send API request
            url = f"https://api.openalex.org/venues/{venue_id}"
            async with session.get(url) as response:
                if response.status != 200:
                    logging.error(f"Failed to fetch venue {venue_id}: HTTP {response.status}")
                    return None
                    
                # Parse response data
                data = await response.json()
                works_count = data.get('works_count', 0)
                cited_count = data.get('cited_by_count', 0)
                
                # Calculate citations per work as a key impact metric
                # Add 0.001 to prevent division by zero
                citations_per_work = cited_count / (works_count + 0.001) if works_count > 0 else 0
                
                # Create and return the metrics object
                return cls(
                    venue_id=venue_id,
                    name=data.get('display_name', ''),
                    type=data.get('type', 'unknown'),
                    works_count=works_count,
                    cited_by_count=cited_count,
                    citations_per_work=citations_per_work,
                    h_index=data.get('h_index'),
                    subjects=[c.get('display_name') for c in data.get('x_concepts', [])]
                )
                
        except Exception as e:
            logging.error(f"Error fetching venue metrics for {venue_id}: {str(e)}")
            return None


class ResearchMetricsConfig:
    """
    Configuration manager for research impact calculations.
    
    This class handles loading, storing, and applying configuration parameters
    that control how research impact is calculated throughout the system. It provides
    defaults for various metrics and weightings that can be overridden by a
    JSON configuration file.
    
    Key configurations include:
    - Publication type weights (e.g., journal articles vs. conference proceedings)
    - Venue impact level thresholds and weights
    - Collaboration network parameters
    """
    
    def __init__(self, config_path: str = None):
        """
        Initialize configuration with defaults and optional custom config file.
        
        Args:
            config_path: Path to JSON configuration file (optional)
        """
        self.config_path = config_path
        
        # Default publication type weights - different types have different scholarly significance
        self.publication_weights = {
            'journal-article': 1.0,    # Standard baseline
            'proceedings-article': 0.7, # Conference papers typically valued less than journals
            'book-chapter': 0.8,        # Book chapters significant but less than journals
            'book': 1.0,                # Books on par with journal articles
            'dissertation': 0.5,        # Dissertations valued but less peer-reviewed
            'preprint': 0.3,            # Preprints minimally valued until peer-reviewed
            'default': 0.5              # Default for unrecognized types
        }
        
        # Default venue impact criteria - classifying venues by citation impact
        self.venue_impact_levels = {
            'very_high': {'min_citations_per_work': 50, 'weight': 2.5},  # Top-tier venues
            'high': {'min_citations_per_work': 25, 'weight': 2.0},       # High impact venues
            'medium': {'min_citations_per_work': 10, 'weight': 1.5},     # Solid journals/conferences
            'standard': {'min_citations_per_work': 5, 'weight': 1.0},    # Average venues
            'low': {'min_citations_per_work': 0, 'weight': 0.7}          # Lower impact venues
        }
        
        # Network analysis parameters for collaboration evaluation
        self.network_params = {
            'max_depth': 2,                # How many degrees of separation to analyze
            'min_collaborations': 2,       # Minimum collaborations to consider relationship significant
            'recent_year_threshold': 5     # How recent collaborations must be to receive full weight
        }
        
        self.changes_pending = False
        
        # Load custom configuration if provided
        if config_path:
            self.load_config(config_path)
    
    def load_config(self, config_path: str):
        """
        Load custom configuration from JSON file.
        
        Overrides default parameters with values from the provided JSON file,
        while maintaining defaults for any parameters not specified.
        
        Args:
            config_path: Path to JSON configuration file
        """
        try:
            with open(config_path, 'r') as f:
                config = json.load(f)
            
            # Selectively update configurations with custom values if present
            if 'publication_weights' in config:
                self.publication_weights.update(config['publication_weights'])
            if 'venue_impact_levels' in config:
                self.venue_impact_levels.update(config['venue_impact_levels'])
            if 'network_params' in config:
                self.network_params.update(config['network_params'])
                
        except FileNotFoundError:
            logging.warning(f"Config file {config_path} not found. Using defaults.")
        except json.JSONDecodeError:
            logging.error(f"Error parsing config file {config_path}. Using defaults.")
    
    def save_config(self):
        """
        Save current configuration to JSON file if changes are pending.
        
        Only writes to disk if changes have been made to the configuration
        and a config path was provided.
        """
        if not self.changes_pending or not self.config_path:
            return
            
        config = {
            'publication_weights': self.publication_weights,
            'venue_impact_levels': self.venue_impact_levels,
            'network_params': self.network_params
        }
        
        with open(self.config_path, 'w') as f:
            json.dump(config, f, indent=4)
        self.changes_pending = False
    
    def get_venue_weight(self, metrics: VenueMetrics) -> float:
        """
        Calculate venue weight based on its citation metrics.
        
        Args:
            metrics: VenueMetrics object with citation data
            
        Returns:
            float: Weight factor based on venue's citation impact
        """
        # Sort levels from highest to lowest threshold to ensure proper matching
        for level, criteria in sorted(
            self.venue_impact_levels.items(),
            key=lambda x: x[1]['min_citations_per_work'],
            reverse=True
        ):
            # Return the weight of the first matching level
            if metrics.citations_per_work >= criteria['min_citations_per_work']:
                return criteria['weight']
                
        # Default to lowest level if no criteria matched
        return self.venue_impact_levels['low']['weight']
    
    def calculate_publication_impact(self, pub_type: str, 
                                   venue_metrics: Optional[VenueMetrics],
                                   citation_count: int, year: int) -> float:
        """
        Calculate overall publication impact score.
        
        Combines multiple factors to estimate the academic impact of a publication:
        - Publication type (journal, conference, book, etc.)
        - Venue quality (based on citation metrics)
        - Citation count for this specific publication
        - Recency (more recent publications get higher weight)
        
        Args:
            pub_type: Type of publication (e.g., 'journal-article', 'book')
            venue_metrics: Metrics for the publication venue
            citation_count: Number of citations for this publication
            year: Publication year
            
        Returns:
            float: Calculated impact score
        """
        # Base weight from publication type
        base_weight = self.publication_weights.get(
            pub_type.lower(),
            self.publication_weights['default']
        )
        
        # Venue impact weight
        venue_weight = 1.0
        if venue_metrics:
            venue_weight = self.get_venue_weight(venue_metrics)
        
        # Citation impact - add small multiplier for each citation
        # (0.01 per citation means 100 citations doubles the impact)
        citation_weight = 1.0 + (citation_count * 0.01)
        
        # Recency weight - recent publications get 20% boost
        current_year = datetime.now().year
        recency_weight = 1.2 if (current_year - year) <= self.network_params['recent_year_threshold'] else 1.0
        
        # Combine all factors multiplicatively
        return base_weight * venue_weight * citation_weight * recency_weight


class AcademicFieldManager:
    """
    Manager for academic field classifications and expertise analysis.
    
    This class handles loading, storing, and analyzing academic field classifications.
    It manages the hierarchical structure of fields and subfields, calculates
    researcher expertise scores across different domains, and can suggest
    field updates based on publication analysis.
    
    The field classification system is key to SciValidate's ability to evaluate
    domain-specific expertise rather than treating all researchers equally.
    """
    
    def __init__(self, db_manager, fields_path: str = None):
        """
        Initialize the field manager with database connection and field definitions.
        
        Args:
            db_manager: DatabaseManager instance for storing field data
            fields_path: Path to JSON file with field definitions
        """
        self.db = db_manager
        self.fields_path = fields_path
        self.fields = {}  # Field definitions loaded from JSON
        self.changes_pending = False
        
        # Load field definitions if path provided
        if fields_path:
            self.load_fields_from_json(fields_path)
    
    def load_fields_from_json(self, fields_path: str):
        """
        Load field definitions from a JSON file.
        
        The JSON structure should contain main fields as top-level keys,
        with subfields and their associated keywords as nested objects.
        
        Args:
            fields_path: Path to JSON field definitions file
        """
        try:
            with open(fields_path, 'r') as f:
                self.fields = json.load(f)
            self.fields_path = fields_path
            
            # Initialize database with loaded fields
            self._initialize_fields_in_db()
            
        except FileNotFoundError:
            logging.warning(f"Fields file {fields_path} not found. Starting with empty fields.")
        except json.JSONDecodeError:
            logging.error(f"Error parsing fields file {fields_path}. Starting with empty fields.")
    
    def _initialize_fields_in_db(self):
        """
        Initialize database tables with field definitions.
        
        Creates field entries and their keywords in the database,
        preserving the hierarchical structure of main fields and subfields.
        """
        with self.db.conn:
            # Clear existing data to avoid duplicates
            self.db.conn.execute("DELETE FROM field_keywords")
            self.db.conn.execute("DELETE FROM fields")
            
            # Add fields and their keywords
            for main_field, subfields in self.fields.items():
                # Create main field entry
                main_field_id = str(uuid.uuid4())
                self.db.conn.execute("""
                    INSERT INTO fields (id, name)
                    VALUES (?, ?)
                """, (main_field_id, main_field))
                
                # Create subfields with parent relationship
                for subfield_code, subfield_info in subfields.items():
                    subfield_id = str(uuid.uuid4())
                    self.db.conn.execute("""
                        INSERT INTO fields (id, name, parent_field_id)
                        VALUES (?, ?, ?)
                    """, (subfield_id, subfield_info['name'], main_field_id))
                    
                    # Add keywords for this subfield
                    for keyword in subfield_info['keywords']:
                        self.db.conn.execute("""
                            INSERT INTO field_keywords (field_id, keyword)
                            VALUES (?, ?)
                        """, (subfield_id, keyword))
    
    def save_fields(self):
        """
        Save current field definitions to JSON file if changes are pending.
        
        Only writes to disk if changes have been made to the fields
        and a fields path was provided.
        """
        if not self.changes_pending or not self.fields_path:
            return
            
        with open(self.fields_path, 'w') as f:
            json.dump(self.fields, f, indent=4)
        self.changes_pending = False
    
    def calculate_field_scores(self, publications: List[Dict],
                             config) -> Dict[str, float]:
        """
        Calculate expertise scores for fields based on publications.
        
        This is a critical function that estimates a researcher's expertise
        level across different fields by analyzing their publication history.
        It considers:
        - Publication content matches with field keywords
        - Publication impact (venue quality, citation count)
        - Publication recency
        
        Args:
            publications: List of publication dictionaries
            config: ResearchMetricsConfig instance
            
        Returns:
            Dict[str, float]: Mapping of field IDs to expertise scores (0-1 scale)
        """
        scores = defaultdict(float)
        
        # Get all field keywords from database
        with self.db.conn:
            keywords = self.db.conn.execute("""
                SELECT f.id as field_id, k.keyword
                FROM fields f
                JOIN field_keywords k ON f.id = k.field_id
            """).fetchall()
        
        # Create a mapping from keywords to the fields they belong to
        keyword_map = defaultdict(list)
        for row in keywords:
            keyword_map[row['keyword']].append(row['field_id'])
        
        # Score publications against fields
        for pub in publications:
            # Calculate publication impact using config parameters
            venue_metrics = None
            if venue_id := pub.get('venue_id'):
                venue_metrics = pub.get('venue_metrics')  # Should be pre-fetched
                
            impact = config.calculate_publication_impact(
                pub.get('type', 'default'),
                venue_metrics,
                pub.get('citations', 0),
                pub.get('year', 0)
            )
            
            # Match publication text against field keywords
            # Combine title and concepts for matching
            text = f"{pub['title']} {' '.join(c['name'] for c in pub['concepts'])}"
            text = text.lower()
            
            # Increment field scores when keywords match
            for keyword, field_ids in keyword_map.items():
                if keyword in text:
                    for field_id in field_ids:
                        scores[field_id] += impact
        
        # Normalize scores to 0-1 scale
        if scores:
            max_score = max(scores.values())
            # Only include scores that are at least 10% of the max score
            # to filter out weak associations
            return {field: score/max_score 
                   for field, score in scores.items() 
                   if score > max_score * 0.1}
        return {}
    
    def suggest_field_updates(self, publications: List[Dict]) -> Dict:
        """
        Analyze publications to suggest new keywords and field relationships.
        
        This function helps the system evolve over time by identifying:
        - Potential new keywords for existing fields
        - Concepts that frequently co-occur and might represent new fields
        
        Args:
            publications: List of publication dictionaries
            
        Returns:
            Dict: Suggestions for field taxonomy updates
        """
        keyword_frequencies = defaultdict(int)
        concept_cooccurrence = defaultdict(lambda: defaultdict(int))
        
        # Analyze publications for keywords and concept co-occurrence
        for pub in publications:
            # Extract concepts from publication
            concepts = [c['name'].lower() for c in pub.get('concepts', [])]
            
            # Update keyword frequencies
            for concept in concepts:
                keyword_frequencies[concept] += 1
            
            # Analyze concept co-occurrence
            for i, c1 in enumerate(concepts):
                for c2 in concepts[i+1:]:
                    concept_cooccurrence[c1][c2] += 1
                    concept_cooccurrence[c2][c1] += 1
        
        # Get existing keywords to avoid suggesting ones we already have
        existing_keywords = set()
        for field in self.fields.values():
            for subfield in field.values():
                if isinstance(subfield, dict):
                    existing_keywords.update(kw.lower() for kw in subfield.get('keywords', []))
        
        # Generate suggestions
        suggestions = {
            # New keywords that appear frequently but aren't in our taxonomy
            'new_keywords': [
                (kw, freq) for kw, freq in keyword_frequencies.items()
                if kw not in existing_keywords and freq >= 3
            ],
            # Concepts that frequently co-occur and might represent related fields
            'field_relationships': [
                (c1, c2, freq)
                for c1, cooccur in concept_cooccurrence.items()
                for c2, freq in cooccur.items()
                if freq >= 2
            ]
        }
        
        return suggestions


class DatabaseManager:
    """
    Central manager for all database operations in the SciValidate system.
    
    This class handles database connection, schema management, and provides
    a clean interface for storing and retrieving:
    - Researcher profiles and identifiers
    - Publications and their metadata
    - Venue information and impact metrics
    - Field classifications and expertise scores
    - Collaboration networks
    
    The database uses SQLite for simplicity and portability while maintaining
    the relational structure necessary for complex queries.
    """
    
    def __init__(self, db_path: str, initialize_tables: bool = True):
        """
        Initialize database connection and optionally create schema.
        
        Args:
            db_path: Path to SQLite database file
            initialize_tables: Whether to create tables if they don't exist
        """
        # Connect to SQLite database
        self.conn = sqlite3.connect(db_path)
        self.conn.row_factory = sqlite3.Row  # Enable column access by name
        
        # Enable foreign key constraints for data integrity
        self.conn.execute("PRAGMA foreign_keys = ON")
        
        # Create tables if requested
        if initialize_tables:
            self._initialize_tables()
            
        self.logger = logging.getLogger(__name__)
    
    def _initialize_tables(self):
        """
        Create all necessary database tables and indices if they don't exist.
        
        This method defines the complete database schema including:
        - Tables for researchers, publications, venues, etc.
        - Foreign key relationships between tables
        - Indices for optimizing common queries
        - Unique constraints to prevent duplicates
        - Support for tracking merge candidates
        """
        with self.conn:
            # Enable foreign key constraints for data integrity
            self.conn.execute("PRAGMA foreign_keys = ON")
            
            # Authors table - core researcher information
            self.conn.execute("""
                CREATE TABLE IF NOT EXISTS authors (
                    id TEXT PRIMARY KEY,
                    given_name TEXT NOT NULL,
                    family_name TEXT NOT NULL,
                    middle_names TEXT,
                    name_suffix TEXT,
                    preferred_name TEXT,
                    display_name TEXT GENERATED ALWAYS AS (
                        CASE 
                            WHEN middle_names IS NOT NULL THEN 
                                given_name || ' ' || middle_names || ' ' || family_name
                            ELSE 
                                given_name || ' ' || family_name
                        END
                    ) STORED,
                    department TEXT,
                    institution TEXT,
                    h_index INTEGER,
                    total_citations INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Create a unique index on given_name and family_name with institution
            # This will prevent exact duplicates while still allowing for name variations
            self.conn.execute("""
                CREATE UNIQUE INDEX IF NOT EXISTS idx_authors_unique_name_components 
                ON authors(given_name, family_name, IFNULL(institution, ''))
            """)

            # Author name indices for efficient searching
            self.conn.execute("CREATE INDEX IF NOT EXISTS idx_authors_family_name ON authors(family_name COLLATE NOCASE)")
            self.conn.execute("CREATE INDEX IF NOT EXISTS idx_authors_given_name ON authors(given_name COLLATE NOCASE)")
            self.conn.execute("CREATE INDEX IF NOT EXISTS idx_authors_display_name ON authors(display_name COLLATE NOCASE)")
            self.conn.execute("CREATE INDEX IF NOT EXISTS idx_authors_institution ON authors(institution)")
            
            # Create a unique index on display_name and institution to prevent exact duplicates
            self.conn.execute("""
                CREATE UNIQUE INDEX IF NOT EXISTS idx_authors_unique_name_inst 
                ON authors(display_name, IFNULL(institution, ''))
            """)
            
            # Author identifiers table (ORCID, email, etc.)
            self.conn.execute("""
                CREATE TABLE IF NOT EXISTS author_identifiers (
                    author_id TEXT NOT NULL,
                    identifier_type TEXT NOT NULL,
                    identifier_value TEXT NOT NULL,
                    confidence_score REAL,
                    verification_status TEXT DEFAULT 'unverified',
                    verified_at TIMESTAMP,
                    verification_method TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (author_id, identifier_type),
                    FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE
                )
            """)
            
            # Create a unique index on ORCID values to prevent duplicate ORCIDs
            self.conn.execute("""
                CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_orcid 
                ON author_identifiers(identifier_value) 
                WHERE identifier_type = 'orcid' AND identifier_value IS NOT NULL
            """)
            
            # Publication venues table (journals, conferences)
            self.conn.execute("""
                CREATE TABLE IF NOT EXISTS publication_venues (
                    id TEXT PRIMARY KEY,
                    display_name TEXT NOT NULL,
                    type TEXT,
                    impact_factor REAL,
                    h_index INTEGER,
                    subjects TEXT,  -- JSON array of subject areas
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Publication venue indices
            self.conn.execute("CREATE INDEX IF NOT EXISTS idx_venues_name ON publication_venues(display_name)")
            
            # Publications table
            self.conn.execute("""
                CREATE TABLE IF NOT EXISTS publications (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    venue_id TEXT,
                    publication_year INTEGER,
                    doi TEXT,
                    type TEXT,
                    citation_count INTEGER DEFAULT 0,
                    abstract TEXT,
                    keywords TEXT,  -- JSON array of keywords/concepts
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (venue_id) REFERENCES publication_venues(id)
                )
            """)
            
            # Create a unique index on DOI to prevent duplicate publications
            self.conn.execute("""
                CREATE UNIQUE INDEX IF NOT EXISTS idx_publications_unique_doi 
                ON publications(doi) 
                WHERE doi IS NOT NULL
            """)
            
            # Publication indices
            self.conn.execute("CREATE INDEX IF NOT EXISTS idx_publications_year ON publications(publication_year)")
            self.conn.execute("CREATE INDEX IF NOT EXISTS idx_publications_doi ON publications(doi)")
            self.conn.execute("CREATE INDEX IF NOT EXISTS idx_publications_citation_count ON publications(citation_count DESC)")
            
            # Author-Publication relationships table
            self.conn.execute("""
                CREATE TABLE IF NOT EXISTS author_publications (
                    author_id TEXT NOT NULL,
                    publication_id TEXT NOT NULL,
                    author_position INTEGER,
                    contribution_type TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (author_id, publication_id),
                    FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE,
                    FOREIGN KEY (publication_id) REFERENCES publications(id) ON DELETE CASCADE
                )
            """)
            
            # Academic fields classification
            self.conn.execute("""
                CREATE TABLE IF NOT EXISTS fields (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    parent_field_id TEXT,
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (parent_field_id) REFERENCES fields(id) ON DELETE SET NULL
                )
            """)
            
            # Create a unique index on field names to prevent duplicates
            self.conn.execute("""
                CREATE UNIQUE INDEX IF NOT EXISTS idx_fields_unique_name 
                ON fields(name)
            """)
            
            # Field keywords for classification
            self.conn.execute("""
                CREATE TABLE IF NOT EXISTS field_keywords (
                    field_id TEXT NOT NULL,
                    keyword TEXT NOT NULL,
                    weight REAL DEFAULT 1.0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (field_id, keyword),
                    FOREIGN KEY (field_id) REFERENCES fields(id) ON DELETE CASCADE
                )
            """)
            
            # Author field expertise scores
            self.conn.execute("""
                CREATE TABLE IF NOT EXISTS author_fields (
                    author_id TEXT NOT NULL,
                    field_id TEXT NOT NULL,
                    expertise_score REAL,
                    publication_count INTEGER DEFAULT 0,
                    citation_count INTEGER DEFAULT 0,
                    last_calculated TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (author_id, field_id),
                    FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE,
                    FOREIGN KEY (field_id) REFERENCES fields(id) ON DELETE CASCADE
                )
            """)
            
            # Collaboration network
            self.conn.execute("""
                CREATE TABLE IF NOT EXISTS author_collaborations (
                    author1_id TEXT NOT NULL,
                    author2_id TEXT NOT NULL,
                    collaboration_count INTEGER DEFAULT 1,
                    first_collaboration INTEGER,
                    last_collaboration INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (author1_id, author2_id),
                    FOREIGN KEY (author1_id) REFERENCES authors(id),
                    FOREIGN KEY (author2_id) REFERENCES authors(id)
                )
            """)
            
            # Merge candidates table for tracking potential author duplicates
            self.conn.execute("""
                CREATE TABLE IF NOT EXISTS merge_candidates (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    primary_author_id TEXT NOT NULL,
                    secondary_author_id TEXT NOT NULL,
                    reason TEXT NOT NULL,
                    confidence REAL DEFAULT 0.0,
                    status TEXT DEFAULT 'pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    resolved_at TIMESTAMP,
                    UNIQUE(primary_author_id, secondary_author_id),
                    FOREIGN KEY (primary_author_id) REFERENCES authors(id),
                    FOREIGN KEY (secondary_author_id) REFERENCES authors(id)
                )
            """)
            
            # Create an index for faster lookup of pending merge candidates
            self.conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_merge_candidates_status
                ON merge_candidates(status)
            """)
            
            # Schema migrations tracking table
            self.conn.execute("""
                CREATE TABLE IF NOT EXISTS schema_migrations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT UNIQUE NOT NULL,
                    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Record that we've initialized the schema
            self.conn.execute("""
                INSERT OR IGNORE INTO schema_migrations (name)
                VALUES ('initial_schema')
            """)
            
    def parse_academic_name(self, full_name: str) -> Dict[str, str]:
        """
        Parse an academic name into its components.
        
        Academic names can have complex formats (e.g., including middle names,
        suffixes). This function attempts to break down a full name string
        into its constituent parts.
        
        Args:
            full_name: Full name string to parse
            
        Returns:
            Dictionary containing name components:
            - given_name: First name
            - family_name: Last name
            - middle_names: Middle names or initials (if present)
            - name_suffix: Suffix like Jr., Sr., etc. (if present)
        """
        name = ' '.join(full_name.split())  # Normalize spaces
        parts = name.split()
        
        # Handle single word names
        if len(parts) == 1:
            return {
                'given_name': parts[0],
                'family_name': parts[0],
                'middle_names': None,
                'name_suffix': None
            }
        
        # Check for suffixes like Jr., Sr., II, III, etc.
        suffixes = {'jr', 'sr', 'ii', 'iii', 'iv', 'v'}
        name_suffix = None
        if parts[-1].lower().replace('.', '') in suffixes:
            name_suffix = parts[-1]
            parts = parts[:-1]

        # Extract remaining components
        # Assume last part is the family name
        family_name = parts[-1]
        # First part is the given name
        given_name = parts[0]
        # Middle parts become middle names
        middle_names = ' '.join(parts[1:-1]) if len(parts) > 2 else None
        
        return {
            'given_name': given_name,
            'family_name': family_name,
            'middle_names': middle_names,
            'name_suffix': name_suffix
        }

    def store_researcher(self, researcher: Dict) -> str:
        """
        Store or update researcher information in the database.
        
        This method checks if the researcher already exists based on name components
        and institution before creating a new record. If found, it updates the
        existing record with any new information.
        
        Args:
            researcher: Dictionary containing researcher information
                
        Returns:
            str: Researcher's database ID
        """
        try:
            # Check if the individual name parts are already present
            if not researcher.get('given_name') or not researcher.get('family_name'):
                # If given_name or family_name are missing, parse the full name string
                if 'name' in researcher:
                    name_parts = self.parse_academic_name(researcher['name'])
                    researcher['given_name'] = name_parts['given_name']
                    researcher['family_name'] = name_parts['family_name'] 
                    researcher['middle_names'] = name_parts['middle_names']
                    researcher['name_suffix'] = name_parts['name_suffix']
                else:
                    # If neither is present, raise an error
                    raise ValueError("Insufficient name information provided")
            
            # Check if this researcher already exists by given_name and family_name
            existing = self.conn.execute("""
                SELECT id FROM authors
                WHERE given_name = ? AND family_name = ? 
                AND (institution = ? OR (institution IS NULL AND ? IS NULL))
            """, (
                researcher['given_name'], 
                researcher['family_name'], 
                researcher.get('institution'), 
                researcher.get('institution')
            )).fetchone()
            
            if existing:
                # If researcher exists, update with any new information
                author_id = existing['id']
                
                # Update fields if provided in the researcher data
                update_fields = []
                params = []
                
                for field in ['department', 'institution', 'h_index', 'total_citations', 'middle_names']:
                    if field in researcher and researcher[field] is not None:
                        update_fields.append(f"{field} = ?")
                        params.append(researcher[field])
                
                if update_fields:
                    params.append(datetime.now().isoformat())
                    params.append(author_id)
                    
                    with self.conn:
                        self.conn.execute(f"""
                            UPDATE authors 
                            SET {', '.join(update_fields)}, updated_at = ?
                            WHERE id = ?
                        """, params)
                
                # If we have an ORCID, make sure it's linked to this author
                if researcher.get('orcid'):
                    # Check if this author already has an ORCID
                    existing_orcid = self.conn.execute("""
                        SELECT identifier_value
                        FROM author_identifiers
                        WHERE author_id = ? AND identifier_type = 'orcid'
                    """, (author_id,)).fetchone()
                    
                    # Only add if no ORCID exists
                    if not existing_orcid:
                        self.store_identifiers(
                            author_id, 
                            researcher['orcid'], 
                            researcher.get('email')
                        )
                
                return author_id
            
            # If researcher doesn't exist, create a new record
            author_id = str(uuid.uuid4())
            
            # Insert the researcher data into the database
            with self.conn:
                self.conn.execute("""
                    INSERT INTO authors (
                        id, given_name, family_name, middle_names, name_suffix,
                        department, institution, h_index, total_citations, 
                        updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    author_id,
                    researcher['given_name'],
                    researcher['family_name'],
                    researcher.get('middle_names'),
                    researcher.get('name_suffix'),
                    researcher.get('department'),
                    researcher.get('institution'),
                    researcher.get('h_index'),
                    researcher.get('total_citations'),
                    datetime.now().isoformat()
                ))
            
            # If we have an ORCID, add it immediately
            if researcher.get('orcid'):
                self.store_identifiers(
                    author_id, 
                    researcher['orcid'], 
                    researcher.get('email')
                )
            
            return author_id
        except sqlite3.IntegrityError as e:
            # Handle case where another process might have created the author
            # between our check and insert (rare but possible)
            if "UNIQUE constraint failed" in str(e):
                # Try again to look up by name components
                existing = self.conn.execute("""
                    SELECT id FROM authors
                    WHERE given_name = ? AND family_name = ? 
                    AND (institution = ? OR (institution IS NULL AND ? IS NULL))
                """, (
                    researcher['given_name'], 
                    researcher['family_name'], 
                    researcher.get('institution'), 
                    researcher.get('institution')
                )).fetchone()
                
                if existing:
                    return existing['id']
            
            # Re-raise the error if it's not what we expected or we couldn't recover
            raise    

    def _update_researcher(self, author_id: str, researcher: Dict):
        """
        Update an existing researcher record with new information.
        
        Args:
            author_id: The ID of the author to update
            researcher: Dictionary containing updated information
        """
        fields_to_update = []
        params = []
        
        # Check which fields should be updated
        for field in ['department', 'institution', 'h_index', 'total_citations']:
            if field in researcher and researcher[field] is not None:
                fields_to_update.append(f"{field} = ?")
                params.append(researcher[field])
        
        # Only update if there are fields to update
        if fields_to_update:
            fields_to_update.append("updated_at = ?")
            params.append(datetime.now().isoformat())
            params.append(author_id)
            
            # Execute the update query
            with self.conn:
                self.conn.execute(f"""
                    UPDATE authors 
                    SET {', '.join(fields_to_update)}
                    WHERE id = ?
                """, params)

    def store_identifiers(self, author_id: str, orcid: Optional[str], email: Optional[str], 
                        match_status: MatchStatus = None) -> None:
        """
        Store researcher identifiers with verification status.
        
        Links external identifiers (ORCID, email) to a researcher profile 
        and records the confidence level of the match. If an ORCID is already
        assigned to a different author, records this as a merge candidate.
        
        Args:
            author_id: Database ID of the author
            orcid: ORCID identifier if found
            email: Email address if available
            match_status: MatchStatus indicating verification level
        """
        try:
            # First check if this ORCID already exists but with a different author_id
            if orcid:
                existing_orcid = self.conn.execute("""
                    SELECT author_id FROM author_identifiers
                    WHERE identifier_type = 'orcid'
                    AND identifier_value = ?
                    AND author_id != ?
                """, (orcid, author_id)).fetchone()
                
                if existing_orcid:
                    # Record this as a merge candidate
                    with self.conn:
                        # Record the potential merge
                        try:
                            self.conn.execute("""
                                INSERT INTO merge_candidates (
                                    primary_author_id, secondary_author_id, reason, confidence
                                ) VALUES (?, ?, ?, ?)
                            """, (
                                existing_orcid['author_id'],  # Existing record as primary
                                author_id,                   # New record as secondary
                                f"ORCID conflict: {orcid}",
                                0.9  # High confidence since ORCID is supposed to be unique
                            ))
                            logging.info(f"ORCID {orcid} conflict detected. Recorded merge candidate.")
                        except sqlite3.IntegrityError:
                            # Merge candidate already exists, just log it
                            logging.info(f"ORCID {orcid} conflict already recorded as merge candidate.")
                    
                    # Still store other identifiers
                    if email:
                        try:
                            with self.conn:
                                self.conn.execute("""
                                    INSERT INTO author_identifiers 
                                        (author_id, identifier_type, identifier_value)
                                    VALUES (?, 'email', ?)
                                """, (author_id, email))
                        except sqlite3.IntegrityError:
                            # Already exists, update it
                            with self.conn:
                                self.conn.execute("""
                                    UPDATE author_identifiers
                                    SET identifier_value = ?
                                    WHERE author_id = ? AND identifier_type = 'email'
                                """, (email, author_id))
                    
                    return

                # Map MatchStatus to verification values
                verification_info = {
                    MatchStatus.EXACT_MATCH_WITH_INSTITUTION: ('verified', 1.0, 'institutional_match'),
                    MatchStatus.EXACT_MATCH_DISTINCTIVE: ('probable', 0.9, 'distinctive_name'),
                    MatchStatus.EXACT_MATCH_COMMON_NAME: ('probable', 0.7, 'common_name'),
                    MatchStatus.MULTIPLE_MATCHES: ('ambiguous', 0.3, 'multiple_matches'),
                    MatchStatus.NO_MATCH: ('unverified', 0.0, 'no_match'),
                    MatchStatus.ERROR: ('error', 0.0, 'api_error')
                }.get(match_status, ('unverified', 0.0, 'direct_input'))
                
                status, confidence, method = verification_info
                
                # Insert or update ORCID identifier
                try:
                    with self.conn:
                        self.conn.execute("""
                            INSERT INTO author_identifiers (
                                author_id, identifier_type, identifier_value,
                                confidence_score, verification_status, verification_method,
                                verified_at
                            ) VALUES (?, 'orcid', ?, ?, ?, ?, ?)
                        """, (
                            author_id,
                            orcid,
                            confidence,
                            status,
                            method,
                            datetime.now().isoformat()
                        ))
                except sqlite3.IntegrityError:
                    # Already exists, update it
                    with self.conn:
                        self.conn.execute("""
                            UPDATE author_identifiers
                            SET identifier_value = ?,
                                confidence_score = ?,
                                verification_status = ?,
                                verification_method = ?,
                                verified_at = ?
                            WHERE author_id = ? AND identifier_type = 'orcid'
                        """, (
                            orcid,
                            confidence,
                            status,
                            method,
                            datetime.now().isoformat(),
                            author_id
                        ))

            # Store email if provided
            if email:
                try:
                    with self.conn:
                        self.conn.execute("""
                            INSERT INTO author_identifiers 
                                (author_id, identifier_type, identifier_value)
                            VALUES (?, 'email', ?)
                        """, (author_id, email))
                except sqlite3.IntegrityError:
                    # Already exists, update it
                    with self.conn:
                        self.conn.execute("""
                            UPDATE author_identifiers
                            SET identifier_value = ?
                            WHERE author_id = ? AND identifier_type = 'email'
                        """, (email, author_id))
        except sqlite3.Error as e:
            logging.error(f"Error storing identifiers: {e}")

    def store_venue(self, venue_data: Dict, metrics: Optional['VenueMetrics'] = None) -> Optional[str]:
        """
        Store publication venue with impact metrics.
        
        Creates or updates a record for a journal, conference, or other 
        publication venue along with its impact metrics.
        
        Args:
            venue_data: Dictionary containing venue information
            metrics: Optional VenueMetrics object with impact data
                
        Returns:
            str: Venue's database ID or None if no name provided
        """
        # Venue must have a name
        if not venue_data.get('name'):
            return None
                
        # Generate a unique ID for this venue
        venue_id = str(uuid.uuid4())
        
        with self.conn:
            self.conn.execute("""
                INSERT INTO publication_venues (
                    id, display_name, type,
                    impact_factor, h_index, subjects,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                venue_id,
                venue_data['name'],
                venue_data.get('type', 'journal'),
                metrics.citations_per_work if metrics else None,
                metrics.h_index if metrics else None,
                json.dumps(metrics.subjects) if metrics and metrics.subjects else None,
                datetime.now().isoformat(),
                datetime.now().isoformat()
            ))
        return venue_id

    def store_publication(self, pub_data: Dict, venue_metrics: Optional['VenueMetrics'] = None) -> str:
        """
        Store a publication with its metadata, handling missing titles and existing records.
        
        Publications with DOIs are always preserved, even with missing titles.
        When a title is missing but a DOI exists, a placeholder title is used.
        
        Args:
            pub_data: Dictionary containing publication information
            venue_metrics: Optional venue impact metrics
            
        Returns:
            str: Publication's database ID or None if rejected
        """
        # Handle missing titles for publications with DOIs
        doi = pub_data.get('doi')
        
        if not pub_data.get('title') and doi:
            # Generate a placeholder title using the DOI
            pub_data['title'] = f"Publication with DOI: {doi}"
            self.logger.info(f"Using placeholder title for publication with DOI: {doi}")
        elif not pub_data.get('title') and not doi:
            # Only skip publications that have neither title nor DOI
            # These can't be reliably identified or deduplicated
            self.logger.warning(f"Skipping publication without title and DOI")
            return None
        
        # Check if this publication already exists by DOI
        if doi:
            existing = self.conn.execute("""
                SELECT id, citation_count, title, updated_at
                FROM publications
                WHERE doi = ?
            """, (doi,)).fetchone()
            
            if existing:
                # Publication already exists - update it if necessary
                pub_id = existing['id']
                
                updates_needed = []
                params = []
                
                # If we have a real title and the existing record has a placeholder, update it
                if (pub_data.get('title') and existing['title'] and 
                    existing['title'].startswith("Publication with DOI:")):
                    updates_needed.append("title = ?")
                    params.append(pub_data['title'])
                
                # Update citation count if the new data has a higher count
                new_citation_count = pub_data.get('citations', 0)
                if new_citation_count > (existing['citation_count'] or 0):
                    updates_needed.append("citation_count = ?")
                    params.append(new_citation_count)
                
                # If we have updates to make
                if updates_needed:
                    params.append(datetime.now().isoformat())
                    params.append(pub_id)
                    
                    self.conn.execute(f"""
                        UPDATE publications
                        SET {', '.join(updates_needed)}, updated_at = ?
                        WHERE id = ?
                    """, params)
                
                return pub_id
        
        # Generate a unique ID for this publication
        pub_id = str(uuid.uuid4())
        
        # Store venue if it exists
        venue_id = None
        if venue := pub_data.get('venue'):
            venue_id = self.store_venue(venue, venue_metrics)
        
        try:
            with self.conn:
                # Store main publication record
                self.conn.execute("""
                    INSERT INTO publications (
                        id, title, venue_id, publication_year,
                        doi, citation_count, type, abstract,
                        keywords, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    pub_id,
                    pub_data['title'],
                    venue_id,
                    pub_data.get('year'),
                    doi,
                    pub_data.get('citations', 0),
                    pub_data.get('type', 'article'),
                    pub_data.get('abstract'),
                    json.dumps([c['name'] for c in pub_data.get('concepts', [])]),
                    datetime.now().isoformat()
                ))
        except sqlite3.IntegrityError as e:
            # Handle race condition where publication was added between our check and insert
            if "UNIQUE constraint failed: publications.doi" in str(e) and doi:
                existing = self.conn.execute("""
                    SELECT id FROM publications WHERE doi = ?
                """, (doi,)).fetchone()
                
                if existing:
                    return existing['id']
            
            # Re-raise other integrity errors
            raise
        
        return pub_id

    def store_author_publication(self, author_id: str, pub_id: str, 
                               author_data: Dict[str, Any]):
        """
        Link an author to a publication with relationship metadata.
        
        Creates the many-to-many relationship between authors and publications,
        recording information like author position and contribution type.
        
        Args:
            author_id: Author's database ID
            pub_id: Publication's database ID
            author_data: Dictionary containing relationship details
        """
        with self.conn:
            self.conn.execute("""
                INSERT INTO author_publications (
                    author_id, publication_id, author_position,
                    contribution_type, created_at
                ) VALUES (?, ?, ?, ?, ?)
            """, (
                author_id,
                pub_id,
                author_data.get('position'),
                'corresponding' if author_data.get('is_corresponding') else 'contributing',
                datetime.now().isoformat()
            ))

    def update_collaboration_network(self, author1_id: str, author2_id: str, pub_year: int):
        """
        Update or create a collaboration record between two authors.
        
        Records or updates a collaborative relationship between researchers,
        tracking frequency and time span of collaborations.
        
        Args:
            author1_id: First author's database ID
            author2_id: Second author's database ID
            pub_year: Year of collaboration
        """
        try:
            # Ensure consistent ordering of author IDs
            if author1_id >= author2_id:  # Lexicographically compare
                author1_id, author2_id = author2_id, author1_id
                
            with self.conn:
                # First check if the collaboration exists
                existing = self.conn.execute("""
                    SELECT collaboration_count, first_collaboration, last_collaboration
                    FROM author_collaborations
                    WHERE author1_id = ? AND author2_id = ?
                """, (author1_id, author2_id)).fetchone()
                
                current_time = datetime.now().isoformat()
                
                if existing:
                    # Update existing collaboration
                    self.conn.execute("""
                        UPDATE author_collaborations
                        SET 
                            collaboration_count = collaboration_count + 1,
                            first_collaboration = MIN(?, first_collaboration),
                            last_collaboration = MAX(?, last_collaboration),
                            updated_at = ?
                        WHERE author1_id = ? AND author2_id = ?
                    """, (pub_year, pub_year, current_time, author1_id, author2_id))
                else:
                    # Create new collaboration
                    self.conn.execute("""
                        INSERT INTO author_collaborations (
                            author1_id, author2_id, collaboration_count,
                            first_collaboration, last_collaboration,
                            created_at, updated_at
                        ) VALUES (?, ?, 1, ?, ?, ?, ?)
                    """, (
                        author1_id, author2_id, pub_year, pub_year,
                        current_time, current_time
                    ))
        except sqlite3.Error as e:
            logging.error(f"Error updating collaboration network: {e}")
    
    def get_author_publications(self, author_id: str) -> List[Dict]:
        """
        Retrieve all publications for an author with full metadata.
        
        Returns a comprehensive list of publications associated with a 
        researcher, including venue information and contribution details.
        
        Args:
            author_id: Author's database ID
            
        Returns:
            List of publication dictionaries with venue and author information
        """
        query = """
            SELECT 
                p.*, v.display_name as venue_name,
                v.type as venue_type,
                v.impact_factor,
                ap.author_position,
                ap.contribution_type
            FROM publications p
            JOIN author_publications ap ON p.id = ap.publication_id
            LEFT JOIN publication_venues v ON p.venue_id = v.id
            WHERE ap.author_id = ?
            ORDER BY p.publication_year DESC
        """
        
        with self.conn:
            results = self.conn.execute(query, (author_id,)).fetchall()
            
            publications = []
            for row in results:
                pub = dict(row)
                
                # Parse JSON fields
                if pub['keywords']:
                    pub['keywords'] = json.loads(pub['keywords'])
                
                publications.append(pub)
                
            return publications

    def get_collaboration_network(self, min_collaborations: int = 2) -> Dict:
        """
        Export collaboration network data for visualization.
        
        Retrieves the network of author collaborations for analysis
        or visualization, filtering by collaboration strength.
        
        Args:
            min_collaborations: Minimum number of collaborations to include
            
        Returns:
            Dictionary containing nodes (authors) and edges (collaborations)
        """
        with self.conn:
            # Get all authors as nodes
            nodes = self.conn.execute("""
                SELECT DISTINCT a.id, a.display_name, a.department,
                    COUNT(DISTINCT ap.publication_id) as publication_count,
                    MAX(p.publication_year) as latest_pub_year
                FROM authors a
                JOIN author_publications ap ON a.id = ap.author_id
                JOIN publications p ON ap.publication_id = p.id
                GROUP BY a.id
            """).fetchall()
            
            # Get collaborations as edges
            edges = self.conn.execute("""
                SELECT 
                    a1.display_name as source,
                    a2.display_name as target,
                    ac.collaboration_count as weight,
                    ac.first_collaboration,
                    ac.last_collaboration
                FROM author_collaborations ac
                JOIN authors a1 ON ac.author1_id = a1.id
                JOIN authors a2 ON ac.author2_id = a2.id
                WHERE ac.collaboration_count >= ?
            """, (min_collaborations,)).fetchall()
            
            # Format as network data
            return {
                'nodes': [dict(row) for row in nodes],
                'edges': [dict(row) for row in edges]
            }

    def update_author_metrics(self, author_id: str, h_index: int, 
                            total_citations: int):
        """
        Update an author's research impact metrics.
        
        Updates calculated metrics that summarize a researcher's
        overall impact and productivity.
        
        Args:
            author_id: Author's database ID
            h_index: Author's calculated h-index
            total_citations: Author's total citation count
        """
        with self.conn:
            self.conn.execute("""
                UPDATE authors 
                SET h_index = ?,
                    total_citations = ?,
                    updated_at = ?
                WHERE id = ?
            """, (h_index, total_citations, datetime.now().isoformat(), author_id))

    def store_field_scores(self, author_id: str, scores: Dict[str, float]):
        """
        Store or update an author's field expertise scores.
        
        Records the calculated expertise levels across different
        academic fields for a researcher.
        
        Args:
            author_id: Author's database ID
            scores: Dictionary mapping field IDs to expertise scores
        """
        with self.conn:
            # First clear existing scores
            self.conn.execute("""
                DELETE FROM author_fields
                WHERE author_id = ?
            """, (author_id,))
            
            # Insert new scores
            for field_id, score in scores.items():
                self.conn.execute("""
                    INSERT INTO author_fields (
                        author_id, field_id, expertise_score,
                        last_calculated
                    ) VALUES (?, ?, ?, ?)
                """, (author_id, field_id, score, datetime.now().isoformat()))

    def close(self):
        """Close the database connection."""
        if self.conn:
            self.conn.close()

    def __enter__(self):
        """Context manager entry."""
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit with proper cleanup."""
        self.close()


class ResearcherProcessor:
    """
    Main processor class for academic researcher data.
    
    This class coordinates the entire workflow of:
    1. Matching researchers to their ORCID identifiers
    2. Fetching publications from external APIs
    3. Processing and storing researcher profiles
    4. Building collaboration networks
    5. Calculating research impact metrics
    
    It serves as the high-level orchestrator for the SciValidate system.
    """
    
    def __init__(self, db_path: str, config_path: str = None):
        """
        Initialize the processor with database and configuration.
        
        Args:
            db_path: Path to SQLite database
            config_path: Optional path to configuration JSON
        """
        # Initialize database manager
        self.db = DatabaseManager(db_path)
        # Load configuration
        self.config = ResearchMetricsConfig(config_path)
        # HTTP session will be initialized in __aenter__
        self.session = None
        # Set up logging
        self.logger = logging.getLogger(__name__)
        
    async def __aenter__(self):
        """
        Set up async session for API calls.
        
        Creates an aiohttp session for making asynchronous API requests
        with appropriate headers and timeout settings.
        """
        # Configure timeout settings
        timeout = aiohttp.ClientTimeout(total=30, connect=10)
        
        # Set up standard headers for API requests
        headers = {
            'Accept': 'application/json',
            'User-Agent': 'ResearcherProcessor/1.0 (Academic Research Project)',
        }
        
        # Create session with configured settings
        self.session = aiohttp.ClientSession(
            headers=headers,
            timeout=timeout,
            raise_for_status=False  # Don't automatically raise for HTTP errors
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """
        Clean up async session.
        
        Ensures the aiohttp session is properly closed when done.
        """
        if self.session:
            await self.session.close()

    async def process_researcher(self, faculty: Dict) -> Optional[str]:
        """
        Process a single researcher's complete profile.
        
        This is the main entry point for processing a researcher, handling:
        1. Finding ORCID match
        2. Storing researcher info with ORCID
        3. Fetching and processing publications
        4. Building collaboration network
        5. Calculating expertise metrics
        
        Args:
            faculty: Dictionary containing faculty member information
            
        Returns:
            Optional[str]: Researcher's database ID if successful
        """
        try:
            # Find ORCID match FIRST
            self.logger.info(f"Searching for ORCID match for {faculty['name']}")
            orcid_result = await self._find_orcid_match(faculty)
            if not orcid_result or orcid_result.status == MatchStatus.ERROR:
                self.logger.warning(f"No ORCID match found for {faculty['name']}")
                # Continue processing without ORCID
            elif orcid_result.orcid:
                self.logger.info(f"ORCID match found for {faculty['name']}: {orcid_result.orcid}")
                # Add ORCID to faculty data so it's stored with the researcher
                faculty['orcid'] = orcid_result.orcid
                
            # Store basic researcher info (now with ORCID if found)
            self.logger.info(f"Storing researcher info for {faculty['name']}")
            author_id = self.db.store_researcher(faculty)
            self.logger.info(f"Stored researcher {faculty['name']} with ID: {author_id}")

            # Also explicitly store ORCID as identifier if found
            if orcid_result and orcid_result.orcid:
                self.logger.info(f"Storing ORCID and email for {faculty['name']}")
                self.db.store_identifiers(
                    author_id, 
                    orcid_result.orcid,
                    faculty.get('email'),
                    orcid_result.status
                )
            
            # Skip publication processing if no ORCID
            if not orcid_result or not orcid_result.orcid:
                return author_id
                
            # Fetch and process publications
            publications = await self._fetch_publications(orcid_result.orcid)
            
            total_citations = 0
            for pub in publications:
                # Get venue metrics if available
                venue_metrics = None
                if venue_id := pub.get('venue_id'):
                    venue_metrics = await VenueMetrics.from_openalex(
                        venue_id, self.session
                    )
                
                # Store publication
                pub_id = self.db.store_publication(pub, venue_metrics)
                
                # Skip further processing if publication couldn't be stored
                if pub_id is None:
                    continue

                # Process author position and store relationship
                author_position = None
                is_corresponding = False
                for idx, author in enumerate(pub['authors']):
                    if author.get('orcid') == orcid_result.orcid:
                        author_position = idx + 1
                        is_corresponding = author.get('is_corresponding', False)
                        break
                
                self.db.store_author_publication(
                    author_id,
                    pub_id,
                    {
                        'position': author_position,
                        'is_corresponding': is_corresponding
                    }
                )
                
                # Update collaboration network
                pub_year = pub.get('year', 0)
                for coauthor in pub['authors']:
                    # Skip if this is the faculty member themselves (by name or ORCID)
                    if (coauthor.get('orcid') == orcid_result.orcid or 
                        coauthor.get('name') == faculty['name']):
                        continue
                        
                    # Only process coauthors with ORCIDs to avoid ambiguity
                    if coauthor.get('orcid'):
                        coauthor_id = await self._get_or_create_coauthor(coauthor)
                        if coauthor_id and coauthor_id != author_id:  # Extra check to avoid self-links
                            self.db.update_collaboration_network(
                                author_id,
                                coauthor_id,
                                pub_year
                            )
                
                total_citations += pub.get('citations', 0)
            
            # Calculate h-index
            h_index = self._calculate_h_index(publications)
            
            # Update author metrics
            self.db.update_author_metrics(author_id, h_index, total_citations)
            
            return author_id
        
        except Exception as e:
            self.logger.error(f"Error processing {faculty['name']}: {str(e)}")
            self.logger.exception("Full traceback:")
            return None
        
    async def _find_orcid_match(self, faculty: Dict) -> Optional[ORCIDResult]:
        """
        Find ORCID match for a faculty member.
        
        This method attempts to locate an ORCID identifier for a faculty member by:
        1. Analyzing name distinctiveness
        2. Generating name variants for searching
        3. Querying the ORCID API
        4. Verifying matches with institutional information
        5. Scoring and ranking potential matches
        
        Args:
            faculty: Dictionary with faculty member information
            
        Returns:
            ORCIDResult: Object containing match results or None if error
        """
        name_analysis = self._analyze_name_distinctiveness(faculty['name'])
        variants = self._generate_name_variants(faculty['name'])
        
        # Try basic name variants first
        for variant in variants:
            names = variant.split()
            first = names[0].strip('.')
            last = names[-1]
            
            url = (f"https://pub.orcid.org/v3.0/expanded-search?"
                f"q=given-names:{quote(first)}+AND+family-name:{quote(last)}")
            
            try:
                async with self.session.get(url) as response:
                    if response.status != 200:
                        self.logger.warning(f"ORCID API request failed for {variant}: {response.status}")
                        continue
                    
                    data = await response.json()
                    self.logger.info(f"ORCID API response for {variant}: {json.dumps(data, indent=2)}")

                    results = data.get('expanded-result', [])
                    
                    if len(results) == 1:  # Single match
                        match = results[0]
                        # Verify institutional affiliation for single match
                        has_institution_match = await self._verify_institutional_affiliation(
                            match['orcid-id'],
                            faculty['institution']
                        )
                        
                        status = (MatchStatus.EXACT_MATCH_WITH_INSTITUTION if has_institution_match
                                else MatchStatus.EXACT_MATCH_DISTINCTIVE)
                        
                        return ORCIDResult(
                            faculty_id=faculty.get('id', str(uuid.uuid4())),
                            faculty_name=faculty['name'],
                            faculty_member=faculty,
                            distinctiveness_score=name_analysis['distinctiveness_score'],
                            status=status,
                            potential_matches=[match],
                            orcid=match['orcid-id'],
                            message="Single match found" + (" with institutional verification" if has_institution_match else "")
                        )
                    
                    elif len(results) > 1:
                        # Check if ambiguity is due to Sr/Jr distinction
                        suffix_matches = [r for r in results 
                                    if any(s in r.get('family-names', '') 
                                            for s in [' Jr', ' Sr', ' II', ' III'])]
                        
                        if suffix_matches:
                            # If we have suffix matches, check institution to disambiguate
                            for match in suffix_matches:
                                if await self._verify_institutional_affiliation(
                                    match['orcid-id'],
                                    faculty['institution']
                                ):
                                    return ORCIDResult(
                                        faculty_id=faculty.get('id', str(uuid.uuid4())),
                                        faculty_name=faculty['name'],
                                        faculty_member=faculty,
                                        distinctiveness_score=name_analysis['distinctiveness_score'],
                                        status=MatchStatus.EXACT_MATCH_WITH_INSTITUTION,
                                        potential_matches=[match],
                                        orcid=match['orcid-id'],
                                        message="Disambiguated via institution and suffix"
                                    )
                        
                        # Score and rank potential matches
                        best_match = None
                        best_score = 0
                        
                        # Extract faculty initials
                        faculty_parts = faculty['name'].split()
                        faculty_last = faculty_parts[-1]
                        faculty_initials = ''.join([p.strip('.')[0] for p in faculty_parts[:-1]])
                        
                        for match in results:
                            score = 0
                            
                            # Last name match
                            if match.get('family-names', '').lower() == faculty_last.lower():
                                score += 0.5
                            
                            # Handle initials
                            orcid_given = match.get('given-names', '')
                            if orcid_given:
                                orcid_initials = ''.join([p.strip('.')[0] for p in orcid_given.split()])
                                
                                # Different types of initial matches
                                if faculty_initials == orcid_initials:
                                    score += 0.4  # Exact match on all initials
                                elif all(init in orcid_initials for init in faculty_initials):
                                    score += 0.3  # All faculty initials present
                                elif faculty_initials and orcid_initials and faculty_initials[0] == orcid_initials[0]:
                                    score += 0.2  # At least first initial matches
                            
                            # Check for institutional match - direct bonus
                            if faculty.get('institution') and match.get('institution-name'):
                                faculty_inst = faculty['institution'].lower()
                                for inst in match['institution-name']:
                                    inst_lower = inst.lower()
                                    if any(word in inst_lower for word in faculty_inst.split()):
                                        score += 0.2
                                        break
                            
                            # Update best match if score improved
                            if score > best_score:
                                best_score = score
                                best_match = match
                        
                        # If we found a good match
                        if best_score >= 0.6:
                            # Check if match has institution information matching faculty
                            has_institution_match = False
                            if faculty.get('institution') and best_match.get('institution-name'):
                                faculty_inst = faculty['institution'].lower()
                                for inst in best_match['institution-name']:
                                    inst_lower = inst.lower()
                                    if any(word in inst_lower for word in faculty_inst.split()):
                                        has_institution_match = True
                                        break
                            
                            # Determine appropriate status based on match quality and institution
                            if has_institution_match:
                                status = MatchStatus.EXACT_MATCH_WITH_INSTITUTION
                            elif best_score > 0.8:
                                status = MatchStatus.EXACT_MATCH_DISTINCTIVE
                            else:
                                status = MatchStatus.EXACT_MATCH_COMMON_NAME
                            
                            return ORCIDResult(
                                faculty_id=faculty.get('id', str(uuid.uuid4())),
                                faculty_name=faculty['name'],
                                faculty_member=faculty,
                                distinctiveness_score=name_analysis['distinctiveness_score'],
                                status=status,
                                potential_matches=[best_match],
                                orcid=best_match['orcid-id'],
                                message=f"Best match found with confidence score: {best_score:.2f}"
                            )
                        
                        # If no clear best match, return multiple matches
                        return ORCIDResult(
                            faculty_id=faculty.get('id', str(uuid.uuid4())),
                            faculty_name=faculty['name'],
                            faculty_member=faculty,
                            distinctiveness_score=name_analysis['distinctiveness_score'],
                            status=MatchStatus.MULTIPLE_MATCHES,
                            potential_matches=results,
                            message=f"Found {len(results)} potential matches"
                        )
                        
            except Exception as e:
                self.logger.error(f"ORCID API error for {variant}: {str(e)}")
                continue
                
            await asyncio.sleep(1)  # Rate limiting

        # No matches found after trying all variants
        return ORCIDResult(
            faculty_id=faculty.get('id', str(uuid.uuid4())),
            faculty_name=faculty['name'],
            faculty_member=faculty,
            distinctiveness_score=name_analysis['distinctiveness_score'],
            status=MatchStatus.NO_MATCH,
            potential_matches=[],
            message="No matches found"
        )

    def _calculate_name_match_score(self, faculty_name, orcid_match, faculty_institution=None):
        """
        Calculate a match score between faculty name and ORCID record.
        
        Scores the similarity between a faculty name and an ORCID record
        based on name components and institutional affiliation.
        
        Args:
            faculty_name: Faculty member's name
            orcid_match: ORCID match record
            faculty_institution: Faculty's institution name (optional)
            
        Returns:
            float: Match score between 0.0 and 1.0 (higher = better match)
        """
        score = 0.0
        
        # Extract components
        faculty_parts = faculty_name.lower().split()
        
        # Get ORCID name components
        orcid_given = orcid_match.get('given-names', '').lower()
        orcid_family = orcid_match.get('family-names', '').lower()
        orcid_institution = next(iter(orcid_match.get('institution-name', [])), '').lower()
        
        # Score family name match (highest importance)
        if orcid_family and faculty_parts[-1].lower() == orcid_family:
            score += 0.5  # Exact family name match is 50% of total score
        elif orcid_family and faculty_parts[-1].lower() in orcid_family or orcid_family in faculty_parts[-1].lower():
            score += 0.3  # Partial match gives 30%
        
        # Score given name match
        if orcid_given and faculty_parts[0].lower() == orcid_given.lower():
            score += 0.3  # Exact given name match is 30% of total score
        elif orcid_given and faculty_parts[0][0].lower() == orcid_given[0].lower():  # Initial match
            score += 0.2  # Matching first initial gives 20%
        
        # Check for middle initials/names
        if len(faculty_parts) > 2 and len(orcid_given.split()) > 1:
            faculty_middle = faculty_parts[1:-1]
            orcid_middle = orcid_given.split()[1:]
            
            # Check for matching middle initials
            for f_middle in faculty_middle:
                for o_middle in orcid_middle:
                    if f_middle[0].lower() == o_middle[0].lower():
                        score += 0.1  # Each matching middle initial adds 10%
                        break
        
        # Institution match (if available)
        if faculty_institution and orcid_institution:
            faculty_inst_parts = set(faculty_institution.lower().split())
            orcid_inst_parts = set(orcid_institution.lower().split())
            
            # Check for institutional overlap
            common_terms = faculty_inst_parts.intersection(orcid_inst_parts)
            if len(common_terms) >= 2:  # At least 2 matching terms indicates same institution
                score += 0.2  # Institution match adds 20%
        
        # Cap at 1.0
        return min(1.0, score)

    async def _verify_institutional_affiliation(self, orcid_id: str,
                                              institution: str) -> bool:
        """
        Verify if a researcher has an affiliation with the given institution.
        
        This adds an important verification layer to ORCID matching by checking
        if the institution in our records matches any employment records in ORCID.
        
        Args:
            orcid_id: Researcher's ORCID identifier
            institution: Institution name to verify
            
        Returns:
            bool: True if affiliation is verified
        """
        try:
            # Query ORCID for employment information
            url = f"https://pub.orcid.org/v3.0/{orcid_id}/employments"
            async with self.session.get(url) as response:
                if response.status != 200:
                    return False

                data = await response.json()
                employments = data.get('employment-summary', [])
                
                # Normalize institution name
                institution_parts = set(institution.lower().split())
                
                # Common abbreviations that might be used
                abbreviations = {
                    'university': ['univ', 'u'],
                    'institute': ['inst'],
                    'technology': ['tech'],
                    # Add more as needed
                }
                
                # Add abbreviated forms to parts
                expanded_parts = set(institution_parts)
                for word in institution_parts:
                    for full, abbrevs in abbreviations.items():
                        if word == full:
                            expanded_parts.update(abbrevs)
                        if word in abbrevs:
                            expanded_parts.add(full)
                
                # Check each employment record for a matching institution
                for employment in employments:
                    org_name = employment.get('organization', {}).get('name', '').lower()
                    org_parts = set(org_name.split())
                    
                    # Check for significant overlap in terms
                    matching_parts = expanded_parts.intersection(org_parts)
                    if len(matching_parts) >= 2:  # Require at least 2 matching terms
                        return True
                        
                return False

        except Exception as e:
            self.logger.error(f"Error verifying institution: {str(e)}")
            return False

    async def _fetch_publications(self, orcid_id: str) -> List[Dict]:
        """
        Fetch publications for a researcher from OpenAlex API.
        
        Uses the OpenAlex API to retrieve a researcher's publication history,
        with cursor-based pagination to handle large result sets.
        
        Args:
            orcid_id: Researcher's ORCID identifier
            
        Returns:
            List[Dict]: List of publication dictionaries with complete metadata
        """
        if not orcid_id:
            self.logger.info(f"No ORCID ID provided, returning empty publications list")
            self.logger.info(f"Total publications found: 0")
            self.logger.info(f"No more pages to fetch")
            return []
            
        try:
            base_url = "https://api.openalex.org/works"
            self.logger.info(f"Fetching publications from OpenAlex for ORCID: {orcid_id}")
            publications = []
            cursor = "*"  # Starting cursor for pagination
            total_fetched = 0
            page_count = 1
            
            # Continue fetching pages until no more cursor is returned
            while cursor:
                # Build the request URL with the cursor
                url = f"{base_url}?filter=author.orcid:{orcid_id}&per-page=100&cursor={cursor}"
                            
                self.logger.info(f"Fetching page {page_count} from OpenAlex")
                async with self.session.get(url) as response:
                    if response.status != 200:
                        self.logger.error(f"OpenAlex API error: {response.status}")
                        break

                    data = await response.json()
                    results = data.get('results', [])
                    total_fetched += len(results)
                    self.logger.info(f"Found {len(results)} publications on this page")
                    
                    if page_count == 1:  # Log total count on first page
                        self.logger.info(f"Total publications found: {data.get('meta', {}).get('count', 0)}")
                    
                    # Process the results
                    for work in results:
                        # Extract venue information
                        venue = None
                        if primary_location := work.get('primary_location', {}):
                            if source := primary_location.get('source'):
                                venue = {
                                    'name': source.get('display_name'),
                                    'type': source.get('type'),
                                    'publisher': source.get('publisher'),
                                    'issn': source.get('issn')
                                }
                        
                        # Create publication record with complete metadata
                        pub = {
                            'title': work.get('title', ''),
                            'year': work.get('publication_year'),
                            'doi': work.get('doi'),
                            'citations': work.get('cited_by_count', 0),
                            'venue': venue,
                            'venue_id': work.get('host_venue', {}).get('id'),
                            'type': work.get('type', 'unknown'),
                            'concepts': [
                                {
                                    'name': c.get('display_name', ''),
                                    'level': c.get('level'),
                                    'score': c.get('score', 0)
                                }
                                for c in work.get('concepts', [])
                            ],
                            'authors': []
                        }
                        
                        # Extract comprehensive author information
                        for authorship in work.get('authorships', []):
                            author = authorship.get('author', {})
                            author_info = {
                                'name': author.get('display_name'),
                                'orcid': author.get('orcid'),
                                'position': len(pub['authors']) + 1,
                                'is_corresponding': authorship.get('is_corresponding', False),
                                'institutions': [
                                    {
                                        'name': inst.get('display_name'),
                                        'country': inst.get('country_code')
                                    }
                                    for inst in authorship.get('institutions', [])
                                ]
                            }
                            pub['authors'].append(author_info)
                        
                        publications.append(pub)
                    
                    page_count += 1
                    
                    # Check for next cursor in meta data
                    cursor = data.get('meta', {}).get('next_cursor')
                    if not cursor:
                        self.logger.info(f"No more pages to fetch")
                        break
                        
                    await asyncio.sleep(1)  # Rate limiting to be respectful to the API
                
            self.logger.info(f"Total publications processed: {len(publications)}")
            return publications

        except Exception as e:
            self.logger.error(f"Error fetching publications: {str(e)}")
            self.logger.exception("Full traceback:")
            return []

    async def _get_or_create_coauthor(self, coauthor_data: Dict) -> Optional[str]:
        """
        Look up or create a coauthor record, avoiding duplicates and handling self-references.
        """
        try:
            # Extract ORCID if available and normalize it
            orcid = coauthor_data.get('orcid')
            if orcid and isinstance(orcid, str) and 'orcid.org' in orcid:
                # Extract just the ID portion from URLs
                orcid = orcid.split('/')[-1]
                coauthor_data['orcid'] = orcid
                
                # FIRST PRIORITY: Try to find by ORCID
                existing = self.db.conn.execute("""
                    SELECT author_id 
                    FROM author_identifiers
                    WHERE identifier_type = 'orcid'
                    AND identifier_value = ?
                """, (orcid,)).fetchone()
                
                if existing:
                    # Author already exists with this ORCID - no need to process further
                    return existing['author_id']
            
            # Extract name and check it exists
            author_name = coauthor_data.get('name')
            if not author_name:
                self.logger.warning(f"Coauthor missing name, skipping")
                return None
            
            # Check if this coauthor is already being processed as a faculty member
            # Get all faculty ORCIDs to compare against
            faculty_orcids = self.db.conn.execute("""
                SELECT identifier_value 
                FROM author_identifiers 
                WHERE identifier_type = 'orcid'
            """).fetchall()
            
            faculty_orcids_set = {row['identifier_value'] for row in faculty_orcids if row['identifier_value']}
            
            # If this coauthor's ORCID matches a faculty ORCID, return that faculty's ID
            if orcid and orcid in faculty_orcids_set:
                existing = self.db.conn.execute("""
                    SELECT author_id 
                    FROM author_identifiers
                    WHERE identifier_type = 'orcid' AND identifier_value = ?
                """, (orcid,)).fetchone()
                
                if existing:
                    return existing['author_id']
            
            # Parse the name into components
            name_parts = self.db.parse_academic_name(author_name)
            
            # Get institution if available - SAFELY
            institution_name = None
            institutions = coauthor_data.get('institutions', [])
            if institutions and isinstance(institutions, list) and len(institutions) > 0:
                first_inst = institutions[0]
                if isinstance(first_inst, dict) and 'name' in first_inst:
                    institution_name = first_inst['name']
            
            # Try to find by name components
            existing = self.db.conn.execute("""
                SELECT id 
                FROM authors
                WHERE given_name = ? AND family_name = ? 
                AND (institution = ? OR (institution IS NULL AND ? IS NULL))
            """, (name_parts['given_name'], 
                name_parts['family_name'], 
                institution_name, 
                institution_name)).fetchone()

            if existing:
                # Author exists with matching name components
                author_id = existing['id']
                
                # If we have an ORCID, add it to the existing record
                if orcid:
                    self.db.store_identifiers(author_id, orcid, None)
                    
                return author_id
            
            # If we get here, we need to create a new author record
            author_data = {
                'given_name': name_parts['given_name'],
                'family_name': name_parts['family_name'],
                'middle_names': name_parts['middle_names'],
                'name_suffix': name_parts['name_suffix'],
                'institution': institution_name
            }
            
            # If we have an ORCID, include it
            if orcid:
                author_data['orcid'] = orcid

            # Store the author record
            author_id = self.db.store_researcher(author_data)
                
            return author_id
                
        except Exception as e:
            self.logger.error(f"Error processing coauthor {coauthor_data.get('name')}: {str(e)}")
            return None

    def _analyze_name_distinctiveness(self, name: str) -> Dict[str, Any]:
        """
        Analyze how distinctive a name is.
        
        Common names are more likely to result in false matches when
        searching by name. This method evaluates the distinctiveness
        of a name based on several factors.
        
        Args:
            name: Full name to analyze
            
        Returns:
            Dict with distinctiveness score and analysis details
        """
        # Lists of common names for matching
        COMMON_GIVEN_NAMES = {
            'john', 'michael', 'david', 'james', 'robert', 'william',
            'mary', 'jennifer', 'elizabeth', 'linda', 'barbara'
        }
        
        COMMON_SURNAMES = {
            'smith', 'johnson', 'williams', 'brown', 'jones', 'garcia',
            'miller', 'davis', 'rodriguez', 'martinez', 'hernandez'
        }
        
        # Split and normalize the name
        parts = name.lower().split()
        if len(parts) < 2:
            return {'distinctiveness_score': 0, 'is_distinctive': False}
            
        score = 0
        given_name = parts[0]
        family_name = parts[-1]
        
        # Score commonality of given name
        if given_name not in COMMON_GIVEN_NAMES:
            score += 1  # Uncommon first name adds 1 point
            
        # Score commonality of family name
        if family_name not in COMMON_SURNAMES:
            score += 1  # Uncommon last name adds 1 point
            
        # Score name length (more parts = more distinctive)
        if len(parts) > 2:
            score += 1  # Having middle names/initials adds 1 point
            
        # Score presence of middle initials
        middle_parts = parts[1:-1]
        if any(len(part) == 1 for part in middle_parts):
            score += 0.5  # Middle initials add 0.5 points
            
        # Return comprehensive results
        return {
            'distinctiveness_score': score,
            'is_distinctive': score >= 2,  # Score of 2+ considered distinctive
            'has_middle_initials': any(len(part) == 1 for part in middle_parts),
            'name_length': len(parts)
        }

    def _generate_name_variants(self, name: str) -> List[str]:
        """
        Generate basic name variants for searching.
        
        Creates different formatted versions of a name to increase
        the chances of finding a match in external systems.
        
        Args:
            name: Full name string
            
        Returns:
            List of name variants for searching
        """
        variants = set()
        name = ' '.join(name.split())  # Normalize spaces
        parts = name.split()
        
        if len(parts) < 2:
            return [name]  # Can't generate variants for single-word names
                
        first = parts[0]
        last = parts[-1]
        middle = parts[1:-1] if len(parts) > 2 else []
        
        # Generate common variants
        variants.add(name)  # Full name as provided
        variants.add(f"{first} {last}")  # First Last
        
        # Add middle initial variant if middle names exist
        if middle:
            middle_initials = '.'.join(p[0] for p in middle)
            variants.add(f"{first} {middle_initials}. {last}")  # First M. Last
        
        return list(variants)

    def _calculate_h_index(self, publications: List[Dict]) -> int:
        """
        Calculate h-index from publication citation counts.
        
        The h-index is the largest number h such that h publications 
        have at least h citations each. It balances quantity and impact.
        
        Args:
            publications: List of publication dictionaries with citation counts
            
        Returns:
            int: Calculated h-index
        """
        if not publications:
            return 0
            
        # Extract citation counts and sort in descending order
        citations = sorted(
            [pub.get('citations', 0) for pub in publications],
            reverse=True
        )
        
        # Find the largest h where publications[h-1] >= h
        h_index = 0
        for i, citations_count in enumerate(citations, 1):
            if citations_count >= i:
                h_index = i
            else:
                break
                
        return h_index

    def close(self):
        """Clean up resources."""
        if self.db:
            self.db.close()