// Generate particles distributed in 3D sphere volume (not just surface)
const generateSpherePoints = (count: number) => {
    const points = [];
    const colors = ['#06b6d4', '#2563eb', '#8b5cf6']; // cyan, blue, purple
    
    for (let i = 0; i < count; i++) {
        // Fibonacci sphere for even surface distribution
        const phi = Math.acos(1 - 2 * (i + 0.5) / count);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        
        // Random radius for volumetric distribution (not just surface)
        const r = 2.5 + Math.random() * 2.5; // radius between 2.5 and 5
        
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);
        
        points.push({
            idx: `point-${i}`,
            position: [x, y, z] as [number, number, number],
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }
    
    return points;
};

// Generate a single large set of particles
const allPoints = generateSpherePoints(800);

// Split into two arrays for compatibility
export const pointsInner = allPoints.slice(0, 400);
export const pointsOuter = allPoints.slice(400);
