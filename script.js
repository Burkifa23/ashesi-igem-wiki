// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// 1. Hero Entrance
const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
tl.fromTo(".fade-in", 
    { y: 30, opacity: 0 }, 
    { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, delay: 0.2 }
);

// 2. Cell Division SVG Animation (Looping)
const cellTl = gsap.timeline({ repeat: -1, yoyo: true, ease: "power1.inOut" });

// Make the main cell slowly split into two
cellTl.to(".split-cell-1", { x: -30, duration: 2 })
      .to(".split-cell-2", { x: 30, duration: 2 }, "<")
      .to(".main-cell", { scale: 0, opacity: 0, duration: 1 }, "-=1.5");

// 3. Scroll Reveal Animations
gsap.utils.toArray('.scroll-up').forEach(element => {
    gsap.fromTo(element, 
        { y: 40, opacity: 0 },
        {
            y: 0, 
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
                trigger: element,
                start: "top 85%", // Triggers when the top of the element hits 85% of viewport
                toggleActions: "play none none reverse"
            }
        }
    );
});