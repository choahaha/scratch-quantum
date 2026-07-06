/** Shared helpers for the mission map. */

export const countPassed = missions =>
    missions.filter(m => m.state === 'passed').length;

/**
 * Node coordinates (percent) along a gentle S-curve for the odyssey map,
 * plus an SVG path (viewBox 0 0 1060 380) through them.
 */
export const odysseyLayout = missions => {
    const n = missions.length;
    const ys = [30, 32, 63, 65, 38, 58]; // repeating wave pattern
    const points = missions.map((mission, i) => ({
        mission,
        x: n === 1 ? 50 : 8.5 + (i * (83 / (n - 1))),
        y: ys[i % ys.length]
    }));

    const toSvg = p => [p.x * 10.6, p.y * 3.8]; // percent -> viewBox units
    let path = '';
    points.forEach((p, i) => {
        const [x, y] = toSvg(p);
        if (i === 0) {
            path = `M ${x} ${y}`;
        } else {
            const [px, py] = toSvg(points[i - 1]);
            const mx = (px + x) / 2;
            path += ` C ${mx} ${py}, ${mx} ${y}, ${x} ${y}`;
        }
    });

    // Solid highlight path: start through the current (first available) node
    const currentIndex = points.findIndex(p => p.mission.state === 'available');
    let donePath = '';
    if (currentIndex > 0) {
        points.slice(0, currentIndex + 1).forEach((p, i) => {
            const [x, y] = toSvg(p);
            if (i === 0) {
                donePath = `M ${x} ${y}`;
            } else {
                const [px, py] = toSvg(points[i - 1]);
                const mx = (px + x) / 2;
                donePath += ` C ${mx} ${py}, ${mx} ${y}, ${x} ${y}`;
            }
        });
    }
    return {points, path, donePath};
};
