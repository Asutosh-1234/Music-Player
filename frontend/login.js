document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (email === 'admin@gmail.com' && password === '123456') {
            alert('Admin login successful! Redirecting to admin panel...');
            window.location.href = 'admin.html';
        } 
        else if (email === 'user@gmail.com' && password === '123456') {
            alert('Login successful! Redirecting to the music player...');
            window.location.href = 'index.html';
        } 
        else {
            errorMessage.textContent = 'Invalid email or password. Please try again.';
            document.getElementById('password').value = '';
        }
    });
});