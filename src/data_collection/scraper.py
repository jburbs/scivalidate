"""
Faculty information scraper for the SciValidate system.

This module provides functions to scrape faculty information from department websites,
with a specific implementation for RPI's Chemistry department. The scraper:

1. Extracts basic faculty information (name, position, etc.)
2. Follows profile links to gather additional details
3. Attempts to locate email addresses through various strategies
4. Organizes faculty by category (core, affiliated, emeritus)

The resulting data serves as the initial seed for the SciValidate system,
which will then enrich this data with publication history, collaboration
networks, and expertise metrics.

Usage:
    python scraper.py

Output:
    Creates a JSON file with structured faculty information
"""

import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime
import hashlib
import time
import re

def scrape_rpi_chemistry():
    """
    Scrape faculty information from the RPI Chemistry department website.
    
    This function:
    1. Fetches the department's people page
    2. Parses the HTML to extract faculty listings
    3. Processes each faculty category (core, affiliated, emeritus)
    4. Visits individual profile pages to extract emails
    5. Generates unique identifiers for each faculty member
    6. Saves all data to a structured JSON file
    
    Returns:
        dict: The complete faculty data structure or None if error occurs
    """
    # The department's people page URL
    url = "https://chemistry.rpi.edu/people"
    base_url = "https://chemistry.rpi.edu"
    
    try:
        # Fetch the main people page
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for HTTP errors
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Initialize structure to hold faculty data by category
        faculty_data = {
            "core_faculty": [],
            "affiliated_faculty": [],
            "emeritus": []
        }
        
        # Process each faculty section on the page
        for section in ['faculty', 'affiliated-faculty', 'emeritus']:
            # Find the section header anchor
            section_elem = soup.find('a', {'id': section})
            
            # Check if section and content exist
            if section_elem and section_elem.find_next('div', class_='view-content'):
                # Find all faculty profile cards in this section
                faculty_cards = section_elem.find_next('div', class_='view-content').find_all('div', class_='profile-card')
                
                # Process each faculty card
                for card in faculty_cards:
                    try:
                        # Extract basic information from the card
                        name = card.find('div', class_='profile-card-name').text.strip()
                        position = card.find('div', class_='profile-card-text').text.strip()
                        
                        # Get profile URL for detailed information
                        profile_link = card.find('a')
                        profile_url = profile_link['href'] if profile_link else None
                        
                        # Get profile image URL
                        img = card.find('img')
                        image_url = img['src'] if img else None
                        
                        # Create unique identifier based on name and position
                        # This provides a stable ID even if the order changes
                        identifier = hashlib.sha256(f"{name}:{position}".encode()).hexdigest()
                        
                        # Create faculty information dictionary
                        faculty_info = {
                            "id": identifier,
                            "name": name,
                            "position": position,
                            "profile_url": profile_url,
                            "image_url": image_url,
                            "scrape_date": datetime.now().isoformat(),
                            "department": "Chemistry and Chemical Biology",
                            "institution": "Rensselaer Polytechnic Institute"
                        }
                        
                        # Visit individual profile page to extract email if available
                        if profile_url:
                            # Make sure we have a full URL
                            full_profile_url = profile_url if profile_url.startswith('http') else f"{base_url}{profile_url}"
                            email = scrape_faculty_email(full_profile_url, name)
                            
                            if email:
                                faculty_info["email"] = email
                                print(f"Found email for {name}: {email}")
                            else:
                                print(f"No email found for {name}")
                            
                            # Be respectful with request rate
                            time.sleep(1)
                        
                        # Add to appropriate section based on faculty type
                        if section == 'faculty':
                            faculty_data["core_faculty"].append(faculty_info)
                        elif section == 'affiliated-faculty':
                            faculty_data["affiliated_faculty"].append(faculty_info)
                        elif section == 'emeritus':
                            faculty_data["emeritus"].append(faculty_info)
                            
                    except AttributeError as e:
                        print(f"Error processing faculty member: {e}")
                        continue
        
        # Save to JSON file
        output_file = "faculty_data_emails.json"
        with open(output_file, 'w') as f:
            json.dump(faculty_data, f, indent=2)
            
        print(f"Data saved to {output_file}")
        return faculty_data
        
    except requests.RequestException as e:
        print(f"Error fetching webpage: {e}")
        return None

def scrape_faculty_email(profile_url, faculty_name):
    """
    Scrape faculty email from their profile page.
    
    This function uses several strategies to find email addresses:
    1. Look for mailto links
    2. Search for text patterns like "Email: username@rpi.edu"
    3. Scan for any text that matches email patterns
    4. As a fallback, construct likely email based on RPI's typical format
    
    Args:
        profile_url: URL of the faculty profile page
        faculty_name: Name of the faculty member (for constructing emails)
        
    Returns:
        str: Email address if found, None otherwise
    """
    try:
        # Fetch the profile page
        response = requests.get(profile_url)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Look for email in contact information
        email = None
        
        # Method 1: Look for mailto links (most reliable)
        mailto_links = soup.select('a[href^="mailto:"]')
        if mailto_links:
            email = mailto_links[0]['href'].replace('mailto:', '')
            return email
        
        # Method 2: Look for text like "Email: username@rpi.edu"
        contact_sections = soup.find_all(['div', 'p'], text=re.compile(r'Email', re.IGNORECASE))
        for section in contact_sections:
            # Use regex to extract email pattern
            email_match = re.search(r'[\w.+-]+@[\w-]+\.[\w.-]+', section.text)
            if email_match:
                return email_match.group(0)
        
        # Method 3: Look for any text that resembles an RPI email
        # This is less precise but catches emails in unexpected locations
        email_pattern = re.compile(r'[\w.+-]+@rpi\.edu')
        for tag in soup.find_all(text=email_pattern):
            match = email_pattern.search(tag)
            if match:
                return match.group(0)
        
        # Method 4: Construct likely email from name pattern as a fallback
        # This creates educated guesses based on RPI's typical email format
        if not email and faculty_name:
            name_parts = faculty_name.split()
            if len(name_parts) >= 2:
                firstname = name_parts[0].lower()
                lastname = name_parts[-1].lower()
                
                # Construct two common RPI email formats:
                # 1. First initial + lastname@rpi.edu (most common)
                # 2. firstname.lastname@rpi.edu (less common but used)
                email1 = f"{firstname[0]}{lastname}@rpi.edu"
                email2 = f"{firstname}.{lastname}@rpi.edu"
                
                # Mark as constructed to indicate it's an educated guess
                return f"{email1} (constructed)"
        
        return None
        
    except requests.RequestException as e:
        print(f"Error fetching profile page for {faculty_name}: {e}")
        return None

if __name__ == "__main__":
    """
    Main execution block when script is run directly.
    
    Calls the scraper function and prints a summary of the results,
    including counts of faculty in each category and how many emails
    were successfully found.
    """
    # Run the main scraper function
    faculty_data = scrape_rpi_chemistry()
    
    # If successful, print a summary of the results
    if faculty_data:
        print("\nSummary:")
        print(f"Core Faculty: {len(faculty_data['core_faculty'])}")
        print(f"Affiliated Faculty: {len(faculty_data['affiliated_faculty'])}")
        print(f"Emeritus: {len(faculty_data['emeritus'])}")
        
        # Calculate and display email coverage statistics
        email_count = sum(1 for category in faculty_data.values() 
                          for faculty in category if "email" in faculty)
        total_faculty = sum(len(category) for category in faculty_data.values())
        
        print(f"Faculty with emails: {email_count} out of {total_faculty} ({email_count/total_faculty:.1%})")            