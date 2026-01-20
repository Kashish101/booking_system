# booking_system
Home Services Marketplace - Booking Lifecycle System

## Overview
This project is a **home services booking system** that manages the **booking lifecycle**.  
It allows creating bookings, assigning providers, accepting/rejecting bookings, completing/cancelling bookings, retrying failed bookings, and performing **admin overrides**.  

The focus is on **state management, lifecycle transitions, and edge case handling**

## Features

- Create a booking (`PENDING`)
- Assign a provider (`ASSIGNED`)
- Provider actions:
  - Accept (`IN_PROGRESS`)
  - Reject (`FAILED`)
  - Complete (`COMPLETED`)
  - Cancel (`CANCELLED`)
  - Retry failed bookings (`PENDING`)
- Admin override to force any booking status
- Booking history with timestamps
- Status badges for easy visualization


## Design Decisions

- **In-memory storage:** Simple and fast for demonstration. Data resets on server restart.  
- **Centralized status constants:** Avoid typos and manage all booking states consistently.  
- **History logging:** Tracks every state change with timestamps.  
- **Admin override:** Allows testing of edge cases easily.  
- **Frontend simplicity:** Focused on clarity and visualization of states.

## Project Structure

home-services-marketplace/
│
├─ server.js # Backend (Node + Express)
├─ package.json # Node dependencies
├─ src/
│ ├─ App.js # React frontend
│ └─ App.css # Styles
├─ public/
│ └─ index.html # HTML entry
└─ README.md

## How to Run
### Backend
1. Install dependencies:
   npm install express cors uuid
2. Start the server
   node server.js
3. Backend runs at http://localhost:5000

### Frontend
1. Ensure React app is set-up (using create-react-app)
2. Install Axios and depencies
   npm insatll axios
3. Start the frontend:
   npm start
4. Open browser at http://localhost:3000

## Usage

-Create Booking: Enter customer name and service type → Click Create.
-Booking Actions: Assign, Accept, Reject, Complete, Cancel, Retry based on status.
-Admin Override: Force any booking to a desired status using admin buttons.
-History: Click History to view all past state changes with timestamps.
