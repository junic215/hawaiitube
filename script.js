const gallery = document.getElementById('gallery');

function renderVideos() {
    gallery.innerHTML = '';

    videos.forEach(video => {
        const card = document.createElement('div');
        card.className = 'video-card';

        card.innerHTML = `
            <div class="video-wrapper">
                <iframe 
                    width="560" 
                    height="315" 
                    src="https://www.youtube.com/embed/${video.id}" 
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
}

// Initialize
renderVideos();
