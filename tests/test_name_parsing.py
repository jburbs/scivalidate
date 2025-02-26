"""
Unit tests for the name parsing functionality in the database manager.

These tests verify that the academic name parsing functions correctly
handle various name formats and edge cases.
"""

import sys
import os
import unittest
from pathlib import Path

# Add the src directory to the Python path
sys.path.append(str(Path(__file__).parent.parent / 'src'))

# Import the module to test
from database.database_populator_4 import DatabaseManager

class TestNameParsing(unittest.TestCase):
    """Test cases for the parse_academic_name function."""
    
    def setUp(self):
        """Set up a DatabaseManager instance for testing."""
        # Use an in-memory SQLite database for testing
        self.db_manager = DatabaseManager(":memory:")
    
    def test_standard_name(self):
        """Test parsing of a standard two-part name."""
        result = self.db_manager.parse_academic_name("John Smith")
        self.assertEqual(result['given_name'], "John")
        self.assertEqual(result['family_name'], "Smith")
        self.assertIsNone(result['middle_names'])
        self.assertIsNone(result['name_suffix'])
    
    def test_name_with_middle(self):
        """Test parsing of a name with a middle name."""
        result = self.db_manager.parse_academic_name("John Alan Smith")
        self.assertEqual(result['given_name'], "John")
        self.assertEqual(result['family_name'], "Smith")
        self.assertEqual(result['middle_names'], "Alan")
        self.assertIsNone(result['name_suffix'])
    
    def test_name_with_multiple_middles(self):
        """Test parsing of a name with multiple middle names."""
        result = self.db_manager.parse_academic_name("John Alan Robert Smith")
        self.assertEqual(result['given_name'], "John")
        self.assertEqual(result['family_name'], "Smith")
        self.assertEqual(result['middle_names'], "Alan Robert")
        self.assertIsNone(result['name_suffix'])
    
    def test_name_with_suffix(self):
        """Test parsing of a name with a suffix."""
        result = self.db_manager.parse_academic_name("John Smith Jr")
        self.assertEqual(result['given_name'], "John")
        self.assertEqual(result['family_name'], "Smith")
        self.assertIsNone(result['middle_names'])
        self.assertEqual(result['name_suffix'], "Jr")
    
    def test_name_with_middle_and_suffix(self):
        """Test parsing of a name with both middle name and suffix."""
        result = self.db_manager.parse_academic_name("John Alan Smith Jr")
        self.assertEqual(result['given_name'], "John")
        self.assertEqual(result['family_name'], "Smith")
        self.assertEqual(result['middle_names'], "Alan")
        self.assertEqual(result['name_suffix'], "Jr")
    
    def test_single_word_name(self):
        """Test parsing of a single-word name."""
        result = self.db_manager.parse_academic_name("Aristotle")
        self.assertEqual(result['given_name'], "Aristotle")
        self.assertEqual(result['family_name'], "Aristotle")
        self.assertIsNone(result['middle_names'])
        self.assertIsNone(result['name_suffix'])
    
    def test_name_with_extra_spaces(self):
        """Test parsing of a name with extra whitespace."""
        result = self.db_manager.parse_academic_name("  John    Smith  ")
        self.assertEqual(result['given_name'], "John")
        self.assertEqual(result['family_name'], "Smith")
        self.assertIsNone(result['middle_names'])
        self.assertIsNone(result['name_suffix'])
    
    def test_roman_numeral_suffix(self):
        """Test parsing of a name with a Roman numeral suffix."""
        result = self.db_manager.parse_academic_name("John Smith III")
        self.assertEqual(result['given_name'], "John")
        self.assertEqual(result['family_name'], "Smith")
        self.assertIsNone(result['middle_names'])
        self.assertEqual(result['name_suffix'], "III")
    
    def test_sr_suffix(self):
        """Test parsing of a name with 'Sr' suffix."""
        result = self.db_manager.parse_academic_name("John Smith Sr")
        self.assertEqual(result['given_name'], "John")
        self.assertEqual(result['family_name'], "Smith")
        self.assertIsNone(result['middle_names'])
        self.assertEqual(result['name_suffix'], "Sr")
    
    def test_hyphenated_last_name(self):
        """Test parsing of a name with a hyphenated last name."""
        # Note: Hyphenated last names are treated as single last names
        result = self.db_manager.parse_academic_name("Maria Garcia-Rodriguez")
        self.assertEqual(result['given_name'], "Maria")
        self.assertEqual(result['family_name'], "Garcia-Rodriguez")
        self.assertIsNone(result['middle_names'])
        self.assertIsNone(result['name_suffix'])

if __name__ == '__main__':
    unittest.main()