
const getElement = id => document.getElementById(id);


const audioElement = getElement('myAudio');
const playIconElement = getElement('playIcon');
const pauseIconElement = getElement('pauseIcon');

const progressBar = getElement('progressBar');
const currentTimeElement = getElement('currentTime');
const durationElement = getElement('duration');

const volumeIconElement = getElement('volIcon');
const volumeSliderElement = getElement('volumeSlider');
const speedLabelElement = getElement('speedLabel');
const albumCoverElement = getElement('albumCover');
const loopBtnElement = getElement('loopBtn');
const shuffleBtnElement = getElement('shuffleBtn');

const trackTitleElement = getElement('trackTitle');
const trackArtistElement = getElement('trackArtist');
const queueListElement = getElement('queueList');
const fileUploadElement = getElement('fileUpload');
const downloadBtnElement = getElement('downloadBtn');

//speed of songs
let trackSpeeds = [1, 1.25, 1.5, 2, 0.5, 0.75]; 
let currentSpeedIndex = 0; 
let currentTrackIndex = 0;
let isLoopingActive = false;
let isShuffleActive = false;
//My songs
const playlistTracks = [
    { title: "mario", artist: "nintendo", src: "audio/Mario.mp3" },
    { title: "girl just quit music already", artist: "petalbyte", src: "audio/2nd song.mp3" },
    { title: "Мой мармеладный", artist: "КАТЯ ЛЕЛЬ", src: "audio/КАТЯ ЛЕЛЬ - Мой мармеладный.mp3" },
    { title: "Promises Promises", artist: "Naked Eyes", src: "audio/Naked Eyes - Promises Promises [m1iFTc5zkN4].mp3" },
    { title: "The Color Violet", artist: "Tory Lanez", src: "audio/Tory Lanez - The Color Violet (Official Music Video) [GfAPEko4rbU].mp3" }
];


// Converts raw seconds into minutes:seconds
const formatTimeInSeconds = seconds => isNaN(seconds) ? "0:00" : `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;

//updates the background color of range slider
const updateSliderColor = (sliderElement, percentageValue) => {
    sliderElement.style.background = `linear-gradient(to right, var(--primary-red) ${percentageValue}%, var(--track-bg) ${percentageValue}%)`;
};

// Renders the queue UI
const renderQueue = () => {
    queueListElement.innerHTML = '';
    playlistTracks.forEach((track, index) => {
        const item = document.createElement('div');
        item.className = `queue-item ${index === currentTrackIndex ? 'active' : ''}`;
        item.onclick = () => loadTrackAtIndex(index, true);
        
        item.innerHTML = `
            <img src="cover.jpg" class="queue-thumb" alt="Thumb">
            <div class="queue-info">
                <span class="queue-track-title">${track.title}</span>
                <span class="queue-track-artist">${track.artist}</span>
            </div>
        `;
        queueListElement.appendChild(item);
    });
};

// Loads a specific track from the playlist into the audio element
const loadTrackAtIndex = (index, shouldAutoPlay = false) => {
    currentTrackIndex = index;
    audioElement.src = playlistTracks[index].src;
    trackTitleElement.textContent = playlistTracks[index].title;
    trackArtistElement.textContent = playlistTracks[index].artist;
    
    updateSliderColor(progressBar, 0);
    audioElement.load();
    
    // Reset speed to 1x whenever a new track is loaded
    currentSpeedIndex = 0;
    audioElement.playbackRate = trackSpeeds[currentSpeedIndex];
    speedLabelElement.textContent = `${trackSpeeds[currentSpeedIndex]}x`;
    
    renderQueue();
    
    // Automatically play the new track
    if (shouldAutoPlay) {
        audioElement.play().then(() => {
            playIconElement.style.display = 'none';
            pauseIconElement.style.display = 'block';
            albumCoverElement.classList.add('playing');
        }).catch(error => console.log(error));
    }
};
//pause and play
const togglePlaybackStatus = () => {
    if (audioElement.paused) {
        audioElement.play();
    } else {
        audioElement.pause();
    }
    // Update the UI icons
    playIconElement.style.display = audioElement.paused ? 'block' : 'none';
    pauseIconElement.style.display = audioElement.paused ? 'none' : 'block';
    albumCoverElement.classList.toggle('playing', !audioElement.paused);
};

// Synchronizes the progress bar and time text with the playback time
const updatePlaybackProgress = () => {
    progressBar.value = (audioElement.currentTime / audioElement.duration) * 100 || 0;
    currentTimeElement.textContent = formatTimeInSeconds(audioElement.currentTime);
    updateSliderColor(progressBar, progressBar.value);
};

// Updates the volume icon based on current volume
const updateVolumeState = () => {
    const volumeValue = parseFloat(volumeSliderElement.value);
    const isMuted = volumeValue === 0 || audioElement.muted;

    volumeIconElement.className = 'icon ' + (isMuted ? 'volume-mute' : (volumeValue === 1 ? 'volume-max' : 'volume-on'));
    updateSliderColor(volumeSliderElement, volumeValue * 100);
};

//Go back a song
const playPreviousTrack = () => {
    loadTrackAtIndex((currentTrackIndex - 1 + playlistTracks.length) % playlistTracks.length, !audioElement.paused);
};

//Go to the next song
const playNextTrack = () => {
    if (isShuffleActive && playlistTracks.length > 1) {
        let nextIndex = Math.floor(Math.random() * playlistTracks.length);
        if (nextIndex === currentTrackIndex) nextIndex = (nextIndex + 1) % playlistTracks.length;
        loadTrackAtIndex(nextIndex, !audioElement.paused);
    } else {
        loadTrackAtIndex((currentTrackIndex + 1) % playlistTracks.length, !audioElement.paused);
    }
};

getElement('prevTrackBtn').onclick = playPreviousTrack;
getElement('nextTrackBtn').onclick = playNextTrack;
getElement('playPauseBtn').onclick = togglePlaybackStatus;

getElement('skipForwardBtn').onclick = () => { audioElement.currentTime += 10; updatePlaybackProgress(); };
getElement('skipBackwardBtn').onclick = () => { audioElement.currentTime -= 10; updatePlaybackProgress(); };

audioElement.onloadedmetadata = () => durationElement.textContent = formatTimeInSeconds(audioElement.duration);
audioElement.ontimeupdate = updatePlaybackProgress;

progressBar.oninput = event => { audioElement.currentTime = (event.target.value / 100) * audioElement.duration; updatePlaybackProgress(); };
volumeSliderElement.oninput = event => { audioElement.volume = event.target.value; updateVolumeState(); };

// Mute button 
getElement('muteBtn').onclick = () => {
    audioElement.muted = !audioElement.muted;
    volumeSliderElement.value = audioElement.muted ? 0 : (audioElement.volume || 1);
    if (!audioElement.muted && audioElement.volume === 0) audioElement.volume = 1;
    updateVolumeState();
};

// Loop toggle button 
loopBtnElement.onclick = () => { 
    isLoopingActive = !isLoopingActive; 
    loopBtnElement.classList.toggle('active', isLoopingActive); 
};

// Shuffle toggle button
shuffleBtnElement.onclick = () => {
    isShuffleActive = !isShuffleActive;
    shuffleBtnElement.classList.toggle('active', isShuffleActive);
};

// Speed cycle button 
getElement('speedBtn').onclick = () => {
    currentSpeedIndex = (currentSpeedIndex + 1) % trackSpeeds.length;
    audioElement.playbackRate = trackSpeeds[currentSpeedIndex];
    speedLabelElement.textContent = `${trackSpeeds[currentSpeedIndex]}x`;
};

// Handle Song Upload
fileUploadElement.onchange = (event) => {
    const files = event.target.files;
    if (files.length === 0) return;

    const originalLength = playlistTracks.length;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileURL = URL.createObjectURL(file);
        
        // Strip file extension for title
        const title = file.name.replace(/\.[^/.]+$/, "");
        
        playlistTracks.push({
            title: title,
            artist: "LOCAL UPLOAD",
            src: fileURL
        });
    }
    
    renderQueue();

    // If nothing is playing, play the first newly uploaded track
    if (audioElement.paused && audioElement.currentTime === 0) {
        loadTrackAtIndex(originalLength, true); 
    }
};

// Handle Song Download
downloadBtnElement.onclick = () => {
    const currentTrack = playlistTracks[currentTrackIndex];
    if (!currentTrack || currentTrack.artist === "LOCAL UPLOAD") {
        alert("Cannot download locally uploaded temporary files.");
        return;
    }
    
    const a = document.createElement('a');
    a.href = currentTrack.src;
    a.download = `${currentTrack.title}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

// Automatically play next track when a song ends
audioElement.onended = () => {
    if (isLoopingActive) {
        audioElement.currentTime = 0;
        audioElement.play();
    } else if (isShuffleActive && playlistTracks.length > 1) {
        let nextIndex = Math.floor(Math.random() * playlistTracks.length);
        if (nextIndex === currentTrackIndex) nextIndex = (nextIndex + 1) % playlistTracks.length;
        loadTrackAtIndex(nextIndex, true);
    } else {
        // If we are on the last track, stop playback entirely
        if (currentTrackIndex === playlistTracks.length - 1) {
            audioElement.pause();
            playIconElement.style.display = 'block';
            pauseIconElement.style.display = 'none';
            albumCoverElement.classList.remove('playing');
            audioElement.currentTime = 0;
            updatePlaybackProgress();
        } else {
            // Play the next track in the playlist
            loadTrackAtIndex(currentTrackIndex + 1, true);
        }
    }
};

// Keyboard Shortcuts for songs
document.onkeydown = event => {
    if (event.target.tagName === 'INPUT') return;
    
    const keyboardShortcuts = {
        'Space': getElement('playPauseBtn'), 
        'ArrowRight': getElement('skipForwardBtn'), 
        'ArrowLeft': getElement('skipBackwardBtn'), 
        'KeyM': getElement('muteBtn'), 
        'KeyS': getElement('speedBtn'),
        'KeyL': loopBtnElement
    };

    if (keyboardShortcuts[event.code]) { 
        event.preventDefault(); 
        keyboardShortcuts[event.code].click(); 
    }
};

//Initialization
loadTrackAtIndex(0, false); 
updateVolumeState(); 