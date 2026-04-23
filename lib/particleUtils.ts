/**
 * Particle Ring Utilities
 * Helper functions for generating 3D particle positions and colors
 */

// Configuration constants
const NUM_POINTS = 2500;
const MIN_RADIUS = 7.5;
const MAX_RADIUS = 15;
const DEPTH = 2;

/**
 * Generate a random number between min and max
 */
const randomFromInterval = (min: number, max: number): number => {
    return Math.random() * (max - min) + min;
};

/**
 * Calculate color based on position
 * Creates a gradient effect from blue to purple to pink
 */
const calculateColor = (x: number): string => {
    const normalizedX = (x + MAX_RADIUS) / (MAX_RADIUS * 2);

    if (normalizedX < 0.33) {
        return '#3b82f6'; // Blue
    } else if (normalizedX < 0.66) {
        return '#8b5cf6'; // Purple
    } else {
        return '#ec4899'; // Pink
    }
};

/**
 * Generate inner ring particles
 */
export const pointsInner = Array.from(
    { length: NUM_POINTS },
    (v, k) => k + 1
).map((num) => {
    const randomRadius = randomFromInterval(MIN_RADIUS, MAX_RADIUS);
    const randomAngle = Math.random() * Math.PI * 2;

    const x = Math.cos(randomAngle) * randomRadius;
    const y = Math.sin(randomAngle) * randomRadius;
    const z = randomFromInterval(-DEPTH, DEPTH);

    const color = calculateColor(x);

    return {
        idx: num,
        position: [x, y, z] as [number, number, number],
        color,
    };
});

/**
 * Generate outer ring particles (more sparse)
 */
export const pointsOuter = Array.from(
    { length: NUM_POINTS / 4 },
    (v, k) => k + 1
).map((num) => {
    const randomRadius = randomFromInterval(MIN_RADIUS / 2, MAX_RADIUS * 2);
    const angle = Math.random() * Math.PI * 2;

    const x = Math.cos(angle) * randomRadius;
    const y = Math.sin(angle) * randomRadius;
    const z = randomFromInterval(-DEPTH * 10, DEPTH * 10);

    const color = calculateColor(x);

    return {
        idx: num,
        position: [x, y, z] as [number, number, number],
        color,
    };
});
