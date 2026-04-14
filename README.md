# SACRA — Art Experience 

**SACRA** is a high-end, minimalist web experience dedicated to the preservation and exploration of two millennia of sacred Western art. Designed with a global museum aesthetic, the platform combines cinematic smooth scrolling, interactive 3D elements, and immersive focal transitions to create a contemplative digital sanctuary.
![2026-04-14 01-54-06](https://github.com/user-attachments/assets/f665c3e2-3b1c-438f-80a2-8dbf43e22205)
---

## Key Features

### Cinematic Hero Sequence
*   **Frame Scrubbing engine**: A procedural 192-frame JPEG sequence that scrubs in sync with the user's scroll, creating a physical sense of "unveiling" the sacred works.
*   **Melt Transition**: Smooth interpolation between the sticky video container and the editorial content sections.

### Immersive Museum Lightbox
*   **Focal Immersive Mode**: A full-screen view for every artwork that applies a deep `20px` background blur to minimize site-wide distractions.
*   **Contextual Meta**: High-resolution viewing paired with curatorial details (School, Material, and Year).
*   **Fluid Navigation**: Eased transitions between works and full keyboard support (`ESC`, `Arrows`).

### Interactive Art Cards
*   **3D Tilt Engine**: GSAP-powered perspective transformations on gallery cards that react to mouse position with non-linear sensitivity.
*   **Micro-scale Feedback**: Subtle 1.04x expansion on hover to clearly signal interactive depth.

### Engineering & Performance
*   **Smooth Motion Architecture**: Powered by **Lenis** for inertial smooth scrolling and **GSAP ScrollTrigger** for all layout-based animations.
*   **Dynamic Responsive Layout**: A editorial mesh-style masonry grid that eliminates layout voids and adapts gracefully across devices.
*   **Hybrid Header**: A scroll-aware navigation bar that adapts its aesthetic (Light/Dark) based on the current section's background.

---

<img width="1905" height="950" alt="image" src="https://github.com/user-attachments/assets/870aab0e-c996-4cd4-8f22-5e6a55137f71" />
<img width="1903" height="948" alt="image" src="https://github.com/user-attachments/assets/5e85404e-efc4-45ca-841a-a5b71648084b" />

## Technology Stack

*   **Logic**: [Vanilla JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
*   **Animations**: [GSAP 3.12](https://greensock.com/gsap/) (ScrollTrigger)
*   **Smooth Scroll**: [Lenis 1.1](https://lenis.darkroom.engineering/)
*   **Styling**: Modern CSS (Flexbox, Grid, Clamp, Backdrop-filters)
*   **Typography**: Cinzel (Serif) & Inter (Sans)


## Credits & License

Concept and development by **rvvviana**.
Artworks curated from the public domain and heritage archives.
