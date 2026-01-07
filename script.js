const gallery = document.getElementById('gallery');

function renderVideos() {
    gallery.innerHTML = '';

    videos.forEach(video => {
        const card = document.createElement('div');
        card.className = 'video-card';
        // video-wrapper has shadow and shape, video-info is text below
        card.innerHTML = `
            <div class="video-wrapper">
                <iframe 
                    src="https://www.youtube.com/embed/${video.id}?modestbranding=1&rel=0" 
                    title="${video.title}" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
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
