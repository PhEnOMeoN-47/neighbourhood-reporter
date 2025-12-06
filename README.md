# Neighbourhood Reporter

Neighbourhood Reporter is a full-stack web application that allows users to report and track real-world neighbourhood issues such as potholes, garbage accumulation, broken streetlights, and safety concerns.

Reported issues are displayed on an interactive map, making them easy to visualize and manage. The platform supports authentication, admin-controlled issue resolution, dark mode, and a mobile-responsive interface.

## Live Demo

- Frontend: To be added after deployment
- Backend API: To be added after deployment

## Features

### User Features
- Google OAuth authentication
- Report neighbourhood issues with:
  - Title
  - Description
  - Category
  - Location (GPS-based or manual entry)
- View reported issues on an interactive map
- Track issue status:
  - Open
  - In Progress
  - Resolved
- Light and dark mode support
- Fully responsive user interface for desktop and mobile

### Admin Features
- View all reported issues
- Update issue status
- Manage reports through the dashboard

## Screenshots

### Desktop View
- Dashboard with interactive map
  
<img width="1440" height="900" alt="image" src="https://github.com/user-attachments/assets/5058991e-5711-41eb-bf77-87f4eecc559c" />

- Issue reporting form
  
<img width="1440" height="900" alt="image" src="https://github.com/user-attachments/assets/8c426c08-2be5-4fcb-9aa2-a0f94fa23598" />

- Dark mode enabled interface
  
<img width="1440" height="900" alt="image" src="https://github.com/user-attachments/assets/d062c1d9-020f-404f-a47d-355d372bd32d" />


### Mobile View
- Responsive dashboard layout

<img width="398" height="732" alt="image" src="https://github.com/user-attachments/assets/700b179e-8f82-4fdf-a2a2-d314889de5c4" />

- Optimised map height for small screen
  
<img width="419" height="747" alt="image" src="https://github.com/user-attachments/assets/65aeab71-66d2-4539-98b7-5f845bfb54cf" />

- Touch-friendly forms and controls
  
<img width="415" height="746" alt="image" src="https://github.com/user-attachments/assets/0bf61893-e91c-4ec0-8f9d-e726056e14e0" />


Screenshots will be added after deployment.

## Tech Stack

### Frontend
- Next.js (App Router)
- React
- Leaflet.js
- CSS (styled JSX and media queries)

### Backend
- Node.js
- Express.js
- PostgreSQL
- Passport.js (Google OAuth)

### Deployment
- Vercel (Frontend) 
- Render (Backend)  

## Mobile Responsiveness

The application has been optimised for mobile devices:
- Responsive layouts across screen sizes
- Touch-friendly input fields and buttons
- Adaptive map height for small screens
- No horizontal scrolling issues

## Dark Mode

- Toggle between light and dark themes
- Theme preference persisted using local storage
- Consistent theming across the application

## Local Development Setup

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- Google OAuth credentials

### Frontend Setup
- cd web
- npm install
- npm run dev

### Backend Setup
- cd server
- npm install
- npm start


### Environment Variables
- Google OAuth client ID and secret
- Database connection string
- Frontend and backend base URLs

## Project Structure

- /server – Backend API
- /web – Frontend (Next.js)
- /docs – Design documents and architecture diagrams

## Future Improvements

- Image uploads for issue reports
- User profiles with report history
- Filtering reports by proximity
- Notifications for status updates
- Role-based admin management

## Author

Anshul Kumar

Built as a portfolio project to demonstrate full-stack development, authentication, map integration, and responsive UI design.
