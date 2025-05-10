// mouseTrail.js - Modified version with white and blue cursor
document.addEventListener('DOMContentLoaded', function () {
    const container = document.querySelector('body');
    const trails = [];
    const trailCount = 15; // Number of circles in the trail
    const trailLifespan = 600; // How long each trail circle lives (ms)
  
    // Create custom cursor
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    cursor.style.position = 'absolute';
    cursor.style.width = '24px';
    cursor.style.height = '24px';
    cursor.style.borderRadius = '50%';
    cursor.style.background = 'radial-gradient(circle, white 0%, #3498db 70%)';
    cursor.style.boxShadow = '0 0 8px rgba(52, 152, 219, 0.8)';
    cursor.style.pointerEvents = 'none';
    cursor.style.zIndex = '10000';
    cursor.style.transform = 'translate(-50%, -50%)';
    container.appendChild(cursor);
  
    // Create trail elements
    for (let i = 0; i < trailCount; i++) {
      const trail = document.createElement('div');
      trail.className = 'mouse-trail';
      trail.style.position = 'absolute';
      trail.style.borderRadius = '50%';
      trail.style.pointerEvents = 'none';
      trail.style.zIndex = '9999';
      trail.style.opacity = '0';
      trail.style.transform = 'translate(-50%, -50%)';
      trail.style.transition = 'opacity 0.5s ease-out';
      container.appendChild(trail);
  
      trails.push({
        element: trail,
        x: 0,
        y: 0,
        size: Math.max(5, (trailCount - i) * 2),
        timeCreated: 0,
      });
    }
  
    // Hide default cursor
    document.body.style.cursor = 'none';
  
    // Mouse move handler
    document.addEventListener('mousemove', function (e) {
      const currentTime = Date.now();
  
      // Update custom cursor position
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
  
      // Update the position of the first trail element immediately
      trails[0].x = e.clientX;
      trails[0].y = e.clientY;
      trails[0].timeCreated = currentTime;
  
      // Update elements
      updateTrails();
    });
  
    function updateTrails() {
      const currentTime = Date.now();
  
      for (let i = 0; i < trails.length; i++) {
        const trail = trails[i];
        const timeDiff = currentTime - trail.timeCreated;
  
        if (timeDiff < trailLifespan) {
          const opacity = Math.max(0, 1 - timeDiff / trailLifespan);
  
          trail.element.style.left = `${trail.x}px`;
          trail.element.style.top = `${trail.y}px`;
          trail.element.style.width = `${trail.size}px`;
          trail.element.style.height = `${trail.size}px`;
          trail.element.style.opacity = opacity;
  
          const blueHue = 210;
          trail.element.style.background = `radial-gradient(circle, hsla(${blueHue}, 100%, 80%, ${opacity}) 0%, hsla(${blueHue}, 100%, 50%, 0) 70%)`;
          trail.element.style.boxShadow = `0 0 5px hsla(${blueHue}, 100%, 70%, ${opacity * 0.7})`;
        } else {
          trail.element.style.opacity = '0';
        }
  
        if (i < trails.length - 1 && trails[i].timeCreated !== 0) {
          const nextTrail = trails[i + 1];
          nextTrail.x = trail.x;
          nextTrail.y = trail.y;
          nextTrail.timeCreated = trail.timeCreated;
        }
      }
  
      requestAnimationFrame(updateTrails);
    }
  
    // Enhanced hover effect for clickable elements
    document.addEventListener(
      'mouseenter',
      function (e) {
        const target = e.target;
        if (
          target instanceof Element &&
          (target.tagName === 'A' ||
            target.tagName === 'BUTTON' ||
            target.closest('a') ||
            target.closest('button'))
        ) {
          cursor.style.transform = 'translate(-50%, -50%) scale(1.2)';
          cursor.style.background = 'radial-gradient(circle, white 0%, #2980b9 70%)';
        }
      },
      true
    );
  
    document.addEventListener(
      'mouseleave',
      function () {
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        cursor.style.background = 'radial-gradient(circle, white 0%, #3498db 70%)';
      },
      true
    );
  });
  