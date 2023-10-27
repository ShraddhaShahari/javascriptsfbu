// Import required Node.js modules
import * as dotenv from 'dotenv';  // Load environment variables from a .env file
import axios from 'axios';         // Axios for making HTTP requests
import qs from 'qs';               // Querystring module for URL parameter serialization

// Load environment variables from a .env file if present
dotenv.config();

// Define the URLs for FedEx authentication and tracking services
const url = {
    authUrl: "https://apis-sandbox.fedex.com/oauth/token", // URL for obtaining an access token
    trackUrl: "https://apis-sandbox.fedex.com/track/v1/trackingnumbers" // URL for tracking shipments
}

// Function to create a configuration object for FedEx authentication
export function getAuthConfig() {
    // Serialize data for authentication request
    let data = qs.stringify({
        'grant_type': process.env.grant_type, // OAuth grant type (e.g., client_credentials)
        'client_id': process.env.client_id,     // Client ID for FedEx API
        'client_secret': process.env.client_secret // Client secret for FedEx API
      });
      
      // Create the configuration object for the authentication request
      let authConfig = {
        method: 'post',             // HTTP POST method
        maxBodyLength: Infinity,    // Set the maximum body length to Infinity
        url: url.authUrl,           // URL for authentication
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded' // Request header for form-urlencoded data
        },
        data: data // Serialized data
      };

      return authConfig; // Return the authentication configuration
}

// Function to create a configuration object for FedEx tracking
export function getTrackingConfig(trackingNumber, access_token) {
    // Define the tracking request data
    let trackingData = {
        "trackingInfo": [
          {
            "trackingNumberInfo": {
              "trackingNumber": trackingNumber // Tracking number to query
            }
          }
        ],
        "includeDetailedScans": true
      };

      // Create the configuration object for the tracking request
      let trackingConfig = {
        method: 'post',             // HTTP POST method
        maxBodyLength: Infinity,    // Set the maximum body length to Infinity
        url: url.trackUrl,          // URL for tracking
        headers: { 
          'X-locale': 'en_US',     // Request header for locale (English, United States)
          'Content-Type': 'text/plain', // Request header for plain text content
          'authorization': 'Bearer ' + access_token // Authorization with the access token
        },
        data: trackingData // Tracking request data
      };
      
      return trackingConfig; // Return the tracking configuration
}


