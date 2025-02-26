"""
Main script for populating the SciValidate academic research database.

This script orchestrates the process of:
1. Loading faculty data from JSON
2. Processing each faculty member's information
3. Fetching their publications and ORCID identifiers
4. Building collaboration networks
5. Calculating expertise scores

The script is designed to be run as the primary entry point for 
database population. It handles logging, error management, and
rate limiting to ensure respectful use of external APIs.

Usage:
    python process_faculty.py

Dependencies:
    - database_populator_4.py for ResearcherProcessor and related classes
    - faculty_data.json containing researcher information
    - config.json for configuration parameters (optional)
    - fields.json for field classification (optional)
"""

import asyncio
import json
import logging
from pathlib import Path
import sys
sys.path.append(str(Path(__file__).parent.parent))

from database.database_populator_4 import (
    ResearcherProcessor,
    AcademicFieldManager,
)


async def main():
    """
    Main execution function that runs the faculty processing workflow.
    
    This asynchronous function:
    1. Sets up logging infrastructure
    2. Creates necessary directories
    3. Initializes database and configurations
    4. Processes each faculty member, handling errors gracefully
    5. Provides summary statistics of the processing results
    """
    # Set up logging with both file and console output
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler("app.log"),    # Save detailed logs to app.log
            logging.StreamHandler()            # Also print logs to terminal
        ]
    )
    logger = logging.getLogger(__name__)
    
    # Create necessary directories for data caching and storage
    logger.info("Creating necessary directories")
    Path('network_cache').mkdir(exist_ok=True)
    
    # Define file paths for database and configuration
    db_path = 'scivalidate.db'
    config_path = 'config.json'
    fields_path = 'fields.json'
    
    # Load faculty data from JSON file
    logger.info("Loading faculty data")
    with open('../data_collection/faculty_data_emails.json', 'r') as f:
        faculty_data = json.load(f)
    
    logger.info("Initializing database and configurations...")
    
    # Initialize processor with configurations
    processor = ResearcherProcessor(
        db_path=db_path,
        config_path=config_path
    )
    
    # Initialize field manager for expertise classification
    fields = AcademicFieldManager(processor.db, fields_path)
    
    # Process each faculty category and member
    async with processor:
        # Process different categories of faculty
        for category in ['core_faculty', 'affiliated_faculty', 'emeritus']:
            if category not in faculty_data:
                logger.info(f"Category {category} not found in faculty data")
                continue
                
            logger.info(f"\nProcessing {category}")
            logger.info("=" * 50)
            
            # Process each faculty member in the category
            success_count = 0
            failure_count = 0
            
            for faculty in faculty_data[category]:
                try:
                    logger.info(f"Processing {faculty['name']}")
                    author_id = await processor.process_researcher(faculty)
                    
                    if author_id:
                        logger.info(f"Successfully processed {faculty['name']}")
                        success_count += 1
                    else:
                        logger.warning(f"Failed to process {faculty['name']}")
                        failure_count += 1
                    
                    # Add delay to respect API rate limits
                    # This is important for ethical API usage
                    await asyncio.sleep(1)
                    
                except Exception as e:
                    logger.error(f"Error processing {faculty['name']}: {str(e)}")
                    failure_count += 1
                    continue
            
            logger.info(f"Category {category} complete. Success: {success_count}, Failure: {failure_count}")
    
    # Final success message
    logger.info("\nProcessing complete!")
    logger.info("You can now query the database or run analysis scripts to explore the data.")

if __name__ == "__main__":
    # Execute the main function using asyncio
    asyncio.run(main())