
export interface Point {
    x: number;
    y: number;
}

export const generateDots = (size: number, width: number, height: number): Point[] => {
    const dots: Point[] = [];
    const padding = 1.5;
    const spacing = Math.min(width, height) / (size - 1 + padding * 2);
    const offsetX = (width - spacing * (size - 1)) / 2;
    const offsetY = (height - spacing * (size - 1)) / 2;

    // The user requested dots to be exactly at the points of intersection.
    for (let c = 0; c < size; c++) {
        for (let r = 0; r < size - 1; r++) {
            dots.push({ x: offsetX + c * spacing, y: offsetY + (r + 0.5) * spacing });
            dots.push({ x: offsetX + (r + 0.5) * spacing, y: offsetY + c * spacing });
        }
    }
    return dots;
};

export const generateKolamPath = (size: number, width: number, height: number): string => {
    // 1. Define Grid Parameters
    const padding = 1.5;
    const spacing = Math.min(width, height) / (size - 1 + padding * 2);
    const startX = (width - spacing * (size - 1)) / 2;
    const startY = (height - spacing * (size - 1)) / 2;

    let path = "";

    const toSvg = (x: number, y: number) => ({
        x: startX + x * spacing,
        y: startY + y * spacing
    });

    const isValidInsidePort = (px: number, py: number) => {
        const isXInt = Number.isInteger(px);
        const isYInt = Number.isInteger(py);
        if (isXInt && !isYInt) {
            return px >= 0 && px <= size - 1 && py >= 0.5 && py <= size - 1.5;
        }
        if (!isXInt && isYInt) {
            return px >= 0.5 && px <= size - 1.5 && py >= 0 && py <= size - 1;
        }
        return false;
    };

    const visited = new Set<string>();

    // Find all valid starting states (directed ports)
    const startStates: { x: number, y: number, dx: number, dy: number }[] = [];
    for (let c = 0; c < size; c++) {
        for (let r = 0; r < size - 1; r++) {
            // Horizontal internal port (x=c, y=r+0.5) implies vertical line crosses horizontal mid
            // Wait, an internal port has one integer, one half integer.
            // Let's use x=c, y=r+0.5 which is a vertical port (between (c,r) and (c,r+1)).
            startStates.push({ x: c, y: r + 0.5, dx: 0.5, dy: 0.5 });
            startStates.push({ x: c, y: r + 0.5, dx: 0.5, dy: -0.5 });
            startStates.push({ x: c, y: r + 0.5, dx: -0.5, dy: 0.5 });
            startStates.push({ x: c, y: r + 0.5, dx: -0.5, dy: -0.5 });
        }
    }

    for (const state of startStates) {
        let { x, y, dx, dy } = state;
        if (visited.has(`${x},${y},${dx},${dy}`)) continue;

        const pSvg = toSvg(x, y);
        let loopPath = `M ${pSvg.x} ${pSvg.y} `;

        while (true) {
            const stateKey = `${x},${y},${dx},${dy}`;
            if (visited.has(stateKey)) break;
            visited.add(stateKey);

            let nx = x + dx;
            let ny = y + dy;

            if (isValidInsidePort(nx, ny)) {
                // INSIDE: Draw straight line
                x = nx;
                y = ny;
                const svgP = toSvg(x, y);
                loopPath += `L ${svgP.x} ${svgP.y} `;
            } else {
                // OUTSIDE: Curve around the boundary dot
                let dotX = Number.isInteger(x) ? x : nx;
                let dotY = Number.isInteger(y) ? y : ny;

                let r1x = x - dotX;
                let r1y = y - dotY;
                let r2x = nx - dotX;
                let r2y = ny - dotY;

                let cross = r1x * r2y - r1y * r2x;
                let isSweep1 = cross > 0;

                const svgP = toSvg(nx, ny);
                const radius = spacing / 2;
                loopPath += `A ${radius} ${radius} 0 0 ${isSweep1 ? 1 : 0} ${svgP.x} ${svgP.y} `;

                // Update velocity for the curve
                let oldDx = dx;
                if (isSweep1) {
                    dx = -dy;
                    dy = oldDx;
                } else {
                    dx = dy;
                    dy = -oldDx;
                }

                x = nx;
                y = ny;
            }
        }

        loopPath += "Z ";
        path += loopPath;
    }

    return path;
};
