"""
Test program for DatabaseManager.store_identifiers method.

This program tests the handling of ORCID conflicts and author deduplication
in the store_identifiers method, particularly focusing on cases where:
1. A coauthor with abbreviated name is processed before a faculty member
2. Both records have the same ORCID
3. The resolution must handle foreign key constraints correctly

Usage:
    python test_store_identifiers.py [test_file.json]
    
    If no test file is provided, default test cases will be used.
"""

import json
import os
import sqlite3
import sys
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
import uuid

# Import the DatabaseManager class from database_populator_4
# Make sure database_populator_4.py is in the same directory
try:
    from database_populator_4 import DatabaseManager, MatchStatus
except ImportError:
    print("Error: Could not import DatabaseManager from database_populator_4.py")
    print("Make sure database_populator_4.py is in the current directory.")
    sys.exit(1)

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class TestDatabaseManager:
    """
    Test harness for DatabaseManager, focusing on store_identifiers method.
    """
    
    def __init__(self, db_path: str = 'test_scivalidate.db'):
        """Initialize with path to test database."""
        self.db_path = db_path
        # Remove existing test database if it exists
        if os.path.exists(db_path):
            os.remove(db_path)
        
        # Create a new test database manager
        self.db_manager = DatabaseManager(db_path, initialize_tables=True)
        
        # Initialize test cases
        self.test_cases = []
        self.conn = sqlite3.connect(db_path)
        self.conn.row_factory = sqlite3.Row
        
    def load_test_cases(self, test_file: Optional[str] = None):
        """
        Load test cases from a JSON file or use default test cases.
        
        Args:
            test_file: Path to JSON file with test cases (optional)
        """
        if test_file and os.path.exists(test_file):
            try:
                with open(test_file, 'r') as f:
                    self.test_cases = json.load(f)
                logger.info(f"Loaded {len(self.test_cases)} test cases from {test_file}")
            except json.JSONDecodeError:
                logger.error(f"Error parsing test file {test_file}. Using default test cases.")
                self.test_cases = self._get_default_test_cases()
        else:
            logger.info("Using default test cases")
            self.test_cases = self._get_default_test_cases()
    
    def _get_default_test_cases(self) -> List[Dict]:
        """
        Generate default test cases for common scenarios.
        
        Returns:
            List of test case dictionaries
        """
        # Test case 1: Basic ORCID conflict between abbreviated name and faculty member
        # (Montelione case)
        case1 = {
            "name": "Montelione Case",
            "steps": [
                {
                    "action": "create_author",
                    "data": {
                        "given_name": "G.T.",
                        "family_name": "Montelione",
                        "institution": "Rensselaer Polytechnic Institute"
                    }
                },
                {
                    "action": "add_orcid",
                    "data": {
                        "orcid": "0000-0002-9440-3059"
                    }
                },
                {
                    "action": "add_publications",
                    "data": {
                        "count": 3
                    }
                },
                {
                    "action": "create_author",
                    "data": {
                        "given_name": "Gaetano",
                        "family_name": "Montelione",
                        "department": "Chemistry and Chemical Biology",
                        "institution": "Rensselaer Polytechnic Institute"
                    }
                },
                {
                    "action": "add_orcid",
                    "data": {
                        "orcid": "0000-0002-9440-3059",
                        "match_status": "EXACT_MATCH_WITH_INSTITUTION"
                    }
                },
                {
                    "action": "verify",
                    "data": {
                        "expect_single_record": True,
                        "expected_given_name": "Gaetano",
                        "verify_publications_transferred": True
                    }
                }
            ]
        }
        
        # Test case 2: ORCID conflict with complex foreign key relationships
        # (complex case with foreign key constraints)
        case2 = {
            "name": "Complex Foreign Key Case",
            "steps": [
                {
                    "action": "create_author",
                    "data": {
                        "given_name": "P.",
                        "family_name": "Dinolfo",
                        "institution": None
                    }
                },
                {
                    "action": "add_orcid",
                    "data": {
                        "orcid": "0000-0003-0153-0006"
                    }
                },
                {
                    "action": "add_publications",
                    "data": {
                        "count": 5
                    }
                },
                {
                    "action": "add_collaborations",
                    "data": {
                        "count": 2
                    }
                },
                {
                    "action": "add_field_expertise",
                    "data": {
                        "count": 2
                    }
                },
                {
                    "action": "create_author",
                    "data": {
                        "given_name": "Peter",
                        "family_name": "Dinolfo",
                        "department": "Chemistry and Chemical Biology",
                        "institution": "Rensselaer Polytechnic Institute"
                    }
                },
                {
                    "action": "add_orcid",
                    "data": {
                        "orcid": "0000-0003-0153-0006",
                        "match_status": "EXACT_MATCH_WITH_INSTITUTION"
                    }
                },
                {
                    "action": "verify",
                    "data": {
                        "expect_single_record": True,
                        "expected_given_name": "Peter",
                        "verify_publications_transferred": True,
                        "verify_collaborations_transferred": True
                    }
                }
            ]
        }
        
        # Test case 3: Multiple records with same name but different ORCIDs
        # (Jian Liu case)
        case3 = {
            "name": "Multiple Records Same Name Different ORCIDs",
            "steps": [
                {
                    "action": "create_author",
                    "data": {
                        "given_name": "Jian",
                        "family_name": "Liu",
                        "institution": "University of Science and Technology"
                    }
                },
                {
                    "action": "add_orcid",
                    "data": {
                        "orcid": "0000-0001-1111-1111"
                    }
                },
                {
                    "action": "create_author",
                    "data": {
                        "given_name": "Jian",
                        "family_name": "Liu",
                        "institution": "Harvard University"
                    }
                },
                {
                    "action": "add_orcid",
                    "data": {
                        "orcid": "0000-0002-2222-2222"
                    }
                },
                {
                    "action": "verify",
                    "data": {
                        "expect_multiple_records": True,
                        "expected_count": 2
                    }
                }
            ]
        }
        
        # Test case 4: Edge case - adding a faculty record first, then coauthor
        case4 = {
            "name": "Faculty First, Coauthor Second",
            "steps": [
                {
                    "action": "create_author",
                    "data": {
                        "given_name": "James",
                        "family_name": "Smith",
                        "department": "Physics",
                        "institution": "Rensselaer Polytechnic Institute"
                    }
                },
                {
                    "action": "add_orcid",
                    "data": {
                        "orcid": "0000-0001-5555-5555",
                        "match_status": "EXACT_MATCH_DISTINCTIVE"
                    }
                },
                {
                    "action": "create_author",
                    "data": {
                        "given_name": "J.",
                        "family_name": "Smith",
                        "institution": "Rensselaer Polytechnic Institute"
                    }
                },
                {
                    "action": "add_orcid",
                    "data": {
                        "orcid": "0000-0001-5555-5555"
                    }
                },
                {
                    "action": "verify",
                    "data": {
                        "expect_single_record": True,
                        "expected_given_name": "James"
                    }
                }
            ]
        }
        
        return [case1, case2, case3, case4]
    
    def run_tests(self):
        """
        Run all test cases and report results.
        """
        results = {
            "passed": 0,
            "failed": 0,
            "total": len(self.test_cases)
        }
        
        for i, case in enumerate(self.test_cases):
            logger.info(f"\n========== Running Test Case {i+1}: {case['name']} ==========")
            
            try:
                self._run_test_case(case)
                logger.info(f"✅ Test case {i+1} PASSED")
                results["passed"] += 1
            except Exception as e:
                logger.error(f"❌ Test case {i+1} FAILED: {str(e)}")
                results["failed"] += 1
        
        # Report overall results
        logger.info("\n========== Test Results ==========")
        logger.info(f"Total tests: {results['total']}")
        logger.info(f"Passed: {results['passed']}")
        logger.info(f"Failed: {results['failed']}")
        
        return results["failed"] == 0
    
    def _run_test_case(self, case: Dict):
        """
        Run a single test case through its steps.
        
        Args:
            case: Test case dictionary
        """
        author_ids = {}  # Keep track of author IDs
        
        for step in case["steps"]:
            action = step["action"]
            data = step["data"]
            
            if action == "create_author":
                author_id = self._create_test_author(data)
                # Store the author ID with the author's name for later reference
                key = f"{data['given_name']}_{data['family_name']}"
                author_ids[key] = author_id
                logger.info(f"Created author {data['given_name']} {data['family_name']} with ID {author_id}")
            
            elif action == "add_orcid":
                # Use the most recently created author if not specified
                author_id = data.get("author_id", list(author_ids.values())[-1])
                match_status = None
                
                if "match_status" in data:
                    match_status = getattr(MatchStatus, data["match_status"])
                self.db_manager.store_identifiers(
                    author_id,
                    data["orcid"],
                    data.get("email"),
                    match_status
                )
                logger.info(f"Added ORCID {data['orcid']} to author {author_id}")
            
            elif action == "add_publications":
                author_id = data.get("author_id", list(author_ids.values())[-1])
                self._add_test_publications(author_id, data["count"])
                logger.info(f"Added {data['count']} publications to author {author_id}")
            
            elif action == "add_collaborations":
                author_id = data.get("author_id", list(author_ids.values())[-1])
                self._add_test_collaborations(author_id, data["count"])
                logger.info(f"Added {data['count']} collaborations to author {author_id}")
            
            elif action == "add_field_expertise":
                author_id = data.get("author_id", list(author_ids.values())[-1])
                self._add_test_field_expertise(author_id, data["count"])
                logger.info(f"Added {data['count']} field expertise records to author {author_id}")
            
            elif action == "verify":
                self._verify_results(data)
                logger.info("Verification passed")
    
    def _create_test_author(self, author_data):
        """
        Create a new author in the database if they don't already exist.
        """
        existing_author = self.conn.execute("""
            SELECT id FROM authors 
            WHERE given_name = ? AND family_name = ?
        """, (author_data['given_name'], author_data['family_name'])).fetchone()
        
        if existing_author:
            logging.info(f"Author {author_data['given_name']} {author_data['family_name']} already exists with ID {existing_author['id']}")
            return existing_author['id']
        
        # If not found, create a new author
        author_id = str(uuid.uuid4())
        with self.conn:
            self.conn.execute("""
                INSERT INTO authors (id, given_name, family_name, created_at) 
                VALUES (?, ?, ?, ?)
            """, (author_id, author_data['given_name'], author_data['family_name'], datetime.now().isoformat()))
        
        logging.info(f"Created author {author_data['given_name']} {author_data['family_name']} with ID {author_id}")
        return author_id

    
    def _add_test_publications(self, author_id: str, count: int):
        """
        Add test publications for an author.
        
        Args:
            author_id: Author ID
            count: Number of publications to add
        """
        with self.db_manager.conn:
            for i in range(count):
                # Create a publication
                pub_id = f"pub_{author_id}_{i}"
                self.db_manager.conn.execute("""
                    INSERT INTO publications (
                        id, title, publication_year, citation_count, updated_at
                    ) VALUES (?, ?, ?, ?, ?)
                """, (
                    pub_id,
                    f"Test Publication {i+1}",
                    2020 + i,
                    10 * (i+1),
                    datetime.now().isoformat()
                ))
                
                # Link the author to the publication
                self.db_manager.conn.execute("""
                    INSERT INTO author_publications (
                        author_id, publication_id, author_position, contribution_type, created_at
                    ) VALUES (?, ?, ?, ?, ?)
                """, (
                    author_id,
                    pub_id,
                    1,
                    'contributing',
                    datetime.now().isoformat()
                ))
    
    def _add_test_collaborations(self, author_id: str, count: int):
        """
        Add test collaborations for an author.
        
        Args:
            author_id: Author ID
            count: Number of collaborations to add
        """
        with self.db_manager.conn:
            for i in range(count):
                # Create a collaborator
                collab_id = f"collab_{author_id}_{i}"
                self.db_manager.conn.execute("""
                    INSERT INTO authors (
                        id, given_name, family_name, updated_at
                    ) VALUES (?, ?, ?, ?)
                """, (
                    collab_id,
                    f"Collaborator{i+1}",
                    f"LastName{i+1}",
                    datetime.now().isoformat()
                ))
                
                # Add the collaboration
                self.db_manager.conn.execute("""
                    INSERT INTO author_collaborations (
                        author1_id, author2_id, collaboration_count,
                        first_collaboration, last_collaboration,
                        created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    min(author_id, collab_id),
                    max(author_id, collab_id),
                    i+1,
                    2020,
                    2023,
                    datetime.now().isoformat(),
                    datetime.now().isoformat()
                ))
    
    def _add_test_field_expertise(self, author_id: str, count: int):
        """
        Add test field expertise records for an author.
        
        Args:
            author_id: Author ID
            count: Number of field expertise records to add
        """
        with self.db_manager.conn:
            for i in range(count):
                # Create a field
                field_id = f"field_{i}"
                try:
                    self.db_manager.conn.execute("""
                        INSERT INTO fields (
                            id, name, updated_at
                        ) VALUES (?, ?, ?)
                    """, (
                        field_id,
                        f"Test Field {i+1}",
                        datetime.now().isoformat()
                    ))
                except sqlite3.IntegrityError:
                    # Field might already exist
                    pass
                
                # Add expertise in this field
                self.db_manager.conn.execute("""
                    INSERT OR REPLACE INTO author_fields (
                        author_id, field_id, expertise_score, last_calculated
                    ) VALUES (?, ?, ?, ?)
                """, (
                    author_id,
                    field_id,
                    0.5 + (i * 0.1),
                    datetime.now().isoformat()
                ))
    
    def _verify_results(self, data: Dict):
        """
        Verify test results according to expectations.
        
        Args:
            data: Verification data dictionary
        """
        if data.get("expect_single_record", False):
            # Verify that there's a single record for this author
            family_name = data.get("expected_family_name")
            given_name = data.get("expected_given_name")
            
            query = """
                SELECT COUNT(*) as count 
                FROM authors
                WHERE 1=1
            """
            params = []
            
            if family_name:
                query += " AND family_name = ?"
                params.append(family_name)
            
            result = self.db_manager.conn.execute(query, params).fetchone()
            
            if result["count"] != 1:
                raise AssertionError(f"Expected 1 record, found {result['count']}")
            
            # If given name is specified, verify it
            if given_name:
                result = self.db_manager.conn.execute("""
                    SELECT given_name FROM authors WHERE family_name = ?
                """, (family_name,)).fetchone()
                
                if result["given_name"] != given_name:
                    raise AssertionError(f"Expected given name '{given_name}', found '{result['given_name']}'")
        
        elif data.get("expect_multiple_records", False):
            # Verify that there are multiple records
            expected_count = data.get("expected_count", 0)
            family_name = data.get("family_name")
            
            query = "SELECT COUNT(*) as count FROM authors"
            params = []
            
            if family_name:
                query += " WHERE family_name = ?"
                params.append(family_name)
            
            result = self.db_manager.conn.execute(query, params).fetchone()
            
            if expected_count > 0 and result["count"] != expected_count:
                raise AssertionError(f"Expected {expected_count} records, found {result['count']}")
            elif result["count"] <= 1:
                raise AssertionError(f"Expected multiple records, found {result['count']}")
        
        # Verify that publications were transferred if requested
        if data.get("verify_publications_transferred", False):
            author_id = self.db_manager.conn.execute("""
                SELECT id FROM authors WHERE given_name = ?
            """, (data["expected_given_name"],)).fetchone()["id"]
            
            pub_count = self.db_manager.conn.execute("""
                SELECT COUNT(*) as count FROM author_publications WHERE author_id = ?
            """, (author_id,)).fetchone()["count"]
            
            if pub_count == 0:
                raise AssertionError("Publications were not transferred correctly")
        
        # Verify that collaborations were transferred if requested
        if data.get("verify_collaborations_transferred", False):
            author_id = self.db_manager.conn.execute("""
                SELECT id FROM authors WHERE given_name = ?
            """, (data["expected_given_name"],)).fetchone()["id"]
            
            collab_count = self.db_manager.conn.execute("""
                SELECT COUNT(*) as count FROM author_collaborations 
                WHERE author1_id = ? OR author2_id = ?
            """, (author_id, author_id)).fetchone()["count"]
            
            if collab_count == 0:
                raise AssertionError("Collaborations were not transferred correctly")


def main():
    """
    Main function to run the tests.
    """
    # Check if a test file was provided
    test_file = None
    if len(sys.argv) > 1:
        test_file = sys.argv[1]
    
    # Create and run the test manager
    test_manager = TestDatabaseManager()
    test_manager.load_test_cases(test_file)
    success = test_manager.run_tests()
    
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())