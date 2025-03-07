from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
from typing import Dict, List, Optional
import logging
import os
from uuid import uuid4

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set up database path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'scivalidate.db')

def get_db():
    """Create a database connection with row factory for named column access"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Add a health check endpoint for Render
@app.get("/health")
async def health_check():
    """Health check endpoint for Render"""
    return {"status": "healthy"}

# Add a root endpoint to help with debugging
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "SciValidate API is running",
        "endpoints": [
            "/health",
            "/faculty",
            "/faculty/{faculty_id}",
            "/faculty/{faculty_id}/reputation",
            "/diagnose/db",
            "/populate/sample"
        ],
        "db_path": DB_PATH,
        "db_exists": os.path.exists(DB_PATH),
        "file_size": os.path.getsize(DB_PATH) if os.path.exists(DB_PATH) else 0
    }

# Modified endpoints to work both with and without /api prefix
@app.get("/faculty")
@app.get("/api/faculty")
async def get_faculty_list():
    """
    Get a list of all faculty members with their basic information.
    Adapted to work with the updated schema.
    """
    logger.debug("Fetching faculty list")
    
    try:
        conn = get_db()
        
        # Get basic information for all faculty members directly from authors table
        faculty = conn.execute("""
            SELECT 
                id,
                display_name,
                department,
                institution,
                h_index,
                total_citations
            FROM authors
            ORDER BY display_name
        """).fetchall()
        
        # Convert rows to dictionaries for JSON response
        faculty_list = []
        
        for row in faculty:
            author_data = dict(row)
            
            # Get publication count
            pub_count = conn.execute("""
                SELECT COUNT(*) as publication_count
                FROM author_publications
                WHERE author_id = ?
            """, (row['id'],)).fetchone()
            
            if pub_count:
                author_data['publication_count'] = pub_count['publication_count']
            else:
                author_data['publication_count'] = 0
            
            # Get latest publication year
            latest_pub = conn.execute("""
                SELECT MAX(p.publication_year) as latest_year
                FROM author_publications ap
                JOIN publications p ON ap.publication_id = p.id
                WHERE ap.author_id = ?
            """, (row['id'],)).fetchone()
            
            if latest_pub and latest_pub['latest_year']:
                author_data['latest_publication_year'] = latest_pub['latest_year']
            
            faculty_list.append(author_data)
        
        logger.debug(f"Successfully fetched {len(faculty_list)} faculty members")
        return faculty_list
        
    except sqlite3.Error as e:
        logger.error(f"Database error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        if 'conn' in locals():
            conn.close()

@app.get("/faculty/{faculty_id}")
@app.get("/api/faculty/{faculty_id}")
async def get_faculty_detail(faculty_id: str):
    """
    Get detailed information about a specific faculty member.
    Adapted to work with the updated schema.
    """
    logger.debug(f"Fetching faculty detail for ID: {faculty_id}")
    
    try:
        conn = get_db()
        
        # Get basic faculty information from authors table
        faculty = conn.execute("""
            SELECT 
                id,
                given_name,
                family_name,
                middle_names,
                display_name,
                department,
                institution,
                h_index,
                total_citations
            FROM authors
            WHERE id = ?
        """, (faculty_id,)).fetchone()
        
        if not faculty:
            logger.warning(f"Faculty member not found with ID: {faculty_id}")
            raise HTTPException(status_code=404, detail="Faculty member not found")
            
        faculty_data = dict(faculty)
        
        # Add position (not in schema, but expected by frontend)
        faculty_data['position'] = "Faculty"  # Default value
        
        # Get publication count
        pub_count = conn.execute("""
            SELECT COUNT(*) as count
            FROM author_publications
            WHERE author_id = ?
        """, (faculty_id,)).fetchone()
        
        faculty_data['publication_count'] = pub_count['count'] if pub_count else 0
        
        # Get latest publication year
        latest_pub = conn.execute("""
            SELECT MAX(p.publication_year) as latest_year
            FROM author_publications ap
            JOIN publications p ON ap.publication_id = p.id
            WHERE ap.author_id = ?
        """, (faculty_id,)).fetchone()
        
        if latest_pub and latest_pub['latest_year']:
            faculty_data['latest_publication_year'] = latest_pub['latest_year']
        
        # Get all identifiers for the faculty member
        identifiers = conn.execute("""
            SELECT 
                identifier_type,
                identifier_value,
                verification_status,
                verified_at,
                0 as is_primary  -- Adding is_primary field expected by frontend
            FROM author_identifiers
            WHERE author_id = ?
        """, (faculty_id,)).fetchall()
        
        faculty_data['identifiers'] = [dict(id) for id in identifiers]
        
        # Mark first ORCID and EMAIL as primary for display purposes
        orcid_found = False
        email_found = False
        
        for ident in faculty_data['identifiers']:
            if ident['identifier_type'] == 'ORCID' and not orcid_found:
                ident['is_primary'] = 1
                orcid_found = True
            elif ident['identifier_type'] == 'EMAIL' and not email_found:
                ident['is_primary'] = 1
                email_found = True
        
        # Get expertise fields
        expertise = conn.execute("""
            SELECT 
                f.name as field_name,
                af.expertise_score,
                af.publication_count,
                af.citation_count
            FROM author_fields af
            JOIN fields f ON af.field_id = f.id
            WHERE af.author_id = ?
            ORDER BY af.expertise_score DESC
        """, (faculty_id,)).fetchall()
        
        faculty_data['expertise'] = [dict(exp) for exp in expertise]
        
        logger.debug(f"Successfully fetched faculty detail for ID: {faculty_id}")
        return faculty_data
        
    except sqlite3.Error as e:
        logger.error(f"Database error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        if 'conn' in locals():
            conn.close()

@app.get("/diagnose/db")
@app.get("/api/diagnose/db")
async def diagnose_db():
    """Return database schema information for debugging."""
    try:
        conn = get_db()
        
        # Get table names
        tables = conn.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' 
            ORDER BY name
        """).fetchall()
        tables = [t[0] for t in tables]
        
        # Get view names
        views = conn.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='view' 
            ORDER BY name
        """).fetchall()
        views = [v[0] for v in views]
        
        # Sample data from authors if it exists
        sample_data = {}
        if 'authors' in tables:
            sample_authors = conn.execute("""
                SELECT * FROM authors LIMIT 3
            """).fetchall()
            if sample_authors:
                sample_data['authors'] = [dict(row) for row in sample_authors]
        
        return {
            "tables": tables,
            "views": views,
            "sample_data": sample_data,
            "db_path": DB_PATH
        }
        
    except sqlite3.Error as e:
        return {"error": str(e)}
    finally:
        if 'conn' in locals():
            conn.close()

@app.post("/populate/sample")
@app.post("/api/populate/sample")
async def populate_sample_data():
    """Create sample data for testing the application."""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Check if we already have data
        authors_count = cursor.execute("SELECT COUNT(*) FROM authors").fetchone()[0]
        
        if authors_count > 0:
            return {"message": "Database already contains data", "count": authors_count}
        
        # Sample data
        fields = [
            {"id": str(uuid4()), "name": "Computer Science"},
            {"id": str(uuid4()), "name": "Machine Learning"},
            {"id": str(uuid4()), "name": "Natural Language Processing"},
            {"id": str(uuid4()), "name": "Computer Vision"},
            {"id": str(uuid4()), "name": "Artificial Intelligence"}
        ]
        
        authors = [
            {
                "id": str(uuid4()),
                "given_name": "Jane",
                "family_name": "Smith",
                "middle_names": "A",
                "department": "Computer Science",
                "institution": "Stanford University",
                "h_index": 45,
                "total_citations": 12500
            },
            {
                "id": str(uuid4()),
                "given_name": "John",
                "family_name": "Doe",
                "middle_names": "B",
                "department": "Electrical Engineering",
                "institution": "MIT",
                "h_index": 38,
                "total_citations": 9800
            },
            {
                "id": str(uuid4()),
                "given_name": "Michael",
                "family_name": "Johnson",
                "middle_names": None,
                "department": "Computer Science",
                "institution": "UC Berkeley",
                "h_index": 52,
                "total_citations": 15200
            }
        ]
        
        # Insert fields
        for field in fields:
            cursor.execute(
                "INSERT INTO fields (id, name) VALUES (?, ?)",
                (field["id"], field["name"])
            )
        
        # Insert authors
        for author in authors:
            cursor.execute(
                """
                INSERT INTO authors 
                (id, given_name, family_name, middle_names, department, institution, h_index, total_citations)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    author["id"], 
                    author["given_name"], 
                    author["family_name"], 
                    author["middle_names"],
                    author["department"],
                    author["institution"],
                    author["h_index"],
                    author["total_citations"]
                )
            )
            
            # Add identifiers
            cursor.execute(
                """
                INSERT INTO author_identifiers
                (author_id, identifier_type, identifier_value, verification_status)
                VALUES (?, ?, ?, ?)
                """,
                (
                    author["id"],
                    "ORCID",
                    f"0000-0001-{hash(author['id']) % 10000:04d}-{hash(author['family_name']) % 10000:04d}",
                    "verified"
                )
            )
            
            cursor.execute(
                """
                INSERT INTO author_identifiers
                (author_id, identifier_type, identifier_value, verification_status)
                VALUES (?, ?, ?, ?)
                """,
                (
                    author["id"],
                    "EMAIL",
                    f"{author['given_name'].lower()}.{author['family_name'].lower()}@{author['institution'].lower().replace(' ', '')}.edu",
                    "unverified"
                )
            )
            
            # Add expertise
            for i, field in enumerate(fields):
                if i % 3 == hash(author["id"]) % 3:  # Just a way to distribute fields
                    cursor.execute(
                        """
                        INSERT INTO author_fields
                        (author_id, field_id, expertise_score, publication_count, citation_count)
                        VALUES (?, ?, ?, ?, ?)
                        """,
                        (
                            author["id"],
                            field["id"],
                            round(0.5 + hash(author["id"] + field["id"]) % 100 / 100, 2),  # Random score between 0.5 and 1.5
                            hash(author["id"] + field["id"]) % 50 + 10,  # Random count between 10 and 60
                            hash(author["id"] + field["id"]) % 500 + 100  # Random citations between 100 and 600
                        )
                    )
        
        conn.commit()
        return {"message": "Sample data created successfully", "authors": len(authors)}
        
    except sqlite3.Error as e:
        return {"error": str(e)}
    finally:
        if 'conn' in locals():
            conn.close()

@app.get("/faculty/{faculty_id}/reputation")
@app.get("/api/faculty/{faculty_id}/reputation")
async def get_faculty_reputation(faculty_id: str):
    """
    Get detailed reputation information for a specific faculty member.
    Includes metrics for calculating reputation scores.
    """
    logger.debug(f"Fetching reputation data for faculty ID: {faculty_id}")
    
    try:
        conn = get_db()
        
        # Get basic author information - ADD reputation_score to the query
        faculty = conn.execute("""
            SELECT 
                id,
                display_name,
                department,
                institution,
                h_index,
                total_citations,
                reputation_score
            FROM authors
            WHERE id = ?
        """, (faculty_id,)).fetchone()
        
        if not faculty:
            logger.warning(f"Faculty member not found with ID: {faculty_id}")
            raise HTTPException(status_code=404, detail="Faculty member not found")
            
        # Convert Row to dict
        faculty_data = dict(faculty)
        
        # Add position (not in original schema, but needed for frontend)
        faculty_data['position'] = "Professor"  # Default value or you can add logic to determine
        
        # Get publication count
        pub_count = conn.execute("""
            SELECT COUNT(*) as count
            FROM author_publications
            WHERE author_id = ?
        """, (faculty_id,)).fetchone()
        
        faculty_data['publication_count'] = pub_count['count'] if pub_count else 0
        
        # Get latest publication year
        latest_pub = conn.execute("""
            SELECT MAX(p.publication_year) as latest_year
            FROM author_publications ap
            JOIN publications p ON ap.publication_id = p.id
            WHERE ap.author_id = ?
        """, (faculty_id,)).fetchone()
        
        if latest_pub and latest_pub['latest_year']:
            faculty_data['latest_publication_year'] = latest_pub['latest_year']
        else:
            faculty_data['latest_publication_year'] = None
        
        # Get expertise areas
        expertise = conn.execute("""
            SELECT 
                f.id as field_id,
                f.name as field_name,
                af.expertise_score,
                af.publication_count,
                af.citation_count
            FROM author_fields af
            JOIN fields f ON af.field_id = f.id
            WHERE af.author_id = ?
            ORDER BY af.expertise_score DESC
        """, (faculty_id,)).fetchall()
        
        faculty_data['expertise'] = [dict(exp) for exp in expertise]
        
        # Get co-author count from collaborations
        coauthor_count = conn.execute("""
            SELECT COUNT(*) as count
            FROM (
                SELECT author2_id as coauthor_id
                FROM author_collaborations
                WHERE author1_id = ?
                UNION
                SELECT author1_id as coauthor_id
                FROM author_collaborations
                WHERE author2_id = ?
            ) AS coauthors
        """, (faculty_id, faculty_id)).fetchone()
        
        faculty_data['coauthor_count'] = coauthor_count['count'] if coauthor_count else 0
        
        return faculty_data
        
    except sqlite3.Error as e:
        logger.error(f"Database error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        if 'conn' in locals():
            conn.close()
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)