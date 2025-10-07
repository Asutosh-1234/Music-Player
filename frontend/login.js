document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent the form from submitting the default way

        // Get the values from the form fields
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // --- Simple Credential Check ---
        
        // Check for Admin credentials
        if (email === 'admin@gmail.com' && password === '123456') {
            alert('Admin login successful! Redirecting to admin panel...');
            window.location.href = 'admin.html'; // Redirect to the admin page
        } 
        // Check for User credentials
        else if (email === 'user@gmail.com' && password === '123456') {
            alert('Login successful! Redirecting to the music player...');
            window.location.href = 'index.html'; // Redirect to the main player page
        } 
        // Handle incorrect credentials
        else {
            errorMessage.textContent = 'Invalid email or password. Please try again.';
            // Clear the password field for security
            document.getElementById('password').value = '';
        }
    });
});