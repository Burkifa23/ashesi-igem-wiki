gsap.registerPlugin(ScrollTrigger);

// 1. HERO LOAD ANIMATION (Framer TextFlux Simulation)
const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
tl.to(".flux-text", { y: "0%", duration: 1.2, stagger: 0.2, delay: 0.2 })
  .fromTo(".fade-in", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, stagger: 0.2 }, "-=0.5");

// 2. HOVER GLOSSARY MECHANICS (Framer Hover/Focus Component)
const tooltip = document.getElementById('glossary-tooltip');
const terms = document.querySelectorAll('.glossary-term');

// Move tooltip with mouse
document.addEventListener('mousemove', (e) => {
    gsap.to(tooltip, { x: e.clientX, y: e.clientY, duration: 0.1, ease: "none" });
});

terms.forEach(term => {
    term.addEventListener('mouseenter', () => {
        tooltip.innerText = term.getAttribute('data-def');
        gsap.to(tooltip, { opacity: 1, duration: 0.2 });
        // Dim the rest of the text slightly to focus on the term
        gsap.to('p', { color: 'rgba(160, 160, 176, 0.4)', duration: 0.3 });
        gsap.to(term, { color: '#ffffff', duration: 0.3 });
    });
    term.addEventListener('mouseleave', () => {
        gsap.to(tooltip, { opacity: 0, duration: 0.2 });
        gsap.to('p', { color: '#a0a0b0', duration: 0.3 });
        gsap.to(term, { color: '#00ffcc', duration: 0.3 });
    });
});

// 3. NARRATIVE SPATIAL CONTINUITY (String-Tune Progress + DrawSVG Simulation)

// Pin the right column
ScrollTrigger.create({
    trigger: ".narrative-track",
    start: "top top",
    end: "bottom bottom",
    pin: ".visual-pin"
});

// Unveil Headers on scroll (TextFlux ScrollReveal)
gsap.utils.toArray('.story-panel').forEach(panel => {
    const header = panel.querySelector('.scroll-reveal');
    gsap.to(header, {
        scrollTrigger: {
            trigger: panel,
            start: "top 75%",
            toggleActions: "play none none reverse"
        },
        y: "0%",
        duration: 0.8,
        ease: "power3.out"
    });
});

// The Master SVG Timeline (Tied to scrollbar)
// Panel 1: Draw the Mars Ring
gsap.to(".path-mars", {
    scrollTrigger: { trigger: "#panel-nasa", start: "top center", end: "bottom center", scrub: 1 },
    strokeDashoffset: 0
});

// Panel 1 -> 2: Shrink Mars, Reveal Earth Grid
const tlEarth = gsap.timeline({
    scrollTrigger: { trigger: "#panel-earth", start: "top 80%", end: "center center", scrub: 1 }
});
tlEarth.to(".path-mars", { scale: 0.2, opacity: 0, transformOrigin: "center center" })
       .to(".layer-earth", { opacity: 1 }, "<")
       .to(".path-grid", { strokeDashoffset: 0, stagger: 0.1 }, "<");

// Panel 2 -> 3: Morph to Cell
const tlMicro = gsap.timeline({
    scrollTrigger: { trigger: "#panel-cell", start: "top 80%", end: "center center", scrub: 1 }
});
tlMicro.to(".layer-earth", { scale: 2, opacity: 0, rotation: 45, transformOrigin: "center center" })
       .to(".path-micro", { opacity: 1, strokeDashoffset: 0 }, "<")
       .to(".core-node", { opacity: 1, scale: 1.5, transformOrigin: "center" }, "-=0.2");


// --- PHASE 2: INFRASTRUCTURE STRESS TEST ---

const stressSection = document.querySelector('.stress-section');
const velocityGrid = document.querySelector('.velocity-grid');

// 1. StringSpotlight Simulation (Cursor Tracking)
stressSection.addEventListener('mousemove', (e) => {
    const rect = stressSection.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Update CSS variables for the radial gradient mask
    gsap.to(stressSection, {
        '--mouse-x': `${x}px`,
        '--mouse-y': `${y}px`,
        duration: 0.3, // Adds a slight smooth trailing effect
        ease: "power2.out"
    });
});

// 2. StringLerp Simulation (Scroll Velocity Tracking & Glitch)
// We use GSAP's built-in velocity tracker to alter the CSS grid variables
ScrollTrigger.create({
    trigger: ".stress-section",
    start: "top bottom",
    end: "bottom top",
    onUpdate: (self) => {
        // Get the current scroll velocity
        let velocity = self.getVelocity();
        
        // Clamp the velocity so it doesn't break the layout if they scroll insanely fast
        let clampedVelocity = gsap.utils.clamp(-3000, 3000, velocity);
        
        // Map the velocity to a skew angle (e.g., max 5 degrees)
        let skewAmount = (clampedVelocity / 3000) * 5;
        // Map velocity to RGB split effect (e.g., max 15px)
        let rgbSplit = (clampedVelocity / 3000) * 15;
        
        gsap.to(velocityGrid, {
            '--skew-y': `${skewAmount}deg`,
            '--rgb-split': `${rgbSplit}px`,
            '--scale': 1 + Math.abs(clampedVelocity / 15000), // Slight zoom on fast scroll
            duration: 0.1,
            overwrite: true
        });
    }
});

// Reset the glitch back to normal when scrolling stops
ScrollTrigger.addEventListener("scrollEnd", () => {
    gsap.to(velocityGrid, {
        '--skew-y': `0deg`,
        '--rgb-split': `0px`,
        '--scale': 1,
        duration: 0.5,
        ease: "elastic.out(1, 0.3)" // Snaps back like a rubber band
    });
});

// 3. Unveil Data Cards on Scroll
gsap.from(".data-card", {
    scrollTrigger: {
        trigger: ".data-dashboard",
        start: "top 80%",
        toggleActions: "play none none reverse"
    },
    y: 40,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: "power3.out"
});