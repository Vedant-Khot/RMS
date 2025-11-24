

Here is a complete guide on how to handle JWTs in **vanilla JavaScript**, from logging in to making protected requests and logging out.

### The Big Picture: The JWT Workflow

1.  **Login:** The user submits a login form. Your JS sends their credentials to `/api/users/login`.
2.  **Receive & Store:** The server validates the credentials and sends back a JWT. Your JS receives this token and **stores it somewhere safe** in the browser.
3.  **Authenticate Requests:** For every subsequent request to a protected endpoint (like `/api/projects`), your JS retrieves the stored token.
4.  **Send Token:** It then adds the token to a special `Authorization` header in the request.
5.  **Logout:** When the user clicks "logout," your JS **deletes the stored token** from the browser.

---

### Step 1: Where to Store the Token?

This is the most important decision. You have two primary options in the browser:

1.  **`localStorage` (Easiest Method):**
    *   **How it works:** `localStorage` is a simple key-value store that persists even after the browser is closed.
    *   **Pros:** Very easy to use (`localStorage.setItem('token', ...)`, `localStorage.getItem('token')`).
    *   **Cons:** It's accessible by any JavaScript running on your page. This makes it vulnerable to Cross-Site Scripting (XSS) attacks. If a malicious script gets injected into your site, it can steal the token.
    *   **Verdict:** **Perfectly acceptable and recommended for your current project.** While there are security risks, they are manageable for personal and portfolio-level applications.

2.  **`HttpOnly` Cookies (Most Secure Method):**
    *   **How it works:** The *backend server* sets a cookie with the `HttpOnly` flag. The browser then automatically includes this cookie in every request to the server.
    *   **Pros:** Inaccessible to JavaScript, which prevents XSS attacks from stealing the token.
    *   **Cons:** More complex to set up. It requires changes to your backend (to set the cookie) and can be tricky to manage with CORS.
    *   **Verdict:** The professional standard for production apps, but more advanced.

**For your current needs, we will use `localStorage` because it's straightforward and requires no backend changes.**

---

### Step 2: A Complete Vanilla JS Example

Let's create a simple HTML file and a JS file to demonstrate the full flow.

#### `index.html` (The Frontend UI)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Project Manager</title>
    <style>
        body { font-family: sans-serif; }
        #login-section, #content-section { border: 1px solid #ccc; padding: 20px; margin: 20px; }
        #content-section { display: none; } /* Hidden by default */
        input { display: block; margin-bottom: 10px; }
        ul { list-style-type: none; padding: 0; }
        li { background-color: #f4f4f4; margin: 5px 0; padding: 10px; }
    </style>
</head>
<body>

    <h1>Project Management App</h1>

    <!-- Login Form Section -->
    <div id="login-section">
        <h2>Login</h2>
        <form id="login-form">
            <input type="email" id="email" placeholder="Email" required>
            <input type="password" id="password" placeholder="Password" required>
            <button type="submit">Login</button>
        </form>
        <p id="login-error" style="color: red;"></p>
    </div>

    <!-- Main Content Section (Protected) -->
    <div id="content-section">
        <h2 id="welcome-message"></h2>
        <button id="logout-button">Logout</button>
        <h3>Your Projects</h3>
        <ul id="projects-list">
            <!-- Projects will be dynamically inserted here -->
        </ul>
    </div>

    <script src="script.js"></script>
</body>
</html>
```

#### `script.js` (The Logic)

This is where all the JWT handling happens.

```javascript
// --- CONFIGURATION ---
const API_BASE_URL = 'https://your-api-url.onrender.com'; // IMPORTANT: Replace with your Render URL

// --- DOM ELEMENTS ---
const loginSection = document.getElementById('login-section');
const contentSection = document.getElementById('content-section');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const welcomeMessage = document.getElementById('welcome-message');
const projectsList = document.getElementById('projects-list');
const logoutButton = document.getElementById('logout-button');

// --- EVENT LISTENERS ---
loginForm.addEventListener('submit', handleLogin);
logoutButton.addEventListener('click', handleLogout);

// --- FUNCTIONS ---

/**
 * Handles the login form submission.
 */
async function handleLogin(event) {
    event.preventDefault(); // Prevent default form submission
    loginError.textContent = ''; // Clear previous errors

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/api/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to login');
        }

        // ** STEP 1: Store the token in localStorage **
        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', data.name);

        // Update UI
        showContentUI(data.name);

    } catch (error) {
        loginError.textContent = error.message;
        console.error('Login failed:', error);
    }
}

/**
 * Fetches protected project data from the API.
 */
async function fetchProjects() {
    // ** STEP 2: Retrieve the token from localStorage **
    const token = localStorage.getItem('token');

    if (!token) {
        console.error('No token found, user is not logged in.');
        showLoginUI();
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/projects`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // ** STEP 3: Add the Authorization header **
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            // Unauthorized (e.g., token expired)
            handleLogout(); // Log the user out
            throw new Error('Session expired. Please log in again.');
        }

        if (!response.ok) {
            throw new Error('Failed to fetch projects');
        }

        const projects = await response.json();
        
        // Display projects
        projectsList.innerHTML = ''; // Clear existing list
        if (projects.length === 0) {
            projectsList.innerHTML = '<li>No projects found.</li>';
        } else {
            projects.forEach(project => {
                const li = document.createElement('li');
                li.textContent = `${project.name} (Status: ${project.status})`;
                projectsList.appendChild(li);
            });
        }

    } catch (error) {
        console.error(error);
        alert(error.message); // Show error to the user
    }
}

/**
 * Handles the logout process.
 */
function handleLogout() {
    // ** STEP 4: Remove the token from localStorage **
    localStorage.removeItem('token');
    localStorage.removeItem('userName');

    // Update UI
    showLoginUI();
}

// --- UI MANAGEMENT ---
function showLoginUI() {
    loginSection.style.display = 'block';
    contentSection.style.display = 'none';
}

function showContentUI(userName) {
    loginSection.style.display = 'none';
    contentSection.style.display = 'block';
    welcomeMessage.textContent = `Welcome, ${userName}!`;
    fetchProjects(); // Fetch data now that we are logged in
}

// --- INITIALIZATION ---
/**
 * Check if the user is already logged in when the page loads.
 */
function initialize() {
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    if (token && userName) {
        showContentUI(userName);
    } else {
        showLoginUI();
    }
}

// Run the initialization function when the script loads
initialize();
```

### How to Use This Code

1.  Save the files as `index.html` and `script.js` in your `client` folder.
2.  **Crucially, update the `API_BASE_URL` constant in `script.js` to your actual Render API URL.**
3.  Deploy your client-side code to Render (or open the `index.html` file in your browser to test locally).

Now, when you visit your frontend, it will check for a token, show the login form if needed, and once you log in, it will store the token and use it to fetch and display your projects.