import sqlite3
import json
import math
import numpy as np
from collections import Counter, defaultdict
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import LatentDirichletAllocation, NMF
from sklearn.cluster import DBSCAN
from sklearn.metrics.pairwise import cosine_similarity
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import os
import argparse
import datetime

# Download NLTK resources if not already available
try:
    nltk.data.find('corpora/stopwords')
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('stopwords', quiet=True)
    nltk.download('wordnet', quiet=True)
    nltk.download('punkt', quiet=True)

# Core Database Functions

def connect_to_database(db_path):
    """Connect to the SQLite database."""
    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row  # This enables column access by name
        return conn
    except sqlite3.Error as e:
        print(f"Database connection error: {e}")
        return None
   
def load_impact_factor_cache(cache_path):
    """Load journal impact factors from JSON cache."""
    try:
        with open(cache_path, 'r') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error loading impact factor cache: {e}")
        return {}

# Keyword Extraction

def extract_author_keywords_with_config(conn, config):
    """
    Enhanced version of extract_author_keywords that properly handles JSON arrays.
    """
    author_keywords = defaultdict(Counter)
    
    # Extract configuration parameters
    keyword_weights = config.get('keyword_weights', {
        'defined_keyword': 3.0,
        'title_word': 2.0,
        'abstract_word': 1.0
    })
    keyword_min_length = config.get('keyword_min_length', 4)
    
    # Query to get all publications for each author
    query = """
    SELECT 
        a.id as author_id, 
        a.display_name, 
        p.title, 
        p.abstract, 
        p.keywords,
        p.citation_count,
        pv.impact_factor
    FROM 
        authors a
    JOIN 
        author_publications ap ON a.id = ap.author_id
    JOIN 
        publications p ON ap.publication_id = p.id
    LEFT JOIN
        publication_venues pv ON p.venue_id = pv.id
    """
    
    # Define generic terms to filter out
    generic_terms = set([
        'study', 'analysis', 'research', 'model', 'method', 'using', 'approach', 
        'based', 'results', 'paper', 'work', 'data', 'novel', 'towards',
        'evaluation', 'review', 'performance'
    ])
    
    try:
        cursor = conn.cursor()
        cursor.execute(query)
        rows = cursor.fetchall()
        
        print(f"Processing {len(rows)} publication records for keyword extraction")
        
        for row in rows:
            author_id = row['author_id']
            title = row['title'] or ""
            abstract = row['abstract'] or ""
            
            # Process keywords with proper JSON parsing
            if row['keywords']:
                try:
                    # Try to parse as JSON array
                    if row['keywords'].startswith('['):
                        keyword_list = json.loads(row['keywords'])
                        if isinstance(keyword_list, list):
                            for keyword in keyword_list:
                                if isinstance(keyword, str):
                                    keyword = keyword.lower().strip()
                                    if keyword and len(keyword) >= keyword_min_length and keyword.lower() not in generic_terms:
                                        author_keywords[author_id][keyword] += keyword_weights.get('defined_keyword', 3.0)
                    else:
                        # Handle comma-separated string format
                        for keyword in row['keywords'].split(','):
                            keyword = keyword.strip().lower()
                            if keyword and len(keyword) >= keyword_min_length and keyword.lower() not in generic_terms:
                                author_keywords[author_id][keyword] += keyword_weights.get('defined_keyword', 3.0)
                except json.JSONDecodeError as e:
                    print(f"JSON parsing error for keywords: {row['keywords']} - {e}")
                    # Fall back to comma-separated handling
                    for keyword in row['keywords'].split(','):
                        keyword = keyword.strip().lower()
                        if keyword and len(keyword) >= keyword_min_length and keyword.lower() not in generic_terms:
                            author_keywords[author_id][keyword] += keyword_weights.get('defined_keyword', 3.0)
            
            # Extract words from title
            for word in title.lower().split():
                word = ''.join(c for c in word if c.isalnum())  # Remove non-alphanumeric
                if len(word) >= keyword_min_length and word.lower() not in generic_terms:
                    author_keywords[author_id][word] += keyword_weights.get('title_word', 2.0)
            
            # Extract words from abstract
            if abstract:
                for word in abstract.lower().split():
                    word = ''.join(c for c in word if c.isalnum())  # Remove non-alphanumeric
                    if len(word) >= keyword_min_length and word.lower() not in generic_terms:
                        author_keywords[author_id][word] += keyword_weights.get('abstract_word', 1.0)
        
        # Add diagnostic information
        author_count = len(author_keywords)
        keyword_counts = {author_id: len(keywords) for author_id, keywords in author_keywords.items()}
        avg_keywords = sum(keyword_counts.values()) / max(1, len(keyword_counts))
        
        print(f"Extracted keywords for {author_count} authors")
        print(f"Average keywords per author: {avg_keywords:.1f}")
        
        # Print some example keywords for verification
        if author_count > 0:
            sample_author = next(iter(author_keywords))
            top_keywords = author_keywords[sample_author].most_common(5)
            print(f"Sample keywords for an author: {', '.join(kw for kw, _ in top_keywords)}")
            
        return author_keywords
        
    except sqlite3.Error as e:
        print(f"Database error during keyword extraction: {e}")
        return defaultdict(Counter)

def extract_author_keywords(conn):
    """Extract the main keywords for each author based on their publications."""
    author_keywords = defaultdict(Counter)
    
    # Query to get all publications for each author
    query = """
    SELECT 
        a.id as author_id, 
        a.display_name, 
        p.title, 
        p.abstract, 
        p.keywords,
        p.citation_count,
        pv.impact_factor
    FROM 
        authors a
    JOIN 
        author_publications ap ON a.id = ap.author_id
    JOIN 
        publications p ON ap.publication_id = p.id
    LEFT JOIN
        publication_venues pv ON p.venue_id = pv.id
    """
    
    try:
        cursor = conn.cursor()
        cursor.execute(query)
        rows = cursor.fetchall()
        
        for row in rows:
            author_id = row['author_id']
            title = row['title'] or ""
            abstract = row['abstract'] or ""
            
            # Process keywords if they exist
            keyword_weight = 3.0  # Keywords are most important
            if row['keywords']:
                try:
                    keywords = json.loads(row['keywords'])
                    if isinstance(keywords, list):
                        for keyword in keywords:
                            author_keywords[author_id][keyword.lower()] += keyword_weight
                except json.JSONDecodeError:
                    # Handle case where keywords might be a string or malformed JSON
                    keywords = row['keywords'].split(',')
                    for keyword in keywords:
                        keyword = keyword.strip().lower()
                        if keyword:
                            author_keywords[author_id][keyword] += keyword_weight
            
            # Extract keywords from title (simple approach - could use NLP for better results)
            title_weight = 2.0
            for word in title.lower().split():
                if len(word) > 4:  # Filter out short words
                    author_keywords[author_id][word] += title_weight
            
            # Extract keywords from abstract (less weight than title)
            abstract_weight = 1.0
            if abstract:
                for word in abstract.lower().split():
                    if len(word) > 4:  # Filter out short words
                        author_keywords[author_id][word] += abstract_weight
                        
        return author_keywords
        
    except sqlite3.Error as e:
        print(f"Query error: {e}")
        return defaultdict(Counter)

# Reputation Scoring

def calculate_reputation_scores(conn, config, impact_factors=None):
    """
    Calculate reputation scores for each author based on scholarly metrics.
    
    The reputation score is a weighted combination of multiple factors:
    - H-index: Measures both productivity and citation impact
    - Citation count: Reflects overall impact of research (log-scaled to prevent dominance by outliers)
    - Publication count: Measures scholarly productivity (log-scaled)
    - Recency factor: Gives more weight to recent publications
    - Venue quality: Uses impact factors of publication venues
    - Field-specific normalization: Accounts for different citation practices across disciplines
    """
    author_reputations = {}
    
    # Extract configuration parameters with defaults
    h_index_weight = config.get('h_index_weight', 0.3)
    citation_weight = config.get('citation_weight', 0.3)
    productivity_weight = config.get('productivity_weight', 0.2)
    expertise_weight = config.get('expertise_weight', 0.2)
    recency_weight = config.get('recency_weight', 0.1)
    impact_factor_weight = config.get('impact_factor_weight', 0.1)
    max_score = config.get('max_score', 10.0)
    
    # Modified base query to only select authors with at least one publication
    base_query = """
    SELECT 
        a.id as author_id, 
        a.display_name,
        a.h_index,
        a.total_citations,
        COUNT(DISTINCT p.id) as publication_count,
        AVG(CASE WHEN p.publication_year IS NOT NULL 
            THEN p.publication_year 
            ELSE 0 
        END) as avg_pub_year,
        MAX(CASE WHEN p.publication_year IS NOT NULL 
            THEN p.publication_year 
            ELSE 0 
        END) as latest_pub_year
    FROM 
        authors a
    INNER JOIN  -- Changed from LEFT JOIN to INNER JOIN
        author_publications ap ON a.id = ap.author_id
    LEFT JOIN 
        publications p ON ap.publication_id = p.id
    GROUP BY 
        a.id
    HAVING 
        COUNT(DISTINCT p.id) > 0  -- Ensure at least one publication
    """
    current_year = datetime.datetime.now().year

    try:
        cursor = conn.cursor()   
        cursor.execute(base_query)
        
        # Get count of authors being processed
        author_count = len(cursor.fetchall())
        print(f"Calculating reputation scores for {author_count} authors with publications")
        
        # Re-execute query since fetchall consumed the results
        cursor.execute(base_query)
               
        # Field-specific normalization factors
        field_stats = get_field_normalization_factors(conn, config)
        for row in cursor.fetchall():
            author_id = row['author_id']
            h_index = row['h_index'] or 0
            citations = row['total_citations'] or 0
            publication_count = row['publication_count'] or 0
            latest_pub_year = row['latest_pub_year'] or 0
            # Get author's primary fields
            author_fields = get_author_primary_fields(conn, author_id)
            
            # Get average normalization factor across author's fields
            field_normalization = 1.0
            if author_fields:
                field_factors = [field_stats.get(field_id, {}).get('normalization_factor', 1.0) 
                                for field_id in author_fields]
                if field_factors:
                    field_normalization = sum(field_factors) / len(field_factors)
            
            #---------------------------------------------------------------------------
            # 1. H-INDEX COMPONENT
            #---------------------------------------------------------------------------
            # The h-index balances quantity (publications) with quality (citations)
            # A researcher with h-index of h has published h papers each cited at least h times
            # Scales linearly with the h-index value
            #---------------------------------------------------------------------------
            h_index_component = h_index * h_index_weight
            
            #---------------------------------------------------------------------------
            # 2. CITATION COMPONENT
            #---------------------------------------------------------------------------
            # Log-scaled to prevent researchers with one extremely highly cited paper
            # from dominating others with more consistent citation patterns
            # Adding 1 prevents log(0) errors for authors with no citations
            #---------------------------------------------------------------------------
            citation_component = math.log10(citations + 1) * citation_weight
            
            #---------------------------------------------------------------------------
            # 3. PRODUCTIVITY COMPONENT
            #---------------------------------------------------------------------------
            # Log-scaled to reward consistent publication without overly penalizing
            # those focused on fewer, higher-impact works
            # This rewards sustained scholarly output without making quantity dominate
            #---------------------------------------------------------------------------
            productivity_component = math.log10(publication_count + 1) * productivity_weight
            
            #---------------------------------------------------------------------------
            # 4. RECENCY COMPONENT
            #---------------------------------------------------------------------------
            # Rewards active researchers with recent publications
            # Calculated as a decay function from most recent publication
            # Researchers with very old latest publications get less weight
            #---------------------------------------------------------------------------
            recency_factor = 0.5
            if latest_pub_year > 0:
                years_since_latest = max(0, current_year - latest_pub_year)
                # Exponential decay with half-life of 5 years
                recency_factor = math.exp(-0.14 * years_since_latest)  # ln(2)/5 ≈ 0.14
            
            #---------------------------------------------------------------------------
            # 5. EXPERTISE COMPONENT
            #---------------------------------------------------------------------------
            # This is a placeholder until we have a proper expertise scoring system
            # For now, we'll use a combination of the above factors as a proxy
            # In a full implementation, this would include field-specific expertise scores
            #---------------------------------------------------------------------------
            expertise_base = (h_index_component + citation_component) / 2
            expertise_component = expertise_weight * expertise_base * recency_factor
            
            #---------------------------------------------------------------------------
            # 6. VENUE QUALITY ADJUSTMENT
            #---------------------------------------------------------------------------
            # Apply an adjustment based on the quality of publication venues
            # Would ideally come from analyzing all author's publication venues
            # For now, we'll use a placeholder that slightly boosts the score
            #---------------------------------------------------------------------------
            venue_quality_factor = 1.0  # Neutral factor as placeholder
            
            #---------------------------------------------------------------------------
            # 7. FIELD NORMALIZATION
            #---------------------------------------------------------------------------
            # Different fields have different citation and publication practices
            # This adjustment prevents bias toward fields with higher citation rates
            # The normalization factor is based on average metrics within each field
            #---------------------------------------------------------------------------
            
            # Calculate raw reputation score (0-10 scale)
            
            # Query to get max values for normalization
            max_values_query = """
            SELECT 
                MAX(a.h_index) as max_h_index,
                MAX(a.total_citations) as max_citations,
                MAX(pub_count) as max_publications
            FROM 
                authors a
            LEFT JOIN (
                SELECT 
                    ap.author_id,
                    COUNT(DISTINCT p.id) as pub_count
                FROM 
                    author_publications ap
                LEFT JOIN 
                    publications p ON ap.publication_id = p.id
                GROUP BY 
                    ap.author_id
            ) pub_counts ON a.id = pub_counts.author_id
            """

            cursor.execute(max_values_query)
            max_values = cursor.fetchone()

            max_h_index = max_values['max_h_index'] or 1  # Avoid division by zero
            max_citations = max_values['max_citations'] or 1
            max_publications = max_values['max_publications'] or 1

            # Precompute the log scales for citation and publication counts
            max_log_citations = math.log10(max_citations + 1)
            max_log_publications = math.log10(max_publications + 1)
            # Debug lines; Remove comments if desired
            # print ("Max h index:", max_h_index)
            # print ("Max citations:", max_citations)
            # print ("Max publications:", max_publications)
            
            # Normalize components
            h_index_component = (h_index / max_h_index) * h_index_weight
            citation_component = (math.log10(citations + 1) / max_log_citations) * citation_weight
            productivity_component = (math.log10(publication_count + 1) / max_log_publications) * productivity_weight

            # Compute expertise and recency
            expertise_component = expertise_weight * (h_index_component + citation_component) * recency_factor

            # Calculate raw score
            raw_score = (h_index_component + citation_component + productivity_component + expertise_component) * venue_quality_factor / field_normalization

            # Apply non-linear scaling or normalization
            normalized_score = max_score * (1 - math.exp(-raw_score))
                        
            # Store detailed score components for transparency
            author_reputations[author_id] = {
                'display_name': row['display_name'],
                'h_index': h_index,
                'citations': citations,
                'publication_count': publication_count,
                'latest_publication_year': latest_pub_year,
                'score_components': {
                    'h_index_component': round(h_index_component, 2),
                    'citation_component': round(citation_component, 2),
                    'productivity_component': round(productivity_component, 2),
                    'recency_factor': round(recency_factor, 2),
                    'expertise_component': round(expertise_component, 2),
                    'field_normalization': round(field_normalization, 2)
                },
                'reputation_score': round(normalized_score, 2)
            }
        
        return author_reputations
        
    except sqlite3.Error as e:
        print(f"Query error: {e}")
        return {}

def get_field_normalization_factors(conn, config):
    """
    Get field-specific normalization factors to fairly compare across disciplines.
    
    Different academic fields have dramatically different citation patterns:
    - High Energy Physics might have papers with hundreds of authors and citations
    - Mathematics might have papers with few authors and lower citation counts
    - Computer Science tends to cite conference proceedings more than journals
    - Biology often has higher average citation counts than Engineering
    
    This function calculates field-specific normalization factors based on:
    - Average h-index in the field
    - Average citation count in the field
    - Average publication count in the field
    
    Parameters:
    -----------
    conn : sqlite3.Connection
        Connection to the database
    config : dict
        Configuration parameters for normalization
        
    Returns:
    --------
    dict
        Dictionary of field IDs to normalization information
    """
    fields = {}
    
    # Extract configuration
    h_index_weight = config.get('h_index_weight', 0.3)
    citation_weight = config.get('citation_weight', 0.3)
    min_authors_for_normalization = config.get('min_authors_for_normalization', 5)
    default_normalization = config.get('default_normalization', 1.0)
    max_normalization = config.get('max_normalization', 3.0) 
    
    query = """
    SELECT 
        f.id, 
        f.name,
        f.parent_field_id,
        COUNT(DISTINCT af.author_id) as author_count,
        AVG(a.h_index) as avg_h_index,
        AVG(a.total_citations) as avg_citations,
        AVG(
            (SELECT COUNT(*) FROM author_publications ap2 
             WHERE ap2.author_id = a.id)
        ) as avg_pub_count
    FROM 
        fields f
    LEFT JOIN 
        author_fields af ON f.id = af.field_id
    LEFT JOIN 
        authors a ON af.author_id = a.id
    GROUP BY 
        f.id
    """
    
    try:
        cursor = conn.cursor()
        cursor.execute(query)
        
        # First pass: calculate raw statistics for each field
        for row in cursor.fetchall():
            field_id = row['id']
            fields[field_id] = {
                'name': row['name'],
                'parent_field_id': row['parent_field_id'],
                'author_count': row['author_count'] or 0,
                'avg_h_index': row['avg_h_index'] or 0,
                'avg_citations': row['avg_citations'] or 0,
                'avg_pub_count': row['avg_pub_count'] or 0,
                'normalization_factor': default_normalization  # Default value
            }
            
            # Calculate a normalization factor based on field averages
            # Only if we have enough authors for statistical significance
            if row['author_count'] and row['author_count'] >= min_authors_for_normalization:
                if row['avg_h_index'] and row['avg_citations']:
                    avg_factor = (
                        row['avg_h_index'] * h_index_weight + 
                        math.log10(row['avg_citations'] + 1) * citation_weight
                    )
                    if avg_factor > 0:
                        fields[field_id]['normalization_factor'] = avg_factor
        
        # Second pass: for fields with few authors, use parent field normalization
        for field_id, field_data in fields.items():
            if (field_data['author_count'] < min_authors_for_normalization and 
                field_data['parent_field_id'] in fields):
                
                parent_field = fields[field_data['parent_field_id']]
                if parent_field['author_count'] >= min_authors_for_normalization:
                    fields[field_id]['normalization_factor'] = parent_field['normalization_factor']
                    fields[field_id]['normalization_source'] = f"parent:{parent_field['name']}"
        
        return fields
        
    except sqlite3.Error as e:
        print(f"Query error: {e}")
        return {}

def get_author_primary_fields(conn, author_id):
    """
    Get the primary fields of research for an author.
    
    Parameters:
    -----------
    conn : sqlite3.Connection
        Connection to the database
    author_id : str
        ID of the author
        
    Returns:
    --------
    list
        List of field IDs that are primary for this author
    """
    query = """
    SELECT 
        field_id,
        expertise_score
    FROM 
        author_fields
    WHERE 
        author_id = ?
    ORDER BY 
        expertise_score DESC,
        publication_count DESC
    LIMIT 3
    """
    
    try:
        cursor = conn.cursor()
        cursor.execute(query, (author_id,))
        return [row['field_id'] for row in cursor.fetchall()]
    except sqlite3.Error:
        return []

# Field & Topic Analysis (Traditional)

def suggest_new_fields(conn, author_keywords, config):
    """
    Analyze keyword patterns across authors to suggest potential new research fields.
    
    This function looks for clusters of similar keywords that appear frequently
    across multiple authors but don't match existing fields. These clusters
    could represent emerging research areas that should be added to the field taxonomy.
    
    Parameters:
    -----------
    conn : sqlite3.Connection
        Connection to the database
    author_keywords : dict
        Dictionary of author IDs to their keywords
    config : dict
        Configuration parameters
        
    Returns:
    --------
    list
        List of potential new fields with associated keywords
    """
    from collections import defaultdict
    import re
    
    # Get existing fields and their keywords
    existing_fields = {}
    existing_keywords = set()
    
    query = """
    SELECT f.id, f.name, fk.keyword
    FROM fields f
    LEFT JOIN field_keywords fk ON f.id = fk.field_id
    """
    
    try:
        cursor = conn.cursor()
        cursor.execute(query)
        
        for row in cursor.fetchall():
            field_id = row['id']
            if field_id not in existing_fields:
                existing_fields[field_id] = {
                    'name': row['name'],
                    'keywords': set()
                }
            
            if row['keyword']:
                existing_fields[field_id]['keywords'].add(row['keyword'].lower())
                existing_keywords.add(row['keyword'].lower())
                
    except sqlite3.Error as e:
        print(f"Error retrieving fields: {e}")
    
    # Collect all frequent keywords across authors
    all_keywords = Counter()
    for author_id, keywords in author_keywords.items():
        # Only include keywords with sufficient weight
        for keyword, weight in keywords.items():
            if weight >= config.get('min_keyword_weight', 2.0):
                all_keywords[keyword] += 1
    
    # Filter out stopwords and common academic terms
    stopwords = set(['study', 'analysis', 'research', 'model', 'method', 'using', 
                     'approach', 'based', 'results', 'paper', 'work', 'data',
                     'novel', 'towards', 'evaluation', 'review', 'performance'])
    
    filtered_keywords = {k: v for k, v in all_keywords.items() 
                         if k not in stopwords and len(k) > 3}
    
    # Find keywords that appear frequently but don't match existing fields
    new_keywords = {k: v for k, v in filtered_keywords.items() 
                    if k not in existing_keywords and v >= config.get('min_field_keyword_count', 3)}
    
    # Cluster similar keywords
    keyword_clusters = defaultdict(list)
    processed_keywords = set()
    
    # Sort keywords by frequency for deterministic clustering
    sorted_keywords = sorted(new_keywords.items(), key=lambda x: (-x[1], x[0]))
    
    for keyword1, count1 in sorted_keywords:
        if keyword1 in processed_keywords:
            continue
            
        # Start a new cluster
        cluster_key = keyword1
        keyword_clusters[cluster_key].append((keyword1, count1))
        processed_keywords.add(keyword1)
        
        # Find similar keywords
        for keyword2, count2 in sorted_keywords:
            if keyword2 in processed_keywords:
                continue
                
            # Check similarity (simple substring match for demonstration)
            # In a real implementation, you'd use more sophisticated NLP techniques
            if keyword1 in keyword2 or keyword2 in keyword1 or \
               (len(keyword1) > 4 and len(keyword2) > 4 and 
                keyword1[:4] == keyword2[:4]):
                
                keyword_clusters[cluster_key].append((keyword2, count2))
                processed_keywords.add(keyword2)
    
    # Format results as potential new fields
    potential_fields = []
    
    for cluster_key, keywords in keyword_clusters.items():
        if len(keywords) >= config.get('min_cluster_size', 3):
            # Generate a field name from the highest frequency keywords
            sorted_cluster = sorted(keywords, key=lambda x: -x[1])
            field_name = sorted_cluster[0][0].title()
            
            if len(sorted_cluster) > 1:
                field_name += " & " + sorted_cluster[1][0].title()
            
            potential_fields.append({
                'suggested_name': field_name,
                'keywords': sorted_cluster,
                'author_count': len(set(author_id for author_id, kws in author_keywords.items() 
                                      if any(k[0] in kws for k in sorted_cluster)))
            })
    
    return sorted(potential_fields, key=lambda x: -x['author_count'])

def analyze_field_relationships(conn):
    """
    Analyze relationships between research fields based on author overlap.
    
    This function identifies which fields frequently co-occur in authors' research,
    potentially indicating interdisciplinary areas or closely related fields.
    
    Parameters:
    -----------
    conn : sqlite3.Connection
        Connection to the database
        
    Returns:
    --------
    dict
        Dictionary of field relationships with strength metrics
    """
    field_relationships = defaultdict(float)
    field_author_counts = {}
    
    # Get all fields and their authors
    query = """
    SELECT 
        f.id as field_id, 
        f.name as field_name,
        COUNT(DISTINCT af.author_id) as author_count,
        GROUP_CONCAT(af.author_id) as author_ids
    FROM 
        fields f
    JOIN 
        author_fields af ON f.id = af.field_id
    GROUP BY 
        f.id
    """
    
    try:
        cursor = conn.cursor()
        cursor.execute(query)
        
        field_authors = {}
        
        for row in cursor.fetchall():
            field_id = row['field_id']
            field_name = row['field_name']
            author_count = row['author_count']
            
            if row['author_ids']:
                author_ids = set(row['author_ids'].split(','))
            else:
                author_ids = set()
                
            field_authors[field_id] = {
                'name': field_name,
                'authors': author_ids,
                'count': author_count
            }
            field_author_counts[field_id] = author_count
        
        # Calculate field relationships using Jaccard similarity
        for field1_id, field1_data in field_authors.items():
            for field2_id, field2_data in field_authors.items():
                if field1_id >= field2_id:  # Avoid duplicates and self-comparisons
                    continue
                    
                authors1 = field1_data['authors']
                authors2 = field2_data['authors']
                
                # Skip if either field has no authors
                if not authors1 or not authors2:
                    continue
                
                # Calculate Jaccard similarity: intersection size / union size
                intersection = len(authors1.intersection(authors2))
                union = len(authors1.union(authors2))
                
                if union > 0:
                    similarity = intersection / union
                    
                    # Only include relationships with meaningful overlap
                    if intersection >= 3 and similarity > 0.1:
                        key = (field1_id, field2_id)
                        field_relationships[key] = {
                            'field1_name': field1_data['name'],
                            'field2_name': field2_data['name'],
                            'overlap_count': intersection,
                            'similarity': similarity,
                            'field1_count': field1_data['count'],
                            'field2_count': field2_data['count']
                        }
        
        return field_relationships
        
    except sqlite3.Error as e:
        print(f"Error analyzing field relationships: {e}")
        return {}

# Field & Topic Analysis (Advanced NLP)

# Revised code for generating a name for a topic
def generate_topic_name(terms):
    """
    Generate a better name for a topic using domain knowledge of compound terms.
    
    Parameters:
    -----------
    terms : list
        List of top terms for the topic
        
    Returns:
    --------
    str
        A meaningful name for the topic
    """
    # Define common compound terms in chemistry/biology
    compound_terms = {
        "organic_chemistry": "organic chemistry",
        "mass_spectrometry": "mass spectrometry", 
        "nuclear_magnetic_resonance": "NMR",
        "protein_folding": "protein folding",
        "escherichia_coli": "E. coli",
        "cell_biology": "cell biology",
        "molecular_biology": "molecular biology",
        "quantum_mechanics": "quantum mechanics",
        "crystal_structure": "crystal structure",
        "composite_material": "composite materials",
        "liquid_chromatography": "liquid chromatography"
    }
    
    # First check if we have compound terms in our top terms
    primary_term = None
    for term in terms:
        if term in compound_terms:
            primary_term = compound_terms[term]
            break
    
    # If no compound term found, use the first term
    if not primary_term:
        primary_term = terms[0].replace('_', ' ')
    
    # Find a secondary term that complements the primary
    secondary_term = None
    for term in terms[1:5]:
        term_readable = term.replace('_', ' ')
        if term in compound_terms:
            term_readable = compound_terms[term]
            
        # Use this term if it's not part of the primary term
        if primary_term not in term_readable and term_readable not in primary_term:
            secondary_term = term_readable
            break
    
    # If no suitable secondary term found, use the second highest ranked term
    if not secondary_term and len(terms) > 1:
        secondary_term = terms[1].replace('_', ' ')
    
    # Format the topic name
    if secondary_term:
        return f"{primary_term} & {secondary_term}"
    else:
        return primary_term

def suggest_new_fields_with_topic_modeling(conn, author_keywords, config):
    """
    Use advanced topic modeling to suggest new research fields based on
    natural patterns in the publication data.
    Now with n-gram recognition.
    """
    print("Performing topic modeling to identify research areas...")
    
    # Add domain-specific compound terms
    compound_terms = [
        "organic chemistry", "escherichia coli", "nuclear magnetic resonance", 
        "mass spectrometry", "machine learning", "artificial intelligence",
        "protein folding", "cell biology", "molecular biology", "gene expression",
        "quantum mechanics", "natural language processing", "data mining",
        "deep learning", "neural network", "climate change", "renewable energy",
        "synthetic biology", "structural biology", "genetic algorithm",
        "magnetic resonance", "amino acid", "carbon nanotube", "stem cell",
        "high performance", "quantum computing", "natural language"
    ]
    # Add more compound terms relevant to your domain
    
    # 1. Prepare data for topic modeling with n-gram recognition
    # Extract all text data (titles, abstracts, keywords) from publications
    
    topic_relationships = []

    query = """
    SELECT 
        p.id,
        p.title,
        p.abstract,
        p.keywords,
        ap.author_id
    FROM 
        publications p
    JOIN 
        author_publications ap ON p.id = ap.publication_id
    ORDER BY 
        p.id
    """
    
    cursor = conn.cursor()
    cursor.execute(query)
    
    # Collect publication text by author
    author_texts = defaultdict(list)
    author_publications = defaultdict(list)
    publication_texts = {}
    
    # Preprocess text: normalize, remove stopwords
    stopwords_set = set(stopwords.words('english'))
    lemmatizer = WordNetLemmatizer()
    
    # Add domain-specific stopwords
    academic_stopwords = {
        "study", "research", "analysis", "method", "result", "using", "based",
        "approach", "data", "paper", "journal", "publication", "author", "university",
        "department", "work", "review", "article", "abstract", "introduction",
        "conclusion", "experimental", "discussion", "results", "methods",
        "wide", "world", "web", "index", "http", "https", "url", "link",
        "page", "site", "internet", "computer", "science", "engineering",
        "technology", "university", "journal", "proceedings", "conference"
    }
    stopwords_set.update(academic_stopwords)
    
    def preprocess_text(text):
        if not text:
            return ""
            
        # Replace compound terms with underscored versions
        processed_text = text.lower()
        for term in compound_terms:
            # Replace only if the term exists as a whole phrase
            processed_text = re.sub(r'\b' + re.escape(term) + r'\b', 
                                   term.replace(' ', '_'), 
                                   processed_text)
            
        # Remove punctuation
        processed_text = re.sub(r'[^\w\s]', ' ', processed_text)
        
        # Tokenize
        tokens = processed_text.split()
        
        # Remove stopwords and lemmatize (but preserve our compound terms)
        processed_tokens = []
        for token in tokens:
            if '_' in token:  # This is a compound term we want to keep
                processed_tokens.append(token)
            elif token not in stopwords_set and len(token) > 3:
                processed_tokens.append(lemmatizer.lemmatize(token))
                
        return " ".join(processed_tokens)
    
    for row in cursor.fetchall():
        pub_id = row['id']
        title = preprocess_text(row['title'] or "")
        abstract = preprocess_text(row['abstract'] or "")
        author_id = row['author_id']
        
        # Process keywords - extract from JSON if needed
        keywords = []
        if row['keywords']:
            try:
                if row['keywords'].startswith('['):
                    keyword_list = json.loads(row['keywords'])
                    if isinstance(keyword_list, list):
                        keywords = [preprocess_text(k) for k in keyword_list if k]
                else:
                    keywords = [preprocess_text(k) for k in row['keywords'].split(',') if k]
            except json.JSONDecodeError:
                # Handle parsing errors
                keywords = [preprocess_text(k) for k in row['keywords'].split(',') if k]
        
        # Combine text with appropriate weighting
        # Keywords get repeated for emphasis (higher weight)
        pub_text = f"{title} {title} {abstract} {' '.join(keywords)} {' '.join(keywords)} {' '.join(keywords)}"
        publication_texts[pub_id] = pub_text
        
        # Add to author's text corpus
        author_texts[author_id].append(pub_text)
        author_publications[author_id].append(pub_id)
    
    # Skip if we don't have enough data
    if len(publication_texts) < 10:
        print("Not enough publications for effective topic modeling")
        return []
    
    # 2. Apply TF-IDF vectorization to publication texts
    print(f"Vectorizing {len(publication_texts)} publications...")
    
    # Get all document texts in a list
    documents = list(publication_texts.values())
    
    # Create TF-IDF vectorizer
    max_features = config.get('max_tfidf_features', 5000)
    min_df = config.get('min_document_frequency', 2)
    max_df = config.get('max_document_frequency', 0.9)  # Ignore terms in >90% of docs
    
    vectorizer = TfidfVectorizer(
        max_features=max_features, 
        min_df=min_df,
        max_df=max_df,
        ngram_range=(1, 2)  # Include both unigrams and bigrams
    )
    
    # Transform documents to TF-IDF matrix
    tfidf_matrix = vectorizer.fit_transform(documents)
    
    # Get feature names (terms)
    feature_names = vectorizer.get_feature_names_out()
    
    # 3. Apply topic modeling - try both LDA and NMF
    num_topics = config.get('num_topics', 15)
    
    # Use Non-negative Matrix Factorization for topic modeling
    # (Often works better than LDA for short texts like abstracts)
    print(f"Extracting {num_topics} topics with NMF...")

    # Updated NMF parameters to be compatible with current scikit-learn
    nmf = NMF(
        n_components=num_topics,
        random_state=42,
        max_iter=200,
        solver='cd',  # Coordinate descent solver
        beta_loss='frobenius'  # Default loss function
    )
    
    nmf_topics = nmf.fit_transform(tfidf_matrix)
    
    # 4. Extract topics and associate with publications
    print("Analyzing topic distribution...")
    
    # Get top terms for each topic
    topic_terms = []
    for topic_idx, topic in enumerate(nmf.components_):
        top_indices = topic.argsort()[:-11:-1]  # Get indices of top 10 terms
        top_terms = [feature_names[i] for i in top_indices]
        topic_terms.append(top_terms)
    
    # Map publications to their dominant topics
    publication_topics = {}
    topic_publications = defaultdict(list)
    
    for idx, (pub_id, _) in enumerate(publication_texts.items()):
        topic_distribution = nmf_topics[idx]
        dominant_topic = topic_distribution.argmax()
        publication_topics[pub_id] = {
            'dominant_topic': dominant_topic,
            'topic_score': topic_distribution[dominant_topic]
        }
        topic_publications[dominant_topic].append(pub_id)
    
    # 5. Map authors to topics
    author_topic_counts = defaultdict(Counter)
    author_topic_scores = defaultdict(dict)
    
    for author_id, pub_ids in author_publications.items():
        total_pubs = len(pub_ids)
        for topic_idx in author_topic_counts[author_id]:
            topic_pubs = author_topic_counts[author_id][topic_idx]
            # Dominance = proportion of author's work in this topic
            dominance_score = topic_pubs / total_pubs
            author_topic_scores[author_id][f"dominance_{topic_idx}"] = dominance_score
        for pub_id in pub_ids:
            if pub_id in publication_topics:
                topic_info = publication_topics[pub_id]
                topic = topic_info['dominant_topic']
                score = topic_info['topic_score']
                
                author_topic_counts[author_id][topic] += 1
                # Sum scores for this topic
                author_topic_scores[author_id][topic] = author_topic_scores[author_id].get(topic, 0) + score

    # 6. Calculate topic dominance ratios
    print("Calculating topic dominance metrics...")

    # Find the maximum score for each topic
    topic_max_scores = {}
    for topic_idx in range(num_topics):
        max_score = 0
        for author_id, scores in author_topic_scores.items():
            if topic_idx in scores and scores[topic_idx] > max_score:
                max_score = scores[topic_idx]
        topic_max_scores[topic_idx] = max_score if max_score > 0 else 1  # Avoid division by zero

    # Calculate each author's total publications and topic specialty ratio
    author_total_pubs = {}
    author_dominance_ratio = defaultdict(dict)
    author_topic_dominance = defaultdict(dict)

    for author_id, topics in author_topic_counts.items():
        # Total publications by this author
        total_pubs = sum(topics.values())
        author_total_pubs[author_id] = total_pubs
        
        # Calculate specialty ratio for each topic
        if total_pubs > 0:
            for topic_idx, pub_count in topics.items():
                # Proportion of author's work in this topic
                specialty_ratio = pub_count / total_pubs
                
                # Dominance ratio compared to top expert
                topic_score = author_topic_scores[author_id].get(topic_idx, 0)
                max_score = topic_max_scores[topic_idx]
                dominance_ratio = topic_score / max_score if max_score > 0 else 0
                
                # Combined metric - weighted average of relative score and specialty
                # Higher values indicate both high expertise and specialization in the topic
                combined_dominance = (dominance_ratio * 0.7) + (specialty_ratio * 0.3)
                author_dominance_ratio[author_id][topic_idx] = dominance_ratio
                author_topic_dominance[author_id][topic_idx] = combined_dominance

    # 7. Generate field suggestions based on topics with dominance filtering
    print("Generating field suggestions with dominance filtering...")

    field_suggestions = []
    topic_name_mapping = {}

    # Minimum threshold for dominance ratio to be considered a true expert
    min_dominance_ratio = config.get('min_dominance_ratio', 0.15)  # Can be adjusted in config

    for topic_idx, terms in enumerate(topic_terms):
        # Generate a name for this topic using our specialized function
        topic_name = generate_topic_name(terms)
        topic_name_mapping[topic_idx] = topic_name
        
        # Find authors associated with this topic with dominance filtering
        topic_authors = []
        for author_id, topics in author_topic_counts.items():
            if topic_idx in topics:
                # Get dominance metrics
                publication_count = topics[topic_idx]
                topic_score = author_topic_scores[author_id].get(topic_idx, 0)
                dominance_ratio = author_dominance_ratio[author_id].get(topic_idx, 0)
                combined_dominance = author_topic_dominance[author_id].get(topic_idx, 0)
                
                # Only include authors with significant expertise AND dominance
                if (publication_count >= config.get('min_topic_publications', 2) and 
                    dominance_ratio >= min_dominance_ratio):
                    
                    topic_authors.append({
                        'author_id': author_id,
                        'publication_count': publication_count,
                        'topic_score': topic_score,
                        'dominance_ratio': dominance_ratio,
                        'combined_dominance': combined_dominance
                    })
        
        # Sort authors by the combined dominance metric
        topic_authors.sort(key=lambda x: x['combined_dominance'], reverse=True)
        
        # Only suggest fields with sufficient authors
        if len(topic_authors) >= config.get('min_authors_per_topic', 1):  # Lower threshold to 1 for true experts
            # Format the top terms nicely
            formatted_terms = []
            for term in terms[:10]:
                term = term.replace('_', ' ')
                formatted_terms.append(term)
            
            # Get the author IDs
            author_ids = [a['author_id'] for a in topic_authors]
            
            field_suggestions.append({
                'topic_id': topic_idx,
                'suggested_name': topic_name,
                'top_terms': formatted_terms,
                'author_ids': author_ids,
                'author_count': len(topic_authors),
                'top_authors': topic_authors
            })
   
    # 8. Deduce primary research areas

    print("\n" + "="*80)
    print("FACULTY PRIMARY RESEARCH AREAS")
    print("="*80)

    # Get full-time faculty members (can be filtered by department if needed)
    cursor.execute("""
        SELECT id, display_name FROM authors 
        WHERE department = 'Chemistry' 
        ORDER BY display_name
    """)

    faculty = cursor.fetchall()
    for faculty_member in faculty:
        faculty_id = faculty_member['id']
        name = faculty_member['display_name']
        
        # Find topics where this faculty member has the highest score
        best_topics = []
        for field in suggested_fields:
            for author_info in field.get('top_authors', []):
                if author_info['author_id'] == faculty_id:
                    best_topics.append({
                        'topic_name': field['suggested_name'],
                        'score': author_info.get('topic_score', 0),
                        'pub_count': author_info.get('publication_count', 0)
                    })
        
        # Sort by topic score
        best_topics.sort(key=lambda x: x['score'], reverse=True)
        
        if best_topics:
            print(f"\n{name} is best known for:")
            for idx, topic in enumerate(best_topics[:3]):
                print(f"  {idx+1}. {topic['topic_name']} (score: {topic['score']:.2f}, publications: {topic['pub_count']})")
        else:
            print(f"\n{name}: No significant research areas identified")

    # 9. Calculate topic similarity matrix for field relationships
    print("Calculating topic similarities...")
    topic_similarity = {}

    # Make sure num_topics is defined
    if 'num_topics' not in locals():
        num_topics = config.get('num_topics', 15)

    for i in range(num_topics):
        for j in range(i+1, num_topics):
            # Calculate cosine similarity between topic term vectors
            similarity = cosine_similarity(
                nmf.components_[i].reshape(1, -1),
                nmf.components_[j].reshape(1, -1)
            )[0][0]
            
            # Convert from numpy float to Python float for JSON serialization
            similarity_value = float(similarity)
            
            if similarity_value > config.get('min_topic_similarity', 0.2):
                relationship = {
                    'topic1_id': i,
                    'topic2_id': j,
                    'topic1_name': topic_name_mapping.get(i, f"Topic {i}"),
                    'topic2_name': topic_name_mapping.get(j, f"Topic {j}"),
                    'similarity': similarity_value
                }
                topic_relationships.append(relationship)
                topic_similarity[(i, j)] = relationship

        # Store similarity data for field relationship analysis
        config['topic_similarity'] = topic_similarity

        # Sort field suggestions by author count
        field_suggestions.sort(key=lambda x: x['author_count'], reverse=True)

        print(f"Generated {len(field_suggestions)} field suggestions")
        return field_suggestions, {
            'authors_with_topics': set(author_topic_dominance.keys()),
            'author_best_topics': author_topic_dominance,
            'topic_relationships': topic_relationships
        }

def analyze_topic_relationships(conn, config):
    """
    Analyze relationships between research topics identified through topic modeling.
    
    Parameters:
    -----------
    conn : sqlite3.Connection
        Connection to the database
    config : dict
        Configuration parameters containing topic similarity data
        
    Returns:
    --------
    list
        List of topic relationships with similarity metrics
    """
    topic_similarity = config.get('topic_similarity', {})
    if not topic_similarity:
        print("No topic similarity data available")
        return []
    
    # Format the relationships
    relationships = []
    for (topic1, topic2), data in topic_similarity.items():
        relationships.append({
            'topic1_id': topic1,
            'topic2_id': topic2,
            'topic1_name': data['topic1_name'],
            'topic2_name': data['topic2_name'],
            'similarity': data['similarity']
        })
    
    # Sort by similarity
    relationships.sort(key=lambda x: x['similarity'], reverse=True)
    
    return relationships

# Configuration & Results Management

def load_config(config_path):
    """
    Load configuration from a JSON file or create a default one if it doesn't exist.
    
    The configuration file controls:
    1. Reputation score calculation weights and parameters
    2. Field extraction thresholds
    3. Keyword extraction settings
    
    Parameters:
    -----------
    config_path : str
        Path to the configuration JSON file
        
    Returns:
    --------
    dict
        Configuration parameters
    """
    default_config = {
        # Reputation score calculation parameters
        "h_index_weight": 0.3,
        "citation_weight": 0.3,
        "productivity_weight": 0.2,
        "expertise_weight": 0.2,
        "recency_weight": 0.1,
        "impact_factor_weight": 0.1,
        "max_score": 10.0,
        "default_normalization": 1.0,
        "min_authors_for_normalization": 5,
        
        # Field extraction parameters
        "min_keyword_count": 2,  # Minimum occurrences for a keyword to be considered
        "max_keywords_per_author": 10,  # Maximum keywords to show per author
        "keyword_weights": {
            "defined_keyword": 3.0,  # Weight for explicitly defined keywords
            "title_word": 2.0,      # Weight for words in publication titles
            "abstract_word": 1.0    # Weight for words in abstracts
        },
        "keyword_min_length": 4,    # Minimum length of words to consider
        
        # Field classification parameters
        "field_classification": {
            "min_similarity": 0.7,  # Minimum similarity for field clustering
            "use_parent_fields": True,  # Use parent fields when insufficient data
            "max_fields_per_author": 3  # Maximum fields to consider per author
        },
        
        # Visualization settings
        "display_detailed_scores": True,  # Show detailed score components
        "sort_by": "reputation_score"  # Sort results by this field
    }
    
    try:
        # Try to load existing config
        if os.path.exists(config_path):
            with open(config_path, 'r') as f:
                config = json.load(f)
                print(f"Loaded configuration from {config_path}")
                
                # Update with any missing fields from default
                for key, value in default_config.items():
                    if key not in config:
                        config[key] = value
        else:
            # Create a new config file with defaults
            config = default_config
            with open(config_path, 'w') as f:
                json.dump(config, f, indent=4)
                print(f"Created new configuration file at {config_path}")
                
        return config
        
    except (json.JSONDecodeError, IOError) as e:
        print(f"Error loading configuration: {e}")
        print("Using default configuration")
        return default_config

def export_analysis_results(author_keywords, author_reputations, suggested_fields, field_relationships, output_dir):
    """
    Export all analysis results to JSON files for further processing or visualization.
    
    Parameters:
    -----------
    author_keywords : dict
        Dictionary of author IDs to their keywords
    author_reputations : dict
        Dictionary of author IDs to their reputation information
    suggested_fields : list
        List of suggested new fields
    field_relationships : dict
        Dictionary of field relationships
    output_dir : str
        Directory to save output files
    """
    import os
    
    # Create output directory if it doesn't exist
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # Export author keywords
    keyword_data = {}
    for author_id, keywords in author_keywords.items():
        if keywords:
            # Convert Counter to dictionary of {keyword: weight}
            keyword_data[author_id] = {k: float(v) for k, v in keywords.items() if v > 1}
    
    with open(os.path.join(output_dir, 'author_keywords.json'), 'w') as f:
        json.dump(keyword_data, f, indent=2)
    
    # Export author reputations
    reputation_data = {}
    for author_id, data in author_reputations.items():
        reputation_data[author_id] = {
            'display_name': data['display_name'],
            'reputation_score': data['reputation_score'],
            'h_index': data['h_index'],
            'citations': data['citations'],
            'publication_count': data['publication_count']
        }
        if 'score_components' in data:
            reputation_data[author_id]['score_components'] = data['score_components']
    
    with open(os.path.join(output_dir, 'author_reputations.json'), 'w') as f:
        json.dump(reputation_data, f, indent=2)
    
    # Export suggested fields
    with open(os.path.join(output_dir, 'suggested_fields.json'), 'w') as f:
        json.dump(suggested_fields, f, indent=2)
    
    # Export field relationships
    relationship_data = {}
    for (field1, field2), data in field_relationships.items():
        key = f"{field1}_{field2}"
        relationship_data[key] = data
    
    with open(os.path.join(output_dir, 'field_relationships.json'), 'w') as f:
        json.dump(relationship_data, f, indent=2)
    
    print(f"Exported all analysis results to {output_dir}/")

def export_topic_analysis_results(field_suggestions, topic_relationships, output_dir):
    """
    Export topic modeling analysis results to JSON files.
    
    Parameters:
    -----------
    field_suggestions : list
        List of suggested fields from topic modeling
    topic_relationships : list
        List of topic relationships
    output_dir : str
        Directory to save output files
    """
    
    # Create output directory if it doesn't exist
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # Define a custom JSON encoder to handle problematic types
    class CustomEncoder(json.JSONEncoder):
        def default(self, obj):
            if isinstance(obj, set):
                return list(obj)
            elif isinstance(obj, defaultdict):
                return dict(obj)
            elif isinstance(obj, np.integer):
                return int(obj)
            elif isinstance(obj, np.floating):
                return float(obj)
            elif isinstance(obj, np.ndarray):
                return obj.tolist()
            else:
                return super(CustomEncoder, self).default(obj)
    
    # Helper function to ensure objects are JSON serializable
    def ensure_serializable(obj):
        if isinstance(obj, set):
            return list(obj)
        elif isinstance(obj, defaultdict):
            return {k: ensure_serializable(v) for k, v in obj.items()}
        elif isinstance(obj, dict):
            return {k: ensure_serializable(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [ensure_serializable(item) for item in obj]
        elif isinstance(obj, (np.integer, np.int64, np.int32)):
            return int(obj)
        elif isinstance(obj, (np.floating, np.float64, np.float32)):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        else:
            return obj
    
    try:
        # Make data safe for JSON serialization
        json_safe_suggestions = ensure_serializable(field_suggestions)
        
        # Export field suggestions
        with open(os.path.join(output_dir, 'topic_fields.json'), 'w') as f:
            json.dump(json_safe_suggestions, f, indent=2, cls=CustomEncoder)
        
        # Make relationships safe for JSON
        json_safe_relationships = ensure_serializable(topic_relationships)
        
        # Export topic relationships
        with open(os.path.join(output_dir, 'topic_relationships.json'), 'w') as f:
            json.dump(json_safe_relationships, f, indent=2, cls=CustomEncoder)
        
        print(f"Exported topic analysis results to {output_dir}/")
    except Exception as e:
        print(f"Error exporting topic analysis results: {e}")
        import traceback
        traceback.print_exc()
 
def populate_fields_tables(conn, suggested_fields, config):
    """
    Populate the fields and field_keywords tables based on suggested fields.
    
    Parameters:
    -----------
    conn : sqlite3.Connection
        Connection to the database
    suggested_fields : list
        List of suggested fields from keyword analysis or topic modeling
    config : dict
        Configuration parameters
        
    Returns:
    --------
    int
        Number of fields added to the database
    """
    import uuid
    import datetime
    
    fields_added = 0
    fields_updated = 0
    current_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Get mapping of existing field names to their IDs
    cursor = conn.cursor()
    cursor.execute("SELECT id, name FROM fields")
    existing_fields = {row['name'].lower(): row['id'] for row in cursor.fetchall()}
    
    print(f"Found {len(existing_fields)} existing fields in the database")
    
    try:
        # Begin transaction
        conn.execute("BEGIN TRANSACTION")
        
        for field in suggested_fields:
            # Use topic modeling or keyword-based field name
            if 'suggested_name' in field:
                field_name = field['suggested_name']
            else:
                continue  # Skip if no name available
            
            # Check if field already exists
            field_id = None
            if field_name.lower() in existing_fields:
                # Use existing ID
                field_id = existing_fields[field_name.lower()]
                print(f"Updating existing field '{field_name}'")
                
                # Update the field
                cursor.execute("""
                    UPDATE fields
                    SET description = ?, updated_at = ?
                    WHERE id = ?
                """, (
                    f"Auto-generated field based on publication analysis (updated)",
                    current_time,
                    field_id
                ))
                
                # Delete existing keywords for this field
                cursor.execute("DELETE FROM field_keywords WHERE field_id = ?", (field_id,))
                fields_updated += 1
            else:
                # Generate a unique ID for the new field
                field_id = str(uuid.uuid4())
                
                # Insert into fields table
                cursor.execute("""
                    INSERT INTO fields (id, name, description, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?)
                """, (
                    field_id,
                    field_name,
                    f"Auto-generated field based on publication analysis",
                    current_time,
                    current_time
                ))
                existing_fields[field_name.lower()] = field_id
                fields_added += 1
            
            # Insert keywords (for both new and updated fields)
            if 'top_terms' in field:  # Topic modeling approach
                keywords = field['top_terms']
                for i, keyword in enumerate(keywords[:10]):  # Use top 10 terms
                    weight = 1.0 - (i * 0.05)  # Decreasing weights: 1.0, 0.95, 0.90, ...
                    cursor.execute("""
                        INSERT INTO field_keywords (field_id, keyword, weight, created_at)
                        VALUES (?, ?, ?, ?)
                    """, (
                        field_id,
                        keyword,
                        weight,
                        current_time
                    ))
            elif 'keywords' in field:  # Keyword clustering approach
                for i, (keyword, count) in enumerate(field['keywords'][:10]):
                    # Normalize weights based on count
                    weight = min(1.0, count / 10.0)
                    cursor.execute("""
                        INSERT INTO field_keywords (field_id, keyword, weight, created_at)
                        VALUES (?, ?, ?, ?)
                    """, (
                        field_id,
                        keyword,
                        weight,
                        current_time
                    ))
            
            # Similar logic for author associations...
        
        # Commit the transaction
        conn.commit()
        print(f"Successfully added {fields_added} new fields and updated {fields_updated} existing fields")
        return fields_added + fields_updated
        
    except sqlite3.Error as e:
        conn.rollback()
        print(f"Database error: {e}")
        return 0

def associate_authors_with_fields(conn, author_keywords, suggested_fields, config):
    """
    Associate authors with fields based on keyword analysis and topic modeling results,
    storing expertise scores in the author_fields table.
    
    Parameters:
    -----------
    conn : sqlite3.Connection
        Connection to the database
    author_keywords : dict
        Dictionary of author IDs to their keywords
    suggested_fields : list
        List of suggested fields from analysis
    config : dict
        Configuration parameters
    
    Returns:
    --------
    int
        Number of author-field associations created or updated
    """
    import datetime
    
    associations_count = 0
    current_time = datetime.datetime.now().isoformat()
    
    # Get existing fields from the database
    cursor = conn.cursor()
    cursor.execute("SELECT id, name FROM fields")
    field_map = {row['name'].lower(): row['id'] for row in cursor.fetchall()}
    
    # Minimum expertise score threshold for association
    min_score_threshold = config.get('min_expertise_score', 0.2)
    
    try:
        # Begin transaction
        conn.execute("BEGIN TRANSACTION")
        
        # First, clear existing expertise scores (optional - you might want to keep history)
        conn.execute("DELETE FROM author_fields")
        
        # Method 1: Associate based on keyword matching
        for author_id, keywords in author_keywords.items():
            # Skip authors with no meaningful keywords
            if not keywords:
                continue
                
            # Calculate field match scores based on keyword overlap
            field_scores = {}
            for field_name, field_id in field_map.items():
                # Get field keywords
                cursor.execute("SELECT keyword FROM field_keywords WHERE field_id = ?", (field_id,))
                field_keywords = {row['keyword'].lower() for row in cursor.fetchall()}
                
                # Calculate overlap score
                overlap_score = 0.0
                for keyword, weight in keywords.items():
                    if keyword in field_keywords:
                        overlap_score += weight
                    # Partial matches (substring)
                    elif any(keyword in fk or fk in keyword for fk in field_keywords):
                        overlap_score += weight * 0.5
                
                # Normalize score (0-1 scale)
                total_weight = sum(keywords.values())
                if total_weight > 0:
                    normalized_score = min(1.0, overlap_score / total_weight)
                    if normalized_score >= min_score_threshold:
                        field_scores[field_id] = normalized_score
            
            # Method 2: Also consider topic-based fields if available
            if len(suggested_fields) > 0 and isinstance(suggested_fields[0], dict) and 'top_authors' in suggested_fields[0]:
                # This appears to be topic modeling output
                for field in suggested_fields:
                    if 'suggested_name' in field and field['suggested_name'].lower() in field_map:
                        field_id = field_map[field['suggested_name'].lower()]
                        
                        # Check if this author is in the top authors
                        for author_info in field.get('top_authors', []):
                            if isinstance(author_info, dict) and author_info.get('author_id') == author_id:
                                # Use the dominance ratio or combined dominance as expertise score
                                expertise_score = author_info.get('combined_dominance', author_info.get('dominance_ratio', 0.0))
                                if expertise_score >= min_score_threshold:
                                    field_scores[field_id] = max(expertise_score, field_scores.get(field_id, 0.0))
            
            # Store the scores in author_fields table
            for field_id, score in field_scores.items():
                # Publication count is a placeholder here - would need additional query to get accurate count
                cursor.execute("""
                    INSERT INTO author_fields (
                        author_id, field_id, expertise_score, 
                        publication_count, last_calculated
                    ) VALUES (?, ?, ?, ?, ?)
                    ON CONFLICT(author_id, field_id) DO UPDATE SET
                        expertise_score = ?,
                        last_calculated = ?
                """, (
                    author_id, field_id, score, 
                    0, current_time,
                    score, current_time
                ))
                associations_count += 1
        
        # Commit the transaction
        conn.commit()
        print(f"Created/updated {associations_count} author-field associations")
        return associations_count
        
    except sqlite3.Error as e:
        conn.rollback()
        print(f"Database error: {e}")
        return 0

def save_reputation_scores_to_database(conn, author_reputations):
    """
    Save calculated reputation scores to the database.
    
    This function adds reputation scores to the authors table or creates
    a new author_reputation table if needed.
    
    Parameters:
    -----------
    conn : sqlite3.Connection
        Connection to the database
    author_reputations : dict
        Dictionary of author IDs to their reputation information
        
    Returns:
    --------
    int
        Number of author records updated
    """
    import sqlite3
    
    # First, check if 'reputation_score' column exists in authors table
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(authors)")
    columns = [row['name'] for row in cursor.fetchall()]
    
    updates_count = 0
    
    try:
        # Begin transaction
        conn.execute("BEGIN TRANSACTION")
        
        # If reputation_score column doesn't exist, add it
        if 'reputation_score' not in columns:
            print("Adding reputation_score column to authors table...")
            conn.execute("ALTER TABLE authors ADD COLUMN reputation_score REAL")
        
        # Create a separate table for detailed reputation data if it doesn't exist
        conn.execute("""
        CREATE TABLE IF NOT EXISTS author_reputation_details (
            author_id TEXT PRIMARY KEY,
            h_index_component REAL,
            citation_component REAL,
            productivity_component REAL,
            recency_factor REAL,
            expertise_component REAL,
            field_normalization REAL,
            last_calculated TEXT,
            FOREIGN KEY (author_id) REFERENCES authors (id)
        )
        """)
        
        # Update authors table with reputation scores
        for author_id, data in author_reputations.items():
            # Update main reputation score
            conn.execute("""
                UPDATE authors
                SET reputation_score = ?
                WHERE id = ?
            """, (data['reputation_score'], author_id))
            
            # Store detailed components in the separate table
            if 'score_components' in data:
                components = data['score_components']
                conn.execute("""
                    INSERT INTO author_reputation_details (
                        author_id, h_index_component, citation_component,
                        productivity_component, recency_factor,
                        expertise_component, field_normalization, last_calculated
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                    ON CONFLICT(author_id) DO UPDATE SET
                        h_index_component = ?,
                        citation_component = ?,
                        productivity_component = ?,
                        recency_factor = ?,
                        expertise_component = ?,
                        field_normalization = ?,
                        last_calculated = CURRENT_TIMESTAMP
                """, (
                    author_id,
                    components.get('h_index_component', 0),
                    components.get('citation_component', 0),
                    components.get('productivity_component', 0),
                    components.get('recency_factor', 0),
                    components.get('expertise_component', 0),
                    components.get('field_normalization', 1.0),
                    # Repeat values for the UPDATE part
                    components.get('h_index_component', 0),
                    components.get('citation_component', 0),
                    components.get('productivity_component', 0),
                    components.get('recency_factor', 0),
                    components.get('expertise_component', 0),
                    components.get('field_normalization', 1.0)
                ))
            
            updates_count += 1
        
        # Commit the transaction
        conn.commit()
        print(f"Successfully updated reputation scores for {updates_count} authors")
        return updates_count
        
    except sqlite3.Error as e:
        conn.rollback()
        print(f"Database error while saving reputation scores: {e}")
        return 0

# Main Execution

def main():
    import os
    import argparse
    
    # Set up command line arguments
    parser = argparse.ArgumentParser(description="Analyze author expertise and reputation from academic database")
    parser.add_argument('--db', default='scivalidate.db', help='Path to SQLite database')
    parser.add_argument('--config', default='author_analysis_config.json', help='Path to configuration file')
    parser.add_argument('--output-dir', default='analysis_results', help='Directory to save output files')
    parser.add_argument('--impact-factors', default='impact_factor_cache.json', help='Path to impact factor cache')
    parser.add_argument('--suggest-fields', action='store_true', help='Suggest new fields based on keyword patterns')
    parser.add_argument('--analyze-relationships', action='store_true', help='Analyze field relationships')
    parser.add_argument('--use-topic-modeling', action='store_true', help='Use advanced topic modeling for field suggestions')
    parser.add_argument('--export-all', action='store_true', help='Export all results to JSON files')
    parser.add_argument('--verbose', action='store_true', help='Show detailed output')
    parser.add_argument('--populate-fields', action='store_true', 
                    help='Populate fields and field_keywords tables with suggested fields')
    args = parser.parse_args()
    
    # File paths
    db_path = args.db
    config_path = args.config
    impact_factor_cache_path = args.impact_factors
    output_dir = args.output_dir
    
    # Connect to the database
    conn = connect_to_database(db_path)
    if not conn:
        return
    
    try:
        # Load or create configuration
        config = load_config(config_path)
        
        # If using topic modeling, add default topic modeling parameters if not present
        if args.use_topic_modeling:
            topic_defaults = {
                'num_topics': 15,
                'max_tfidf_features': 5000,
                'min_document_frequency': 2,
                'max_document_frequency': 0.9,
                'min_topic_publications': 2,
                'min_authors_per_topic': 2,
                'min_topic_similarity': 0.2
            }
            for key, value in topic_defaults.items():
                if key not in config:
                    config[key] = value
        
        # Load impact factor cache (optional - use if file exists)
        try:
            impact_factors = load_impact_factor_cache(impact_factor_cache_path)
        except:
            impact_factors = {}
            print("Impact factor cache not loaded. Continuing without it.")
        
        # Extract author keywords with configuration
        print("Extracting author keywords...")
        author_keywords = extract_author_keywords_with_config(conn, config)
        
        # Calculate reputation scores with configuration
        print("Calculating reputation scores...")
        author_reputations = calculate_reputation_scores(conn, config, impact_factors)
        
        # Save reputation scores to database
        print("Saving reputation scores to database...")
        save_reputation_scores_to_database(conn, author_reputations)

            # Perform additional analyses if requested

        
        # Add a tracking variable for topic modeling results
        is_topic_modeling = False

        field_suggestion_method = None
        
        # Perform additional analyses if requested
        suggested_fields = None
        if args.suggest_fields:
            if args.use_topic_modeling:
                # Use advanced topic modeling approach
                print("Using advanced topic modeling for field suggestions...")
                suggested_fields, topic_data = suggest_new_fields_with_topic_modeling(conn, author_keywords, config)   
                field_suggestion_method = "topic_modeling"
                # Store the additional data for use later
                authors_with_topics = topic_data.get('authors_with_topics', set())
                author_best_topics = topic_data.get('author_best_topics', defaultdict(list))
            else:
                # Use original keyword clustering approach
                print("Analyzing keyword patterns to suggest new fields...")
                suggested_fields = suggest_new_fields(conn, author_keywords, config)
                field_suggestion_method = "keyword_clustering"
                
            # Add this section to populate fields tables
            if suggested_fields and args.populate_fields:
                print("Populating fields and field_keywords tables...")
                fields_added = populate_fields_tables(conn, suggested_fields, config)
                print(f"Added {fields_added} new fields to the database")
        
        field_relationships = None
        topic_relationships = None
        if args.analyze_relationships:
            if args.use_topic_modeling and 'topic_data' in locals() and 'topic_relationships' in topic_data:
                # Use the topic relationships from our topic modeling results
                print("Using topic relationships from topic modeling...")
                topic_relationships = topic_data['topic_relationships']
            elif args.use_topic_modeling:
                # Fall back to analyzing from config if topic_data doesn't have relationships
                print("Analyzing topic relationships...")
                topic_relationships = analyze_topic_relationships(conn, config)
            else:
                # Use original field relationships
                print("Analyzing field relationships...")
                field_relationships = analyze_field_relationships(conn)

        # Export all results if requested
        if args.export_all:
            print("Exporting analysis results...")
            if args.use_topic_modeling:
                # Make sure we have topic_relationships available
                if 'topic_relationships' not in locals() or topic_relationships is None:
                    if 'topic_data' in locals() and 'topic_relationships' in topic_data:
                        topic_relationships = topic_data['topic_relationships']
                    else:
                        topic_relationships = []
                        
                export_topic_analysis_results(
                    suggested_fields, 
                    topic_relationships,
                    output_dir
                )
            else:
                export_analysis_results(
                    author_keywords, 
                    author_reputations, 
                    suggested_fields or [], 
                    field_relationships or {}, 
                    output_dir
                )

        # Print results
        print("\n" + "="*80)
        print("AUTHOR KEYWORD AND REPUTATION ANALYSIS")
        print("="*80)
        
        # Sort results based on configuration
        sort_by = config.get('sort_by', 'reputation_score')
        sorted_authors = sorted(
            author_reputations.items(), 
            key=lambda x: x[1].get(sort_by, 0), 
            reverse=True
        )
        
        # Modification to the reporting section in main()
        # Replace the current author printing loop with this:

        # Use a set to track which authors we've already displayed
        displayed_authors = set()

        # Sort results based on configuration
        sort_by = config.get('sort_by', 'reputation_score')
        sorted_authors = sorted(
            author_reputations.items(), 
            key=lambda x: x[1].get(sort_by, 0), 
            reverse=True
        )

        # Limit displayed authors if not verbose
        display_limit = len(sorted_authors) if args.verbose else min(20, len(sorted_authors))

        for i, (author_id, reputation) in enumerate(sorted_authors):
            if i >= display_limit and not args.verbose:
                remaining = len(sorted_authors) - display_limit
                print(f"\n... and {remaining} more authors (use --verbose to see all)")
                break
                
            # Skip if we've already displayed this author
            if author_id in displayed_authors:
                continue
            
            displayed_authors.add(author_id)
            display_name = reputation['display_name']
            # ... rest of author display code remains the same
            reputation_score = reputation['reputation_score']
            
            # Get top keywords for this author
            keywords = author_keywords.get(author_id, Counter())
            min_keyword_count = config.get('min_keyword_count', 2)
            max_keywords = config.get('max_keywords_per_author', 10)
            top_keywords = [kw for kw, count in keywords.most_common(max_keywords) 
                           if count > min_keyword_count]
            
            # Skip authors with no substantial keywords if desired
            if not top_keywords and config.get('skip_authors_without_keywords', True) or \
                (reputation_score == 0 and reputation['publication_count'] == 0 and config.get('skip_empty_authors', True)):
                continue
                
            print(f"\nAuthor: {display_name}")
            print(f"Reputation Score: {reputation_score}/10.0")
            print(f"H-Index: {reputation['h_index']}, Citations: {reputation['citations']}")
            print(f"Publications: {reputation['publication_count']}")
            
            # Display detailed scores if configured
            if config.get('display_detailed_scores', True) and 'score_components' in reputation:
                components = reputation['score_components']
                print("Score Components:")
                for component, value in components.items():
                    print(f"  - {component}: {value}")
            
            if top_keywords:
                print("Main Keywords: " + ", ".join(top_keywords))
            else:
                print("No substantial keywords identified")
                
            print("-" * 40)

    
        # In the field display section:
        if suggested_fields:
            print("\n" + "="*80)
            print("SUGGESTED NEW RESEARCH FIELDS")
            print("="*80)
            
            # Create a direct lookup from the database
            author_name_lookup = {}
            cursor = conn.cursor()
            cursor.execute("SELECT id, display_name FROM authors")
            for row in cursor.fetchall():
                author_name_lookup[row['id']] = row['display_name']
            
            display_count = min(10, len(suggested_fields))
            for i, field in enumerate(suggested_fields[:display_count]):
                print(f"\nSuggested Field: {field['suggested_name']}")
                print(f"Potential Authors: {field['author_count']}")
                
                # Check which field format we have based on our tracking variable
                if field_suggestion_method == "topic_modeling" and 'top_terms' in field:
                    # Topic modeling format
                    print("Associated Terms:")
                    for term in field['top_terms'][:5]:  # Show top 5 terms
                        print(f"  - {term}")
                    
                    # Show top authors for this field with dominance information
                    if 'top_authors' in field and len(field['top_authors']) > 0:
                        print("Top experts in this field:")
                        for author_info in field['top_authors'][:3]:  # Show top 3 authors
                            author_id = author_info['author_id']
                            name = author_name_lookup.get(author_id, f"Unknown ({author_id})")
                            
                            # Display all relevant scores
                            pub_count = author_info.get('publication_count', 0)
                            topic_score = author_info.get('topic_score', 0)
                            dominance = author_info.get('dominance_ratio', 0) * 100  # Convert to percentage
                            
                            # Add reputation score from author_reputations if available
                            reputation_score = "N/A"
                            if author_id in author_reputations:
                                reputation_score = author_reputations[author_id].get('reputation_score', "N/A")
                            
                            print(f"  - {name}")
                            print(f"    Publications: {pub_count}")
                            print(f"    Topic relevance: {topic_score:.2f}")
                            print(f"    Dominance: {dominance:.1f}% (relative to top expert)")
                            print(f"    Reputation: {reputation_score}")
                    else:
                        print("No expert information available for this field")
                elif field_suggestion_method == "keyword_clustering" and 'keywords' in field:
                    # Keyword clustering format
                    print("Associated Keywords:")
                    for keyword, count in field['keywords'][:5]:  # Show top 5 keywords
                        print(f"  - {keyword} (appears in {count} authors)")
                
                # Fallback for any format (useful if the code changes later)
                else:
                    if 'top_terms' in field:
                        print("Associated Terms:")
                        for term in field['top_terms'][:5]:
                            print(f"  - {term}")
                    elif 'keywords' in field:
                        print("Associated Keywords:")
                        for keyword, count in field['keywords'][:5]:
                            print(f"  - {keyword} (appears in {count} authors)")
                    else:
                        print("No term information available")
                        
                print("-" * 40)
            
            # Modify the code that displays FACULTY PRIMARY RESEARCH AREAS
            # Use a set to track displayed faculty
            displayed_faculty = set()

        if suggested_fields and args.use_topic_modeling and 'topic_data' in locals():
            # Use a set to track displayed faculty
            displayed_faculty = set()
            
            print("\n" + "="*80)
            print("FACULTY PRIMARY RESEARCH AREAS")
            print("="*80)
            
            # Get the authors with topics
            authors_with_topics = topic_data.get('authors_with_topics', set())
            author_topic_dominance = topic_data.get('author_best_topics', {})
            
            # Create direct lookup for author names
            author_name_lookup = {}
            try:
                cursor = conn.cursor()
                cursor.execute("SELECT id, display_name FROM authors")
                for row in cursor.fetchall():
                    author_name_lookup[row['id']] = row['display_name']
            except Exception as e:
                print(f"Warning: Could not retrieve author names: {e}")
            
            # For each author with topic dominance information
            for author_id in authors_with_topics:
                # Skip if already displayed
                if author_id in displayed_faculty:
                    continue
                    
                displayed_faculty.add(author_id)
                name = author_name_lookup.get(author_id, f"Unknown ({author_id})")
                
                # Find topics for this author
                topics = []
                for field in suggested_fields:
                    if 'top_authors' not in field:
                        continue
                        
                    for author_info in field.get('top_authors', []):
                        if not isinstance(author_info, dict):
                            continue
                            
                        if author_info.get('author_id') == author_id:
                            topics.append({
                                'topic_name': field.get('suggested_name', 'Unknown Topic'),
                                'combined_dominance': author_info.get('combined_dominance', 0),
                                'pub_count': author_info.get('publication_count', 0)
                            })
                
                # If no topics found via top_authors, try author_topic_dominance
                if not topics and author_id in author_topic_dominance:
                    topic_scores = author_topic_dominance[author_id]
                    for topic_id, score in topic_scores.items():
                        if not isinstance(topic_id, int):
                            continue
                        
                        # Try to find the topic name
                        topic_name = "Unknown Topic"
                        for field in suggested_fields:
                            if field.get('topic_id') == topic_id:
                                topic_name = field.get('suggested_name', topic_name)
                                break
                        
                        topics.append({
                            'topic_name': topic_name,
                            'combined_dominance': score,
                            'pub_count': 0  # We don't have this info here
                        })
                
                # Sort topics by combined dominance
                topics.sort(key=lambda x: x.get('combined_dominance', 0), reverse=True)
                
                if topics:
                    print(f"\n{name} is best known for:")
                    for idx, topic in enumerate(topics[:3]):  # Top 3 topics
                        dominance_pct = topic.get('combined_dominance', 0) * 100
                        print(f"  {idx+1}. {topic['topic_name']} (dominance: {dominance_pct:.1f}%, publications: {topic.get('pub_count', 'N/A')})")
                else:
                    print(f"\n{name}: No significant research areas identified")

        if suggested_fields:
            print("Creating author-field associations in database...")
            associations_count = associate_authors_with_fields(conn, author_keywords, suggested_fields, config)
            print(f"Created {associations_count} author-field associations")


        # Print field relationships if available
        if field_relationships:
            print("\n" + "="*80)
            print("FIELD RELATIONSHIP ANALYSIS")
            print("="*80)
            
            # Sort by similarity for display
            sorted_relationships = sorted(
                field_relationships.items(), 
                key=lambda x: -x[1]['similarity']
            )
            
            display_count = min(10, len(sorted_relationships))
            for i, ((field1, field2), data) in enumerate(sorted_relationships[:display_count]):
                print(f"\nRelated Fields: {data['field1_name']} & {data['field2_name']}")
                print(f"Similarity: {data['similarity']:.2f}")
                print(f"Author Overlap: {data['overlap_count']} authors")
                print("-" * 40)
        
        # Print topic relationships if available
        if topic_relationships:
            print("\n" + "="*80)
            print("TOPIC RELATIONSHIP ANALYSIS")
            print("="*80)
            
            display_count = min(10, len(topic_relationships))
            for i, rel in enumerate(topic_relationships[:display_count]):
                print(f"\nRelated Topics: {rel['topic1_name']} & {rel['topic2_name']}")
                print(f"Similarity: {rel['similarity']:.2f}")
                print("-" * 40)
        
    finally:
        conn.close()

if __name__ == "__main__":
    main()