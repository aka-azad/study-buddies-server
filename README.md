# Study Buddies Server

**Purpose**:
This server is designed to support the Study Buddies web application, which facilitates online group study with friends. The server handles user authentication, assignment management, and submission tracking.

**Live URL**:
[Study Buddies Server](https://study-buddies-by-ashraf.web.app)

## Key Features

- **User Authentication**: Utilizes JWT for secure user login and logout.
- **Assignment Management**: Supports creating, reading, updating, and deleting assignments.
- **Submission Tracking**: Allows users to submit assignments, view submission status, and manage submissions.
- **Protected Routes**: Uses middleware to verify tokens and protect certain routes.
- **Environment Variables**: Uses dotenv for managing environment-specific settings.

## Dependencies

The server uses the following npm packages:

- **express**
- **cors**
- **cookie-parser**
- **jsonwebtoken**
- **dotenv**
- **mongodb**

## API Endpoints

### Root Endpoint

- **GET /**: Check if the server is running.

### Authentication Endpoints

- **POST /login**: Logs in the user and provides a JWT token.
- **POST /logout**: Logs out the user and clears the JWT token.

### User Data Endpoints

- **POST /users**: Adds a new user to the database.

### Assignment Endpoints

- **POST /assignments**: Creates a new assignment.
- **GET /assignments**: Retrieves all assignments with optional search and filter.
- **GET /assignments/:id**: Retrieves a single assignment by ID.
- **PUT /assignments/:id**: Updates an assignment by ID.
- **DELETE /assignments/:id**: Deletes an assignment by ID.

### Submission Endpoints

- **POST /submissions**: Submits a new assignment.
- **GET /submissions/pending**: Retrieves all pending submissions.
- **GET /submissions**: Retrieves submissions by user email.
- **PATCH /submissions/:id**: Updates a submission by ID.

## Middleware

- **verifyToken**: Middleware to verify JWT tokens and protect routes.
