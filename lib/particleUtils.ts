const randFloat = (min: number, max: number) => Math.random() * (max - min) + min;

const makeRing = (
    count: number,
    radius: number,
    spread: number,
    colors: string[]
) =>
    Array.from({ length: count }, (_, idx) => {
        const angle = Math.random() * Math.PI * 2;
        const r = radius + (Math.random() - 0.5) * spread;
        return {
            idx,
            position: [
                Math.cos(angle) * r,
                Math.sin(angle) * r,
                randFloat(-0.5, 0.5),
            ] as [number, number, number],
            color: colors[Math.floor(Math.random() * colors.length)],
        };
    });

export const pointsInner = makeRing(750, 4, 1.5, ['#22d3ee', '#06b6d4', '#0891b2', '#67e8f9']);
export const pointsOuter = makeRing(750, 7.5, 1.5, ['#3b82f6', '#2563eb', '#60a5fa', '#818cf8']);
