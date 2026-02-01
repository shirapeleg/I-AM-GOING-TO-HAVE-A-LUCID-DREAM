let pg; // Graphics buffer for text rendering
let pgNegative; // Graphics buffer for negative text at the end
let staticTextPoints = []; // Pre-calculated points where text exists
let romiImg; // Image for ASCII background
let sunImg; // Sun image for top right
let cloudsImg; // Clouds image for ASCII layer
let cloudsRightImg; // Second cloud image
let batimImg; // Buildings image
let roadImg; // Road image
let flowersImg; // Flowers image
let flowersMask = []; // 2D mask for flowers
let roadMask = []; // 2D mask for road
let carsLeftImg; // Cars image
let carsLeftMask = []; // 2D mask for cars
let carsRightImg; // Cars right image
let carsRightMask = []; // 2D mask for cars right
let fishVid; // Fish video
let peopleVid; // People video
let kidVid; // Kid video
let fisherVid; // Fisher video
let chitaVid; // Chita video for footer
let stripVid; // Strip video
let birdVid; // Bird video
let bestTreesVid; // Best trees video
let cellSize = 7; // Resolution for ASCII grid
let pixelSize = 3; // Size of each pixel square
let pixelOffsetY = 137; // Offset to move all pixels down (adjusted)
let mouseXPos = 0;
let mouseYPos = 0;
let scatterRadius = 80; // Radius around mouse that triggers scattering
let isSquareMode = false; // State for square mode
let pixelData = []; // Store all pixel data for square mode
let longPressStartTime = 0; // Time when mouse was pressed
let longPressThreshold = 500; // Milliseconds for long press (500ms)
let isLongPressActive = false; // Whether long press is currently active
let longPressPixels = new Map(); // Store new positions for pixels after long press (key: pixel index, value: {x, y})
let longPressRadius = 100; // Radius for long press effect (reduced from 150)
let longPressStrength = 0.12; // Movement strength per frame (reduced from 0.5 for gentler suction)
let lastResetTime = 0; // Time when pixels were last reset to original positions
let resetInterval = 15000; // Reset interval in milliseconds (15 seconds)
let isResetting = false; // Whether gradual reset is in progress
let resetStartTime = 0; // Time when reset started
let resetDuration = 2000; // Duration of gradual reset in milliseconds (2 seconds)
let transitionActive = false; // Whether transition is in progress
let userText = ""; // Store text from textarea
let textBuffer = null; // Graphics buffer for user text
let textPixelPositions = []; // Store pixel positions for user text
let transitionProgress = 0; // Transition progress (0 to 1)
let transitionSpeed = 0.02; // Speed of transition
let sourceParticlePositions = []; // Store source positions for transition
let targetParticlePositions = []; // Store target positions for transition
let transitionParticleData = []; // Store particle data during transition
let overlappingPositions = new Set(); // Store overlapping positions as strings for quick lookup
let sourceOriginalPositions = []; // Store original source positions (without noise) for overlap detection
let targetOriginalPositions = []; // Store original target positions (without noise) for overlap detection
let edgeMap = []; // Store Sobel edge detection data (magnitude and angle)
let cloudsEdgeMap = []; // Store edge data for clouds layer
let cloudsEdgeMap2 = []; // Store edge data for second clouds layer
let sunEdgeMap = []; // Store edge data for sun layer
let sunPixels = []; // Store pixel data for sun
let cloudsPixels = []; // Store pixel data for shimmering clouds
let cloudsMask = []; // 2D mask for cloud 1
let cloudsRightMask = []; // 2D mask for cloud 2
let batimMask = []; // 2D mask for buildings
let cloudsXOffset = 0; // Horizontal offset for clouds movement
let carsXOffset = 0; // Horizontal offset for cars movement
let edgeThreshold = 15; // Threshold for edge detection (lower = more detail)

// Bayer matrix for dithering
const bayerMatrix = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5]
];

// Color palette (will be updated dynamically based on scroll)
let colors = [
  [217, 217, 217], // #D9D9D9
  [107, 107, 107], // #6B6B6B
  [64, 65, 85],    // #404155
];

let sunEntryProgress = 0; // Current entry progress based on scroll
let currentBgColor = [255, 255, 255]; // Track background color for sun rays effect

// Function to update colors from external script (called from HTML)
function updateP5Colors(newColors, bgColor) {
  if (newColors && newColors.length >= 3) {
    colors = [
      [...newColors[0]], // Primary color
      [...newColors[1]], // Secondary color
      [...newColors[2]]  // Tertiary color
    ];
  }
  if (bgColor) {
    currentBgColor = [...bgColor];
  }
}

// Helper function to apply stroke based on color index
function applyPixelStroke(colorIndex) {
  if (colorIndex === 1) { // Secondary color (#6B6B6B)
    stroke(0);
    strokeWeight(0.5);
  } else if (colorIndex === 0) { // Primary color (#D9D9D9)
    stroke(158, 158, 161); // #9E9EA1
    strokeWeight(0.5);
  } else {
    noStroke();
  }
}

// Hover color effect parameters
const hoverEffectColor = [117, 139, 253]; // #758BFD
const hoverEffectRadius = 100;

function applyPixelFill(baseColor, x, y) {
  let d = dist(x, y, mouseXPos, mouseYPos);
  if (d < hoverEffectRadius) {
    let amt = map(d, 0, hoverEffectRadius, 1, 0);
    fill(
      lerp(baseColor[0], hoverEffectColor[0], amt),
      lerp(baseColor[1], hoverEffectColor[1], amt),
      lerp(baseColor[2], hoverEffectColor[2], amt)
    );
  } else {
    fill(baseColor[0], baseColor[1], baseColor[2]);
  }
}

function preload() {
  // Load only existing files to prevent freezing
  romiImg = loadImage('last.png');
  cloudsImg = loadImage('clouds.png');
  cloudsRightImg = loadImage('images/clouds right2.png');
  batimImg = loadImage('images/bait.png');
  roadImg = loadImage('images/road.png');
  carsLeftImg = loadImage('images/cars left.png');
  carsRightImg = loadImage('images/cars right.png');
  sunImg = loadImage('images/sun.png');
  flowersImg = loadImage('images/flowers.png');
  try {
    fishVid = createVideo(['images/amen fish.mov']);
    fishVid.hide();
    peopleVid = createVideo(['images/people1.mp4']);
    peopleVid.hide();
    kidVid = createVideo(['images/kid.mov']);
    kidVid.hide();
    fisherVid = createVideo(['images/fisher.mov']);
    fisherVid.hide();
    stripVid = createVideo(['images/strip.mov']);
    stripVid.hide();
    birdVid = createVideo(['images/bird.mov']);
    birdVid.hide();
    bestTreesVid = createVideo(['images/best trees.mov']);
    bestTreesVid.hide();
    chitaVid = createVideo(['images/chita.mov']);
    chitaVid.hide();
  } catch (e) { console.error("Video load error:", e); }
}

function setup() {
  let w = windowWidth > 0 ? windowWidth : window.innerWidth;
  let h = windowHeight > 0 ? windowHeight : window.innerHeight;
  
  createCanvas(w, h);
  pixelDensity(displayDensity());
  
  // Initialize text buffer first to ensure main title works even if images fail
  initTextBuffer();
  lastResetTime = millis();

  // Wrap image processing in try-catch for robustness
  try {
    if (romiImg && romiImg.width > 1) {
      let docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, h * 2.5);
    romiImg.resize(w, docHeight);
      analyzeEdges(romiImg, edgeMap);
    }
  } catch (e) { console.error("Error loading romiImg:", e); }
  
  try {
    if (cloudsImg && cloudsImg.width > 1) {
      // Resize to full window width
      let cloudsScale = w / cloudsImg.width;
      cloudsImg.resize(w, cloudsImg.height * cloudsScale); 
      analyzeEdges(cloudsImg, cloudsEdgeMap);
      initCloudsPixels(cloudsImg, cloudsMask);
    }
  } catch (e) { console.error("Error loading cloudsImg:", e); }

  try {
    if (cloudsRightImg && cloudsRightImg.width > 1) {
      // Resize second cloud as well
      let cloudsScale = (w * 0.8) / cloudsRightImg.width;
      cloudsRightImg.resize(w * 0.8, cloudsRightImg.height * cloudsScale);
      initCloudsPixels(cloudsRightImg, cloudsRightMask);
    }
  } catch (e) { console.error("Error loading cloudsRightImg:", e); }

  try {
    if (batimImg && batimImg.width > 1) {
      // Resize buildings image to full width
      let batimScale = w / batimImg.width;
      batimImg.resize(w, batimImg.height * batimScale);
      initCloudsPixels(batimImg, batimMask);
    }
  } catch (e) { console.error("Error loading batimImg:", e); }
  
  try {
    if (sunImg && sunImg.width > 1) {
      let sunScale = 180 / sunImg.width;
      sunImg.resize(180, sunImg.height * sunScale);
      analyzeEdges(sunImg, sunEdgeMap);
      initSunPixels();
    }
  } catch (e) { console.error("Error loading sunImg:", e); }

  try {
    if (roadImg && roadImg.width > 1) {
      let roadScale = w / roadImg.width;
      roadImg.resize(w, roadImg.height * roadScale);
      initCloudsPixels(roadImg, roadMask);
    }
  } catch (e) { console.error("Error loading roadImg:", e); }

  try {
    if (carsLeftImg && carsLeftImg.width > 1) {
      let carsScale = w / carsLeftImg.width;
      carsLeftImg.resize(w, carsLeftImg.height * carsScale);
      initCloudsPixels(carsLeftImg, carsLeftMask);
    }
  } catch (e) { console.error("Error loading carsLeftImg:", e); }

  try {
    if (carsRightImg && carsRightImg.width > 1) {
      let carsScale = w / carsRightImg.width;
      carsRightImg.resize(w, carsRightImg.height * carsScale);
      initCloudsPixels(carsRightImg, carsRightMask);
    }
  } catch (e) { console.error("Error loading carsRightImg:", e); }

  try {
    if (flowersImg && flowersImg.width > 1) {
      let flowersScale = w / flowersImg.width;
      flowersImg.resize(w, flowersImg.height * flowersScale);
      initCloudsPixels(flowersImg, flowersMask);
    }
  } catch (e) { console.error("Error loading flowersImg:", e); }

  try {
    if (fishVid) {
      fishVid.hide();
      fishVid.loop();
      fishVid.volume(0);
      fishVid.speed(0.2); // Even slower motion (20% speed)
      // Use a smaller internal buffer for processing to keep performance high
      fishVid.size(640, 360); 
    }
    if (peopleVid) {
      peopleVid.hide();
      peopleVid.loop();
      peopleVid.volume(0);
      peopleVid.speed(0.3); // Slowed down further
      peopleVid.size(640, 360);
    }
    if (kidVid) {
      kidVid.hide();
      kidVid.loop();
      kidVid.volume(0);
      kidVid.speed(0.3); // Match people video speed
      kidVid.size(640, 360);
    }
    if (fisherVid) {
      fisherVid.hide();
      fisherVid.loop();
      fisherVid.volume(0);
      fisherVid.speed(1.0); // Normal speed as requested
      fisherVid.size(640, 360);
    }
    if (bestTreesVid) {
      bestTreesVid.hide();
      bestTreesVid.loop();
      bestTreesVid.volume(0);
      bestTreesVid.speed(0.4);
      bestTreesVid.size(640, 360);
    }
    if (chitaVid) {
      chitaVid.hide();
      chitaVid.loop();
      chitaVid.volume(0);
      chitaVid.size(160, 120); // Small size for footer processing
    }
  } catch (e) { console.error("Error setting up videos:", e); }
}

// Helper to create a mask based on edges for thinner outlines
function initEdgeMask(img, maskArray, edgeMap, threshold) {
  if (!img || edgeMap.length === 0) return;
  
  let w = img.width;
  let h = img.height;
  
  maskArray.length = 0;
  for (let i = 0; i < w; i++) {
    maskArray[i] = new Array(h).fill(false);
  }

  for (let i = 0; i < edgeMap.length; i++) {
    for (let j = 0; j < edgeMap[i].length; j++) {
      if (edgeMap[i][j].magnitude > threshold) {
        // Map grid coordinate back to image pixels
        let x = i * cellSize;
        let y = j * cellSize;
        if (x < w && y < h) {
          maskArray[x][y] = true;
        }
      }
    }
  }
}

function initCloudsPixels(img, maskArray) {
  if (!img) return;

  img.loadPixels();
  let w = img.width;
  let h = img.height;
  
  // Initialize mask
  maskArray.length = 0;
  for (let i = 0; i < w; i++) {
    maskArray[i] = new Array(h).fill(false);
  }

  // Mark all pixels that are part of the cloud shape (darker than background)
    for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      let idx = (j * w + i) * 4;
      let r = img.pixels[idx];
      let g = img.pixels[idx+1];
      let b = img.pixels[idx+2];
      let a = img.pixels[idx+3];
      
      let brightness = (r + g + b) / 3;
      
      // If it's not white and has some opacity, it's part of the cloud
      // This preserves the precise shape of the image without destructive filling
      if (a > 10 && brightness < 250) {
        maskArray[i][j] = true;
      }
    }
  }
}

function drawCloudsPixels() {
  if ((!cloudsImg || cloudsMask.length === 0) && (!cloudsRightImg || cloudsRightMask.length === 0) && (!batimImg || batimMask.length === 0)) return;

  let scrollY = window.pageYOffset || window.scrollY || 0;

  let w = width > 0 ? width : window.innerWidth;
  let h = height > 0 ? height : window.innerHeight;
  
  // Use standardized "aggressive" time from main title
  let time = frameCount * 0.0008;
  
  // Horizontal movement
  cloudsXOffset -= 0.8;
  carsXOffset += 0.5; // Slow movement from left to right

  // Position parameters
  let largeTitleCenterY = h / 2 - 100;
  let largeTitleHeight = w * 0.15;
  let spacing = 300;
  let initialSmallTitleTop = largeTitleCenterY + (largeTitleHeight / 2) + spacing;
  let baseStartY = initialSmallTitleTop - 150; 

  // Animation for clouds rising from the bottom together with the first scroll
  let cloudRiseThreshold = 800; // How much scroll it takes to reach normal position
  let riseProgress = constrain(scrollY / cloudRiseThreshold, 0, 1);
  // Using cubic ease-out for a smooth arrival
  let easedRise = 1 - Math.pow(1 - riseProgress, 3);
  let initialRiseOffset = h * 1.2; // Start well below the screen
  let currentRiseOffset = lerp(initialRiseOffset, 0, easedRise);
  
  // Use animated startY for the first section
  let startY = baseStartY + currentRiseOffset; 

  // Sampling for clouds - use the same step size as the main title
  let cloudStepSize = pixelSize * 2; 
  
  // Calculate base position for buildings and video using static base position for consistency
  let staticBatimY = baseStartY + (cloudsImg ? cloudsImg.height : 400) + 300;
  let batimY = staticBatimY + currentRiseOffset;

  // Pre-calculate static birdY so reappearance scroll is consistent
  let bHeight_temp = (batimImg && batimImg.height > 10) ? batimImg.height : 400;
  let loveHeight_temp = w * (9/16);
  let staticTreesY = staticBatimY + bHeight_temp + loveHeight_temp + 1630;
  let fisherHeight_temp = (fisherVid && fisherVid.width > 0) ? fisherVid.height * (width / fisherVid.width) : 500;
  let staticBirdY = staticTreesY + 3000 + fisherHeight_temp;
  
  // Current positions for the first section
  let treesY = staticTreesY + currentRiseOffset;
  let birdY = staticBirdY + currentRiseOffset;

  // 5. Reappearance of clouds and buildings before bird disappears
  // To keep them in the same relative position at the end of the scroll,
  // we compensate for the parallax difference that accumulates over the long scroll.
  // Use staticBirdY here so the scroll target doesn't move during the rise animation
  let S_end = (staticBirdY + pixelOffsetY - height * 0.35) / 1.2;
  let targetY = height * 1.8; // Target screen position (even lower, appearing much later)
  
  let reappearanceStartY = targetY - 100 + S_end * 0.5 - pixelOffsetY;
  let reappearanceStartY2 = targetY + 100 + S_end * 0.7 - pixelOffsetY;
  let cHeight = (cloudsImg && cloudsImg.height > 10) ? cloudsImg.height : 400;
  let reappearanceBatimY = targetY + cHeight + 300 + S_end * 0.75 - pixelOffsetY;

  // Calculate release scroll for the bird (when buildings reach the sticky bird)
  let birdStickyY = height * 0.35;
  let birdReleaseScroll = (reappearanceBatimY + pixelOffsetY - birdStickyY) / 0.75;

  // Render elements in order (bottom to top)
  
    // 1b. Road (road.png) - replaces moving tree
    if (roadImg && roadMask.length > 0) {
      renderCloud(roadImg, roadMask, treesY, scrollY, time, 0, 1.2, false, "road", null);
    }

    // 1b.5 Best Trees Video (best trees.mov) - placed over the top part of the road
    if (bestTreesVid) {
      renderVideo(bestTreesVid, treesY, scrollY, time, 0, 1.2, "bestTrees", 85);
    }

    // 1c. Cars Left (cars left.png) - placed on the horizontal lines under the trees
    if (carsLeftImg && carsLeftMask.length > 0) {
      renderCloud(carsLeftImg, carsLeftMask, treesY + 815, scrollY, time, 0, 1.2, true, "carsLeft", null);
    }

    // 1d. Cars Right (cars right.png) - placed immediately below cars left, moving like clouds
    if (carsRightImg && carsRightMask.length > 0) {
      renderCloud(carsRightImg, carsRightMask, treesY + 1135, scrollY, time, 0, 1.2, true, "carsRight", null);
    }

    // 1e. Kid Video (kid.mov) - appears under the flowers from edge to edge
    if (kidVid && kidVid.width > 0) {
      renderVideo(kidVid, treesY + 2400, scrollY, time, 0, 1.2, "kid", 85, true);
    }

    // 1f. Fisher Video (fisher.mov) - right below kid video
    if (fisherVid && fisherVid.width > 0) {
      renderVideo(fisherVid, treesY + 3200, scrollY, time, 0, 1.2, "fisher", 110);
    }

      // 1h. Bird Video (bird.mov) - right below fisher video, small and on the right
    if (birdVid && birdVid.width > 0) {
      // First bird (original)
      let birdWidth = width * 0.55; // Even larger for better edge definition
      let birdX = width - birdWidth + 40; // Shifted 40px further right
      renderVideo(birdVid, birdY, scrollY, time, birdX, 1.2, "bird", 75, false, birdWidth, birdReleaseScroll);
      
      // Second bird (smaller, to the left of the first)
      let bird2Width = width * 0.35; // Smaller
      let bird2X = birdX - bird2Width; // Exactly to the left
      renderVideo(birdVid, birdY - 250, scrollY, time, bird2X, 1.2, "bird2", 75, false, bird2Width, birdReleaseScroll);
    }

    // 1i. Strip Video (strip.mov) - right below kida video
    if (stripVid && stripVid.width > 0) {
      let bHeight = (batimImg && batimImg.height > 10) ? batimImg.height : 400;
      let stripY = batimY + bHeight;
      renderVideo(stripVid, stripY, scrollY, time, 0, 0.75, "strip", 85);
    }

    // 1g. Flowers (flowers.png) - moved down and uses different parallax for overlap
    if (flowersImg && flowersMask.length > 0) {
      renderCloud(flowersImg, flowersMask, treesY + 3020, scrollY, time, 0, 1.38, false, "flowers", null);
    }

    // 1g. People Video (people1.mp4) - appears under the cars from edge to edge
    if (peopleVid) {
      renderVideo(peopleVid, treesY + 1200, scrollY, time, 0, 1.2, "people", 85);
    }
  // 2. Buildings (bait.png) - appear under clouds but depth relative to video varies
  renderCloud(batimImg, batimMask, batimY, scrollY, time, 0, 0.75, false, "batim", null);

  // 3. Fish Video (amen fish.mov) - appears on top of trees
  if (fishVid) {
    let bHeight = (batimImg && batimImg.height > 10) ? batimImg.height : 400;
    let loveY = batimY + bHeight + 170; 
    // Slowed down parallax from 0.75 to 0.7
    renderVideo(fishVid, loveY, scrollY, time, 0, 0.7, "fish");
  }
  
  // 4. Clouds (on top of everything)
  renderCloud(cloudsImg, cloudsMask, startY, scrollY, time, 0, 0.5, true, "cloud1", null);
  renderCloud(cloudsRightImg, cloudsRightMask, startY + 200, scrollY, time, width * 0.5, 0.7, true, "cloud2", null);

  // Render reappearance elements (calculated earlier)
  renderCloud(batimImg, batimMask, reappearanceBatimY, scrollY, time, 0, 0.75, false, "batim_re", null);
  renderCloud(cloudsImg, cloudsMask, reappearanceStartY, scrollY, time, 0, 0.5, true, "cloud1_re", null);
  renderCloud(cloudsRightImg, cloudsRightMask, reappearanceStartY2, scrollY, time, width * 0.5, 0.7, true, "cloud2_re", null);

  // Render chita video in footer
  if (chitaVid) {
    let placeholder = document.getElementById('footer-chita-placeholder');
    if (placeholder) {
      let rect = placeholder.getBoundingClientRect();
      let canvasRect = canvas.getBoundingClientRect();
      let chitaX = rect.left - canvasRect.left + rect.width / 2;
      let chitaY = rect.top - canvasRect.top;
      
      // Calculate S_max (total scroll distance) to determine when to show chita
      let bHeight = (batimImg && batimImg.height > 10) ? batimImg.height : 400;
      let secondTextY = reappearanceBatimY + bHeight;
      let S_max = (secondTextY + pixelOffsetY) / 0.75;
      
      // Footer enters viewport when scrollY > S_max - height
      // Chita starts rising from the bottom 350px before footer enters
      let chitaStartScroll = S_max - height - 350;
      let chitaRiseEndScroll = S_max - height + 100; // Reaches sticky position
      
      if (scrollY > chitaStartScroll) {
        // Target position above the footer text
        let stickyY = height - 210; 
        
        // Calculate the rising animation position
        let riseProgress = constrain((scrollY - chitaStartScroll) / (chitaRiseEndScroll - chitaStartScroll), 0, 1);
        // Cubic ease out for a smooth "landing" at the sticky position
        let easedRise = 1 - Math.pow(1 - riseProgress, 3);
        let currentStickyY = lerp(height + 150, stickyY, easedRise);
        
        // Final screen Y is the minimum of its natural position (moving with footer)
        // and the current rising/sticky position
        let drawY = min(chitaY - 70, currentStickyY);
        
        renderVideo(chitaVid, drawY - pixelOffsetY, 0, time, chitaX - (width * 0.15 / 2), 0, "chita", 85, false, width * 0.15);
      }
    }
  }
}

function renderVideo(vid, startY, scrollY, time, xShift, parallaxFactor, vidId, threshold = 85, flipV = false, customWidth = null, releaseScroll = null) {
  if (!vid) return;

  // Sticky logic for bird - calculate adjusted scroll for the entire video
  let effectiveScrollY = scrollY;
  if (vidId.includes("bird")) {
    let isWhiteBg = currentBgColor[0] > 245 && currentBgColor[1] > 245 && currentBgColor[2] > 245;
    
    // Check if it should be sticky (not white bg or not released yet)
    let stickyThreshold = height * 0.35;
    let scrollAtThreshold = (startY + pixelOffsetY - stickyThreshold) / parallaxFactor;

    if (scrollY > scrollAtThreshold) {
      effectiveScrollY = scrollAtThreshold;
      
      // Release logic: stop being sticky and move up when released or background is white
      if ((releaseScroll && scrollY > releaseScroll) || isWhiteBg) {
        let releasePoint = releaseScroll || scrollY; // Use current scroll if white bg triggered release
        // Move up from the sticky position. 
        // We add (scrollY - releasePoint) to effectiveScrollY so it starts increasing.
        effectiveScrollY = scrollAtThreshold + (scrollY - releasePoint);
      }
    }
    
    // Specific logic for bird2 release (keeping it for consistency if needed)
    if (vidId === "bird2" && !isWhiteBg) {
      let b2ReleasePoint = (startY + 150 + pixelOffsetY) / parallaxFactor;
      if (scrollY > b2ReleasePoint && (!releaseScroll || b2ReleasePoint < releaseScroll)) {
        effectiveScrollY = scrollAtThreshold + (scrollY - b2ReleasePoint);
      }
    }
  }

  // Frustum Culling: Skip processing if video is completely off-screen
  let targetWidth = customWidth || width;
  let approxScale = targetWidth / (vid.width || 640);
  let approxHeight = (vid.height || 360) * approxScale;
  let screenYTop = startY - effectiveScrollY * parallaxFactor + pixelOffsetY;
  let screenYBottom = screenYTop + approxHeight;
  
  if (screenYBottom < -200 || screenYTop > height + 200) return;
  
  if (vid.elt && vid.elt.paused) {
    vid.loop();
  }

  vid.loadPixels();
  if (!vid.pixels || vid.pixels.length === 0) return;

  // Calculate how many video pixels represent a fixed screen-space step (e.g., 6 pixels like clouds)
  let screenStep;
  if (vidId === "chita" || vidId === "strip") {
    screenStep = pixelSize * 1.0; // Even denser for clarity
  } else if (vidId.includes("bird") || vidId === "bestTrees") {
    screenStep = pixelSize * 1.6; // Slightly denser for better outlines
  } else {
    screenStep = pixelSize * 2;
  }
  let step = screenStep * (vid.width / targetWidth);
  step = max(1, step);

  // Calculate scale factor
  let scaleX = targetWidth / vid.width;
  let scaleY = scaleX; // Maintain aspect ratio based on width

  let currentVideoPixels = [];
  
  for (let i = 0; i < vid.width; i += step) {
    for (let j = 0; j < vid.height; j += step) {
      let idx = (floor(j) * vid.width + floor(i)) * 4;
      let r = vid.pixels[idx];
      let g = vid.pixels[idx+1];
      let b = vid.pixels[idx+2];
      let a = vid.pixels[idx+3];
      
      let bright = (r + g + b) / 3;
      // Skip background (only keep brighter areas like the fish or people)
      // Uses configurable threshold for better isolation
      if (a < 50 || bright < threshold) continue; 

      // Special check for "kid" and "kida" videos to filter out blue water
      if (vidId === "kida") {
        // More aggressive filtering for kida to isolate the girl
        if (b > r + 10 || b > g + 10) continue; 
        if (bright < 100) continue; // Skip darker pixels to focus on the girl
      } else if (vidId === "kid" && b > r + 20 && b > g) {
        continue;
      }

      // Special check for "fisher" video to filter out blue/dark water and corals
      if (vidId === "fisher") {
        // Filter out blue water
        if (b > r + 5 || b > g + 5) continue;
        // Filter out reddish/brownish corals (where Red is significantly higher than Blue/Green)
        if (r > g + 20 || r > b + 20) continue;
      }

      // Special check for "chita" video to filter out green background
      if (vidId === "chita") {
        if (g > r + 5 && g > b + 5) continue;

        // Detect outlines/edges for the chita to make it clearer
        let isEdge = false;
        if (i > step && j > step && i < vid.width - step && j < vid.height - step) {
          let leftIdx = (floor(j) * vid.width + floor(i - step)) * 4;
          let rightIdx = (floor(j) * vid.width + floor(i + step)) * 4;
          let topIdx = (floor(j - step) * vid.width + floor(i)) * 4;
          let bottomIdx = (floor(j + step) * vid.width + floor(i)) * 4;

          let leftBright = (vid.pixels[leftIdx] + vid.pixels[leftIdx+1] + vid.pixels[leftIdx+2]) / 3;
          let rightBright = (vid.pixels[rightIdx] + vid.pixels[rightIdx+1] + vid.pixels[rightIdx+2]) / 3;
          let topBright = (vid.pixels[topIdx] + vid.pixels[topIdx+1] + vid.pixels[topIdx+2]) / 3;
          let bottomBright = (vid.pixels[bottomIdx] + vid.pixels[bottomIdx+1] + vid.pixels[bottomIdx+2]) / 3;

          // Sensitive edge detection for chita shape
          if (abs(bright - leftBright) > 12 || abs(bright - rightBright) > 12 || 
              abs(bright - topBright) > 12 || abs(bright - bottomBright) > 12) {
            isEdge = true;
          }
        }

        if (isEdge) {
          currentVideoPixels.push({x: i, y: j, origI: i, origJ: j, isEdge: true});
          continue;
        }
      }

      // Special check for "bestTrees" video to enhance outlines
      if (vidId === "bestTrees") {
        // Filter out very dark/background pixels if needed, but here we want clarity
        if (bright < 50) continue;

        let isEdge = false;
        if (i > step && j > step && i < vid.width - step && j < vid.height - step) {
          let leftIdx = (floor(j) * vid.width + floor(i - step)) * 4;
          let rightIdx = (floor(j) * vid.width + floor(i + step)) * 4;
          let topIdx = (floor(j - step) * vid.width + floor(i)) * 4;
          let bottomIdx = (floor(j + step) * vid.width + floor(i)) * 4;

          let leftBright = (vid.pixels[leftIdx] + vid.pixels[leftIdx+1] + vid.pixels[leftIdx+2]) / 3;
          let rightBright = (vid.pixels[rightIdx] + vid.pixels[rightIdx+1] + vid.pixels[rightIdx+2]) / 3;
          let topBright = (vid.pixels[topIdx] + vid.pixels[topIdx+1] + vid.pixels[topIdx+2]) / 3;
          let bottomBright = (vid.pixels[bottomIdx] + vid.pixels[bottomIdx+1] + vid.pixels[bottomIdx+2]) / 3;

          // Sensitive edge detection for tree details
          if (abs(bright - leftBright) > 10 || abs(bright - rightBright) > 10 || 
              abs(bright - topBright) > 10 || abs(bright - bottomBright) > 10) {
            isEdge = true;
          }
        }

        if (isEdge) {
          currentVideoPixels.push({x: i, y: j, origI: i, origJ: j, isEdge: true});
          continue;
        }
      }

      // Special check for "fish" video to filter out green background
      if (vidId === "fish") {
        // Filter out green background
        if (g > r + 10 && g > b + 10) continue;

        // Detect outlines/edges for the fish to make it clearer
        let isEdge = false;
        if (i > step && j > step && i < vid.width - step && j < vid.height - step) {
          let leftIdx = (floor(j) * vid.width + floor(i - step)) * 4;
          let rightIdx = (floor(j) * vid.width + floor(i + step)) * 4;
          let topIdx = (floor(j - step) * vid.width + floor(i)) * 4;
          let bottomIdx = (floor(j + step) * vid.width + floor(i)) * 4;

          let leftBright = (vid.pixels[leftIdx] + vid.pixels[leftIdx+1] + vid.pixels[leftIdx+2]) / 3;
          let rightBright = (vid.pixels[rightIdx] + vid.pixels[rightIdx+1] + vid.pixels[rightIdx+2]) / 3;
          let topBright = (vid.pixels[topIdx] + vid.pixels[topIdx+1] + vid.pixels[topIdx+2]) / 3;
          let bottomBright = (vid.pixels[bottomIdx] + vid.pixels[bottomIdx+1] + vid.pixels[bottomIdx+2]) / 3;

          // Slightly more sensitive edge detection (12 instead of 15)
          if (abs(bright - leftBright) > 12 || abs(bright - rightBright) > 12 || 
              abs(bright - topBright) > 12 || abs(bright - bottomBright) > 12) {
            isEdge = true;
          }
        }

        if (isEdge) {
          currentVideoPixels.push({x: i, y: j, origI: i, origJ: j, isEdge: true});
          continue;
        }
      }

      // Special check for "strip" video to isolate characters (filter out blue background)
      if (vidId === "strip") {
        if (b > r + 15 || b > g + 15) continue; // Filter out blueish background
        if (bright < 110) continue; // Only keep brighter characters

        // Detect outlines/edges for the strip to make it clearer
        let isEdge = false;
        if (i > step && j > step && i < vid.width - step && j < vid.height - step) {
          let leftIdx = (floor(j) * vid.width + floor(i - step)) * 4;
          let rightIdx = (floor(j) * vid.width + floor(i + step)) * 4;
          let topIdx = (floor(j - step) * vid.width + floor(i)) * 4;
          let bottomIdx = (floor(j + step) * vid.width + floor(i)) * 4;

          let leftBright = (vid.pixels[leftIdx] + vid.pixels[leftIdx+1] + vid.pixels[leftIdx+2]) / 3;
          let rightBright = (vid.pixels[rightIdx] + vid.pixels[rightIdx+1] + vid.pixels[rightIdx+2]) / 3;
          let topBright = (vid.pixels[topIdx] + vid.pixels[topIdx+1] + vid.pixels[topIdx+2]) / 3;
          let bottomBright = (vid.pixels[bottomIdx] + vid.pixels[bottomIdx+1] + vid.pixels[bottomIdx+2]) / 3;

          // Sensitive edge detection for strip shape
          if (abs(bright - leftBright) > 12 || abs(bright - rightBright) > 12 || 
              abs(bright - topBright) > 12 || abs(bright - bottomBright) > 12) {
            isEdge = true;
          }
        }

        if (isEdge) {
          currentVideoPixels.push({x: i, y: j, origI: i, origJ: j, isEdge: true});
          continue;
        }
      }

      // Special check for "bird" video to isolate the bird (filter out sky/background)
      if (vidId.includes("bird")) {
        // Filter out blue/cyan sky
        if (b > r + 10 && b > g - 20) continue;
        
        // Lower threshold for bird to get more detail
        if (bright < 70) continue; 

        // Detect outlines/edges for the bird to make it clearer
        let isEdge = false;
        if (i > step && j > step && i < vid.width - step && j < vid.height - step) {
          let leftIdx = (floor(j) * vid.width + floor(i - step)) * 4;
          let rightIdx = (floor(j) * vid.width + floor(i + step)) * 4;
          let topIdx = (floor(j - step) * vid.width + floor(i)) * 4;
          let bottomIdx = (floor(j + step) * vid.width + floor(i)) * 4;
          
          let leftBright = (vid.pixels[leftIdx] + vid.pixels[leftIdx+1] + vid.pixels[leftIdx+2]) / 3;
          let rightBright = (vid.pixels[rightIdx] + vid.pixels[rightIdx+1] + vid.pixels[rightIdx+2]) / 3;
          let topBright = (vid.pixels[topIdx] + vid.pixels[topIdx+1] + vid.pixels[topIdx+2]) / 3;
          let bottomBright = (vid.pixels[bottomIdx] + vid.pixels[bottomIdx+1] + vid.pixels[bottomIdx+2]) / 3;

          // If there's a significant brightness difference with neighbors, it's an edge
          if (abs(bright - leftBright) > 15 || abs(bright - rightBright) > 15 || 
              abs(bright - topBright) > 15 || abs(bright - bottomBright) > 15) {
            isEdge = true;
          }
        }

        if (isEdge) {
          // Add extra points on the edges to define the shape, but space them out
          currentVideoPixels.push({x: i, y: j, origI: i, origJ: j, isEdge: true});
          continue; // Move to next pixel to avoid double-adding
        }
      }
      let densityNoise = noise(i * 0.015, j * 0.015, time); 
      
      let clusterThreshold = (vidId.includes("bird") || vidId === "bestTrees" || vidId === "chita" || vidId === "strip") ? 0.55 : 0.72; // Lower threshold for bird, chita and strip for more density
      if (densityNoise > clusterThreshold) { 
        // Adjust cluster size to be consistent on screen
        let vStep = pixelSize * (vid.width / targetWidth);
        // Use slightly larger spacing for clusters to avoid overlap
        let clusterDist = vStep * 1.1; 
        for (let dx = -clusterDist; dx <= clusterDist; dx += clusterDist) {
          for (let dy = -clusterDist; dy <= clusterDist; dy += clusterDist) {
            currentVideoPixels.push({x: i + dx, y: j + dy, origI: i, origJ: j});
          }
        }
      } else {
        currentVideoPixels.push({x: i, y: j, origI: i, origJ: j});
      }
    }
  }

  for (let pixel of currentVideoPixels) {
    let px_orig = pixel.x;
    let py_orig = pixel.y;
    let origI = pixel.origI;
    let origJ = pixel.origJ;

    // Use cluster center for noise for the bird, chita and strip to keep squares in a clean grid (prevent overlapping)
    let isDetailed = vidId.includes("bird") || vidId === "bestTrees" || vidId === "chita" || vidId === "strip";
    let noiseRefX = isDetailed ? origI : px_orig;
    let noiseRefY = isDetailed ? origJ : py_orig;
    
    let densityNoise = noise(noiseRefX * 0.02, noiseRefY * 0.02, time);
    // If it's an edge, we definitely want to show it, otherwise use density threshold
    let currentDensityThreshold = vidId === "fish" || vidId === "bestTrees" || vidId === "chita" || vidId === "strip" ? 0.32 : (isDetailed ? 0.2 : 0.4); 
    if (!pixel.isEdge && densityNoise < currentDensityThreshold) continue; 

    let offsetNoiseX = noise(noiseRefX * 0.03, noiseRefY * 0.03, time * 1.5);
    let offsetNoiseY = noise(noiseRefX * 0.03, noiseRefY * 0.03 + 100, time * 1.5);
    
    let offsetAmount = 0.3; 
    if (densityNoise > 0.82) offsetAmount = 0;
    else if (densityNoise > 0.72) offsetAmount = 0.02;
    else if (densityNoise > 0.55) offsetAmount = 0.08;

    let offsetX = map(offsetNoiseX, 0, 1, -pixelSize * offsetAmount, pixelSize * offsetAmount);
    let offsetY = map(offsetNoiseY, 0, 1, -pixelSize * offsetAmount, pixelSize * offsetAmount);

    // Initial calculation of position
    let py_for_pos = flipV ? (vid.height - py_orig) : py_orig;
    let originalX = (px_orig * scaleX) + xShift + offsetX;
    let originalY = (py_for_pos * scaleY) + startY + offsetY;

    // Interaction logic
    let pixelKey = `${vidId}_${floor(origI)},${floor(origJ)}_${floor(px_orig-origI)},${floor(py_orig-origJ)}`;
    let currentTime = millis();
    let storedPos = longPressPixels.get(pixelKey);
    let finalX, finalY;

    if (storedPos) {
      if (isResetting) {
        let resetProgress = (currentTime - resetStartTime) / resetDuration;
        resetProgress = constrain(resetProgress, 0, 1);
        let easedProgress = resetProgress < 0.5 ? 2 * resetProgress * resetProgress : -1 + (4 - 2 * resetProgress) * resetProgress;
        finalX = lerp(storedPos.x, originalX, easedProgress);
        finalY = lerp(storedPos.y, originalY, easedProgress);
        longPressPixels.set(pixelKey, {x: finalX, y: finalY});
      } else {
        finalX = storedPos.x;
        finalY = storedPos.y;
      }
      originalX = finalX;
      originalY = finalY;
    } else {
      finalX = originalX;
      finalY = originalY;
    }

    // Interactive positioning
    let px = finalX;
    let py = finalY - effectiveScrollY * parallaxFactor;

    // Interaction with mouse
    let screenY = py + pixelOffsetY;
    let mouseDistance = dist(px, screenY, mouseXPos, mouseYPos);

    if (isLongPressActive && mouseIsPressed) {
      if (mouseDistance < scatterRadius && mouseDistance > 0) {
        let scatterStrength = (1 - mouseDistance / scatterRadius) * 5;
        randomSeed(px * 1000 + screenY * 100);
        let scatterAngle = random(0, TWO_PI);
        px = px + cos(scatterAngle) * scatterStrength;
        py = py + sin(scatterAngle) * scatterStrength;
      }
    } else {
      if (mouseDistance < longPressRadius && mouseDistance > 0) {
        let moveStrength = (1 - mouseDistance / longPressRadius) * longPressStrength;
        let angle = atan2(mouseYPos - screenY, mouseXPos - px);
        finalX = originalX + cos(angle) * mouseDistance * moveStrength;
        finalY = originalY + sin(angle) * mouseDistance * moveStrength;
        longPressPixels.set(pixelKey, {x: finalX, y: finalY});
        px = finalX;
        py = finalY - scrollY * parallaxFactor;
      }
    }

    // Draw if on screen
    if (py + pixelOffsetY > -100 && py + pixelOffsetY < height + 100) {
      let hash = (sin(origI * 12.9898 + origJ * 78.233) * 43758.5453) % 1;
      let stableColorNoise = hash < 0 ? hash + 1 : hash;
      let colorIndex = stableColorNoise < 0.65 ? 0 : (stableColorNoise < 0.96 ? 1 : 2);
      let color = colors[colorIndex];

      applyPixelStroke(colorIndex);
      applyPixelFill(color, px, py + pixelOffsetY);
      rect(px, py + pixelOffsetY, pixelSize, pixelSize);
    }
  }
}

function renderCloud(img, mask, startY, scrollY, time, xShift, parallaxFactor, shouldLoopX, cloudId, edgeMap) {
  if (!img || mask.length === 0) return;

  // Frustum Culling: Skip processing if cloud is completely off-screen
  let screenYTop = startY - scrollY * parallaxFactor + pixelOffsetY;
  let screenYBottom = screenYTop + img.height;
  
  if (screenYBottom < -200 || screenYTop > height + 200) return;

  let currentCloudPixels = [];
  for (let i = 0; i < img.width; i += pixelSize * 2) {
    for (let j = 0; j < img.height; j += pixelSize * 2) {
      let idxI = floor(i);
      let idxJ = floor(j);
      if (idxI < 0 || idxI >= mask.length || !mask[idxI] || idxJ < 0 || idxJ >= mask[idxI].length || !mask[idxI][idxJ]) continue;

      let densityNoise = noise(i * 0.015, j * 0.015, time);
      
      if (densityNoise > 0.72) {
        for (let dx = -pixelSize; dx <= pixelSize; dx += pixelSize) {
          for (let dy = -pixelSize; dy <= pixelSize; dy += pixelSize) {
            currentCloudPixels.push({x: i + dx, y: j + dy, origI: i, origJ: j});
          }
        }
      } else {
        currentCloudPixels.push({x: i, y: j, origI: i, origJ: j});
      }
    }
  }

  for (let pixel of currentCloudPixels) {
    let px = pixel.x;
    let py = pixel.y;
    let origI = pixel.origI;
    let origJ = pixel.origJ;
    
    // Apply horizontal loop only if shouldLoopX is true
    let currentXPos;
    if (shouldLoopX) {
      let hOffset = (cloudId === "carsLeft") ? carsXOffset : cloudsXOffset;
      currentXPos = (px + hOffset + xShift) % width;
      if (currentXPos < 0) currentXPos += width;
    } else {
      currentXPos = px + xShift;
    }

    let densityNoise = noise(px * 0.02, py * 0.02, time);
    if (densityNoise < 0.4) continue;

    let offsetNoiseX = noise(px * 0.03, py * 0.03, time * 1.5); 
    let offsetNoiseY = noise(px * 0.03, py * 0.03 + 100, time * 1.5);
    
    // Standardized offset amounts from main title
    let offsetAmount;
    if (densityNoise > 0.82) {
      offsetAmount = 0;
    } else if (densityNoise > 0.72) {
      offsetAmount = 0.02;
    } else if (densityNoise > 0.55) {
      offsetAmount = 0.08;
    } else {
      offsetAmount = 0.3;
    }

    let offsetX = map(offsetNoiseX, 0, 1, -pixelSize * offsetAmount, pixelSize * offsetAmount);
    let offsetY = map(offsetNoiseY, 0, 1, -pixelSize * offsetAmount, pixelSize * offsetAmount);
    
    let originalX = currentXPos + offsetX;
    let originalY = py + startY + offsetY; // Position without scroll

    // Unique key for persistence (based on image and original grid position)
    let pixelKey = `${cloudId}_${floor(origI)},${floor(origJ)}_${floor(px-origI)},${floor(py-origJ)}`;
    
    // Check for long press (same as title)
    let currentTime = millis();
    let storedPos = longPressPixels.get(pixelKey);
    let finalX, finalY;
    
    if (storedPos) {
      if (isResetting) {
        let resetProgress = (currentTime - resetStartTime) / resetDuration;
        resetProgress = constrain(resetProgress, 0, 1);
        let easedProgress = resetProgress < 0.5 ? 2 * resetProgress * resetProgress : -1 + (4 - 2 * resetProgress) * resetProgress;
        finalX = lerp(storedPos.x, originalX, easedProgress);
        finalY = lerp(storedPos.y, originalY, easedProgress);
        longPressPixels.set(pixelKey, {x: finalX, y: finalY});
      } else {
        finalX = storedPos.x;
        finalY = storedPos.y;
      }
      originalX = finalX;
      originalY = finalY;
    } else {
      finalX = originalX;
      finalY = originalY;
    }

    // Interaction (same as title)
    let screenY = finalY + pixelOffsetY - scrollY * parallaxFactor;
    let mouseDistance = dist(finalX, screenY, mouseXPos, mouseYPos);

    if (isLongPressActive && mouseIsPressed) {
      if (mouseDistance < scatterRadius && mouseDistance > 0) {
        let scatterStrength = (1 - mouseDistance / scatterRadius) * 5;
        randomSeed(finalX * 1000 + finalY * 100);
        let scatterAngle = random(0, TWO_PI);
        finalX = finalX + cos(scatterAngle) * scatterStrength;
        finalY = finalY + sin(scatterAngle) * scatterStrength;
      }
    } else {
      if (mouseDistance < longPressRadius && mouseDistance > 0) {
        let moveStrength = (1 - mouseDistance / longPressRadius) * longPressStrength;
        let angle = atan2(mouseYPos - screenY, mouseXPos - finalX);
        finalX = finalX + cos(angle) * mouseDistance * moveStrength;
        finalY = finalY + sin(angle) * mouseDistance * moveStrength;
        longPressPixels.set(pixelKey, {x: finalX, y: finalY});
      }
    }

    let currentX = finalX;
    let currentY = finalY - scrollY * parallaxFactor;

    // Standardized color selection from main title - use grid position for stability with subtle shimmer
    let secondColorNoise = noise(px * 0.03, py * 0.03, frameCount * 0.002);
    let thirdColorNoise = noise(px * 0.035, py * 0.035, frameCount * 0.002);
    
    // Use a stable hash-like value for uniform color distribution
    let hash = (sin(px * 12.9898 + py * 78.233) * 43758.5453) % 1;
    let stableColorNoise = hash < 0 ? hash + 1 : hash;
    
    let colorIndex;
    if (secondColorNoise > 0.8) {
      // For batim, trees and cars, reduce light blue probability
      let lightBlueProb = (cloudId === "batim" || cloudId === "trees" || cloudId === "carsLeft" || cloudId === "carsRight") ? 0.40 : 0.80;
      colorIndex = stableColorNoise < lightBlueProb ? 1 : 0;
    } else if (thirdColorNoise > 0.85) {
      // Reduced red cluster area - 30% red
      colorIndex = stableColorNoise < 0.3 ? 2 : 0;
    } else if (secondColorNoise > 0.65) {
      // For batim, trees and cars, reduce light blue probability
      let lightBlueProb = (cloudId === "batim" || cloudId === "trees" || cloudId === "carsLeft" || cloudId === "carsRight") ? 0.25 : 0.55;
      colorIndex = stableColorNoise < lightBlueProb ? 1 : 0;
    } else if (thirdColorNoise > 0.7) {
      // Reduced red leaning area - 15% red
      colorIndex = stableColorNoise < 0.15 ? 2 : 0;
    } else {
      // Default area - Hierarchy: Dark Blue > Light Blue > Red
      if (cloudId === "batim" || cloudId === "trees" || cloudId === "carsLeft" || cloudId === "carsRight") {
        if (stableColorNoise < 0.85) {
          colorIndex = 0; // Dark Blue (85%)
        } else if (stableColorNoise < 0.96) {
          colorIndex = 1; // Light Blue (11%)
        } else {
          colorIndex = 2; // Red (4%)
        }
      } else {
        if (stableColorNoise < 0.65) {
          colorIndex = 0; // Dark Blue (65%)
        } else if (stableColorNoise < 0.96) {
          colorIndex = 1; // Light Blue (31%)
        } else {
          colorIndex = 2; // Red (4%)
        }
      }
    }

    let color = colors[colorIndex];
    applyPixelStroke(colorIndex);
    applyPixelFill(color, currentX, currentY + pixelOffsetY);
    rect(currentX, currentY + pixelOffsetY, pixelSize, pixelSize);
  }
}

function initSunPixels() {
  sunPixels = [];
  if (sunEdgeMap.length === 0) return;

  // Position: 80px from right, 20px from top
  let startX = width - 180 - 80;
  let startY = 20;
  
  // Center of the sun in the original image coordinates (relative to sunImg)
  let sunCenterX = 180 / 2;
  let sunCenterY = sunImg.height * (180 / sunImg.width) / 2;
  let innerCircleRadius = 180 * 0.32; // Threshold for "inner circle" vs "rays"

  for (let i = 0; i < sunEdgeMap.length; i++) {
    for (let j = 0; j < sunEdgeMap[i].length; j++) {
      let { magnitude } = sunEdgeMap[i][j];
      
      // Coordinate in the resized sun image
      let px = i * cellSize;
      let py = j * cellSize;
      
      // Calculate distance from center to identify rays
      let d = dist(px, py, sunCenterX, sunCenterY);
      let isRay = d > innerCircleRadius;

      // Slightly lower threshold specifically for sun pixels to capture more details
      if (magnitude > edgeThreshold - 3) {
        sunPixels.push({
          x: startX + px,
          y: startY + py,
          origX: startX + px,
          origY: startY + py,
          isRay: isRay
        });
      }
    }
  }
}

function analyzeEdges(img, targetMap) {
  // Reset the target map
  targetMap.length = 0;
  img.loadPixels();
  
  // Sobel Kernels
  const kx = [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1]
  ];
  const ky = [
    [-1, -2, -1],
    [ 0,  0,  0],
    [ 1,  2,  1]
  ];

  let magCount = 0;
  let highMagCount = 0;

  // We analyze the image in a grid matching our cellSize
  for (let x = 0; x < img.width; x += cellSize) {
    let row = [];
    for (let y = 0; y < img.height; y += cellSize) {
      // Calculate Sobel gradient at this pixel
      let gx = 0;
      let gy = 0;

      // Apply kernels to 3x3 neighborhood
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          let ix = constrain(x + i, 0, img.width - 1);
          let iy = constrain(y + j, 0, img.height - 1);
          let idx = (iy * img.width + ix) * 4;
          // Use average brightness of RGB
          let b = (img.pixels[idx] + img.pixels[idx + 1] + img.pixels[idx + 2]) / 3;
          
          gx += b * kx[i + 1][j + 1];
          gy += b * ky[i + 1][j + 1];
        }
      }

      let magnitude = sqrt(gx * gx + gy * gy);
      let angle = atan2(gy, gx); // Range: -PI to PI
      row.push({ magnitude, angle });
      
      magCount++;
      if (magnitude > edgeThreshold) highMagCount++;
    }
    targetMap.push(row);
  }
}

function initTextBuffer() {
  // Ensure width and height are valid
  let w = width > 0 ? width : window.innerWidth;
  let h = height > 0 ? height : window.innerHeight;
  
  // Create buffers matching canvas size
  pg = createGraphics(w, h);
  pg.pixelDensity(1);
  pg.background(0);
  pg.fill(255);
  pg.textAlign(LEFT, TOP);
  pg.textStyle(BOLD);

  pgNegative = createGraphics(w, h);
  pgNegative.pixelDensity(1);
  pgNegative.background(0);
  pgNegative.fill(255);
  pgNegative.textAlign(LEFT, TOP);
  pgNegative.textStyle(BOLD);
  
  // Calculate target width based on identical gaps on both sides (20px)
  let baseGap = 20; 
  let navWidth = 27;
  let targetTextWidth = w - (baseGap * 2) - navWidth;
  
  // Use monospace sans-serif font
  pg.textFont('Monaco, Consolas, monospace');
  pg.textStyle(BOLD);
  pgNegative.textFont('Monaco, Consolas, monospace');
  pgNegative.textStyle(BOLD);
  
  // Custom word spacing (increased for more clarity)
  let testSize = 100;
  pg.textSize(testSize);
  let wordGapFactor = 0.1; 
  let testWordGap = testSize * wordGapFactor;
  
  // Calculate width of "LUCID DREAM" with spacing
  let phraseWords = ["LUCID", "DREAM"];
  let phraseTestWidth = 0;
  for (let i = 0; i < phraseWords.length; i++) {
    phraseTestWidth += pg.textWidth(phraseWords[i]);
    if (i < phraseWords.length - 1) phraseTestWidth += testWordGap;
  }
  
  // Scale textSize to match the size it was (fitting once across)
  let textSize = (targetTextWidth / phraseTestWidth) * testSize;
  pg.textSize(textSize);
  pgNegative.textSize(textSize); // Use the EXACT SAME text size for both
  
  let wordGap = textSize * wordGapFactor;
  let wordGapNeg = wordGap * 2.0; // Increased gap between GOOD and NIGHT
  let leading = textSize * 0.98;
  
  // Width of one "LUCID DREAM "
  let phraseWidth = pg.textWidth("LUCID") + wordGap + pg.textWidth("DREAM");
  let fullPhraseWidth = phraseWidth + wordGap;
  
  // Width of one "GOOD NIGHT "
  let phraseWidthNeg = pgNegative.textWidth("GOOD") + wordGapNeg + pgNegative.textWidth("NIGHT");
  let fullPhraseWidthNeg = phraseWidthNeg + wordGap; // Gap between phrases remains same
  
  // Calculate how many phrases fit across and the starting X for centering (Main)
  let availableWidth = w - navWidth;
  let numPhrases = Math.floor(availableWidth / fullPhraseWidth);
  let totalPhrasesWidth = (numPhrases * fullPhraseWidth) - wordGap;
  let startX = (availableWidth - totalPhrasesWidth) / 2;

  // Calculate how many phrases fit across and the starting X for centering (Negative)
  let numPhrasesNeg = Math.floor(availableWidth / fullPhraseWidthNeg);
  let totalPhrasesWidthNeg = (numPhrasesNeg * fullPhraseWidthNeg) - wordGap;
  let startXNeg = (availableWidth - totalPhrasesWidthNeg) / 2;

  // Render the phrase again and again to fill the entire buffer
  // Starting at 0 to remove the cut-off top sentence and moving everything up
  let lineCount = 0;
  for (let currentY = 0; currentY < h + leading; currentY += leading) {
    lineCount++;
    if (lineCount === 4) continue; // Skip the fourth line
    
    // Horizontal centering within the available width (Main)
    for (let i = 0; i < numPhrases; i++) {
      let currentX = startX + i * fullPhraseWidth;
      pg.text("LUCID", currentX, currentY);
      pg.text("DREAM", currentX + pg.textWidth("LUCID") + wordGap, currentY);
    }

    // Horizontal centering within the available width (Negative)
    for (let i = 0; i < numPhrasesNeg; i++) {
      let currentX = startXNeg + i * fullPhraseWidthNeg;
      pgNegative.text("GOOD", currentX, currentY + 120);
      pgNegative.text("NIGHT", currentX + pgNegative.textWidth("GOOD") + wordGapNeg, currentY + 120);
    }
  }
  
  // Set the navigation height and top position to match the pattern exactly
  document.documentElement.style.setProperty('--nav-top', '0px');
  // Subtract 30px to make them slightly longer than before (was -90px)
  document.documentElement.style.setProperty('--nav-height', (leading * 3 - 30) + 'px');
  
  pg.loadPixels();
  pgNegative.loadPixels();
  
  // Pre-calculate points where text exists to avoid scanning buffer every frame
  staticTextPoints = [];
  let baseStepSize = pixelSize * 2;
  for (let x = 0; x < w; x += baseStepSize) {
    for (let y = 0; y < h; y += baseStepSize) {
      let sampleX = floor(constrain(x, 0, pg.width - 1));
      let sampleY = floor(constrain(y, 0, pg.height - 1));
      let idx = (sampleY * pg.width + sampleX) * 4;
      if (pg.pixels[idx] > 50) {
        staticTextPoints.push({x: x, y: y});
      }
    }
  }
}

function mouseMoved() {
  mouseXPos = mouseX;
  mouseYPos = mouseY;
}

function mousePressed() {
  // Start long press timer
  longPressStartTime = millis();
  isLongPressActive = false;
}

function mouseReleased() {
  // Check if it was a long press before releasing
  if (isLongPressActive) {
    // Long press was active, keep the pixels in their new positions
    // The positions are already stored in longPressPixels, so we just reset the active flag
    isLongPressActive = false;
  }
  // Reset press start time
  longPressStartTime = 0;
}

// ASCII Clouds Layer (clouds.png) - Positioned below the main title with horizontal loop
function drawCloudsASCII() {
  if (cloudsImg && cloudsImg.width > 0 && cloudsEdgeMap.length > 0) {
    push();
    noStroke();
    fill(255, 0, 0); // Red color for clouds layer
    textFont('Courier New');
    textStyle(BOLD);
    textSize(cellSize * 1.2);
    textAlign(CENTER, CENTER);
    
    let scrollY = window.pageYOffset || window.scrollY || 0;
    
    // Horizontal movement: move left by 1 pixel per frame
    cloudsXOffset -= 1;

    // Parallax effect: Clouds layer moves faster (1.3x), while red layer moves significantly slower (0.4x)
    
    // Calculate the bottom of the "LUCID DREAMS" title to start the clouds below it
    // Title centerY is height/2 - 100, textSize is width * 0.15, pixelOffsetY is 50
    let titleBottom = height / 2 - 100 + (width * 0.15) / 2 + 50;
    let cloudsStartOffset = titleBottom + 20; // 20px gap below title

    // Frustum Culling: Skip processing if the whole ASCII clouds layer is off-screen
    // The layer starts at cloudsStartOffset and has height of cloudsImg.height
    let layerScreenYTop = cloudsStartOffset - scrollY * 1.3;
    let layerScreenYBottom = layerScreenYTop + (cloudsImg ? cloudsImg.height : 500);
    if (layerScreenYBottom < -100 || layerScreenYTop > height + 100) return;
    
    for (let i = 0; i < cloudsEdgeMap.length; i++) {
      for (let j = 0; j < cloudsEdgeMap[i].length; j++) {
        let { magnitude, angle } = cloudsEdgeMap[i][j];
        
        if (magnitude > edgeThreshold) {
          let x = i * cellSize;
          let y = j * cellSize;
          
          // Horizontal looping logic: Apply offset and wrap around screen width
          let displayX = (x + cloudsXOffset) % width;
          if (displayX < 0) displayX += width;

          // Draw with offset and faster parallax speed (1.3x)
          let displayY = y + cloudsStartOffset - scrollY * 1.3; 
          
          if (displayY > -cellSize && displayY < height + cellSize) {
            let deg = (angle * 180 / PI + 360) % 180; 
            let char = '';
            if (deg >= 75 && deg < 105) char = '|';
            else if (deg >= 165 || deg < 15) char = '-';
            else if (deg >= 15 && deg < 45) char = '/';
            else if (deg >= 45 && deg < 75) char = '/'; 
            else if (deg >= 105 && deg < 135) char = '\\';
            else if (deg >= 135 && deg < 165) char = '\\';
            
            if (char !== '') {
              text(char, displayX + cellSize / 2, displayY + cellSize / 2);
            }
          }
        }
      }
    }
    pop();
  }
}

// Shimmering Squares Sun Layer (sun.png) - Outline version with dithering style
function drawSunPixels() {
  if (sunPixels.length === 0) return;

  let scrollY = window.pageYOffset || window.scrollY || 0;
  // Completely hide sun on the opening page (no scroll)
  if (scrollY <= 1) return; 

  let w = width > 0 ? width : window.innerWidth;
  let h = height > 0 ? height : window.innerHeight;

  // Frustum Culling: Skip processing if sun is completely off-screen
  // Approx sun height is around 180px
  let sunScreenYTop = pixelOffsetY - 280; // Min entryOffsetY is -280
  let sunScreenYBottom = pixelOffsetY + 180; // Max startY + height
  if (sunScreenYBottom < -100 || sunScreenYTop > height + 100) return;

  // Calculate when buildings reach the middle to hide the sun
  let largeTitleCenterY = h / 2 - 100;
  let largeTitleHeight = w * 0.15;
  let spacing = 300;
  let initialSmallTitleTop = largeTitleCenterY + (largeTitleHeight / 2) + spacing;
  let startY = initialSmallTitleTop - 150;
  let batimY = startY + (cloudsImg ? cloudsImg.height : 400) + 300;
  
  // The scroll value where buildings top reaches middle of screen (h/2)
  // Buildings screen pos: batimY + pixelOffsetY - scrollY * 0.75
  let buildingsAtMiddleScroll = (batimY + pixelOffsetY - h / 2) / 0.75;
  
  // Sun visibility factor - fades out as buildings reach middle
  // Start fading 400px before they reach the middle
  let sunVisibility = map(scrollY, buildingsAtMiddleScroll - 400, buildingsAtMiddleScroll, 1, 0);
  sunVisibility = constrain(sunVisibility, 0, 1);
  
  if (sunVisibility <= 0) return;

  // Standardized aggressive time from main title
  let time = frameCount * 0.0008;
  
  // Entry animation based on scroll - slow and immediate
  let entryThreshold = 1000; // Slow entry (1000px scroll for full entry)
  let entryProgress = constrain(scrollY / entryThreshold, 0, 1);
  // -280 is calculated to place the bottom edge of the sun just above the screen top at scroll start
  let entryOffsetY = lerp(-280, 0, entryProgress); 

  // Calculate ray visibility factor based on background brightness (gradual transition)
  let bgBrightness = currentBgColor[0] * 0.299 + currentBgColor[1] * 0.587 + currentBgColor[2] * 0.114;
  // Map brightness to a visibility factor: 0 (hidden) to 1 (fully visible)
  // Transition happens between brightness 60 and 160
  let rayVisibility = constrain(map(bgBrightness, 60, 160, 0, 1), 0, 1);

  for (let pixel of sunPixels) {
    let x = pixel.origX;
    let y = pixel.origY;

    // Use noise for shimmering effect (same as text)
    let densityNoise = noise(x * 0.02, y * 0.02, time);
    
    // Base threshold for the sun body
    let threshold = 0.32;
    
    // For rays, adjust threshold gradually based on visibility factor
    if (pixel.isRay) {
      threshold = lerp(1.0, 0.32, rayVisibility);
    }
    
    // Adjust threshold based on sunVisibility to fade out shimmering dots
    threshold = lerp(1.0, threshold, sunVisibility);
    
    // Pattern shifts over time - slightly lower threshold to show more dots
    if (densityNoise < threshold) continue;

    // Standardized noise movement
    let offsetNoiseX = noise(x * 0.03, y * 0.03, time * 1.5);
    let offsetNoiseY = noise(x * 0.03, y * 0.03 + 100, time * 1.5);
    
    let offsetAmount;
    if (densityNoise > 0.82) offsetAmount = 0;
    else if (densityNoise > 0.72) offsetAmount = 0.02;
    else if (densityNoise > 0.55) offsetAmount = 0.08;
    else offsetAmount = 0.3;

    let offsetX = map(offsetNoiseX, 0, 1, -pixelSize * offsetAmount, pixelSize * offsetAmount);
    let offsetY = map(offsetNoiseY, 0, 1, -pixelSize * offsetAmount, pixelSize * offsetAmount);
    
    let originalX = x + offsetX;
    let originalY = y + offsetY; // Position without entry offset for key persistence

    // Unique key for persistence
    let pixelKey = `sun_${floor(x)},${floor(y)}`;
    
    let currentTime = millis();
    let storedPos = longPressPixels.get(pixelKey);
    let finalX, finalY;
    
    if (storedPos) {
      if (isResetting) {
        let resetProgress = (currentTime - resetStartTime) / resetDuration;
        resetProgress = constrain(resetProgress, 0, 1);
        let easedProgress = resetProgress < 0.5 ? 2 * resetProgress * resetProgress : -1 + (4 - 2 * resetProgress) * resetProgress;
        finalX = lerp(storedPos.x, originalX, easedProgress);
        finalY = lerp(storedPos.y, originalY, easedProgress);
        longPressPixels.set(pixelKey, {x: finalX, y: finalY});
      } else {
        finalX = storedPos.x;
        finalY = storedPos.y;
      }
      originalX = finalX;
      originalY = finalY;
    } else {
      finalX = originalX;
      finalY = originalY;
    }

    // Interaction
    let screenY = finalY + pixelOffsetY + entryOffsetY;
    let mouseDistance = dist(finalX, screenY, mouseXPos, mouseYPos);

    if (isLongPressActive && mouseIsPressed) {
    if (mouseDistance < scatterRadius && mouseDistance > 0) {
        let scatterStrength = (1 - mouseDistance / scatterRadius) * 5;
        randomSeed(finalX * 1000 + finalY * 100);
        let scatterAngle = random(0, TWO_PI);
        finalX = finalX + cos(scatterAngle) * scatterStrength;
        finalY = finalY + sin(scatterAngle) * scatterStrength;
      }
    } else {
      if (mouseDistance < longPressRadius && mouseDistance > 0) {
        let moveStrength = (1 - mouseDistance / longPressRadius) * longPressStrength;
        let angle = atan2(mouseYPos - screenY, mouseXPos - finalX);
        finalX = finalX + cos(angle) * mouseDistance * moveStrength;
        finalY = finalY + sin(angle) * mouseDistance * moveStrength;
        longPressPixels.set(pixelKey, {x: finalX, y: finalY});
      }
    }

    // FIXED position: we don't subtract scrollY anymore because entryOffsetY handles the positioning
    let currentX = finalX;
    let currentY = finalY + pixelOffsetY + entryOffsetY;

    // Standardized color selection from main title - use original grid position for stability with subtle shimmer
    let secondColorNoise = noise(pixel.origX * 0.03, pixel.origY * 0.03, frameCount * 0.002);
    let thirdColorNoise = noise(pixel.origX * 0.035, pixel.origY * 0.035, frameCount * 0.002);
    
    let colorIndex;
    
    // Use a stable hash-like value for uniform color distribution without flickering
    let hash = (sin(pixel.origX * 12.9898 + pixel.origY * 78.233) * 43758.5453) % 1;
    let stableColorNoise = hash < 0 ? hash + 1 : hash;
    
    if (secondColorNoise > 0.8) {
      colorIndex = stableColorNoise < 0.80 ? 1 : 0;
    } else if (thirdColorNoise > 0.85) {
      // Increased red cluster area for sun - 70% red
      colorIndex = stableColorNoise < 0.7 ? 2 : 0;
    } else if (secondColorNoise > 0.65) {
      colorIndex = stableColorNoise < 0.55 ? 1 : 0;
    } else if (thirdColorNoise > 0.7) {
      // Increased red leaning area for sun - 50% red
      colorIndex = stableColorNoise < 0.5 ? 2 : 0;
    } else {
      // Default area for sun - Higher Red percentage (20%)
      if (stableColorNoise < 0.50) {
        colorIndex = 0; // Dark Blue (50%)
      } else if (stableColorNoise < 0.80) {
        colorIndex = 1; // Light Blue (30%)
      } else {
        colorIndex = 2; // Red (20%)
      }
    }

    let color = colors[colorIndex];
    applyPixelStroke(colorIndex);
    applyPixelFill(color, finalX, finalY + pixelOffsetY + entryOffsetY);
    rect(finalX, finalY + pixelOffsetY + entryOffsetY, pixelSize, pixelSize);
  }
}

// Shimmering Squares Clouds Right Layer (clouds right.png)
function renderTextPattern(offsetY, parallaxFactor, textId, collectPixelData, isInverted = false, buffer = pg) {
  if (!buffer || buffer.width === 0 || buffer.height === 0) return;
  
  let scrollY = window.pageYOffset || window.scrollY || 0;
  let titleTime = frameCount * 0.0008;
  
  // Fade-in progress for the inverted title at the end
  let fadeInProgress = 1.0;
  if (isInverted) {
    // Calculate vertical build-up based on the actual position on screen
    let currentTopOnScreen = offsetY + pixelOffsetY - scrollY * parallaxFactor;
    
    // We want the build-up to be slower. 
    // It starts when the top enters (currentTopOnScreen = height)
    // And completes only after it has moved significantly up.
    fadeInProgress = map(currentTopOnScreen, height, -height * 0.8, 0, 1);
    fadeInProgress = constrain(fadeInProgress, 0, 1);
    // Use easing for a smoother build-up start
    fadeInProgress = pow(fadeInProgress, 1.2); 
  }

  let baseStepSize = pixelSize * 2;
  let textPixels = [];

  // Scan text buffer pixels for faster access
  buffer.loadPixels();
  
  // Scan text buffer with variable density
  for (let x = 0; x < width; x += baseStepSize) {
    for (let y = 0; y < height; y += baseStepSize) {
      // Frustum Culling for main text: Skip processing if text is completely off-screen
      let screenY = y + offsetY + pixelOffsetY - scrollY * parallaxFactor;
      if (screenY < -100 || screenY > height + 100) continue;

      let sampleX = floor(constrain(x, 0, buffer.width - 1));
      let sampleY = floor(constrain(y, 0, buffer.height - 1));
      
      let idx = (sampleY * buffer.width + sampleX) * 4;
      let r = buffer.pixels[idx];
      let bright = r; 
      
      // Determine if we should draw a pixel here based on inversion mode
      let shouldDraw = isInverted ? bright <= 50 : bright > 50;
      
      // For negative title, allow some pixels to bleed into the letter shapes to "break" them
      if (isInverted) {
        let bleedNoise = noise(x * 0.02, y * 0.02, titleTime + 100);
        if (!shouldDraw && bleedNoise > 0.88) shouldDraw = true; // Reduced bleed into letter
        else if (shouldDraw && bleedNoise < 0.12) shouldDraw = false; // Reduced skip background
      }
      
      if (shouldDraw) {
        let densityNoise = noise(x * 0.015, y * 0.015, titleTime); 
        if (densityNoise > 0.72) { 
          for (let dx = -pixelSize; dx <= pixelSize; dx += pixelSize) {
            for (let dy = -pixelSize; dy <= pixelSize; dy += pixelSize) {
              let newX = x + dx;
              let newY = y + dy;
              if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                textPixels.push({x: newX, y: newY, isDense: true, origX: x, origY: y});
              }
            }
          }
        } else {
          textPixels.push({x: x, y: y, isDense: false, origX: x, origY: y});
        }
      }
    }
  }

  // Draw pixels - dense blocks or scattered individual pixels
  for (let pixel of textPixels) {
    let px = pixel.x; 
    let py = pixel.y;
    let origX = pixel.origX;
    let origY = pixel.origY;
    
    // Gradual appearance for inverted title - vertical build-up from top to bottom
    if (isInverted && fadeInProgress < 1.0) {
      let yNormalized = py / buffer.height;
      // Combine vertical threshold with a bit of noise for a natural "pouring/building" effect
      let visibilityHash = (sin(px * 12.9898 + py * 78.233 + 500) * 43758.5453) % 1;
      let stableVisibility = visibilityHash < 0 ? visibilityHash + 1 : visibilityHash;
      
      // Reduce noise influence for a clearer top-to-bottom build-up
      if (yNormalized > fadeInProgress + stableVisibility * 0.1) continue;
    }
    
    // Calculate density noise with time - use stable px, py for stability (identical to clouds)
    let densityNoise = noise(px * 0.02, py * 0.02, titleTime); 
    
    // Skip some pixels to create empty spaces (pattern shifts over time)
    // For inverted mode (GOOD NIGHT), we skip a bit more to "break" the letters further
    let skipThreshold = isInverted ? 0.22 : 0.4;
    if (densityNoise < skipThreshold) continue; 
    
    // Add random offset - use stable px, py for stable noise calculation
    let offsetNoiseX = noise(px * 0.03, py * 0.03, titleTime * 1.5); 
    let offsetNoiseY = noise(px * 0.03, py * 0.03 + 100, titleTime * 1.5);
    
    // Determine offset amount based on density noise with time
    let offsetAmount;
    if (isInverted) {
      // Softened shimmering for the negative mode
      if (densityNoise > 0.85) offsetAmount = 0.01;
      else if (densityNoise > 0.7) offsetAmount = 0.06;
      else offsetAmount = 0.18; 
    } else {
      if (densityNoise > 0.82) offsetAmount = 0;
      else if (densityNoise > 0.72) offsetAmount = 0.02; 
      else if (densityNoise > 0.55) offsetAmount = 0.08; 
      else offsetAmount = 0.3; 
    }    
    let offsetX = map(offsetNoiseX, 0, 1, -pixelSize * offsetAmount, pixelSize * offsetAmount);
    let offsetY_noise = map(offsetNoiseY, 0, 1, -pixelSize * offsetAmount, pixelSize * offsetAmount);
    
    // Store original position (before mouse interaction)
    let worldX = px + offsetX;
    let worldY = py + offsetY + offsetY_noise;
    
    // Get pixel key for long press tracking
    let pixelKey = `${textId}_${floor(px)},${floor(py)}`;
    
    // Check for long press
    let currentTime = millis();
    let storedPos = longPressPixels.get(pixelKey);
    let finalX, finalY;
    
    if (storedPos) {
      if (isResetting) {
        let resetProgress = (currentTime - resetStartTime) / resetDuration;
        resetProgress = constrain(resetProgress, 0, 1);
        let easedProgress = resetProgress < 0.5 ? 2 * resetProgress * resetProgress : -1 + (4 - 2 * resetProgress) * resetProgress;
        finalX = lerp(storedPos.x, worldX, easedProgress);
        finalY = lerp(storedPos.y, worldY, easedProgress);
        longPressPixels.set(pixelKey, {x: finalX, y: finalY});
      } else {
        finalX = storedPos.x;
        finalY = storedPos.y;
      }
      worldX = finalX;
      worldY = finalY;
    } else {
      finalX = worldX;
      finalY = worldY;
    }
    
    // Interaction
    let screenPosTranslateY = pixelOffsetY - scrollY * parallaxFactor;
    let mouseDistance = dist(finalX, finalY + screenPosTranslateY, mouseXPos, mouseYPos);
    
    if (isLongPressActive && mouseIsPressed) {
      if (mouseDistance < scatterRadius && mouseDistance > 0) {
        let scatterStrength = (1 - mouseDistance / scatterRadius) * 5;
        randomSeed(finalX * 1000 + finalY * 100);
        let scatterAngle = random(0, TWO_PI);
        finalX = finalX + cos(scatterAngle) * scatterStrength;
        finalY = finalY + sin(scatterAngle) * scatterStrength;
      }
    } else {
      if (mouseDistance < longPressRadius && mouseDistance > 0) {
        let moveStrength = (1 - mouseDistance / longPressRadius) * longPressStrength;
        let angle = atan2(mouseYPos - (finalY + screenPosTranslateY), mouseXPos - finalX);
        finalX = worldX + cos(angle) * mouseDistance * moveStrength;
        finalY = worldY + sin(angle) * mouseDistance * moveStrength;
        longPressPixels.set(pixelKey, {x: finalX, y: finalY});
      }
    }
    
    // Color selection - use stable px, py for stability (identical to clouds)
    let secondColorNoise = noise(px * 0.03, py * 0.03, frameCount * 0.002);
    let thirdColorNoise = noise(px * 0.035, py * 0.035, frameCount * 0.002);
    
    let hash = (sin(px * 12.9898 + py * 78.233) * 43758.5453) % 1;
    let stableColorNoise = hash < 0 ? hash + 1 : hash;
    
    let colorIndex;
    if (secondColorNoise > 0.8) {
      colorIndex = stableColorNoise < 0.80 ? 1 : 0;
    } else if (thirdColorNoise > 0.85) {
      colorIndex = stableColorNoise < 0.3 ? 2 : 0;
    } else if (secondColorNoise > 0.65) {
      colorIndex = stableColorNoise < 0.55 ? 1 : 0;
    } else if (thirdColorNoise > 0.7) {
      colorIndex = stableColorNoise < 0.15 ? 2 : 0;
    } else {
      if (stableColorNoise < 0.65) {
        colorIndex = 0;
      } else if (stableColorNoise < 0.96) {
        colorIndex = 1;
      } else {
        colorIndex = 2;
      }
    }
    
    let color = colors[colorIndex];

    // Store pixel data (only when not in square mode and not in transition)
    if (collectPixelData && !transitionActive) {
      pixelData.push({
        originalX: finalX,
        originalY: finalY,
        colorIndex: colorIndex
      });
    }
    
    applyPixelStroke(colorIndex);
    applyPixelFill(color, finalX, finalY + screenPosTranslateY);
    rect(finalX, finalY + screenPosTranslateY, pixelSize, pixelSize);
  }
}

function draw() {
  // Update mouse position every frame
  mouseXPos = mouseX;
  mouseYPos = mouseY;
  
  let scrollY = window.pageYOffset || window.scrollY || 0;
  
  // Transparent background - clear with alpha
  clear();
  
  // Draw the Sun layer with shimmering squares
  drawSunPixels();
  
  // Draw the Clouds layer with shimmering squares
  drawCloudsPixels();
  
  noStroke();
  
  // Ensure text buffer exists and is valid
  if (!pg || pg.width === 0 || pg.height === 0) return;
  
  // Handle transition
  if (transitionActive) {
    updateTransition();
    drawTransition();
    return;
  }
  
  // Reset pixels to original positions every 15 seconds on home screen
  let currentTime = millis();
  if (currentTime - lastResetTime >= resetInterval && !isResetting) {
    // Start gradual reset
    isResetting = true;
    resetStartTime = currentTime;
    lastResetTime = currentTime; // Update reset time
  }
  
  // Handle gradual reset
  if (isResetting) {
    let resetProgress = (currentTime - resetStartTime) / resetDuration;
    if (resetProgress >= 1) {
      // Reset complete - clear all positions
      resetProgress = 1;
      longPressPixels.clear();
      isResetting = false;
    }
  }

  // Collect all pixels with their colors (only update when not in square mode and not in transition)
  if (!isSquareMode && !transitionActive) {
    pixelData = [];
  }
  
  // 1. Draw first text pattern (at the beginning)
  renderTextPattern(0, 1.0, "text_main", true);
  
  // 2. Calculate and draw second text pattern (below second buildings)
  if (batimImg) {
    let bHeight = (batimImg && batimImg.height > 10) ? batimImg.height : 400;
    let cHeight = (cloudsImg && cloudsImg.height > 10) ? cloudsImg.height : 400;
    
    // Recalculate same positions as in drawCloudsPixels to align second header
    let largeTitleCenterY = height / 2 - 100;
    let largeTitleHeight = width * 0.15;
    let spacing = 300;
    let initialSmallTitleTop = largeTitleCenterY + (largeTitleHeight / 2) + spacing;
    let startY = initialSmallTitleTop - 150; 
    let batimY_orig = startY + (cloudsImg ? cloudsImg.height : 400) + 300;
    let loveHeight = width * (9/16);
    let treesY = batimY_orig + bHeight + loveHeight + 1630;
    let fisherHeight = (fisherVid && fisherVid.width > 0) ? fisherVid.height * (width / fisherVid.width) : 500;
    let birdY = treesY + 3000 + fisherHeight;
    let S_end = (birdY + pixelOffsetY - height * 0.35) / 1.2;
    let targetY = height * 1.8;
    let reappearanceBatimY = targetY + cHeight + 300 + S_end * 0.75 - pixelOffsetY;
    
    // Place it below the reappearing buildings
    // Using 0.75 parallax to move in sync with the buildings
    let secondTextY = reappearanceBatimY + bHeight;
    
    renderTextPattern(secondTextY, 0.75, "text_second", true, true, pgNegative);

    // Set scroll height to end right after this pattern
    // The pattern is fully shown (from top 0 to bottom height) when scroll reaches S_max
    if (frameCount % 10 === 0) {
      let S_max = (secondTextY + pixelOffsetY) / 0.75;
      let scrollSpacer = document.getElementById('scroll-spacer');
      if (scrollSpacer) {
        // Total document height must be S_max + window height to allow scrolling to S_max
        let targetHeight = S_max + height;
        let currentHeight = parseFloat(scrollSpacer.style.height);
        
        if (isNaN(currentHeight) || abs(currentHeight - targetHeight) > 1) {
          scrollSpacer.style.height = targetHeight + 'px';
          // Force document and body min-height to match to prevent other elements from expanding it
          document.documentElement.style.minHeight = targetHeight + 'px';
          document.body.style.minHeight = targetHeight + 'px';
          document.documentElement.style.height = targetHeight + 'px';
          document.body.style.height = targetHeight + 'px';
        }
      }
    }
  }
}

function windowResized() {
  // Canvas takes full window height
  resizeCanvas(windowWidth, windowHeight);
  initTextBuffer();
  
  if (sunImg) initSunPixels();
  
  if (cloudsImg) {
    let cloudsScale = windowWidth / cloudsImg.width;
    cloudsImg.resize(windowWidth, cloudsImg.height * cloudsScale);
    initCloudsPixels(cloudsImg, cloudsMask);
  }
  if (cloudsRightImg) {
    let cloudsScale = (windowWidth * 0.8) / cloudsRightImg.width;
    cloudsRightImg.resize(windowWidth * 0.8, cloudsRightImg.height * cloudsScale);
    initCloudsPixels(cloudsRightImg, cloudsRightMask);
  }
  if (batimImg) {
    let batimScale = windowWidth / batimImg.width;
    batimImg.resize(windowWidth, batimImg.height * batimScale);
    initCloudsPixels(batimImg, batimMask);
  }
  if (roadImg) {
    let roadScale = windowWidth / roadImg.width;
    roadImg.resize(windowWidth, roadImg.height * roadScale);
    initCloudsPixels(roadImg, roadMask);
  }

  if (carsLeftImg) {
    let carsScale = windowWidth / carsLeftImg.width;
    carsLeftImg.resize(windowWidth, carsLeftImg.height * carsScale);
    initCloudsPixels(carsLeftImg, carsLeftMask);
  }

  if (carsRightImg) {
    let carsScale = windowWidth / carsRightImg.width;
    carsRightImg.resize(windowWidth, carsRightImg.height * carsScale);
    initCloudsPixels(carsRightImg, carsRightMask);
  }
  
  if (fishVid) {
    fishVid.size(windowWidth, windowWidth * (9/16));
  }
  if (peopleVid) {
    peopleVid.size(windowWidth, windowWidth * (9/16));
  }
  if (kidVid) {
    kidVid.size(windowWidth, windowWidth * (9/16));
  }
  if (fisherVid) {
    fisherVid.size(windowWidth, windowWidth * (9/16));
  }
  if (bestTreesVid) {
    bestTreesVid.size(windowWidth, windowWidth * (9/16));
  }

  // Recreate text buffer if user text exists
  if (userText && userText.length > 0) {
    createTextBuffer();
  }
}

// Function to toggle square mode - called from HTML
function toggleSquareMode() {
  // If already in transition, don't do anything
  if (transitionActive) {
    return;
  }
  
  // Start transition
  startTransition(!isSquareMode);
  
  // Update navigation active state after transition completes
  // We'll update it immediately for the toggle, and again when transition finishes
  updateNavigationActiveState(!isSquareMode);
}

// Function to update navigation active state
function updateNavigationActiveState(isWrILDActive) {
  const wrildLink = document.getElementById('wrild-link');
  const wrildText = document.getElementById('wrild-text');
  
  if (wrildLink) {
    if (isWrILDActive) {
      wrildLink.classList.add('active');
    } else {
      wrildLink.classList.remove('active');
    }
  }
  
  // Show/hide WrILD text
  if (wrildText) {
    if (isWrILDActive) {
      wrildText.style.display = 'block';
    } else {
      wrildText.style.display = 'none';
    }
  }
}

// Start the transition between modes
function startTransition(toSquareMode) {
  transitionActive = true;
  transitionProgress = 0;
  
  // Capture current pixel positions as source (from hands if in square mode, from text if not)
  captureSourcePositions();
  
  // Square mode removed - no longer transitioning to hands
  {
    // Transitioning back to text mode - use pixelData original positions
    // Note: pixelData still contains text positions from before entering square mode
    targetParticlePositions = [];
    targetOriginalPositions = [];
    for (let i = 0; i < pixelData.length && i < transitionParticleData.length; i++) {
      let pos = {
        x: pixelData[i].originalX,
        y: pixelData[i].originalY
      };
      targetParticlePositions.push(pos);
      targetOriginalPositions.push(pos);
    }
    // If we have more particles than text positions, repeat the last position
    while (targetParticlePositions.length < transitionParticleData.length && targetParticlePositions.length > 0) {
      let lastPos = targetParticlePositions[targetParticlePositions.length - 1];
      let lastOriginalPos = targetOriginalPositions[targetOriginalPositions.length - 1];
      targetParticlePositions.push({
        x: lastPos.x,
        y: lastPos.y
      });
      targetOriginalPositions.push({
        x: lastOriginalPos.x,
        y: lastOriginalPos.y
      });
    }
  }
  
  // Calculate overlapping positions after capturing both source and target
  calculateOverlappingPositions();
}

// Calculate which positions overlap between source and target
function calculateOverlappingPositions() {
  overlappingPositions.clear();
  
  // Round positions to grid cells for overlap detection (using pixelSize as grid size)
  // Use larger grid for better overlap detection
  let gridSize = pixelSize * 2;
  
  // Create a set of all source original positions (rounded to grid)
  let sourceGridSet = new Set();
  for (let i = 0; i < sourceOriginalPositions.length; i++) {
    let pos = sourceOriginalPositions[i];
    let gridX = floor(pos.x / gridSize) * gridSize;
    let gridY = floor(pos.y / gridSize) * gridSize;
    sourceGridSet.add(`${gridX},${gridY}`);
  }
  
  // Create a set of all target original positions (rounded to grid)
  let targetGridSet = new Set();
  for (let i = 0; i < targetOriginalPositions.length; i++) {
    let pos = targetOriginalPositions[i];
    let gridX = floor(pos.x / gridSize) * gridSize;
    let gridY = floor(pos.y / gridSize) * gridSize;
    targetGridSet.add(`${gridX},${gridY}`);
  }
  
  // Find intersection - positions that exist in both source and target
  // These are the overlapping areas where pixels should stay in place
  for (let sourceKey of sourceGridSet) {
    if (targetGridSet.has(sourceKey)) {
      overlappingPositions.add(sourceKey);
    }
  }
}

// Check if a position overlaps (is in the overlapping area)
function isPositionOverlapping(x, y) {
  // Use same grid size as in calculateOverlappingPositions
  let gridSize = pixelSize * 2;
  let gridX = floor(x / gridSize) * gridSize;
  let gridY = floor(y / gridSize) * gridSize;
  let key = `${gridX},${gridY}`;
  return overlappingPositions.has(key);
}

// Capture source positions from current pixel data
function captureSourcePositions() {
  sourceParticlePositions = [];
  sourceOriginalPositions = [];
  transitionParticleData = [];
  
  // Square mode removed - only text mode
    // Nested loop through pixel data to create particle system
    for (let i = 0; i < pixelData.length; i++) {
      let pixel = pixelData[i];
      
      // Store original position for overlap detection
      sourceOriginalPositions.push({
        x: pixel.originalX,
        y: pixel.originalY
      });
      
      // Store position for display (same as original in text mode)
      sourceParticlePositions.push({
        x: pixel.originalX,
        y: pixel.originalY
      });
      transitionParticleData.push({
        colorIndex: pixel.colorIndex
      });
  }
}

// Capture target positions - removed hands mode
function captureTargetPositions() {
  // No longer needed - hands mode removed
}

// Update transition progress
function updateTransition() {
  transitionProgress += transitionSpeed;
  
  if (transitionProgress >= 1) {
    transitionProgress = 1;
    transitionActive = false;
    isSquareMode = !isSquareMode;
    // Update navigation active state after transition completes
    updateNavigationActiveState(isSquareMode);
  }
}

// Draw transition with particle system and nested loop
function drawTransition() {
  if (sourceParticlePositions.length === 0) {
    return;
  }
  
  let time = frameCount * 0.0008; // Slow time progression for smooth movement
  
  // Use easing function for smoother transition (ease-in-out)
  let easedProgress = transitionProgress < 0.5 
    ? 2 * transitionProgress * transitionProgress 
    : -1 + (4 - 2 * transitionProgress) * transitionProgress;
  
  // Nested loop through particles to draw transition
  for (let i = 0; i < sourceParticlePositions.length; i++) {
    let sourcePos = sourceParticlePositions[i];
    let particle = transitionParticleData[i];
    
    // Get target position
    let targetPos;
    if (i < targetParticlePositions.length) {
      targetPos = targetParticlePositions[i];
    } else {
      // If no target position, stay at source
      targetPos = sourcePos;
    }
    
    // Check if this pixel is in an overlapping area
    let isOverlapping = isPositionOverlapping(sourcePos.x, sourcePos.y);
    
    // If pixel is in overlapping area, keep it at source position (no movement at all)
    let currentX, currentY;
    let shouldMove = !isOverlapping;
    
    if (isOverlapping) {
      // Pixel is in overlapping area - keep it completely still at source position
      currentX = sourcePos.x;
      currentY = sourcePos.y;
    } else {
      // Pixel needs to move - interpolate between source and target
      currentX = lerp(sourcePos.x, targetPos.x, easedProgress);
      currentY = lerp(sourcePos.y, targetPos.y, easedProgress);
    }
    
    // No noise-based movement during transition - pixels move directly to their target
    // This creates a clean transition where pixels go straight to their destination
    
    // No mouse interaction during transition - pixels should move directly to target
    let finalX = currentX;
    let finalY = currentY;
    
      // Get color from palette based on position - use source grid position for stability with subtle shimmer
      let secondColorNoise = noise(sourcePos.x * 0.03, sourcePos.y * 0.03, frameCount * 0.002);
      let thirdColorNoise = noise(sourcePos.x * 0.035, sourcePos.y * 0.035, frameCount * 0.002);
      // Use a stable hash-like value for uniform color distribution without flickering
      let hash = (sin(sourcePos.x * 12.9898 + sourcePos.y * 78.233) * 43758.5453) % 1;
      let stableColorNoise = hash < 0 ? hash + 1 : hash;
      
      let colorIndex;
      
      if (secondColorNoise > 0.8) {
        colorIndex = stableColorNoise < 0.80 ? 1 : 0;
      } else if (thirdColorNoise > 0.85) {
        // Reduced red cluster area - 30% red
        colorIndex = stableColorNoise < 0.3 ? 2 : 0;
      } else if (secondColorNoise > 0.65) {
        colorIndex = stableColorNoise < 0.55 ? 1 : 0;
      } else if (thirdColorNoise > 0.7) {
        // Reduced red leaning area - 15% red
        colorIndex = stableColorNoise < 0.15 ? 2 : 0;
      } else {
        // Default area - Hierarchy: Dark Blue > Light Blue > Red
        if (stableColorNoise < 0.65) {
          colorIndex = 0; // Dark Blue (65%)
        } else if (stableColorNoise < 0.96) {
          colorIndex = 1; // Light Blue (31%)
        } else {
          colorIndex = 2; // Red (4%)
        }
      }
    
    let currentColor = colors[colorIndex];
    // Draw particle
    applyPixelStroke(colorIndex);
    applyPixelFill(currentColor, finalX, finalY + pixelOffsetY);
    rect(finalX, finalY + pixelOffsetY, pixelSize, pixelSize);
  }
}

// Update text buffer based on user input
function updateTextBuffer() {
  const textarea = document.getElementById('wrild-textarea');
  if (!textarea) return;
  
  let newText = textarea.value;
  
  // Only update if text changed
  if (newText !== userText) {
    userText = newText;
    
    if (userText && userText.length > 0) {
      createTextBuffer();
    } else {
      textPixelPositions = [];
    }
  }
}

// Create text buffer for user input text (similar to main page)
function createTextBuffer() {
  if (!textBuffer || textBuffer.width !== width || textBuffer.height !== height) {
    textBuffer = createGraphics(width, height);
    textBuffer.pixelDensity(1);
  }
  
  textBuffer.background(0);
  textBuffer.fill(255);
  
  // Text size - smaller to fit more words per line
  let textSize = width * 0.08; // Reduced from 0.12 to fit more words
  textBuffer.textSize(textSize);
  textBuffer.textFont('Monaco, Consolas, monospace');
  textBuffer.textStyle(BOLD);
  
  // Calculate position - start below the textarea, left-aligned, wrapping to next lines
  // Get the position of textarea to calculate where text should start
  const textareaElement = document.getElementById('wrild-textarea');
  let startY = 200; // Default fallback position
  if (textareaElement) {
    const textareaRect = textareaElement.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    // Calculate Y position relative to canvas (textarea bottom + some spacing)
    startY = (textareaRect.bottom - canvasRect.top) + 30; // 30px spacing below textarea
  }
  
  // Draw text with manual word wrapping - denser lines with more words
  // Calculate text width and wrap to next line if needed
  textBuffer.textAlign(LEFT, TOP); // Left-aligned, top-aligned for multi-line
  let textX = width * 0.03; // Start 3% from left edge (closer to edge)
  let textY = startY;
  let maxWidth = width * 0.94; // 94% of canvas width for text wrapping (wider)
  let words = userText.toUpperCase().split(' ');
  let currentLine = '';
  
  for (let word of words) {
    let testLine = currentLine + (currentLine ? ' ' : '') + word;
    let testWidth = textBuffer.textWidth(testLine);
    
    if (testWidth > maxWidth && currentLine) {
      // Draw current line and move to next
      textBuffer.text(currentLine, textX, textY);
      textY += textSize * 1.1; // Tighter line height (1.1 instead of 1.2)
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  // Draw the last line
  if (currentLine) {
    textBuffer.text(currentLine, textX, textY);
  }
  
  textBuffer.loadPixels();
  
  // Extract pixel positions from text buffer
  extractTextPixels();
}

// Extract pixel positions from text buffer
function extractTextPixels() {
  textPixelPositions = [];
  let baseStepSize = pixelSize * 2;
  
  for (let x = 0; x < width; x += baseStepSize) {
    for (let y = 0; y < height; y += baseStepSize) {
      let sampleX = constrain(x, 0, textBuffer.width - 1);
      let sampleY = constrain(y, 0, textBuffer.height - 1);
      
      let c = textBuffer.get(sampleX, sampleY);
      let bright = brightness(c);
      
      if (bright > 50) {
        // Add pixel position for text
        textPixelPositions.push({x: x, y: y});
      }
    }
  }
}

// Draw user text using pixels from hands (pixel clusters randomly move from hands to text)
function drawUserText() {
  if (textPixelPositions.length === 0 || pixelData.length === 0 || handsPixelPositions.length === 0) {
    return;
  }
  
  let time = frameCount * 0.0008;
  
  // Calculate how many pixels to use for text (based on text length)
  // Use up to the minimum of: text positions available, hands positions available, and pixelData available
  let pixelsForText = min(textPixelPositions.length, handsPixelPositions.length, pixelData.length);
  
  // Create clusters of pixels instead of individual pixels
  // Use a deterministic seed based on text length for consistent cluster selection
  randomSeed(pixelsForText * 1000 + userText.length);
  
  // Calculate cluster size (number of pixels per cluster)
  // Cluster size should be proportional to how many pixels we need
  let clusterSize = max(5, floor(sqrt(pixelsForText) * 0.5)); // Adaptive cluster size
  let clusterRadius = pixelSize * clusterSize * 0.5; // Radius for cluster formation
  
  // Create clusters: select random seed points and gather nearby pixels
  let usedIndices = new Set(); // Track which pixel indices are used for text
  let textPixelIndex = 0;
  
  while (textPixelIndex < pixelsForText && usedIndices.size < handsPixelPositions.length) {
    // Select a random seed point from available hands pixels
    let availableIndices = [];
    for (let i = 0; i < handsPixelPositions.length && i < pixelData.length; i++) {
      if (!usedIndices.has(i)) {
        availableIndices.push(i);
      }
    }
    
    if (availableIndices.length === 0) break;
    
    // Pick random seed point
    let seedIndex = availableIndices[floor(random(availableIndices.length))];
    let seedPos = handsPixelPositions[seedIndex];
    
    // Find nearby pixels to form a cluster
    let clusterIndices = [seedIndex];
    for (let i = 0; i < handsPixelPositions.length && i < pixelData.length; i++) {
      if (i !== seedIndex && !usedIndices.has(i)) {
        let pos = handsPixelPositions[i];
        let distance = dist(seedPos.originalX, seedPos.originalY, pos.originalX, pos.originalY);
        
        // Add to cluster if within radius and we haven't filled the cluster yet
        if (distance <= clusterRadius && clusterIndices.length < clusterSize && textPixelIndex + clusterIndices.length < pixelsForText) {
          clusterIndices.push(i);
        }
      }
    }
    
    // Mark cluster pixels as used
    for (let clusterIdx of clusterIndices) {
      usedIndices.add(clusterIdx);
      if (textPixelIndex < pixelsForText && textPixelIndex < textPixelPositions.length) {
        let textPos = textPixelPositions[textPixelIndex];
        let pixel = pixelData[clusterIdx];
        
        // Draw this pixel at text position
        // Add noise-based movement (same as main page)
        let offsetNoiseX = noise(textPos.x * 0.03, textPos.y * 0.03, time * 1.5);
        let offsetNoiseY = noise(textPos.x * 0.03, textPos.y * 0.03 + 100, time * 1.5);
        
        // Calculate density noise for offset amount
        let densityNoise = noise(textPos.x * 0.02, textPos.y * 0.02, time);
        let offsetAmount;
        if (densityNoise > 0.75) {
          offsetAmount = 0;
        } else if (densityNoise > 0.6) {
          offsetAmount = 0.02;
        } else if (densityNoise > 0.5) {
          offsetAmount = 0.08;
        } else {
          offsetAmount = 0.3;
        }
        
        // Convert noise to offset
        let offsetX = map(offsetNoiseX, 0, 1, -pixelSize * offsetAmount, pixelSize * offsetAmount);
        let offsetY = map(offsetNoiseY, 0, 1, -pixelSize * offsetAmount, pixelSize * offsetAmount);
        
        let originalX = textPos.x + offsetX;
        let originalY = textPos.y + offsetY;
        
        // Get pixel key for long press tracking (use text position key)
        let pixelKey = `text_${textPixelIndex}`;
        
        // Check for long press
        let currentTime = millis();
        let pressDuration = longPressStartTime > 0 ? currentTime - longPressStartTime : 0;
        let isLongPress = pressDuration >= longPressThreshold && mouseIsPressed;
        
        // If long press detected, activate it
        if (isLongPress && !isLongPressActive) {
          isLongPressActive = true;
        }
        
        // Check if this pixel has a stored position from previous long press
        let storedPos = longPressPixels.get(pixelKey);
        let finalX, finalY;
        
        if (storedPos) {
          // If reset is in progress, gradually move pixel back to original position
          if (isResetting) {
            let originalPos = originalPixelPositions.get(pixelKey);
            if (originalPos) {
              let resetProgress = (currentTime - resetStartTime) / resetDuration;
              resetProgress = constrain(resetProgress, 0, 1);
              // Use easing function for smoother transition
              let easedProgress = resetProgress < 0.5 
                ? 2 * resetProgress * resetProgress 
                : -1 + (4 - 2 * resetProgress) * resetProgress;
              // Interpolate between current stored position and original position
              finalX = lerp(storedPos.x, originalPos.x, easedProgress);
              finalY = lerp(storedPos.y, originalPos.y, easedProgress);
              // Update stored position during reset
              longPressPixels.set(pixelKey, {x: finalX, y: finalY});
            } else {
              finalX = storedPos.x;
              finalY = storedPos.y;
            }
          } else {
            // Use stored position from previous long press
            finalX = storedPos.x;
            finalY = storedPos.y;
          }
          originalX = finalX;
          originalY = finalY;
        } else {
          finalX = originalX;
          finalY = originalY;
        }
        
        // Handle long press - scatter pixels around mouse
        if (isLongPressActive && mouseIsPressed) {
          let mouseDistance = dist(finalX, finalY, mouseXPos, mouseYPos);
          
          if (mouseDistance < scatterRadius && mouseDistance > 0) {
            let scatterStrength = (1 - mouseDistance / scatterRadius) * 5;
            randomSeed(finalX * 1000 + finalY * 100);
            let scatterAngle = random(0, TWO_PI);
            finalX = finalX + cos(scatterAngle) * scatterStrength;
            finalY = finalY + sin(scatterAngle) * scatterStrength;
          }
        } else {
          // Regular mouse interaction - move pixels towards mouse when hovering
          let mouseDistance = dist(originalX, originalY, mouseXPos, mouseYPos);
          
          if (mouseDistance < longPressRadius && mouseDistance > 0) {
            let moveStrength = (1 - mouseDistance / longPressRadius) * longPressStrength;
            let angle = atan2(mouseYPos - originalY, mouseXPos - originalX);
            finalX = originalX + cos(angle) * mouseDistance * moveStrength;
            finalY = originalY + sin(angle) * mouseDistance * moveStrength;
            longPressPixels.set(pixelKey, {x: finalX, y: finalY});
          }
        }
        
      // Get color from palette based on position - use text grid position for stability with subtle shimmer
      let secondColorNoise = noise(textPos.x * 0.03, textPos.y * 0.03, frameCount * 0.002);
      let thirdColorNoise = noise(textPos.x * 0.035, textPos.y * 0.035, frameCount * 0.002);
      // Use a stable hash-like value for uniform color distribution without flickering
      let hash = (sin(textPos.x * 12.9898 + textPos.y * 78.233) * 43758.5453) % 1;
      let stableColorNoise = hash < 0 ? hash + 1 : hash;
      
      let colorIndex;
      
      if (secondColorNoise > 0.8) {
        colorIndex = stableColorNoise < 0.80 ? 1 : 0;
      } else if (thirdColorNoise > 0.85) {
        // Reduced red cluster area - 30% red
        colorIndex = stableColorNoise < 0.3 ? 2 : 0;
      } else if (secondColorNoise > 0.65) {
        colorIndex = stableColorNoise < 0.55 ? 1 : 0;
      } else if (thirdColorNoise > 0.7) {
        // Reduced red leaning area - 15% red
        colorIndex = stableColorNoise < 0.15 ? 2 : 0;
      } else {
        // Default area - Hierarchy: Dark Blue > Light Blue > Red
        if (stableColorNoise < 0.65) {
          colorIndex = 0; // Dark Blue (65%)
        } else if (stableColorNoise < 0.96) {
          colorIndex = 1; // Light Blue (31%)
        } else {
          colorIndex = 2; // Red (4%)
        }
      }
        let currentColor = colors[colorIndex];
        applyPixelStroke(colorIndex);
        applyPixelFill(currentColor, finalX, finalY + pixelOffsetY);
        rect(finalX, finalY + pixelOffsetY, pixelSize, pixelSize);
        
        textPixelIndex++;
      }
    }
  }
}

// Draw remaining hands pixels (those not used for text - clusters were used for text)
function drawHandsRemaining() {
  if (textPixelPositions.length === 0 || pixelData.length === 0 || handsPixelPositions.length === 0) {
    return;
  }
  
  let time = frameCount * 0.0008;
  
  // Calculate how many pixels were used for text
  let pixelsUsedForText = min(textPixelPositions.length, handsPixelPositions.length, pixelData.length);
  
  // Recreate the same cluster selection logic to know which pixels were used for text
  randomSeed(pixelsUsedForText * 1000 + userText.length);
  
  let clusterSize = max(5, floor(sqrt(pixelsUsedForText) * 0.5));
  let clusterRadius = pixelSize * clusterSize * 0.5;
  
  let usedIndices = new Set();
  let textPixelIndex = 0;
  
  while (textPixelIndex < pixelsUsedForText && usedIndices.size < handsPixelPositions.length) {
    let availableIndices = [];
    for (let i = 0; i < handsPixelPositions.length && i < pixelData.length; i++) {
      if (!usedIndices.has(i)) {
        availableIndices.push(i);
      }
    }
    
    if (availableIndices.length === 0) break;
    
    let seedIndex = availableIndices[floor(random(availableIndices.length))];
    let seedPos = handsPixelPositions[seedIndex];
    
    let clusterIndices = [seedIndex];
    for (let i = 0; i < handsPixelPositions.length && i < pixelData.length; i++) {
      if (i !== seedIndex && !usedIndices.has(i)) {
        let pos = handsPixelPositions[i];
        let distance = dist(seedPos.originalX, seedPos.originalY, pos.originalX, pos.originalY);
        
        if (distance <= clusterRadius && clusterIndices.length < clusterSize && textPixelIndex + clusterIndices.length < pixelsUsedForText) {
          clusterIndices.push(i);
        }
      }
    }
    
    for (let clusterIdx of clusterIndices) {
      usedIndices.add(clusterIdx);
      textPixelIndex++;
      if (textPixelIndex >= pixelsUsedForText) break;
    }
  }
  
  // Draw remaining pixels as hands (only those not in usedIndices)
  for (let i = 0; i < handsPixelPositions.length && i < pixelData.length; i++) {
    if (usedIndices.has(i)) {
      continue; // Skip pixels that are used for text
    }
    
    let pos = handsPixelPositions[i];
    let pixel = pixelData[i];
    
    // Add noise-based movement (same as main page)
    let offsetNoiseX = noise(pos.originalX * 0.03, pos.originalY * 0.03, time * 1.5);
    let offsetNoiseY = noise(pos.originalX * 0.03, pos.originalY * 0.03 + 100, time * 1.5);
    
    // Calculate density noise for offset amount (same logic as main page)
    let densityNoise = noise(pos.originalX * 0.02, pos.originalY * 0.02, time);
    let offsetAmount;
    if (densityNoise > 0.75) {
      offsetAmount = 0;
    } else if (densityNoise > 0.6) {
      offsetAmount = 0.02;
    } else if (densityNoise > 0.5) {
      offsetAmount = 0.08;
    } else {
      offsetAmount = 0.3;
    }
    
    // Convert noise (0-1) to offset range using map
    let offsetX = map(offsetNoiseX, 0, 1, -pixelSize * offsetAmount, pixelSize * offsetAmount);
    let offsetY = map(offsetNoiseY, 0, 1, -pixelSize * offsetAmount, pixelSize * offsetAmount);
    
    // Store original position (before mouse interaction)
    let originalX = pos.originalX + offsetX;
    let originalY = pos.originalY + offsetY;
    
    // Get pixel key for long press tracking
    let pixelKey = `hands_${i}`;
    
    // Check for long press
    let currentTime = millis();
    let pressDuration = longPressStartTime > 0 ? currentTime - longPressStartTime : 0;
    let isLongPress = pressDuration >= longPressThreshold && mouseIsPressed;
    
    // If long press detected, activate it
    if (isLongPress && !isLongPressActive) {
      isLongPressActive = true;
    }
    
    // Check if this pixel has a stored position from previous long press
    let storedPos = longPressPixels.get(pixelKey);
    let finalX, finalY;
    
    if (storedPos) {
      // If reset is in progress, gradually move pixel back to original position
      if (isResetting) {
        // Calculate current original position (with noise) as target
        let resetProgress = (currentTime - resetStartTime) / resetDuration;
        resetProgress = constrain(resetProgress, 0, 1);
        // Use easing function for smoother transition
        let easedProgress = resetProgress < 0.5 
          ? 2 * resetProgress * resetProgress 
          : -1 + (4 - 2 * resetProgress) * resetProgress;
        // Interpolate between current stored position and target original position
        finalX = lerp(storedPos.x, originalX, easedProgress);
        finalY = lerp(storedPos.y, originalY, easedProgress);
        // Update stored position during reset
        longPressPixels.set(pixelKey, {x: finalX, y: finalY});
      } else {
        // Use stored position from previous long press
        finalX = storedPos.x;
        finalY = storedPos.y;
      }
      originalX = finalX;
      originalY = finalY;
    } else {
      finalX = originalX;
      finalY = originalY;
    }
    
    // Handle long press - scatter pixels around mouse
    if (isLongPressActive && mouseIsPressed) {
      let mouseDistance = dist(finalX, finalY, mouseXPos, mouseYPos);
      
      if (mouseDistance < scatterRadius && mouseDistance > 0) {
        let scatterStrength = (1 - mouseDistance / scatterRadius) * 5;
        randomSeed(finalX * 1000 + finalY * 100);
        let scatterAngle = random(0, TWO_PI);
        finalX = finalX + cos(scatterAngle) * scatterStrength;
        finalY = finalY + sin(scatterAngle) * scatterStrength;
      }
    } else {
      // Regular mouse interaction - move pixels towards mouse when hovering
      let mouseDistance = dist(originalX, originalY, mouseXPos, mouseYPos);
      
      if (mouseDistance < longPressRadius && mouseDistance > 0) {
        let moveStrength = (1 - mouseDistance / longPressRadius) * longPressStrength;
        let angle = atan2(mouseYPos - originalY, mouseXPos - originalX);
        finalX = originalX + cos(angle) * mouseDistance * moveStrength;
        finalY = originalY + sin(angle) * mouseDistance * moveStrength;
        longPressPixels.set(pixelKey, {x: finalX, y: finalY});
      }
    }
    
      // Get color from palette based on position - use original grid position for stability with subtle shimmer
      let secondColorNoise = noise(pos.originalX * 0.03, pos.originalY * 0.03, frameCount * 0.002);
      let thirdColorNoise = noise(pos.originalX * 0.035, pos.originalY * 0.035, frameCount * 0.002);
      // Use a stable hash-like value for uniform color distribution without flickering
      let hash = (sin(pos.originalX * 12.9898 + pos.originalY * 78.233) * 43758.5453) % 1;
      let stableColorNoise = hash < 0 ? hash + 1 : hash;
      
      let colorIndex;
      
      if (secondColorNoise > 0.8) {
        colorIndex = stableColorNoise < 0.80 ? 1 : 0;
      } else if (thirdColorNoise > 0.85) {
        // Reduced red cluster area - 30% red
        colorIndex = stableColorNoise < 0.3 ? 2 : 0;
      } else if (secondColorNoise > 0.65) {
        colorIndex = stableColorNoise < 0.55 ? 1 : 0;
      } else if (thirdColorNoise > 0.7) {
        // Reduced red leaning area - 15% red
        colorIndex = stableColorNoise < 0.15 ? 2 : 0;
      } else {
        // Default area - Hierarchy: Dark Blue > Light Blue > Red
        if (stableColorNoise < 0.65) {
          colorIndex = 0; // Dark Blue (65%)
        } else if (stableColorNoise < 0.96) {
          colorIndex = 1; // Light Blue (31%)
        } else {
          colorIndex = 2; // Red (4%)
        }
      }
    let currentColor = colors[colorIndex];
    applyPixelStroke(colorIndex);
    applyPixelFill(currentColor, finalX, finalY + pixelOffsetY);
    rect(finalX, finalY + pixelOffsetY, pixelSize, pixelSize);
  }
}

// Calculate pixel positions from hands image (called once when entering square mode)
function calculateHandsPixelPositions() {
  handsPixelPositions = [];
  
  // Check if image is loaded
  if (!handsImage || handsImage.width === 0) {
    return; // Wait for image to load
  }
  
  // Scale image to fit canvas while maintaining aspect ratio
  let imgWidth = handsImage.width;
  let imgHeight = handsImage.height;
  let scale = min(width / imgWidth, height / imgHeight) * 0.8; // 80% of canvas size
  let scaledWidth = imgWidth * scale;
  let scaledHeight = imgHeight * scale;
  
  // Position image at bottom-right corner
  let startX = width - scaledWidth;
  let startY = height - scaledHeight;
  
  // Sample the image to find pixel positions
  let sampleStep = pixelSize; // Sample every pixelSize pixels
  
  for (let y = 0; y < scaledHeight; y += sampleStep) {
    for (let x = 0; x < scaledWidth; x += sampleStep) {
      // Map back to original image coordinates
      let imgX = floor((x / scaledWidth) * imgWidth);
      let imgY = floor((y / scaledHeight) * imgHeight);
      
      // Constrain to image bounds
      imgX = constrain(imgX, 0, imgWidth - 1);
      imgY = constrain(imgY, 0, imgHeight - 1);
      
      // Get pixel color from image (returns [R, G, B, A] array)
      let imgColor = handsImage.get(imgX, imgY);
      let r = imgColor[0];
      let g = imgColor[1];
      let b = imgColor[2];
      let a = imgColor.length > 3 ? imgColor[3] : 255;
      let brightness = (r + g + b) / 3;
      
      // Only use pixels that are part of the hands (not background)
      // Check alpha channel first (if transparent background)
      if (a < 128) {
        continue; // Skip transparent/background pixels
      }
      
      // For opaque images, use pixels that are not pure white or pure black
      // This should work for both light and dark backgrounds
      if (brightness > 10 && brightness < 245) { // Not pure black or pure white
        handsPixelPositions.push({
          originalX: startX + x,
          originalY: startY + y
        });
      }
    }
  }
}
