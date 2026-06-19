export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export const lerp = (start: number, end: number, amount: number): number =>
  start + (end - start) * amount;

export const inverseLerp = (start: number, end: number, value: number): number => {
  if (start === end) {
    return 0;
  }

  return clamp((value - start) / (end - start), 0, 1);
};

export const smoothstep = (edge0: number, edge1: number, value: number): number => {
  const t = inverseLerp(edge0, edge1, value);
  return t * t * (3 - 2 * t);
};

export const nearlyEqual = (a: number, b: number, epsilon = 0.000_001): boolean =>
  Math.abs(a - b) <= epsilon;
