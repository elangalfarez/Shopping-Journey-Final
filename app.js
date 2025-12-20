// app.js — cPanel Passenger entry point
// This file is the entry point that cPanel's Passenger expects

// Set production environment before requiring anything
process.env.NODE_ENV = 'production';

// Start the server
require('./server.js');
