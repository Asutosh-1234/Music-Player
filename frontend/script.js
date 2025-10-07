document.addEventListener('DOMContentLoaded', () => {
    const songList = document.getElementById('song-list');
    const coverArt = document.getElementById('cover-art');
    const songTitle = document.getElementById('song-title');
    const songArtist = document.getElementById('song-artist');
    const audioSource = document.getElementById('audio-source');
    const playBtn = document.getElementById('play-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const progressBar = document.getElementById('progress-bar');
    const progress = document.getElementById('progress');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const volumeIcon = document.getElementById('volume-icon');
    const volumeSlider = document.getElementById('volume-slider');

    const API_BASE_URL = 'http://127.0.0.1:8000';

    let songs = [];
    let currentSongIndex = 0;
    let isPlaying = false;
    let previousVolume = 1;
    async function fetchSongs(query = '') {
        try {
            const url = query ? `${API_BASE_URL}/api/songs/search?q=${query}` : `${API_BASE_URL}/api/songs`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            songs = await response.json();
            displaySongs(songs);
            // --- NEW: Set initial volume on load ---
            setVolume(); 
            loadSong(currentSongIndex);
        } catch (error) {
            console.error('Error fetching songs:', error);
            songList.innerHTML = '<li>Failed to load songs. Make sure the backend is running.</li>';
        }
    }

    // Display songs in the list
    function displaySongs(songData) {
        songList.innerHTML = '';
        songData.forEach((song, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="title">${song.title}</div>
                <div class="artist">${song.artist}</div>
            `;
            li.addEventListener('click', () => {
                currentSongIndex = index;
                loadSong(currentSongIndex);
                playSong();
            });
            songList.appendChild(li);
        });
    }

    // Load a specific song into the player
    function loadSong(index) {
        if (songs.length === 0) return;
        const song = songs[index];
        songTitle.textContent = song.title;
        songArtist.textContent = song.artist;
        coverArt.src = `${API_BASE_URL}${song.cover_art_path}`;
        audioSource.src = `${API_BASE_URL}${song.file_path}`;

        const listItems = songList.querySelectorAll('li');
        listItems.forEach(item => item.classList.remove('playing'));
        if (listItems[index]) {
            listItems[index].classList.add('playing');
        }
    }

    // Play the current song
    function playSong() {
        isPlaying = true;
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        audioSource.play();
    }

    // Pause the current song
    function pauseSong() {
        isPlaying = false;
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        audioSource.pause();
    }
    
    // Play or pause toggle
    function togglePlayPause() {
        if (isPlaying) {
            pauseSong();
        } else {
            playSong();
        }
    }

    // Go to the previous song
    function prevSong() {
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        loadSong(currentSongIndex);
        playSong();
    }
    
    // Go to the next song
    function nextSong() {
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        loadSong(currentSongIndex);
        playSong();
    }

    // Update progress bar and time
    function updateProgress(e) {
        const { duration, currentTime } = e.srcElement;
        const progressPercent = (currentTime / duration) * 100;
        progress.style.width = `${progressPercent}%`;
        durationEl.textContent = formatTime(duration);
        currentTimeEl.textContent = formatTime(currentTime);
    }
    
    // Set progress bar on click
    function setProgress(e) {
        const width = this.clientWidth;
        const clickX = e.offsetX;
        const duration = audioSource.duration;
        audioSource.currentTime = (clickX / width) * duration;
    }
    
    // Format time (e.g., 1:05)
    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // Handle search
    function handleSearch(e) {
        e.preventDefault();
        const query = searchInput.value.trim();
        currentSongIndex = 0;
        fetchSongs(query);
    }

    // --- NEW: Function to set volume from slider ---
    function setVolume() {
        audioSource.volume = volumeSlider.value / 100;
        updateVolumeIcon();
    }
    
    // --- NEW: Function to toggle mute ---
    function toggleMute() {
        if (audioSource.volume > 0) {
            previousVolume = audioSource.volume; // Save current volume
            audioSource.volume = 0;
            volumeSlider.value = 0;
        } else {
            audioSource.volume = previousVolume; // Restore previous volume
            volumeSlider.value = previousVolume * 100;
        }
        updateVolumeIcon();
    }

    // --- NEW: Function to update volume icon based on volume level ---
    function updateVolumeIcon() {
        volumeIcon.classList.remove('fa-volume-up', 'fa-volume-down', 'fa-volume-mute');
        if (audioSource.volume > 0.5) {
            volumeIcon.classList.add('fa-volume-up');
        } else if (audioSource.volume > 0) {
            volumeIcon.classList.add('fa-volume-down');
        } else {
            volumeIcon.classList.add('fa-volume-mute');
        }
    }

    // --- Event Listeners ---
    playBtn.addEventListener('click', togglePlayPause);
    prevBtn.addEventListener('click', prevSong);
    nextBtn.addEventListener('click', nextSong);
    audioSource.addEventListener('timeupdate', updateProgress);
    audioSource.addEventListener('ended', nextSong);
    progressBar.addEventListener('click', setProgress);
    searchForm.addEventListener('submit', handleSearch);
    // --- NEW: Event Listeners for Volume Controls ---
    volumeSlider.addEventListener('input', setVolume);
    volumeIcon.addEventListener('click', toggleMute);

    // --- Initial Load ---
    fetchSongs();
});