export type SvgNode = {
  x: number;
  y: number;
  type: 'endpoint' | 'control';
  idx: number;
};

// Very basic parser for 'M' and 'L' commands only
export function parseSimplePath(path: string): SvgNode[] {
  const nodes: SvgNode[] = [];
  const regex = /([ML])\s*(-?\d+(?:\.\d+)?)\s*(-?\d+(?:\.\d+)?)/gi;
  let match;
  let idx = 0;
  while ((match = regex.exec(path))) {
    const [, , x, y] = match;
    nodes.push({
      x: parseFloat(x),
      y: parseFloat(y),
      type: 'endpoint',
      idx: idx++,
    });
  }
  return nodes;
}