export const Vector3 = {
    zero: () => ({ x: 0, y: 0, z: 0 }),
    one: () => ({ x: 1, y: 1, z: 1 }),
    up: () => ({ x: 0, y: 1, z: 0 }),
    forward: () => ({ x: 0, y: 0, z: 1 }),

    add: (a, b) => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }),
    sub: (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }),
    mul: (v, s) => ({ x: v.x * s, y: v.y * s, z: v.z * s }),

    dot: (a, b) => a.x * b.x + a.y * b.y + a.z * b.z,
    cross: (a, b) => ({
        x: a.y * b.z - a.z * b.y,
        y: a.z * b.x - a.x * b.z,
        z: a.x * b.y - a.y * b.x
    }),

    length: (v) => Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z),
    normalize: (v) => {
        const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
        return len > 0.0001 ? { x: v.x / len, y: v.y / len, z: v.z / len } : { x: 0, y: 0, z: 0 };
    },

    distance: (a, b) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2),

    lerp: (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t })
};

export const Quaternion = {
    identity: () => ({ x: 0, y: 0, z: 0, w: 1 }),

    euler: (x, y, z) => {
        const sx = Math.sin(x * 0.5), cx = Math.cos(x * 0.5);
        const sy = Math.sin(y * 0.5), cy = Math.cos(y * 0.5);
        const sz = Math.sin(z * 0.5), cz = Math.cos(z * 0.5);
        return {
            x: sx * cy * cz + cx * sy * sz,
            y: cx * sy * cz - sx * cy * sz,
            z: cx * cy * sz + sx * sy * cz,
            w: cx * cy * cz - sx * sy * sz
        };
    },

    multiply: (a, b) => ({
        x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
        y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
        z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
        w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z
    }),

    fromLookRotation: (forward, up) => {
        forward = Vector3.normalize(forward);
        up = Vector3.normalize(up);
        const right = Vector3.normalize(Vector3.cross(up, forward));
        up = Vector3.cross(forward, right);

        const m00 = right.x, m01 = up.x, m02 = forward.x;
        const m10 = right.y, m11 = up.y, m12 = forward.y;
        const m20 = right.z, m21 = up.z, m22 = forward.z;

        const trace = m00 + m11 + m22;
        let q = { x: 0, y: 0, z: 0, w: 1 };

        if (trace > 0) {
            const s = Math.sqrt(trace + 1) * 2;
            q = { x: (m21 - m12) / s, y: (m02 - m20) / s, z: (m10 - m01) / s, w: s * 0.25 };
        } else if (m00 > m11 && m00 > m22) {
            const s = Math.sqrt(1 + m00 - m11 - m22) * 2;
            q = { x: s * 0.25, y: (m01 + m10) / s, z: (m02 + m20) / s, w: (m21 - m12) / s };
        } else if (m11 > m22) {
            const s = Math.sqrt(1 + m11 - m00 - m22) * 2;
            q = { x: (m01 + m10) / s, y: s * 0.25, z: (m12 + m21) / s, w: (m02 - m20) / s };
        } else {
            const s = Math.sqrt(1 + m22 - m00 - m11) * 2;
            q = { x: (m02 + m20) / s, y: (m12 + m21) / s, z: s * 0.25, w: (m10 - m01) / s };
        }

        const len = Math.sqrt(q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w);
        return { x: q.x / len, y: q.y / len, z: q.z / len, w: q.w / len };
    }
};

export class MathUtils {
    static clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    static lerp(a, b, t) {
        return a + (b - a) * t;
    }

    static randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}