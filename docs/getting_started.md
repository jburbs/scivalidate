# Getting Started with SciValidate

This guide will walk you through the process of setting up and running the SciValidate codebase on your local machine. Whether you're interested in exploring the system, contributing to its development, or just understanding how it works, this guide will help you get started.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8+**: The core programming language used throughout the project
- **Git**: For version control and cloning the repository
- **SQLite**: Already included in Python, but make sure it's working properly

## Step 1: Clone the Repository

First, clone the SciValidate repository to your local machine:

```bash
git clone https://github.com/jburbs/scivalidate.git
cd scivalidate
```

## Step 2: Set Up a Virtual Environment

It's recommended to use a virtual environment to keep dependencies isolated:

```bash
# On macOS/Linux
python -m venv venv
source venv/bin/activate

# On Windows
python -m venv venv
venv\Scripts\activate
```

## Step 3: Install Dependencies

Install all required packages using pip:

```bash
pip install -r requirements.txt
```

## Step 4: Understand the Project Structure

SciValidate is organized into several core components:

- `src/database/`: Database models and management
- `src/analysis/`: Data analysis and expertise calculation
- `src/data_collection/`: Scraping and API integration
- `web/`: Future web interface components
- `docs/`: Project documentation
- `tests/`: Unit and integration tests

## Step 5: Running Your First Data Collection

Let's start by collecting some faculty data from RPI's Chemistry Department:

```bash
# Make sure you're in the project root directory
cd src/data_collection
python scraper.py
```

This will:

1. Scrape the department website
2. Extract faculty information
3. Save the data to `faculty_data_emails.json`
4. Print a summary of the collected data

## Step 6: Processing Researcher Data

Once you have the faculty data, you can process it to populate the database with researchers, publications, and expertise scores:

```bash
# Navigate to the analysis directory
cd ../analysis

# Run the faculty processing script
python process_faculty.py
```

This process will:

1. Connect to the ORCID API to verify researcher identities
2. Fetch publication data from OpenAlex
3. Calculate expertise scores across different fields
4. Build a collaboration network
5. Store all results in a SQLite database (`scivalidate.db`)

The process may take some time, as it makes multiple API requests with appropriate rate limiting.

## Step 7: Analyzing the Results

After processing the data, you can analyze the results using the author analyzer:

```bash
# Still in the analysis directory
python author_analyzer.py --db scivalidate.db
```

This will output:

1. Researcher reputation scores
2. Field expertise classifications
3. Publication keyword analysis
4. Network metrics

## Step 8: Exploring the Database

You can directly explore the SQLite database to see the structured data:

```bash
# Using the SQLite command line tool
sqlite3 scivalidate.db

# Some useful queries to try:
.tables
SELECT * FROM authors LIMIT 5;
SELECT a.display_name, COUNT(ap.publication_id) as pub_count
FROM authors a
JOIN author_publications ap ON a.id = ap.author_id
GROUP BY a.id
ORDER BY pub_count DESC;
```

## Step 9: Understanding the Code Structure

To contribute to the project, it's helpful to understand how the code is organized:

### Key Files and Their Purposes

- **database_populator_4.py**: Core data structures and database operations

  - `DatabaseManager`: Handles database connection and operations
  - `ResearcherProcessor`: Coordinates ORCID matching and data collection
  - `AcademicFieldManager`: Manages field classification

- **process_faculty.py**: Main script for populating the database

  - Loads faculty data and processes each researcher
  - Handles logging and error management
  - Orchestrates the overall processing workflow

- **author_analyzer.py**: Analysis and visualization of researcher data

  - Calculates reputation scores
  - Performs keyword analysis
  - Suggests field classifications
  - Analyzes collaboration networks

- **scraper.py**: Faculty data collection
  - Scrapes department websites
  - Extracts contact information
  - Formats data for processing

## Step 10: Running Tests

To ensure code quality, you can run the unit tests:

```bash
# Navigate to the project root
cd ../../

# Run the test suite
python -m unittest discover tests
```

This will run all test cases and report any failures.

## Next Steps

Now that you've got the basic system up and running, here are some ways to explore further:

1. **Analyze Different Departments**: Modify `scraper.py` to collect data from other academic departments

2. **Improve Classification**: Enhance the field classification system in `AcademicFieldManager`

3. **Visualize Networks**: Create visualizations of the collaboration networks using NetworkX and Matplotlib

4. **Extend Database Schema**: Add new tables or fields to capture additional researcher information

5. **Develop Verification Badges**: Start prototyping the visual verification badge system

## Troubleshooting Common Issues

### API Rate Limiting

If you encounter rate limiting issues with external APIs:

- Increase the delay between requests in `process_faculty.py`
- Consider implementing a caching mechanism
- Split processing into smaller batches

### Database Errors

If you encounter database errors:

- Check that the SQLite database file is not locked by another process
- Ensure you have write permissions in the directory
- Verify that foreign key constraints are not being violated

### Memory Issues

For large datasets:

- Process researchers in smaller batches
- Implement pagination for API requests
- Consider using a more powerful database backend

## Getting Help

If you encounter issues or have questions:

- Check the existing GitHub issues
- Review the detailed documentation in the `docs` directory
- Create a new issue with a clear description of your problem

We welcome your contributions to making SciValidate more robust and useful!
