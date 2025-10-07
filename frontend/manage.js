document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('songs-table-body');
    const modal = document.getElementById('edit-modal');
    const closeBtn = document.querySelector('.close-btn');
    const editForm = document.getElementById('edit-form');

    const API_BASE_URL = 'http://127.0.0.1:8000';

    // Fetch all songs and populate the table
    async function fetchAndDisplaySongs() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/songs`);
            const songs = await response.json();
            
            tableBody.innerHTML = ''; // Clear existing rows
            songs.forEach(song => {
                const row = document.createElement('tr');
                row.setAttribute('data-song-id', song.id); // Add song id to the row
                row.innerHTML = `
                    <td><img src="${API_BASE_URL}${song.cover_art_path}" alt="Cover"></td>
                    <td class="song-title">${song.title}</td>
                    <td class="song-artist">${song.artist}</td>
                    <td class="song-album">${song.album}</td>
                    <td>
                        <button class="action-btn edit-btn">Edit</button>
                        <button class="action-btn delete-btn">Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Failed to fetch songs:', error);
            tableBody.innerHTML = '<tr><td colspan="5">Failed to load songs.</td></tr>';
        }
    }

    // Handle clicks on Edit or Delete buttons
    tableBody.addEventListener('click', (e) => {
        const target = e.target;
        const row = target.closest('tr');
        const songId = row.dataset.songId;

        if (target.classList.contains('delete-btn')) {
            handleDelete(songId, row);
        } else if (target.classList.contains('edit-btn')) {
            handleEdit(songId, row);
        }
    });

    // --- Delete Functionality ---
    async function handleDelete(songId, row) {
        if (!confirm('Are you sure you want to delete this song? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/songs/${songId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete the song.');
            }

            row.remove(); // Remove the row from the table on success
            alert('Song deleted successfully!');

        } catch (error) {
            console.error('Error deleting song:', error);
            alert('Could not delete the song. Please try again.');
        }
    }
    
    // --- Edit Functionality ---
    function handleEdit(songId, row) {
        // Get current data from the table
        const currentTitle = row.querySelector('.song-title').textContent;
        const currentArtist = row.querySelector('.song-artist').textContent;
        const currentAlbum = row.querySelector('.song-album').textContent;

        // Populate the modal form
        document.getElementById('edit-song-id').value = songId;
        document.getElementById('edit-title').value = currentTitle;
        document.getElementById('edit-artist').value = currentArtist;
        document.getElementById('edit-album').value = currentAlbum;

        // Show the modal
        modal.style.display = 'block';
    }

    // Close the modal
    closeBtn.onclick = () => { modal.style.display = 'none'; }
    window.onclick = (e) => { if (e.target == modal) { modal.style.display = 'none'; } }

    // Handle the edit form submission
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const songId = document.getElementById('edit-song-id').value;
        const updatedData = {
            title: document.getElementById('edit-title').value,
            artist: document.getElementById('edit-artist').value,
            album: document.getElementById('edit-album').value,
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/songs/${songId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });

            if (!response.ok) {
                throw new Error('Failed to update song details.');
            }
            
            // On success, update the table and close the modal
            const rowToUpdate = tableBody.querySelector(`tr[data-song-id='${songId}']`);
            rowToUpdate.querySelector('.song-title').textContent = updatedData.title;
            rowToUpdate.querySelector('.song-artist').textContent = updatedData.artist;
            rowToUpdate.querySelector('.song-album').textContent = updatedData.album;

            modal.style.display = 'none';
            alert('Song updated successfully!');

        } catch (error) {
            console.error('Error updating song:', error);
            alert('Could not update song. Please try again.');
        }
    });

    // Initial load
    fetchAndDisplaySongs();
});