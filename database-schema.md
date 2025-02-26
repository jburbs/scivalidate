# SciValidate Database Schema

This document outlines the database schema used in the SciValidate system. Understanding this schema is essential for contributors working on database operations, analysis tools, or integrations.

## Overview

The SciValidate database is implemented as a SQLite database with a relational schema designed to capture:

1. Researcher identities and credentials
2. Publication metadata and relationships
3. Field classifications and expertise metrics
4. Collaboration networks
5. Reputation metrics

The schema uses foreign key constraints to maintain referential integrity between related tables.

## Core Tables

### `authors`

Stores core information about researchers.

| Column Name | Type | Description |
|-------------|------|-------------|
| `id` | TEXT | Primary key, UUID |
| `given_name` | TEXT | First name |
| `family_name` | TEXT | Last name |
| `middle_names` | TEXT | Middle names or initials (optional) |
| `name_suffix` | TEXT | Suffixes like Jr., Sr., etc. (optional) |
| `preferred_name` | TEXT | Preferred name if different (optional) |
| `display_name` | TEXT | Generated full name for display |
| `department` | TEXT | Academic department |
| `institution` | TEXT | Institution affiliation |
| `h_index` | INTEGER | Calculated h-index |
| `total_citations` | INTEGER | Total citation count |
| `created_at` | TIMESTAMP | Record creation timestamp |
| `updated_at` | TIMESTAMP | Record update timestamp |

### `author_identifiers`

Links authors to their external identifiers (ORCID, email, etc.).

| Column Name | Type | Description |
|-------------|------|-------------|
| `author_id` | TEXT | Foreign key to authors.id |
| `identifier_type` | TEXT | Type of identifier (orcid, email, etc.) |
| `identifier_value` | TEXT | The identifier value |
| `confidence_score` | REAL | Confidence in identifier match (0-1) |
| `verification_status` | TEXT | Verification state |
| `verified_at` | TIMESTAMP | When verification occurred |
| `verification_method` | TEXT | How verification was performed |
| `created_at` | TIMESTAMP | Record creation timestamp |

### `publications`

Stores publication metadata.

| Column Name | Type | Description |
|-------------|------|-------------|
| `id` | TEXT | Primary key, UUID |
| `title` | TEXT | Publication title |
| `venue_id` | TEXT | Foreign key to publication_venues.id |
| `publication_year` | INTEGER | Year published |
| `doi` | TEXT | Digital Object Identifier |
| `type` | TEXT | Publication type (article, book, etc.) |
| `citation_count` | INTEGER | Number of citations |
| `abstract` | TEXT | Publication abstract |
| `keywords` | TEXT | JSON array of keywords/concepts |
| `created_at` | TIMESTAMP | Record creation timestamp |
| `updated_at` | TIMESTAMP | Record update timestamp |

### `publication_venues`

Information about journals, conferences, and other publication venues.

| Column Name | Type | Description |
|-------------|------|-------------|
| `id` | TEXT | Primary key, UUID |
| `display_name` | TEXT | Venue name |
| `type` | TEXT | Venue type (journal, conference, etc.) |
| `impact_factor` | REAL | Impact factor or similar metric |
| `h_index` | INTEGER | Venue h-index |
| `subjects` | TEXT | JSON array of subject areas |
| `created_at` | TIMESTAMP | Record creation timestamp |
| `updated_at` | TIMESTAMP | Record update timestamp |

### `author_publications`

Links authors to their publications with relationship metadata.

| Column Name | Type | Description |
|-------------|------|-------------|
| `author_id` | TEXT | Foreign key to authors.id |
| `publication_id` | TEXT | Foreign key to publications.id |
| `author_position` | INTEGER | Position in author list |
| `contribution_type` | TEXT | Nature of contribution |
| `created_at` | TIMESTAMP | Record creation timestamp |

## Field Classification Tables

### `fields`

Defines academic fields and subfields.

| Column Name | Type | Description |
|-------------|------|-------------|
| `id` | TEXT | Primary key, UUID |
| `name` | TEXT | Field name |
| `parent_field_id` | TEXT | Foreign key to parent field |
| `description` | TEXT | Field description |
| `created_at` | TIMESTAMP | Record creation timestamp |
| `updated_at` | TIMESTAMP | Record update timestamp |

### `field_keywords`

Keywords associated with specific fields.

| Column Name | Type | Description |
|-------------|------|-------------|
| `field_id` | TEXT | Foreign key to fields.id |
| `keyword` | TEXT | Keyword text |
| `weight` | REAL | Keyword importance weight |
| `created_at` | TIMESTAMP | Record creation timestamp |

### `author_fields`

Links authors to their fields of expertise with metrics.

| Column Name | Type | Description |
|-------------|------|-------------|
| `author_id` | TEXT | Foreign key to authors.id |
| `field_id` | TEXT | Foreign key to fields.id |
| `expertise_score` | REAL | Calculated expertise score |
| `publication_count` | INTEGER | Publications in this field |
| `citation_count` | INTEGER | Citations in this field |
| `last_calculated` | TIMESTAMP | When score was last updated |
| `created_at` | TIMESTAMP | Record creation timestamp |
| `updated_at` | TIMESTAMP | Record update timestamp |

## Network Tables

### `author_collaborations`

Captures collaborative relationships between authors.

| Column Name | Type | Description |
|-------------|------|-------------|
| `author1_id` | TEXT | Foreign key to authors.id |
| `author2_id` | TEXT | Foreign key to authors.id |
| `collaboration_count` | INTEGER | Number of collaborations |
| `first_collaboration` | INTEGER | Year of first collaboration |
| `last_collaboration` | INTEGER | Year of most recent collaboration |
| `created_at` | TIMESTAMP | Record creation timestamp |
| `updated_at` | TIMESTAMP | Record update timestamp |

## Indexing Strategy

The database employs several strategic indices to optimize common queries:

- Author name indices for efficient name searching
- Publication year and citation indices for impact ranking
- DOI index for rapid lookup by identifier
- Field and keyword indices for expertise matching

## Data Flow

The primary data flow through the schema is:

1. Authors are identified and stored with basic information
2. External identifiers (ORCID, etc.) are linked to authors
3. Publications are gathered and associated with venues
4. Author-publication relationships are established
5. Field classifications are applied based on publication content
6. Collaboration networks are derived from co-authorship
7. Expertise scores are calculated using field-specific metrics

## Extension Points

The schema is designed to be extensible in several ways:

1. Additional identifier types can be added to author_identifiers
2. New publication types can be introduced in the type field
3. The field hierarchy can be expanded with new parent-child relationships
4. Custom metrics can be stored in JSON fields for flexibility

## Implementation Notes

- Text fields containing structured data use JSON format for flexibility
- Timestamps use ISO 8601 format for interoperability
- UUID identifiers ensure global uniqueness
- Foreign key constraints enforce referential integrity

## Future Schema Enhancements

Planned enhancements to the schema include:

1. Verification history tracking
2. Endorsement networks between researchers
3. Fine-grained expertise topic modeling
4. Publication impact tracking over time
5. Integration with external validation services

Contributors should consider these planned enhancements when making schema modifications to ensure compatibility with future development.
