#!/usr/bin/env python3
import sqlite3
import os
import logging
import argparse
from datetime import datetime

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger()

def cleanup_database(db_path, dry_run=True):
    """Clean up the database by removing orphaned and unused data."""
    initial_size = os.path.getsize(db_path)
    logger.info(f"Initial database size: {initial_size/1024/1024:.2f} MB")
    
    # Connect to database
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    
    # Get initial record counts
    c.execute("SELECT COUNT(*) FROM authors")
    initial_authors = c.fetchone()[0]
    
    c.execute("SELECT COUNT(*) FROM fields")
    initial_fields = c.fetchone()[0]
    
    c.execute("SELECT COUNT(*) FROM author_publications")
    initial_author_pubs = c.fetchone()[0]
    
    # Start cleaning
    logger.info("Starting database cleanup...")
    
    if not dry_run:
        # 1. Remove orphaned records
        logger.info("Removing orphaned records...")
        
        c.execute("DELETE FROM author_identifiers WHERE author_id NOT IN (SELECT id FROM authors)")
        orphaned_ids = c.rowcount
        logger.info(f"Removed {orphaned_ids} orphaned author identifiers")
        
        c.execute("""
            DELETE FROM author_publications 
            WHERE author_id NOT IN (SELECT id FROM authors)
            OR publication_id NOT IN (SELECT id FROM publications)
        """)
        orphaned_pubs = c.rowcount
        logger.info(f"Removed {orphaned_pubs} orphaned author publications")
        
        c.execute("""
            DELETE FROM author_fields
            WHERE author_id NOT IN (SELECT id FROM authors)
            OR field_id NOT IN (SELECT id FROM fields)
        """)
        orphaned_fields = c.rowcount
        logger.info(f"Removed {orphaned_fields} orphaned author fields")
        
        c.execute("""
            DELETE FROM author_collaborations
            WHERE author1_id NOT IN (SELECT id FROM authors)
            OR author2_id NOT IN (SELECT id FROM authors)
        """)
        orphaned_collabs = c.rowcount
        logger.info(f"Removed {orphaned_collabs} orphaned collaborations")
        
        # 2. Remove unused fields
        logger.info("Removing unused fields...")
        
        c.execute("""
            DELETE FROM field_keywords
            WHERE field_id IN (
                SELECT f.id FROM fields f
                LEFT JOIN author_fields af ON f.id = af.field_id
                WHERE af.author_id IS NULL
            )
        """)
        unused_keywords = c.rowcount
        
        c.execute("""
            DELETE FROM fields
            WHERE id NOT IN (SELECT DISTINCT field_id FROM author_fields)
        """)
        unused_fields = c.rowcount
        logger.info(f"Removed {unused_fields} unused fields with {unused_keywords} keywords")
        
        # 3. Remove authors without data
        logger.info("Removing authors without meaningful data...")
        
        c.execute("""
            DELETE FROM authors
            WHERE NOT EXISTS (
                SELECT 1 FROM author_publications WHERE author_id = authors.id
            ) AND NOT EXISTS (
                SELECT 1 FROM author_fields 
                WHERE author_id = authors.id AND expertise_score IS NOT NULL
            )
        """)
        unused_authors = c.rowcount
        logger.info(f"Removed {unused_authors} authors without meaningful data")
        
        # 4. Perform approved merges
        logger.info("Processing approved author merges...")
        
        c.execute("SELECT COUNT(*) FROM merge_candidates WHERE status = 'approved'")
        approved_merges = c.fetchone()[0]
        
        if approved_merges > 0:
            c.execute("""
                SELECT primary_author_id, secondary_author_id
                FROM merge_candidates
                WHERE status = 'approved'
            """)
            merges = c.fetchall()
            
            for merge in merges:
                primary_id = merge['primary_author_id']
                secondary_id = merge['secondary_author_id']
                
                # Transfer related data
                c.execute("UPDATE OR IGNORE author_identifiers SET author_id = ? WHERE author_id = ?", 
                          (primary_id, secondary_id))
                c.execute("UPDATE OR IGNORE author_publications SET author_id = ? WHERE author_id = ?", 
                          (primary_id, secondary_id))
                c.execute("UPDATE OR IGNORE author_fields SET author_id = ? WHERE author_id = ?", 
                          (primary_id, secondary_id))
                c.execute("UPDATE OR IGNORE author_collaborations SET author1_id = ? WHERE author1_id = ?", 
                          (primary_id, secondary_id))
                c.execute("UPDATE OR IGNORE author_collaborations SET author2_id = ? WHERE author2_id = ?", 
                          (primary_id, secondary_id))
                
                # Delete the secondary author
                c.execute("DELETE FROM authors WHERE id = ?", (secondary_id,))
                
                # Update merge status
                c.execute("""
                    UPDATE merge_candidates 
                    SET status = 'completed', resolved_at = CURRENT_TIMESTAMP
                    WHERE primary_author_id = ? AND secondary_author_id = ?
                """, (primary_id, secondary_id))
                
            logger.info(f"Processed {approved_merges} author merges")
        
        # Commit all changes
        conn.commit()
        
        # Run VACUUM to reclaim space
        logger.info("Running VACUUM to reclaim space...")
        c.execute("VACUUM")
        conn.commit()
    else:
        # Just count what would be removed in dry run
        c.execute("SELECT COUNT(*) FROM author_identifiers WHERE author_id NOT IN (SELECT id FROM authors)")
        orphaned_ids = c.fetchone()[0]
        
        c.execute("""
            SELECT COUNT(*) FROM author_publications 
            WHERE author_id NOT IN (SELECT id FROM authors)
            OR publication_id NOT IN (SELECT id FROM publications)
        """)
        orphaned_pubs = c.fetchone()[0]
        
        c.execute("""
            SELECT COUNT(*) FROM author_fields
            WHERE author_id NOT IN (SELECT id FROM authors)
            OR field_id NOT IN (SELECT id FROM fields)
        """)
        orphaned_fields = c.fetchone()[0]
        
        c.execute("""
            SELECT COUNT(*) FROM author_collaborations
            WHERE author1_id NOT IN (SELECT id FROM authors)
            OR author2_id NOT IN (SELECT id FROM authors)
        """)
        orphaned_collabs = c.fetchone()[0]
        
        c.execute("""
            SELECT COUNT(*) FROM fields
            WHERE id NOT IN (SELECT DISTINCT field_id FROM author_fields)
        """)
        unused_fields = c.fetchone()[0]
        
        c.execute("""
            SELECT COUNT(*) FROM authors
            WHERE NOT EXISTS (
                SELECT 1 FROM author_publications WHERE author_id = authors.id
            ) AND NOT EXISTS (
                SELECT 1 FROM author_fields 
                WHERE author_id = authors.id AND expertise_score IS NOT NULL
            )
        """)
        unused_authors = c.fetchone()[0]
        
        c.execute("SELECT COUNT(*) FROM merge_candidates WHERE status = 'approved'")
        approved_merges = c.fetchone()[0]
        
        logger.info(f"Would remove {orphaned_ids} orphaned author identifiers")
        logger.info(f"Would remove {orphaned_pubs} orphaned author publications")
        logger.info(f"Would remove {orphaned_fields} orphaned author fields")
        logger.info(f"Would remove {orphaned_collabs} orphaned collaborations")
        logger.info(f"Would remove {unused_fields} unused fields")
        logger.info(f"Would remove {unused_authors} authors without meaningful data")
        logger.info(f"Would process {approved_merges} author merges")
    
    # Get final record counts
    c.execute("SELECT COUNT(*) FROM authors")
    final_authors = c.fetchone()[0]
    
    c.execute("SELECT COUNT(*) FROM fields")
    final_fields = c.fetchone()[0]
    
    c.execute("SELECT COUNT(*) FROM author_publications")
    final_author_pubs = c.fetchone()[0]
    
    # Close connection
    conn.close()
    
    # Calculate final size
    final_size = os.path.getsize(db_path)
    size_diff = initial_size - final_size
    
    logger.info("\nCLEANUP SUMMARY:")
    logger.info(f"Authors: {initial_authors} → {final_authors} ({initial_authors - final_authors} removed)")
    logger.info(f"Fields: {initial_fields} → {final_fields} ({initial_fields - final_fields} removed)")
    logger.info(f"Author publications: {initial_author_pubs} → {final_author_pubs} ({initial_author_pubs - final_author_pubs} removed)")
    
    if size_diff > 0:
        logger.info(f"SPACE SAVED: {size_diff/1024/1024:.2f} MB ({size_diff/initial_size*100:.2f}%)")
        logger.info(f"Database size: {initial_size/1024/1024:.2f} MB → {final_size/1024/1024:.2f} MB")
    else:
        logger.info(f"Database size: {initial_size/1024/1024:.2f} MB → {final_size/1024/1024:.2f} MB (no space saved)")
    
    if dry_run:
        logger.info("DRY RUN: No changes were made to the database.")
    
    return {
        "initial_size_mb": round(initial_size/1024/1024, 2),
        "final_size_mb": round(final_size/1024/1024, 2),
        "space_saved_mb": round(size_diff/1024/1024, 2),
        "space_saved_percent": round(size_diff/initial_size*100, 2) if initial_size > 0 else 0,
        "records_removed": {
            "authors": initial_authors - final_authors,
            "fields": initial_fields - final_fields,
            "author_publications": initial_author_pubs - final_author_pubs
        }
    }

def main():
    parser = argparse.ArgumentParser(description="Simple database cleanup utility")
    parser.add_argument("--db", required=True, help="Path to SQLite database file")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be removed without making changes")
    
    args = parser.parse_args()
    
    if not os.path.exists(args.db):
        logger.error(f"Database file not found: {args.db}")
        return
    
    logger.info(f"Starting cleanup of {args.db}" + (" (dry run)" if args.dry_run else ""))
    cleanup_database(args.db, args.dry_run)

if __name__ == "__main__":
    main()