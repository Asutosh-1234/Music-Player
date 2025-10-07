document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('upload-form');
    const statusMessage = document.getElementById('status-message');
    const submitBtn = document.getElementById('submit-btn');

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Create FormData object from the form
        const formData = new FormData(uploadForm);
        
        // Disable button and show loading text
        submitBtn.disabled = true;
        submitBtn.textContent = 'Uploading...';
        statusMessage.textContent = '';
        statusMessage.style.color = '';

        try {
            const response = await fetch('http://127.0.0.1:8000/api/songs/upload', {
                method: 'POST',
                body: formData, // The browser will set the correct Content-Type with boundary
            });

            const result = await response.json();

            if (!response.ok) {
                // If server returns an error (e.g., 4xx, 5xx)
                throw new Error(result.detail || 'An unknown error occurred.');
            }
            
            // Success
            statusMessage.textContent = '✅ Success! Song uploaded.';
            statusMessage.style.color = '#2ecc71';
            uploadForm.reset(); // Clear the form

        } catch (error) {
            // Failure
            statusMessage.textContent = `❌ Error: ${error.message}`;
            statusMessage.style.color = '#e74c3c';
        } finally {
            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.textContent = 'Upload Song';
        }
    });
});