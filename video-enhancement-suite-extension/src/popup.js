// Add at the beginning of your popup.js file
document.getElementById('infoButton').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://github.com/captainmgc' });
});

document.addEventListener('DOMContentLoaded', () => {
  const controls = {
    brightness: document.getElementById('brightness'),
    contrast: document.getElementById('contrast'),
    saturation: document.getElementById('saturation'),
    speed: document.getElementById('speed'),
    bluelight: document.getElementById('bluelight')  // Yeni kontrol
  };

  const values = {
    brightness: document.getElementById('brightnessValue'),
    contrast: document.getElementById('contrastValue'),
    saturation: document.getElementById('saturationValue'),
    speed: document.getElementById('speedValue'),
    bluelight: document.getElementById('bluelightValue')  // Yeni değer
  };

  // Speed control buttons
  const decreaseSpeed = document.getElementById('decreaseSpeed');
  const increaseSpeed = document.getElementById('increaseSpeed');

  function updateSpeed(newValue) {
    const speed = controls.speed;
    const value = Math.max(25, Math.min(400, newValue));
    speed.value = value;
    values.speed.textContent = `${(value / 100).toFixed(2)}x`;

    // Save to storage and update video
    chrome.storage.local.get(['videoFilters'], (result) => {
      const filters = result.videoFilters || {};
      filters.speed = value;
      chrome.storage.local.set({ videoFilters: filters });

      // Send to content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'UPDATE_FILTERS',
          filters: { speed: value }
        });
      });
    });
  }

  // Speed button click handlers
  decreaseSpeed.addEventListener('click', () => {
    const currentValue = parseInt(controls.speed.value);
    updateSpeed(currentValue - 25);
  });

  increaseSpeed.addEventListener('click', () => {
    const currentValue = parseInt(controls.speed.value);
    updateSpeed(currentValue + 25);
  });

  // Load saved values
  chrome.storage.local.get(['videoFilters'], (result) => {
    if (result.videoFilters) {
      Object.entries(result.videoFilters).forEach(([key, value]) => {
        if (controls[key]) {
          controls[key].value = value;
          if (key === 'speed') {
            values[key].textContent = `${(value / 100).toFixed(2)}x`;
          } else {
            values[key].textContent = `${value}%`;
          }
        }
      });
    }
  });

  // Update values and save changes
  Object.entries(controls).forEach(([key, control]) => {
    control.addEventListener('input', (e) => {
      const value = e.target.value;
      if (key === 'speed') {
        values[key].textContent = `${(value / 100).toFixed(2)}x`;
      } else {
        values[key].textContent = `${value}%`;
      }

      // Save to storage
      chrome.storage.local.get(['videoFilters'], (result) => {
        const filters = result.videoFilters || {};
        filters[key] = value;
        chrome.storage.local.set({ videoFilters: filters });
      });

      // Send to content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'UPDATE_FILTERS',
          filters: { [key]: value }
        });
      });
    });
  });

  // Reset button
  document.getElementById('reset').addEventListener('click', () => {
    // Reset button içindeki defaultValues objesine ekleyelim
    const defaultValues = {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      speed: 100,
      bluelight: 0  // Varsayılan değer
    };

    Object.entries(defaultValues).forEach(([key, value]) => {
      controls[key].value = value;
      if (key === 'speed') {
        values[key].textContent = `${(value / 100).toFixed(2)}x`;
      } else {
        values[key].textContent = `${value}%`;
      }
    });

    chrome.storage.local.set({ videoFilters: defaultValues });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'RESET_FILTERS'
      });
    });
  });
});