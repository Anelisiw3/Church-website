document.addEventListener("DOMContentLoaded", function() {
    let slides = document.querySelectorAll('.event-slider .slide');
    let currentSlide = 0;
});
const API_KEY = 'AIzaSyDV6NkpHUDrvDDZopRr-E8KC7hDQDs8cAs'; 
const PLAYLIST_ID = 'M6cBcsproZQ'; 
const MAX_RESULTS = 5;
const sermonContainer = document.getElementById("sermon-list");

async function fetchSermons() {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=${MAX_RESULTS}&playlistId=${PLAYLIST_ID}&key=${API_KEY}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        // Clear loading text
        sermonContainer.innerHTML = "";

        // Loop through videos and create embedded players
        data.items.forEach(item => {
            const videoId = item.snippet.resourceId.videoId;
            const title = item.snippet.title;

            // Create video container
            const videoElement = document.createElement("div");
            videoElement.classList.add("sermon-video");
            videoElement.innerHTML = `
                <h3>${title}</h3>
                <iframe width="100%" height="315" 
                    src="https://www.youtube.com/embed/${videoId}" 
                    frameborder="0" allowfullscreen>
                </iframe>
            `;

            sermonContainer.appendChild(videoElement);
        });

    } catch (error) {
        console.error("Error fetching YouTube API:", error);
        sermonContainer.innerHTML = "<p>Failed to load sermons.</p>";
    }
}

// Fetch sermons on page load
fetchSermons();

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
            document.body.style.overflow = 'hidden'; // Prevent scrolling when lightbox is open
        });
    });

    // Close lightbox when clicking close button
    closeBtn.addEventListener('click', function() {
        lightbox.classList.remove('show');
        document.body.style.overflow = ''; // Restore scrolling
    });

    // Close lightbox when clicking outside the image
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            lightbox.classList.remove('show');
            document.body.style.overflow = ''; // Restore scrolling
        }
    });

    // Close lightbox with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox.classList.contains('show')) {
            lightbox.classList.remove('show');
            document.body.style.overflow = ''; // Restore scrolling
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
        audio.src = track.getAttribute('data-src');
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
            audio.play();
            playBtn.textContent = '⏸';
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
        if (isPlaying) audio.play();
    }

    // Previous track
    function prevTrack() {
        currentTrackIndex = (currentTrackIndex - 1 + playlistItems.length) % playlistItems.length;
        loadTrack(currentTrackIndex);
        if (isPlaying) audio.play();
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
            audio.play();
            isPlaying = true;
            playBtn.textContent = '⏸';
        });
    });

    // Initialize first track
    loadTrack(0);
});

// Sermon functionality
document.addEventListener('DOMContentLoaded', function() {
    const sermonList = document.getElementById('sermon-list');
    const searchInput = document.getElementById('sermon-search');
    const speakerFilter = document.getElementById('speaker-filter');
    const dateFilter = document.getElementById('date-filter');
    const loadMoreBtn = document.querySelector('.load-more-btn');
    const featuredVideo = document.getElementById('featured-video');
    
    // Sample sermon data (replace with your actual data)
    const sermons = [
        {
            id: 1,
            title: "The Power of Faith",
            speaker: "Pastor John",
            date: "2024-04-15",
            videoId: "example1",
            thumbnail: "Images/sermon-thumbnail.jpg",
            description: "Exploring the transformative power of faith in our daily lives.",
            duration: "45:30"
        },
        {
            id: 2,
            title: "Walking in Love",
            speaker: "Pastor Sarah",
            date: "2024-04-08",
            videoId: "example2",
            thumbnail: "Images/sermon-thumbnail.jpg",
            description: "Understanding and practicing unconditional love in our relationships.",
            duration: "42:15"
        },
        // Add more sermons as needed
    ];

    let currentPage = 1;
    const sermonsPerPage = 6;
    let filteredSermons = [...sermons];

    // Load featured sermon
    function loadFeaturedSermon() {
        if (sermons.length > 0) {
            const featured = sermons[0];
            featuredVideo.src = `https://www.youtube.com/embed/${featured.videoId}`;
            document.querySelector('.sermon-title').textContent = featured.title;
            document.querySelector('.speaker').textContent = featured.speaker;
            document.querySelector('.date').textContent = new Date(featured.date).toLocaleDateString();
            document.querySelector('.duration').textContent = featured.duration;
            document.querySelector('.sermon-description').textContent = featured.description;
        }
    }

    // Create sermon card
    function createSermonCard(sermon) {
        return `
            <div class="sermon-card" data-id="${sermon.id}">
                <div class="sermon-thumbnail">
                    <img src="${sermon.thumbnail}" alt="${sermon.title}">
                    <div class="play-overlay">▶</div>
                </div>
                <div class="sermon-info">
                    <h4>${sermon.title}</h4>
                    <div class="sermon-meta">
                        <span class="speaker">${sermon.speaker}</span>
                        <span class="date">${new Date(sermon.date).toLocaleDateString()}</span>
                    </div>
                    <p class="sermon-excerpt">${sermon.description}</p>
                </div>
            </div>
        `;
    }

    // Load sermons
    function loadSermons() {
        const start = (currentPage - 1) * sermonsPerPage;
        const end = start + sermonsPerPage;
        const sermonsToShow = filteredSermons.slice(start, end);
        
        if (start === 0) {
            sermonList.innerHTML = '';
        }
        
        sermonsToShow.forEach(sermon => {
            sermonList.innerHTML += createSermonCard(sermon);
        });
        
        // Show/hide load more button
        loadMoreBtn.style.display = end < filteredSermons.length ? 'block' : 'none';
    }

    // Filter sermons
    function filterSermons() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedSpeaker = speakerFilter.value;
        const selectedDate = dateFilter.value;
        
        filteredSermons = sermons.filter(sermon => {
            const matchesSearch = sermon.title.toLowerCase().includes(searchTerm) ||
                                sermon.description.toLowerCase().includes(searchTerm);
            const matchesSpeaker = !selectedSpeaker || sermon.speaker === selectedSpeaker;
            const matchesDate = !selectedDate || checkDateMatch(sermon.date, selectedDate);
            
            return matchesSearch && matchesSpeaker && matchesDate;
        });
        
        currentPage = 1;
        loadSermons();
    }

    // Check if sermon date matches filter
    function checkDateMatch(date, filter) {
        const sermonDate = new Date(date);
        const now = new Date();
        
        switch(filter) {
            case 'this-week':
                const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
                return sermonDate >= weekStart;
            case 'this-month':
                return sermonDate.getMonth() === now.getMonth() && 
                       sermonDate.getFullYear() === now.getFullYear();
            case 'this-year':
                return sermonDate.getFullYear() === now.getFullYear();
            default:
                return true;
        }
    }

    // Event listeners
    searchInput.addEventListener('input', filterSermons);
    speakerFilter.addEventListener('change', filterSermons);
    dateFilter.addEventListener('change', filterSermons);
    loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        loadSermons();
    });

    // Initialize
    loadFeaturedSermon();
    loadSermons();

    // Handle sermon card clicks
    sermonList.addEventListener('click', (e) => {
        const card = e.target.closest('.sermon-card');
        if (card) {
            const sermonId = card.dataset.id;
            const sermon = sermons.find(s => s.id === parseInt(sermonId));
            if (sermon) {
                featuredVideo.src = `https://www.youtube.com/embed/${sermon.videoId}`;
                document.querySelector('.sermon-title').textContent = sermon.title;
                document.querySelector('.speaker').textContent = sermon.speaker;
                document.querySelector('.date').textContent = new Date(sermon.date).toLocaleDateString();
                document.querySelector('.duration').textContent = sermon.duration;
                document.querySelector('.sermon-description').textContent = sermon.description;
                
                // Scroll to featured sermon
                document.querySelector('.featured-sermon').scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});

