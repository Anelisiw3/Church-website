document.addEventListener("DOMContentLoaded", function() {
    let slides = document.querySelectorAll('.event-slider .slide');
    let currentSlide = 0;
});

// YouTube API Configuration
const API_KEY = 'AIzaSyDV6NkpHUDrvDDZopRr-E8KC7hDQDs8cAs';
const CHANNEL_ID = 'UC-bZYdjetNl31Qhy9F4W09A';
const MAX_RESULTS = 10;

// DOM Elements
const sermonContainer = document.getElementById("sermon-list");
const featuredSermon = document.getElementById('featured-sermon');
const loadMoreBtn = document.getElementById('load-more-btn');
const searchInput = document.getElementById('sermon-search');
const dateFilter = document.getElementById('date-filter');

let nextPageToken = '';
let isLoading = false;

// Fetch YouTube videos
async function fetchVideos(pageToken = '') {
    try {
        isLoading = true;
        const response = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=${MAX_RESULTS}&pageToken=${pageToken}&type=video`);
        const data = await response.json();
        
        console.log('YouTube API Response:', data); // Debug log
        
        if (!data.items || !Array.isArray(data.items)) {
            throw new Error('Invalid response format from YouTube API');
        }
        
        nextPageToken = data.nextPageToken || '';
        
        if (pageToken === '') {
            // First load - set featured video and clear list
            sermonContainer.innerHTML = '';
            if (data.items.length > 0) {
                const firstVideo = data.items[0];
                if (firstVideo.id && firstVideo.id.videoId) {
                    createFeaturedVideo(firstVideo);
                    createVideoList(data.items.slice(1));
                } else {
                    console.error('First video missing required data:', firstVideo);
                    sermonContainer.innerHTML = '<p>Error loading featured video. Please try again later.</p>';
                }
            } else {
                sermonContainer.innerHTML = '<p>No videos found. Please check your channel ID.</p>';
            }
        } else {
            // Append to existing list
            createVideoList(data.items);
        }
    } catch (error) {
        console.error('Error fetching videos:', error);
        sermonContainer.innerHTML = '<p>Error loading videos. Please try again later.</p>';
    } finally {
        isLoading = false;
    }
}

// Create featured video
function createFeaturedVideo(video) {
    if (!video || !video.id || !video.id.videoId) {
        console.error('Invalid video data:', video);
        return;
    }

    const videoId = video.id.videoId;
    const title = video.snippet?.title || 'Untitled Video';
    const description = video.snippet?.description || '';
    const publishedAt = video.snippet?.publishedAt ? new Date(video.snippet.publishedAt).toLocaleDateString() : 'Unknown date';
    
    featuredSermon.innerHTML = `
        <div class="sermon-video">
            <div class="video-container">
                <iframe width="100%" height="315" 
                    src="https://www.youtube.com/embed/${videoId}" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            </div>
        </div>
        <div class="sermon-details">
            <h3 class="sermon-title">${title}</h3>
            <div class="sermon-meta">
                <span class="date">${publishedAt}</span>
            </div>
            <p class="sermon-description">${description}</p>
            <div class="sermon-actions">
                <button class="action-btn share-btn" onclick="shareVideo('${videoId}')">Share</button>
            </div>
        </div>
    `;
}

// Create video list
function createVideoList(videos) {
    if (!videos || !Array.isArray(videos)) {
        console.error('Invalid videos data:', videos);
        return;
    }

    videos.forEach(video => {
        if (!video || !video.id || !video.id.videoId) {
            console.error('Invalid video item:', video);
            return;
        }

        const videoId = video.id.videoId;
        const title = video.snippet?.title || 'Untitled Video';
        const description = video.snippet?.description || '';
        const publishedAt = video.snippet?.publishedAt ? new Date(video.snippet.publishedAt).toLocaleDateString() : 'Unknown date';
        const thumbnailUrl = video.snippet?.thumbnails?.medium?.url || 'https://via.placeholder.com/320x180?text=No+Thumbnail';
        
        const videoCard = document.createElement('div');
        videoCard.className = 'sermon-card';
        videoCard.innerHTML = `
            <div class="sermon-thumbnail">
                <img src="${thumbnailUrl}" alt="${title}" loading="lazy">
                <div class="play-overlay" onclick="playVideo('${videoId}')">▶</div>
            </div>
            <div class="sermon-info">
                <h4>${title}</h4>
                <div class="sermon-meta">
                    <span class="date">${publishedAt}</span>
                </div>
                <p class="sermon-excerpt">${description.substring(0, 100)}...</p>
            </div>
        `;
        sermonContainer.appendChild(videoCard);
    });
}

// Play video in featured section
function playVideo(videoId) {
    featuredSermon.innerHTML = `
        <div class="sermon-video">
            <div class="video-container">
                <iframe width="100%" height="315" 
                    src="https://www.youtube.com/embed/${videoId}" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            </div>
        </div>
    `;
    featuredSermon.scrollIntoView({ behavior: 'smooth' });
}

// Share video
function shareVideo(videoId) {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    if (navigator.share) {
        navigator.share({
            title: 'Watch this sermon',
            url: url
        });
    } else {
        // Fallback for browsers that don't support Web Share API
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    loadMoreBtn.addEventListener('click', () => {
        if (nextPageToken && !isLoading) {
            fetchVideos(nextPageToken);
        }
    });

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const videos = sermonContainer.querySelectorAll('.sermon-card');
        
        videos.forEach(video => {
            const title = video.querySelector('h4').textContent.toLowerCase();
            const description = video.querySelector('.sermon-excerpt').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                video.style.display = 'block';
            } else {
                video.style.display = 'none';
            }
        });
    });

    dateFilter.addEventListener('change', (e) => {
        const selectedDate = e.target.value;
        const videos = sermonContainer.querySelectorAll('.sermon-card');
        
        videos.forEach(video => {
            const date = new Date(video.querySelector('.date').textContent);
            const now = new Date();
            
            let showVideo = true;
            switch (selectedDate) {
                case 'this-week':
                    showVideo = (now - date) <= 7 * 24 * 60 * 60 * 1000;
                    break;
                case 'this-month':
                    showVideo = date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                    break;
                case 'this-year':
                    showVideo = date.getFullYear() === now.getFullYear();
                    break;
            }
            
            video.style.display = showVideo ? 'block' : 'none';
        });
    });

    // Initial load
    fetchVideos();
});

// Lightbox functionality
document.addEventListener('DOMContentLoaded', function() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.querySelector('.lightbox-caption');
    const closeBtn = document.querySelector('.close-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    // Open lightbox when clicking on gallery items
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            const imgSrc = this.getAttribute('data-image');
            const imgTitle = this.getAttribute('data-title');
            
            lightboxImg.src = imgSrc;
            lightboxCaption.textContent = imgTitle;
            lightbox.classList.add('show');
            document.body.style.overflow = 'hidden';
        });
    });

    // Close lightbox when clicking close button
    closeBtn.addEventListener('click', function() {
        lightbox.classList.remove('show');
        document.body.style.overflow = '';
    });

    // Close lightbox when clicking outside the image
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            lightbox.classList.remove('show');
            document.body.style.overflow = '';
        }
    });

    // Close lightbox with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox.classList.contains('show')) {
            lightbox.classList.remove('show');
            document.body.style.overflow = '';
        }
    });
});

// Music Player functionality
document.addEventListener('DOMContentLoaded', function() {
    const audio = new Audio();
    const playBtn = document.getElementById('play-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const progressBar = document.querySelector('.progress');
    const progressContainer = document.querySelector('.progress-bar');
    const currentTimeEl = document.getElementById('current-time');
    const totalTimeEl = document.getElementById('total-time');
    const volumeSlider = document.getElementById('volume-slider');
    const playlistItems = document.querySelectorAll('.playlist-item');
    const currentTrackEl = document.getElementById('current-track');
    const currentArtistEl = document.getElementById('current-artist');
    const currentAlbumArt = document.getElementById('current-album-art');

    let currentTrackIndex = 0;
    let isPlaying = false;

    // Load first track
    function loadTrack(index) {
        const track = playlistItems[index];
        // Since we don't have actual audio files, we'll just update the UI
        currentTrackEl.textContent = track.getAttribute('data-title');
        currentArtistEl.textContent = track.getAttribute('data-artist');
        
        // Update active state
        playlistItems.forEach(item => item.classList.remove('active'));
        track.classList.add('active');
    }

    // Play/Pause
    function togglePlay() {
        if (isPlaying) {
            audio.pause();
            playBtn.textContent = '▶';
        } else {
            // Show message that music is not available
            alert('Music playback is not available at this time. Please check back later.');
            playBtn.textContent = '▶';
        }
        isPlaying = !isPlaying;
    }

    // Update progress bar
    function updateProgress(e) {
        const { duration, currentTime } = e.srcElement;
        const progressPercent = (currentTime / duration) * 100;
        progressBar.style.width = `${progressPercent}%`;
        
        // Update time display
        const durationMinutes = Math.floor(duration / 60);
        let durationSeconds = Math.floor(duration % 60);
        if (durationSeconds < 10) {
            durationSeconds = `0${durationSeconds}`;
        }
        
        const currentMinutes = Math.floor(currentTime / 60);
        let currentSeconds = Math.floor(currentTime % 60);
        if (currentSeconds < 10) {
            currentSeconds = `0${currentSeconds}`;
        }
        
        currentTimeEl.textContent = `${currentMinutes}:${currentSeconds}`;
        if (duration) {
            totalTimeEl.textContent = `${durationMinutes}:${durationSeconds}`;
        }
    }

    // Set progress bar
    function setProgress(e) {
        const width = this.clientWidth;
        const clickX = e.offsetX;
        const duration = audio.duration;
        audio.currentTime = (clickX / width) * duration;
    }

    // Change volume
    function setVolume() {
        audio.volume = volumeSlider.value / 100;
    }

    // Next track
    function nextTrack() {
        currentTrackIndex = (currentTrackIndex + 1) % playlistItems.length;
        loadTrack(currentTrackIndex);
        if (isPlaying) {
            alert('Music playback is not available at this time. Please check back later.');
        }
    }

    // Previous track
    function prevTrack() {
        currentTrackIndex = (currentTrackIndex - 1 + playlistItems.length) % playlistItems.length;
        loadTrack(currentTrackIndex);
        if (isPlaying) {
            alert('Music playback is not available at this time. Please check back later.');
        }
    }

    // Event Listeners
    playBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', prevTrack);
    nextBtn.addEventListener('click', nextTrack);
    audio.addEventListener('timeupdate', updateProgress);
    progressContainer.addEventListener('click', setProgress);
    volumeSlider.addEventListener('input', setVolume);
    audio.addEventListener('ended', nextTrack);

    // Playlist item click
    playlistItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            currentTrackIndex = index;
            loadTrack(currentTrackIndex);
            alert('Music playback is not available at this time. Please check back later.');
        });
    });

    // Initialize first track
    loadTrack(0);
});

// Contact Form Handling
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnSpinner = submitBtn.querySelector('.btn-spinner');
    const formStatus = document.getElementById('form-status');

    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Disable submit button and show spinner
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnSpinner.style.display = 'inline-block';
        formStatus.textContent = '';
        formStatus.className = 'form-status';
        
        try {
            const formData = new FormData(contactForm);
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                formStatus.textContent = 'Thank you for your message! We will get back to you soon.';
                formStatus.className = 'form-status success';
                contactForm.reset();
            } else {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            formStatus.textContent = 'Sorry, there was an error sending your message. Please try again later.';
            formStatus.className = 'form-status error';
            console.error('Error:', error);
        } finally {
            // Re-enable submit button and hide spinner
            submitBtn.disabled = false;
            btnText.style.display = 'inline-block';
            btnSpinner.style.display = 'none';
        }
    });

    // Form validation
    const inputs = contactForm.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.checkValidity()) {
                this.classList.remove('invalid');
            } else {
                this.classList.add('invalid');
            }
        });
    });
});
