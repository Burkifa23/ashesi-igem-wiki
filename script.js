// ==========================================
// 1. GLOBAL INITIALIZATION (Runs on all pages)
// ==========================================

// --- 0. INITIALIZE LENIS SMOOTH SCROLLING ---
const lenis = new Lenis({
    duration: 1.2, // Controls the "weight" of the scroll momentum
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Premium smooth easing curve
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
});

// Sync Lenis with GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000) });
gsap.ticker.lagSmoothing(0);

gsap.registerPlugin(ScrollTrigger);

// --- 1. GLOBAL PAGE TRANSITION SYSTEM ---
const transitionScreen = document.getElementById('global-transition');
const transitionFill = document.querySelector('.transition-fill');

if (transitionScreen && transitionFill) {
    // A. Enter Animation (When the page loads)
    window.addEventListener('load', () => {
        const tl = gsap.timeline();
        tl.to(transitionFill, { width: "100%", duration: 0.6, ease: "power3.inOut" })
          .to(transitionScreen, { y: "-100%", duration: 0.8, ease: "expo.inOut", delay: 0.2 })
          .set(transitionScreen, { display: "none" }); // Hide it completely once done
    });

    // B. Exit Animation (When clicking a link)
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            // Only hijack internal links
            if (link.hostname === window.location.hostname && link.getAttribute('target') !== '_blank' && !link.getAttribute('href').startsWith('#')) {
                e.preventDefault(); // Stop instant navigation
                const targetUrl = link.href;
                
                // Reset loader and animate it down
                gsap.set(transitionScreen, { display: "flex", y: "100%" });
                gsap.set(transitionFill, { width: "0%" });
                
                const tl = gsap.timeline({
                    onComplete: () => { window.location.href = targetUrl; } // Navigate after animation
                });
                
                tl.to(transitionScreen, { y: "0%", duration: 0.6, ease: "expo.inOut" })
                  .to(transitionFill, { width: "100%", duration: 0.4, ease: "power2.out" });
            }
        });
    });
}

// --- 2. OS TELEMETRY HUD ---

// A. Scroll Percentage Tracker
const scrollPercentDisplay = document.getElementById('scroll-percent');
if (scrollPercentDisplay) {
    lenis.on('scroll', (e) => {
        // Calculate total scrollable height
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        // Calculate percentage and pad with leading zero (e.g., 05%, 99%)
        let percent = Math.min(100, Math.max(0, (e.scroll / scrollHeight) * 100));
        scrollPercentDisplay.innerText = Math.round(percent).toString().padStart(2, '0') + '%';
    });
}

// B. FPS Tracker (Refined)
const fpsCounter = document.getElementById('fps-counter');
if (fpsCounter) {
    let lastTime = performance.now();
    let frameCount = 0;

    const updateFPS = () => {
        const now = performance.now();
        frameCount++;
        if (now >= lastTime + 1000) {
            const fps = Math.round((frameCount * 1000) / (now - lastTime));
            fpsCounter.innerText = fps;
            if (fps < 30) fpsCounter.classList.add('drop');
            else fpsCounter.classList.remove('drop');
            frameCount = 0;
            lastTime = now;
        }
        requestAnimationFrame(updateFPS);
    };
    requestAnimationFrame(updateFPS);
}

// --- 3. COMMON ANIMATIONS (Hero Text Unveil) ---
const fluxTexts = document.querySelectorAll(".flux-text");
if (fluxTexts.length > 0) {
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.to(".flux-text", { y: "0%", duration: 1.2, stagger: 0.2, delay: 0.2 })
      .fromTo(".fade-in", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, stagger: 0.2 }, "-=0.5");
}

// UNIVERSAL Scroll Reveal (Fixed)
const scrollReveals = gsap.utils.toArray('.scroll-reveal');
if (scrollReveals.length > 0) {
    scrollReveals.forEach(header => {
        gsap.to(header, {
            scrollTrigger: {
                trigger: header.parentElement, // Triggers based on its own wrapper
                start: "top 85%", 
                toggleActions: "play none none reverse"
            },
            y: "0%",
            duration: 0.8,
            ease: "power3.out"
        });
    });
}

// ==========================================
// 2. ENGINEERING PAGE LOGIC
// ==========================================

// --- 4. ENGINEERING: HORIZONTAL SCROLL HIJACK ---
const horizontalSection = document.querySelector('.horizontal-section');
const horizontalContainer = document.querySelector('.horizontal-container');

if (horizontalSection && horizontalContainer) {
    gsap.to(horizontalContainer, {
        // Move container left by its total width minus one screen width
        x: () => -(horizontalContainer.scrollWidth - window.innerWidth),
        ease: "none",
        scrollTrigger: {
            trigger: horizontalSection,
            pin: true, // Lock the vertical scroll
            scrub: 1,  // Tie to Lenis smooth scroll
            invalidateOnRefresh: true, // Recalculate on window resize
            // Pin for the exact distance of the horizontal scroll
            end: () => "+=" + (horizontalContainer.scrollWidth - window.innerWidth)
        }
    });
}

// --- 5. MATH GRAPH & PARALLAX ---
const modelContainer = document.querySelector(".model-container");
if (modelContainer) {
    // 1. Draw the Hill Equation Curve on Scroll
    const graphTl = gsap.timeline({
        scrollTrigger: {
            trigger: ".model-container",
            start: "top 60%",
            end: "center center",
            scrub: 1 // Ties drawing speed to scroll speed
        }
    });

    graphTl.to(".hill-curve", { strokeDashoffset: 0, ease: "none" })
           .to(".operating-point", { opacity: 1, scale: 1, ease: "back.out(2)" }, "-=0.2");
}

const parallaxCards = document.querySelectorAll('.parallax-card');
if (parallaxCards.length > 0) {
    // 2. StringParallax Simulation for Hardware Cards
    parallaxCards.forEach(card => {
        // Increase the multiplier to make the distance traveled much larger
        const speed = parseFloat(card.getAttribute('data-speed')) * 2.5; 
        
        gsap.fromTo(card, 
            { y: 150 * speed }, // Start much lower
            { 
                y: -150 * speed, // End much higher
                ease: "none",
                scrollTrigger: {
                    trigger: ".parallax-track",
                    start: "top bottom", // Start animating when the track enters the bottom of the screen
                    end: "bottom top",   // Stop when it leaves the top
                    scrub: true // Tied flawlessly to Lenis smooth scroll
                }
            }
        );
    });
}

// --- 6. INTERACTIVE BIOLOGY SIMULATOR ---
const arsSlider = document.getElementById('ars-slider');
const tempSlider = document.getElementById('temp-slider');

if (arsSlider && tempSlider) {
    const arsVal = document.getElementById('ars-val');
    const tempVal = document.getElementById('temp-val');
    const gfpVal = document.getElementById('gfp-val');
    const gfpFill = document.getElementById('gfp-fill');

    const nodeHrpR = document.getElementById('node-hrpr');
    const nodeHrpS = document.getElementById('node-hrps');
    const nodeGfp = document.getElementById('node-gfp');

    // The parameterized Hill Equation variables
    const nR = 2.381, nS = 1.835, Kr = 206.1, Ks = 3135;

    const calculateCircuit = () => {
        let arsenic = parseFloat(arsSlider.value);
        let temp = parseFloat(tempSlider.value);
        
        arsVal.innerText = arsenic;
        tempVal.innerText = temp;

        let isHrpRActive = arsenic > 10;
        if (isHrpRActive) {
            nodeHrpR.classList.add('active-hrpr');
            nodeHrpR.querySelector('.node-state').innerText = 'ON';
        } else {
            nodeHrpR.classList.remove('active-hrpr');
            nodeHrpR.querySelector('.node-state').innerText = 'OFF';
        }

        let isHrpSActive = temp >= 37;
        if (isHrpSActive) {
            nodeHrpS.classList.add('active-hrps');
            nodeHrpS.querySelector('.node-state').innerText = 'ON';
        } else {
            nodeHrpS.classList.remove('active-hrps');
            nodeHrpS.querySelector('.node-state').innerText = 'OFF';
        }

        let concentrationR = isHrpRActive ? (arsenic * 5) : 0; 
        let concentrationS = isHrpSActive ? (temp * 100) : 0;

        let hillR = Math.pow(concentrationR, nR) / (Math.pow(Kr, nR) + Math.pow(concentrationR, nR));
        let hillS = Math.pow(concentrationS, nS) / (Math.pow(Ks, nS) + Math.pow(concentrationS, nS));
        
        let gfpOutput = hillR * hillS;
        let gfpPercentage = (gfpOutput * 100).toFixed(2);

        gfpVal.innerText = gfpPercentage;
        gfpFill.style.width = `${gfpPercentage}%`;

        if (gfpPercentage > 50) {
            nodeGfp.classList.add('active-gfp');
            nodeGfp.querySelector('.node-state').innerText = 'FLUORESCENT';
            gsap.to(nodeGfp, { scale: 1.05, duration: 0.2 }); 
        } else {
            nodeGfp.classList.remove('active-gfp');
            nodeGfp.querySelector('.node-state').innerText = 'OFF';
            gsap.to(nodeGfp, { scale: 1, duration: 0.2 });
        }
    };

    arsSlider.addEventListener('input', calculateCircuit);
    tempSlider.addEventListener('input', calculateCircuit);
    calculateCircuit();
}


// ==========================================
// 3. HOME PAGE LOGIC
// ==========================================

// --- 7. HOVER GLOSSARY MECHANICS ---
const tooltip = document.getElementById('glossary-tooltip');
const terms = document.querySelectorAll('.glossary-term');

if (tooltip && terms.length > 0) {
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
}

// --- 8. NARRATIVE SPATIAL CONTINUITY (Home Page SVG Morphing) ---
const narrativeTrack = document.querySelector('.narrative-track');
if (narrativeTrack) {
    // Pin the right column
    ScrollTrigger.create({
        trigger: ".narrative-track",
        start: "top top",
        end: "bottom bottom",
        pin: ".visual-pin"
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
}

if (narrativeTrack) {
    // 1. Pin the right column so it sticks to the screen while reading
    ScrollTrigger.create({
        trigger: ".narrative-track",
        start: "top top",
        end: "bottom bottom",
        pin: ".visual-pin"
    });

    // 2. Panel 1 (NASA): Draw the Mars Ring tied to the scrollbar
    gsap.to(".path-mars", {
        scrollTrigger: { 
            trigger: "#panel-nasa", 
            start: "top center", 
            end: "bottom center", 
            scrub: 1 // Links animation directly to scroll speed
        },
        strokeDashoffset: 0
    });

    // 3. Panel 1 -> 2: Shrink Mars, Draw Earth Grid
    const tlEarth = gsap.timeline({
        scrollTrigger: { 
            trigger: "#panel-earth", 
            start: "top 80%", 
            end: "center center", 
            scrub: 1 
        }
    });
    tlEarth.to(".path-mars", { scale: 0.2, opacity: 0, transformOrigin: "center center" })
           .to(".layer-earth", { opacity: 1 }, "<")
           .to(".path-grid", { strokeDashoffset: 0, stagger: 0.1 }, "<");

    // 4. Panel 2 -> 3: Earth Grid collapses into Biological Plasmid Cell
    const tlMicro = gsap.timeline({
        scrollTrigger: { 
            trigger: "#panel-cell", 
            start: "top 80%", 
            end: "center center", 
            scrub: 1 
        }
    });
    tlMicro.to(".layer-earth", { scale: 2, opacity: 0, rotation: 45, transformOrigin: "center center" })
           .to(".path-micro", { opacity: 1, strokeDashoffset: 0 }, "<")
           .to(".core-node", { opacity: 1, scale: 1.5, transformOrigin: "center" }, "-=0.2");
}

// --- 9. INFRASTRUCTURE STRESS TEST (Home Page) ---
const stressSection = document.querySelector('.stress-section');
const velocityGrid = document.querySelector('.velocity-grid');

if (stressSection && velocityGrid) {
    // StringSpotlight Simulation (Cursor Tracking)
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

    // StringLerp Simulation (Scroll Velocity Tracking & Glitch)
    ScrollTrigger.create({
        trigger: ".stress-section",
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
            let velocity = self.getVelocity();
            let clampedVelocity = gsap.utils.clamp(-3000, 3000, velocity);
            let skewAmount = (clampedVelocity / 3000) * 5;
            let rgbSplit = (clampedVelocity / 3000) * 15;
            
            gsap.to(velocityGrid, {
                '--skew-y': `${skewAmount}deg`,
                '--rgb-split': `${rgbSplit}px`,
                '--scale': 1 + Math.abs(clampedVelocity / 15000), 
                duration: 0.1,
                overwrite: true
            });
        }
    });

    ScrollTrigger.addEventListener("scrollEnd", () => {
        gsap.to(velocityGrid, {
            '--skew-y': `0deg`,
            '--rgb-split': `0px`,
            '--scale': 1,
            duration: 0.5,
            ease: "elastic.out(1, 0.3)" 
        });
    });

    // Unveil Data Cards on Scroll
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
}

// --- 10. WETLAB MAGNETIC LOGIC GATES (Home Page) ---
const nodeA = document.getElementById('node-a');
const nodeB = document.getElementById('node-b');
const nodeOut = document.getElementById('node-out');
const lineA = document.getElementById('line-a');
const lineB = document.getElementById('line-b');

if (nodeA && nodeB && nodeOut) {
    const wrappers = document.querySelectorAll('.magnetic-wrapper');
    
    // 1. StringMagnetic & StringImpulse Simulation
    wrappers.forEach(wrapper => {
        const node = wrapper.querySelector('.node');
        
        wrapper.addEventListener('mousemove', (e) => {
            const rect = wrapper.getBoundingClientRect();
            const x = e.clientX - (rect.left + rect.width / 2);
            const y = e.clientY - (rect.top + rect.height / 2);
            
            gsap.to(node, {
                x: x * 0.4,
                y: y * 0.4,
                duration: 0.4,
                ease: "power2.out"
            });
        });

        wrapper.addEventListener('mouseleave', () => {
            gsap.to(node, {
                x: 0,
                y: 0,
                duration: 0.8,
                ease: "elastic.out(1, 0.3)" 
            });
        });
    });

    // 2. The Biological Logic Gate (AND Evaluation)
    const evaluateGate = () => {
        let stateA = nodeA.getAttribute('data-state') === '1';
        let stateB = nodeB.getAttribute('data-state') === '1';

        if (stateA && stateB) {
            nodeOut.classList.add('active');
            nodeOut.querySelector('.node-val').innerText = 'GFP: ON';
            gsap.to([lineA, lineB], { stroke: "#39ff14", duration: 0.3 }); 
            gsap.to(nodeOut, { scale: 1.1, duration: 0.5, ease: "elastic.out(1, 0.3)" });
        } else {
            nodeOut.classList.remove('active');
            nodeOut.querySelector('.node-val').innerText = 'GFP: OFF';
            gsap.to([lineA, lineB], { stroke: "#333", duration: 0.3 });
            gsap.to(nodeOut, { scale: 1, duration: 0.3 });
        }
    };

    // 3. Click Handlers for Inputs
    nodeA.parentElement.addEventListener('click', () => {
        let currentState = nodeA.getAttribute('data-state');
        if (currentState === '0') {
            nodeA.setAttribute('data-state', '1');
            nodeA.classList.add('active');
            nodeA.querySelector('.node-val').innerText = 'ARSENIC: 1';
            gsap.to(lineA, { stroke: "#00ffcc", duration: 0.3 });
        } else {
            nodeA.setAttribute('data-state', '0');
            nodeA.classList.remove('active');
            nodeA.querySelector('.node-val').innerText = 'ARSENIC: 0';
            gsap.to(lineA, { stroke: "#333", duration: 0.3 });
        }
        evaluateGate();
    });

    nodeB.parentElement.addEventListener('click', () => {
        let currentState = nodeB.getAttribute('data-state');
        if (currentState === '0') {
            nodeB.setAttribute('data-state', '1');
            nodeB.classList.add('active');
            nodeB.querySelector('.node-val').innerText = 'HEAT: 1';
            gsap.to(lineB, { stroke: "#00ffcc", duration: 0.3 });
        } else {
            nodeB.setAttribute('data-state', '0');
            nodeB.classList.remove('active');
            nodeB.querySelector('.node-val').innerText = 'HEAT: 0';
            gsap.to(lineB, { stroke: "#333", duration: 0.3 });
        }
        evaluateGate();
    });
}


// ==========================================
// 4. HUMAN PRACTICES PAGE LOGIC
// ==========================================

const hpGridSection = document.querySelector('.grid-collapse-section');

if (hpGridSection) {
    
    // --- A. THE MACRO: SVG GRID COLLAPSE ---
    // As the user scrolls, the power lines lose power (turn red) and dashed lines separate (break)
    const gridTl = gsap.timeline({
        scrollTrigger: {
            trigger: ".grid-collapse-section",
            start: "top top",
            end: "bottom center",
            scrub: 1
        }
    });

    gridTl.to(".power-line", { stroke: "#ff0055", duration: 1 })
          .to(".grid-node", { fill: "#ff0055", duration: 1 }, "<")
          .to(".power-line", { strokeDasharray: "5 20", duration: 1 }, "+=0.2")
          .to(".grid-node", { scale: 0.5, opacity: 0.2, duration: 1 }, "<");


    // --- B. THE MICRO: TIMELINE HUD METRICS ---
    // Pin the HUD on the left while the right side scrolls
    ScrollTrigger.create({
        trigger: ".timeline-section",
        start: "top top",
        end: "bottom bottom",
        pin: ".timeline-hud"
    });

    const tO2 = document.getElementById('t-o2');
    const tPh = document.getElementById('t-ph');
    const tClock = document.getElementById('t-clock');

    // Tie the biological metrics directly to scroll progress
    ScrollTrigger.create({
        trigger: ".timeline-content",
        start: "top center",
        end: "bottom center",
        scrub: true,
        onUpdate: (self) => {
            const p = self.progress; // Goes from 0.0 to 1.0

            // 1. Oxygen drops from 30% to 0% rapidly (exponential decay sim)
            let o2Val = Math.max(0, 30 - (p * 150)); 
            tO2.innerText = o2Val.toFixed(1) + "%";
            tO2.style.color = o2Val < 5 ? "#ff0055" : "#00ffcc";

            // 2. pH drops from 7.00 to 4.00 slowly
            let phVal = 7.00 - (p * 3.00);
            tPh.innerText = phVal.toFixed(2);
            tPh.style.color = phVal < 5.0 ? "#ff0055" : (phVal < 6.0 ? "#ffaa00" : "#00ffcc");

            // 3. Fake Clock 00:00:00 to 04:00:00
            let totalSeconds = Math.floor(p * 14400); // 4 hours = 14400 secs
            let h = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
            let m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
            let s = (totalSeconds % 60).toString().padStart(2, '0');
            tClock.innerText = `${h}:${m}:${s}`;
        }
    });

    // Highlight the active event as it hits the center of the screen
    gsap.utils.toArray('.t-event').forEach(event => {
        ScrollTrigger.create({
            trigger: event,
            start: "top 60%",
            end: "bottom 40%",
            toggleClass: "active-event"
        });
    });


    // --- C. THE FENTON REACTION (TEXT SHATTER) ---
    // Since we can't use Club GSAP's SplitText, we build a quick vanilla JS text splitter
    const shatterText = document.getElementById('shatter-text');
    if (shatterText) {
        const textContent = shatterText.innerText;
        shatterText.innerHTML = '';
        
        // Wrap every character in a span
        textContent.split('').forEach(char => {
            const span = document.createElement('span');
            span.innerText = char === ' ' ? '\u00A0' : char;
            span.classList.add('shatter-char');
            shatterText.appendChild(span);
        });

        const chars = document.querySelectorAll('.shatter-char');

        // The violent shatter animation triggered when scrolling into the section
        gsap.to(chars, {
            scrollTrigger: {
                trigger: ".shatter-section",
                start: "top 40%", // Triggers right when they read "Grid Restored"
                toggleActions: "play none none reverse"
            },
            // Randomize the explosion of the letters
            x: () => gsap.utils.random(-400, 400),
            y: () => gsap.utils.random(-400, 400),
            rotationZ: () => gsap.utils.random(-360, 360),
            opacity: 0,
            color: "#ff0055", // Flash red as they die
            duration: 1.5,
            ease: "expo.out",
            stagger: { amount: 0.5, from: "center" } // Explodes from the middle out
        });
    }
}


