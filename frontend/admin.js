document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('upload-form');
    const statusMessage = document.getElementById('status-message');
    const submitBtn = document.getElementById('submit-btn');

    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(uploadForm);
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Uploading...';
        statusMessage.textContent = '';
        statusMessage.style.color = '';

        try {
            const response = await fetch('http://127.0.0.1:8000/api/songs/upload', {
                method: 'POST',
                body: formData, 
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.detail || 'An unknown error occurred.');
            }
            
            statusMessage.textContent = '✅ Success! Song uploaded.';
            statusMessage.style.color = '#2ecc71';
            uploadForm.reset();

        } catch (error) {
            statusMessage.textContent = `❌ Error: ${error.message}`;
            statusMessage.style.color = '#e74c3c';
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Upload Song';
        }
    });
});