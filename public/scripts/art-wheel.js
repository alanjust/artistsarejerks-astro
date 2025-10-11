console.log("Art wheel loading...");

let movements = [];
let currentMovementIndex = 0;
let selectedArtistIndex = 0;
let isDragging = false;
let startAngle = 0;

// Exact order of movements painted on the wheel (clockwise from title - REVERSED)
const wheelOrder = [
  "Art History Wheel",           // 0 - Title (pointer default)
  "AI and Algorithmic Art",      // 1
  "Social Practice Art",         // 2
  "Contemporary Indigenous Art", // 3
  "Post-Internet Art",          // 4
  "Bio Art",                    // 5
  "Relational Aesthetics",      // 6
  "Young British Artists (YBAs)",// 7
  "Digital Art / New Media Art",// 8
  "Installation Art",           // 9
  "Street Art / Graffiti Art",  // 10
  "Appropriation Art",          // 11
  "Neo-Expressionism",          // 12
  "Postminimalism",             // 13
  "Photorealism",               // 14
  "Land Art / Earthworks",       // 15
  "Performance Art",             // 16
  "Conceptual Art",              // 17
  "Minimalism",                  // 18
  "Pop Art"                      // 19
];

// Function to clean HTML tags and extra whitespace
function cleanHtmlText(text) {
  if (!text || typeof text !== 'string') return '';

  // Remove HTML tags
  let cleaned = text.replace(/<[^>]*>/g, '');

  // Remove extra whitespace and line breaks
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // Remove common HTML entities
  cleaned = cleaned.replace(/&nbsp;/g, ' ');
  cleaned = cleaned.replace(/&amp;/g, '&');
  cleaned = cleaned.replace(/&lt;/g, '<');
  cleaned = cleaned.replace(/&gt;/g, '>');
  cleaned = cleaned.replace(/&quot;/g, '"');

  return cleaned;
}

function getAngle(x, y, rect) {
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  return Math.atan2(y - centerY, x - centerX) * 180 / Math.PI;
}

function rotateWheel(degrees) {
  const wheel = document.getElementById("artWheel");
  if (wheel) {
    let currentRotation = parseInt(wheel.dataset.rotation || '0');
    currentRotation += degrees;
    wheel.style.transform = "rotate(" + currentRotation + "deg)";
    wheel.dataset.rotation = currentRotation;

    const normalizedRotation = ((currentRotation % 360) + 360) % 360;
    const newIndex = Math.round(normalizedRotation / 18) % 20;

    if (newIndex !== currentMovementIndex) {
      currentMovementIndex = newIndex;
      updateContent(currentMovementIndex);
    }
  }
}

function updateContent(index) {
  const movement = movements[index];
  if (!movement) return;

  selectedArtistIndex = 0;

  const artistsSection = document.getElementById("artistsSection");
  const artworkSection = document.getElementById("artworkSection");

  if (movement.isTitle) {
    // For the title section, show the main title and description
    document.getElementById("movementTitle").textContent = "Art History Wheel";
    document.getElementById("movementDescription").textContent = "This interactive wheel explores 19 major art movements that shaped contemporary culture. From Pop Art's rebellion against Abstract Expressionism to today's digital innovations, discover the artists, artworks, and ideas that transformed how we see the world. Click through each movement to explore key artists and their most significant works.";
    artistsSection.style.display = "none";
    artworkSection.style.display = "none";
  } else {
    // For movement sections, show the movement name (not "Art History Wheel")
    document.getElementById("movementTitle").textContent = movement.name;
    document.getElementById("movementDescription").textContent = cleanHtmlText(movement.description);

    artistsSection.style.display = "block";
    artworkSection.style.display = "block";

    const artistList = document.getElementById("artistList");
    artistList.innerHTML = "";

    if (movement.artists && movement.artists.length > 0) {
      movement.artists.forEach(function (artist, idx) {
        const li = document.createElement("li");
        li.className = "art-wheel-artist-item" + (idx === 0 ? " active" : "");
        li.textContent = artist.name;
        li.addEventListener("click", function () { selectArtist(idx); });
        artistList.appendChild(li);
      });

      updateFeaturedArtwork(movement, 0);
    }
  }
}

function selectArtist(index) {
  selectedArtistIndex = index;

  document.querySelectorAll(".art-wheel-artist-item").forEach(function (li, i) {
    if (i === index) {
      li.classList.add("active");
    } else {
      li.classList.remove("active");
    }
  });

  updateFeaturedArtwork(movements[currentMovementIndex], index);
}

function updateFeaturedArtwork(movement, index) {
  if (!movement.artists || !movement.artists[index]) return;

  const artist = movement.artists[index];

  document.getElementById("artworkTitle").textContent = cleanHtmlText(artist.artwork.title);
  document.getElementById("artworkArtist").textContent = "by " + cleanHtmlText(artist.name);
  // Clean the artwork description to remove HTML tags
  document.getElementById("artworkDescription").textContent = cleanHtmlText(artist.artwork.description);

  const img = document.getElementById("artworkImage");
  if (artist.artwork.imageUrl && artist.artwork.imageUrl !== '') {
    img.src = artist.artwork.imageUrl;
    img.alt = cleanHtmlText(artist.artwork.title) + " by " + cleanHtmlText(artist.name);
  } else {
    img.src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 200'><rect width='300' height='200' fill='%23ecf0f1'/><text x='150' y='100' text-anchor='middle' dy='0.3em' font-size='14' fill='%23666'>No Image</text></svg>";
  }

  // Store the artist slug for navigation
  const artworkSection = document.getElementById("artworkSection");
  if (artworkSection && artist.slug) {
    artworkSection.setAttribute('data-artist-slug', artist.slug);
  }
}

function loadArtData() {
  const dataScript = document.getElementById('art-data');
  if (dataScript) {
    try {
      const data = JSON.parse(dataScript.textContent);

      let movementsData = typeof data.movements === 'string' ? JSON.parse(data.movements) : data.movements;
      let artistsData = typeof data.artists === 'string' ? JSON.parse(data.artists) : data.artists;

      // Group artists by movement
      const artistsByMovement = {};
      artistsData.forEach(function (artist) {
        const movement = artist['Art Movement'];
        if (movement && movement !== '') {
          if (!artistsByMovement[movement]) {
            artistsByMovement[movement] = [];
          }
          artistsByMovement[movement].push({
            name: artist['Artist Name'],
            slug: artist['Slug'],
            artwork: {
              title: artist['Artwork Title'] || 'Untitled',
              description: artist['Artwork Description'] || '',
              imageUrl: artist['Notable Artwork'] || ''
            }
          });
        }
      });

      // Create movements lookup
      const movementLookup = {};
      movementsData.forEach(function (movement) {
        const name = movement['Movement Name'] || movement['Art Movement'];
        movementLookup[name] = movement;
      });

      // Build movements array in wheel order
      movements = wheelOrder.map(function (wheelName) {
        if (wheelName === "Art History Wheel") {
          return {
            name: "Art History Wheel",
            description: "Welcome to your comprehensive guide through contemporary art history.",
            isTitle: true
          };
        }

        // Find matching movement and artists
        let matchedMovement = null;
        let artists = [];

        for (let dataName in movementLookup) {
          if (dataName === wheelName) {
            matchedMovement = movementLookup[dataName];
            artists = artistsByMovement[dataName] || [];
            break;
          }
        }

        if (!matchedMovement) {
          for (let dataName in movementLookup) {
            if (dataName.includes(wheelName.split(' ')[0]) ||
              wheelName.includes(dataName.split(' ')[0])) {
              matchedMovement = movementLookup[dataName];
              artists = artistsByMovement[dataName] || [];
              break;
            }
          }
        }

        return {
          name: wheelName,
          description: matchedMovement ? (matchedMovement['Description'] || '') : 'Coming soon...',
          artists: artists
        };
      });

      updateContent(0);

    } catch (e) {
      console.error('Error loading data:', e);
    }
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function () {
  const wheel = document.getElementById("artWheel");
  if (!wheel) return;

  // Pointer events with momentum/inertia (physics-based)
  let dragging = false;
  let lastAngle = 0;
  let lastTs = 0;
  let velocity = 0; // deg/sec
  let inertiaFrame = null;
  let rotation = parseFloat(wheel.dataset.rotation || '0') || 0; // current rotation in degrees

  function normAngle(deg) {
    return ((deg % 360) + 360) % 360;
  }

  function setRotation(deg) {
    rotation = deg;
    wheel.style.transform = "rotate(" + rotation + "deg)";
    wheel.dataset.rotation = rotation;
    const normalizedRotation = normAngle(rotation);
    const newIndex = Math.round(normalizedRotation / 18) % 20;
    if (newIndex !== currentMovementIndex) {
      currentMovementIndex = newIndex;
      updateContent(currentMovementIndex);
    }
  }

  function angleFromEvent(e, rect) {
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const a = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI + 90;
    return normAngle(a);
  }

  function endDragWithInertia(e) {
    if (!dragging) return;
    dragging = false;
    try { wheel.releasePointerCapture(e.pointerId); } catch (_) { }
    document.body.style.userSelect = "";
    wheel.style.cursor = "grab";
    
    // Re-enable page scrolling
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";

    let v = velocity; // deg/sec
    const friction = 0.95;

    function tick() {
      if (Math.abs(v) < 5) { // threshold to stop
        setRotation(Math.round(rotation / 18) * 18);
        inertiaFrame = null;
        return;
      }
      setRotation(rotation + v / 60); // approximate per-frame advance (60fps)
      v *= friction;
      inertiaFrame = requestAnimationFrame(tick);
    }
    inertiaFrame = requestAnimationFrame(tick);
  }

  wheel.addEventListener('pointerdown', function (e) {
    // Prevent default touch behaviors that cause page scrolling
    e.preventDefault();
    
    // Sync with any external rotation changes done via rotateWheel()
    rotation = parseFloat(wheel.dataset.rotation || '0') || 0;
    if (inertiaFrame) { cancelAnimationFrame(inertiaFrame); inertiaFrame = null; }
    dragging = true;
    wheel.setPointerCapture(e.pointerId);
    const rect = wheel.getBoundingClientRect();
    lastAngle = angleFromEvent(e, rect);
    lastTs = e.timeStamp;
    velocity = 0;
    wheel.style.cursor = "grabbing";
    document.body.style.userSelect = "none";
    
    // Disable page scrolling during wheel interaction
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
  });

  wheel.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    
    // Prevent default touch behaviors during dragging
    e.preventDefault();
    
    const rect = wheel.getBoundingClientRect();
    const a = angleFromEvent(e, rect);
    let delta = a - lastAngle;
    if (delta > 180) delta -= 360; if (delta < -180) delta += 360;
    setRotation(rotation + delta);
    const dt = e.timeStamp - lastTs;
    if (dt > 0) {
      const v = (delta / dt) * 1000; // deg/sec
      velocity = 0.8 * velocity + 0.2 * v; // low-pass filter
    }
    lastAngle = a;
    lastTs = e.timeStamp;
  });

  wheel.addEventListener('pointerup', endDragWithInertia);
  wheel.addEventListener('pointercancel', endDragWithInertia);
  
  // Additional touch event prevention for better mobile support
  wheel.addEventListener('touchstart', function(e) {
    e.preventDefault();
  }, { passive: false });
  
  wheel.addEventListener('touchmove', function(e) {
    e.preventDefault();
  }, { passive: false });
  
  wheel.addEventListener('touchend', function(e) {
    e.preventDefault();
  }, { passive: false });

  // Add click handler for artwork section to navigate to artist page
  const artworkSection = document.getElementById("artworkSection");
  if (artworkSection) {
    artworkSection.addEventListener("click", function (e) {
      const slug = this.getAttribute('data-artist-slug');
      if (slug) {
        // Navigate to the artist page
        window.location.href = '/artists/' + slug;
      }
    });
  }

  // Load data
  loadArtData();
});
