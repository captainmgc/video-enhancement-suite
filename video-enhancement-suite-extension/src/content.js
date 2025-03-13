// Initialize video controls
function initVideoControls() {
  const videos = document.getElementsByTagName('video');

  // Load saved filters
  chrome.storage.local.get(['videoFilters'], (result) => {
    if (result.videoFilters) {
      applyFilters(result.videoFilters);
    }
  });

  // Apply filters to all videos
  function applyFilters(filters) {
    Array.from(videos).forEach(video => {
      if (filters.brightness || filters.contrast || filters.saturation || filters.bluelight) {
        video.style.filter = `
          brightness(${filters.brightness || 100}%)
          contrast(${filters.contrast || 100}%)
          saturate(${filters.saturation || 100}%)
          sepia(${filters.bluelight || 0}%)
        `;
      }

      if (filters.speed) {
        video.playbackRate = filters.speed / 100;
      }
    });
  }

  // Reset filters
  function resetFilters() {
    Array.from(videos).forEach(video => {
      video.style.filter = '';
      video.playbackRate = 1;
    });
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'UPDATE_FILTERS') {
      applyFilters(message.filters);
    } else if (message.type === 'RESET_FILTERS') {
      resetFilters();
    }
  });
}

// Initialize when page loads
initVideoControls();

// Initialize when new videos are added to the page
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length) {
      const hasNewVideo = Array.from(mutation.addedNodes).some(
        node => node.nodeName === 'VIDEO'
      );
      if (hasNewVideo) {
        initVideoControls();
      }
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});