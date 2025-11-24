# RMS


# **Task Management API Documentation**

This document provides a guide for interacting with the Task Management API.

**Base URL:** `https://rms-api-karw.onrender.com`

---


This documentation assumes that you have also secured the Task routes with the `protect` middleware, as is standard practice once authentication is introduced.

---

# **Full Project Management API Documentation**

**Base URL:** `https://your-api-url.onrender.com`

## **Data Models**

<details>
<summary><strong>User Object</strong></summary>

| Field      | Type     | Description                                | Notes                       |
|------------|----------|--------------------------------------------|-----------------------------|
| `_id`      | ObjectId | The unique identifier for the user.        | Auto-generated.             |
| `name`     | String   | The user's full name.                      | Required.                   |
| `email`    | String   | The user's email address.                  | Required, must be unique.   |
| `password` | String   | The user's hashed password.                | Stored securely, required.  |
| `role`     | String   | The user's role in the system.             | Defaults to `'member'`.     |
</details>

<details>
<summary><strong>Project Object</strong></summary>

| Field         | Type       | Description                                  | Notes                       |
|---------------|------------|----------------------------------------------|-----------------------------|
| `_id`         | ObjectId   | The unique identifier for the project.       | Auto-generated.             |
| `name`        | String     | The name of the project.                     | Required.                   |
| `description` | String     | A detailed description of the project.       | Optional.                   |
| `deadline`    | Date       | The due date for the project.                | Required.                   |
| `status`      | String     | The current status of the project.           | Defaults to `'Planning'`.     |
| `createdBy`   | ObjectId   | The ID of the user who created the project.  | References `User`.          |
| `teamMembers` | [ObjectId] | An array of user IDs on the project team.    | References `User`.          |
</details>

<details>
<summary><strong>Task Object</strong></summary>

| Field         | Type     | Description                                  | Notes                       |
|---------------|----------|----------------------------------------------|-----------------------------|
| `_id`         | ObjectId | The unique identifier for the task.          | Auto-generated.             |
| `description` | String   | The content of the task.                     | Required.                   |
| `completed`   | Boolean  | The status of the task.                      | Defaults to `false`.        |
| `assignedTo`  | String   | The person or team the task is assigned to.  | Defaults to `'Unassigned'`. |
| `project_id`  | ObjectId | The ID of the project this task belongs to.  | Optional.                   |
</details>

---

## **Authentication**

Most endpoints in this API are protected. To access them, you must first register and log in to obtain a JSON Web Token (JWT). This token must be included in the `Authorization` header for all subsequent requests to protected routes.

**Header Format:** `Authorization: Bearer <your_token_here>`

---

## **User API Endpoints**

These endpoints handle user registration, login, and profile management.

### 1. Register a New User

Creates a new user account. This is a public route.

-   **HTTP Method:** `POST`
-   **URL:** `/api/users/register`
-   **Request Body:**

    ```json
    {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "password": "a_strong_password"
    }
    ```
-   **Success Response (`201 Created`):**
    ```json
    {
        "_id": "64a3f1b1c5d1e2f3a4b5c6d9",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "member"
    }
    ```

### 2. Log In a User

Authenticates a user and returns a JWT for accessing protected routes. This is a public route.

-   **HTTP Method:** `POST`
-   **URL:** `/api/users/login`
-   **Request Body:**
    ```json
    {
      "email": "john.doe@example.com",
      "password": "a_strong_password"
    }
    ```
-   **Success Response (`200 OK`):**
    ```json
    {
        "_id": "64a3f1b1c5d1e2f3a4b5c6d9",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```

### 3. Get User Profile

Retrieves the profile of the currently logged-in user.

-   **HTTP Method:** `GET`
-   **URL:** `/api/users/me`
-   **Authentication:** **Required.**
-   **Success Response (`200 OK`):** The user object (without the password).
    ```json
    {
        "_id": "64a3f1b1c5d1e2f3a4b5c6d9",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "role": "member",
        "createdAt": "...",
        "updatedAt": "..."
    }
    ```

---

## **Project API Endpoints**

All project endpoints are **protected** and require a valid JWT.

### 1. Create a Project

-   **HTTP Method:** `POST`
-   **URL:** `/api/projects`
-   **Request Body:**
    ```json
    {
      "name": "New Website Launch",
      "description": "Launch the new marketing website.",
      "deadline": "2025-12-31",
      "teamMembers": ["64a3f1b1c5d1e2f3a4b5c6d9", "64a3f1c2c5d1e2f3a4b5c6da"]
    }
    ```-   **Success Response (`201 Created`):** The new project object.

### 2. Get User's Projects

-   **HTTP Method:** `GET`
-   **URL:** `/api/projects`
-   **Success Response (`200 OK`):** An array of projects created by the logged-in user.

### 3. Get a Single Project by ID

-   **HTTP Method:** `GET`
-   **URL:** `/api/projects/:id`
-   **Success Response (`200 OK`):** A single project object, populated with team member details.

### 4. Update a Project

-   **HTTP Method:** `PATCH`
-   **URL:** `/api/projects/:id`
-   **Request Body:** A JSON object with the fields to update (e.g., `{"status": "In Progress"}`).
-   **Success Response (`200 OK`):** The full, updated project object.

### 5. Delete a Project

-   **HTTP Method:** `DELETE`
-   **URL:** `/api/projects/:id`
-   **Success Response (`200 OK`):**
    ```json
    {
      "message": "Project deleted successfully"
    }
    ```

---

## **Task API Endpoints**

All task endpoints are **protected** and require a valid JWT.

### 1. Create a Task

-   **HTTP Method:** `POST`
-   **URL:** `/api/tasks`
-   **Request Body:**
    ```json
    {
        "description": "Create wireframes for the homepage",
        "project_id": "64a3f2d3c5d1e2f3a4b5c6db"
    }
    ```
-   **Success Response (`201 Created`):** The new task object.

### 2. Get All Tasks

-   **HTTP Method:** `GET`
-   **URL:** `/api/tasks`
-   **Success Response (`200 OK`):** An array of all task objects.

### 3. Get a Single Task by ID

-   **HTTP Method:** `GET`
-   **URL:** `/api/tasks/:id`
-   **Success Response (`200 OK`):** A single task object.

### 4. Update a Task

-   **HTTP Method:** `PATCH`
-   **URL:** `/api/tasks/:id`
-   **Request Body:** A JSON object with the fields to update (e.g., `{"completed": true}`).
-   **Success Response (`200 OK`):** The full, updated task object.

### 5. Delete a Task

-   **HTTP Method:** `DELETE`
-   **URL:** `/api/tasks/:id`
-   **Success Response (`200 OK`):**
    ```json
    {
      "message": "Task deleted successfully"
    }
    ```