const gallery = document.getElementById('gallery');

function renderVideos() {
    gallery.innerHTML = '';

    videos.forEach(video => {
        const card = document.createElement('div');
        card.className = 'video-card';
        // USE FACADE PATTERN: Image first, Click for Video
        card.innerHTML = `
            <div class="video-wrapper" onclick="loadVideo(this, '${video.id}')">
                <div class="video-facade">
                     <!-- Added timestamp to force cache refresh -->
                    <img class="thumbnail-img" src="https://img.youtube.com/vi/${video.id}/maxresdefault.jpg?t=${new Date().getTime()}" alt="${video.title}" loading="lazy">
                </div>
            </div>
            <div class="video-info">
                <h2>${video.title}</h2>
                <p>${video.description}</p>
            </div>
        `;

        gallery.appendChild(card);
    });

    // Add Scroll Animation
    setupObserver();
}

// Function to replace Image with YouTube Iframe
function loadVideo(wrapper, videoId) {
    // Check if already loaded to avoid re-loading
    if (wrapper.querySelector('iframe')) return;

    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
    iframe.title = "YouTube video player";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;

    wrapper.appendChild(iframe);
}

function setupObserver() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1, // Trigger when 10% is visible
        rootMargin: "0px 0px -50px 0px" // Slight offset
    });

    const cards = document.querySelectorAll('.video-card');
    cards.forEach((card, index) => {
        // Stagger delay for top items just in case multiple load at once
        card.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(card);
    });
}

// Initialize
renderVideos();
