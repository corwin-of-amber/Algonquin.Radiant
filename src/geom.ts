/**
 * Really basic 2D geometry.
 */

type XY<T> = {x: T, y: T};
type Point2D = XY<number>;

namespace Point2D {
    export const O = {x: 0, y: 0};

    export function add(...p: Point2D[]) {
        return p.reduce((p1, p2) => ({x: p1.x + p2.x, y: p1.y + p2.y}), O);
    }
}

export { Point2D }