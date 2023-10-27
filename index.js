// Import required Node.js modules
import https from 'https';         // Module for handling HTTPS requests
import fs from 'fs';               // File system module for reading certificates
import express from 'express';     // Express.js framework for building web applications
import axios from 'axios';         // Axios for making HTTP requests
import bodyParser from 'body-parser'; // Middleware for parsing request bodies
import { getAuthConfig, getTrackingConfig } from './controller/controller.js'; // Import custom functions from controller module

// Define the port where the HTTPS server will run
const port = 8080;

// Configuration options for the HTTPS server
const httpsOptions = {
    key: fs.readFileSync('./key.pem'), // Read the private key from the file
    cert: fs.readFileSync('./cert.pem') // Read the SSL certificate from the file
}

// Create an Express application
const app = express();

// Create an HTTPS server using the provided options and the Express application
const server = https.createServer(httpsOptions, app);

// Use body-parser middleware to parse request bodies as URL-encoded or JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Define an HTTP POST endpoint '/postRequest'
app.post('/postRequest', (req, res) => {
    // Extract the request body from the HTTP request
    let body = req.body;

    // Check if the request body is valid
    if (body === undefined || body.orderNumber === undefined || typeof body.orderNumber !== 'number') {
        res.status(400); // Set response status to 'Bad Request'
        res.send("Error: Correct order number not found"); // Send an error response
    } else {
        // Extract the order number from the request body
        let trackingNumber = body.orderNumber;

        // Send a request to obtain an access bearer token using custom function 'getAuthConfig'
        axios.request(getAuthConfig())
        .then((response) => {
            if (response === undefined || response.data === undefined || response.data.access_token === undefined) {
                res.status(501); // Set response status to 'Not Implemented'
                res.send("Unable to generate access bearer token"); // Send an error response
            } else {
                // Send a request to obtain tracking information using custom function 'getTrackingConfig'
                axios.request(getTrackingConfig(trackingNumber, response.data.access_token))
                .then((trackingResponse) => {
                    // Send a response with tracking information
                    res.send("Tracking number is: " + trackingNumber + "\n" + "Status of your package is : " + trackingResponse.data.output.completeTrackResults[0].trackResults[0].latestStatusDetail.ancillaryDetails[0].reasonDescription);
                })
                .catch((error) => {
                    res.status(400); // Set response status to 'Bad Request'
                    res.send(error.response.data); // Send an error response
                });
            }
        })
        .catch((error) => {
            res.status(400); // Set response status to 'Bad Request'
            res.send("Error while authorizing: " + error); // Send an error response
        });
    }
});

// Start the HTTPS server and listen on the specified port
server.listen(port, () => {
    console.log('HTTPS is running on port ' + port + ''); // Output a message to the console
});
