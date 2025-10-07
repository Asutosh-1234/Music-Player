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
    const shuffleBtn = document.getElementById('shuffle-btn');
    const repeatBtn = document.getElementById('repeat-btn');

    const API_BASE_URL = 'http://127.0.0.1:8000';
    
    let songs = [];
    let shuffledSongs = [];
    let currentSongIndex = 0;
    let isPlaying = false;
    let previousVolume = 1; 
    let isShuffled = false;
    let repeatState = 'none'; 



    async function fetchSongs(query = '') {
        try {
            const url = query ? `${API_BASE_URL}/api/songs/search?q=${query}` : `${API_BASE_URL}/api/songs`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            
            songs = await response.json();
            displaySongs(songs);
            setVolume(); 
            loadSong(currentSongIndex);
        } catch (error) {
            console.error('Error fetching songs:', error);
            songList.innerHTML = '<li>Failed to load songs. Make sure the backend is running.</li>';
        }
    }

    function displaySongs(songData) {
        songList.innerHTML = '';
        const currentPlaylist = isShuffled ? shuffledSongs : songs;
        
        currentPlaylist.forEach((song, index) => {
            const li = document.createElement('li');
            li.dataset.songId = song.id;
            li.innerHTML = `
                <div class="title">${song.title}</div>
                <div class="artist">${song.artist}</div>
            `;
            li.addEventListener('click', () => {
                const songIndex = currentPlaylist.findIndex(s => s.id === song.id);
                currentSongIndex = songIndex;
                loadSong(currentSongIndex);
                playSong();
            });
            songList.appendChild(li);
        });
    }

    function loadSong(index) {
        const currentPlaylist = isShuffled ? shuffledSongs : songs;
        if (currentPlaylist.length === 0) return;

        const song = currentPlaylist[index];
        songTitle.textContent = song.title;
        songArtist.textContent = song.artist;
        coverArt.src = `${API_BASE_URL}${song.cover_art_path}`;
        audioSource.src = `${API_BASE_URL}${song.file_path}`;

        const listItems = songList.querySelectorAll('li');
        listItems.forEach(item => item.classList.remove('playing'));
        const activeListItem = songList.querySelector(`li[data-song-id='${song.id}']`);
        if (activeListItem) {
            activeListItem.classList.add('playing');
        }
    }

    function playSong() {
        isPlaying = true;
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        audioSource.play();
    }

    function pauseSong() {
        isPlaying = false;
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        audioSource.pause();
    }
    
    function togglePlayPause() {
        isPlaying ? pauseSong() : playSong();
    }

    function prevSong() {
        const currentPlaylist = isShuffled ? shuffledSongs : songs;
        currentSongIndex = (currentSongIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
        loadSong(currentSongIndex);
        playSong();
    }
    
    function nextSong() {
        const currentPlaylist = isShuffled ? shuffledSongs : songs;
        currentSongIndex = (currentSongIndex + 1) % currentPlaylist.length;
        loadSong(currentSongIndex);
        playSong();
    }

    function handleSongEnd() {
        if (repeatState === 'one') {
            audioSource.currentTime = 0;
            playSong();
        } else if (repeatState === 'all') {
            nextSong();
        } else { 
            const currentPlaylist = isShuffled ? shuffledSongs : songs;
            if (currentSongIndex < currentPlaylist.length - 1) {
                nextSong();
            } else {
                pauseSong();
            }
        }
    }

    function toggleShuffle() {
        isShuffled = !isShuffled;
        shuffleBtn.classList.toggle('active', isShuffled);
        shuffleBtn.title = isShuffled ? "Shuffle On" : "Shuffle Off";

        if (isShuffled) {
            const currentSong = songs[currentSongIndex];
            shuffledSongs = [...songs].sort(() => Math.random() - 0.5);
            currentSongIndex = shuffledSongs.findIndex(s => s.id === currentSong.id);
        } else {
            const currentSong = shuffledSongs[currentSongIndex];
            currentSongIndex = songs.findIndex(s => s.id === currentSong.id);
        }
        displaySongs();
        loadSong(currentSongIndex);
    }
    
    function cycleRepeat() {
        if (repeatState === 'none') {
            repeatState = 'all';
            repeatBtn.classList.add('active');
            repeatBtn.title = 'Repeat All';
        } else if (repeatState === 'all') {
            repeatState = 'one';
            repeatBtn.title = 'Repeat One';
        } else {
            repeatState = 'none';
            repeatBtn.classList.remove('active');
            repeatBtn.title = 'Repeat Off';
        }
    }

    function updateProgress(e) {
        const { duration, currentTime } = e.srcElement;
        const progressPercent = (currentTime / duration) * 100;
        progress.style.width = `${progressPercent}%`;
        durationEl.textContent = formatTime(duration);
        currentTimeEl.textContent = formatTime(currentTime);
    }
    
    function setProgress(e) {
        const width = this.clientWidth;
        const clickX = e.offsetX;
        const duration = audioSource.duration;
        audioSource.currentTime = (clickX / width) * duration;
    }
    
    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function handleSearch(e) {
        e.preventDefault();
        const query = searchInput.value.trim();
        isShuffled = false; // Turn off shuffle on new search
        shuffleBtn.classList.remove('active');
        currentSongIndex = 0;
        fetchSongs(query);
    }

    function setVolume() {
        audioSource.volume = volumeSlider.value / 100;
        updateVolumeIcon();
    }
    
    function toggleMute() {
        if (audioSource.volume > 0) {
            previousVolume = audioSource.volume;
            audioSource.volume = 0;
            volumeSlider.value = 0;
        } else {
            audioSource.volume = previousVolume;
            volumeSlider.value = previousVolume * 100;
        }
        updateVolumeIcon();
    }

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


    playBtn.addEventListener('click', togglePlayPause);
    prevBtn.addEventListener('click', prevSong);
    nextBtn.addEventListener('click', nextSong);
    audioSource.addEventListener('ended', handleSongEnd);
    audioSource.addEventListener('timeupdate', updateProgress);
    progressBar.addEventListener('click', setProgress);
    searchForm.addEventListener('submit', handleSearch);
    volumeSlider.addEventListener('input', setVolume);
    volumeIcon.addEventListener('click', toggleMute);
    shuffleBtn.addEventListener('click', toggleShuffle);
    repeatBtn.addEventListener('click', cycleRepeat);
    fetchSongs();
});