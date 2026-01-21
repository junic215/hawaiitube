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
                    <img class="thumbnail-img" 
                         data-video-id="${video.id}"
                         src="https://i.ytimg.com/vi_webp/${video.id}/maxresdefault.webp" 
                         alt="${video.title}" 
                         loading="lazy">
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

    // Setup thumbnail fallback after images load
    setupThumbnailFallback();
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

// Function to setup thumbnail fallback for images that fail to load properly
function setupThumbnailFallback() {
    const thumbnails = document.querySelectorAll('.thumbnail-img');

    thumbnails.forEach(img => {
        img.addEventListener('load', function () {
            // Check if the loaded image is a placeholder (YouTube returns 120x90 placeholder for 404s)
            if (this.naturalWidth < 200) {
                const videoId = this.getAttribute('data-video-id');

                // Try sddefault.jpg first
                const sdUrl = `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`;

                const testImg = new Image();
                testImg.onload = () => {
                    if (testImg.naturalWidth >= 200) {
                        this.src = sdUrl;
                    } else {
                        // Fall back to hqdefault.jpg
                        this.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
                    }
                };
                testImg.onerror = () => {
                    // If sddefault fails, use hqdefault
                    this.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
                };
                testImg.src = sdUrl;
            }
        });

        // Also handle actual errors
        img.addEventListener('error', function () {
            const videoId = this.getAttribute('data-video-id');
            this.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
        });
    });
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
