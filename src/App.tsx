import { useState, useCallback, useRef } from 'react';
import { Application, extend } from '@pixi/react';
import { Graphics, Container } from 'pixi.js';
import { SvgPathNodes } from './nodes/SvgPathNodes';
import { parseSimplePath } from './nodes/nodes';

extend({
  Container,
  Graphics,
});

// Extract a simple path for demo (first path in SVG)
const demoPath = 'M 100 350 L 250 50 L 300 300';

export const App = () => {
  const [path, setPath] = useState(demoPath);
  const [nodes, setNodes] = useState(() => parseSimplePath(demoPath));
  const mainDivRef = useRef<HTMLDivElement>(null);

  // Update node position and path string
  const handleNodeDrag = useCallback((idx: number, x: number, y: number) => {
    setNodes(prev => {
      const updated = prev.map(n => n.idx === idx ? { ...n, x, y } : n);
      // Rebuild path string from updated nodes
      const newPath = updated.map((n, i) => (i === 0 ? `M ${n.x} ${n.y}` : `L ${n.x} ${n.y}`)).join(' ');
      setPath(newPath);
      return updated;
    });
  }, []);

  // Draw the path as a line
  const drawPath = useCallback((g: Graphics) => {
    g.clear();
    g.setStrokeStyle({ width: 2, color: 0x1976d2 });
    if (nodes.length > 0) {
      g.moveTo(nodes[0].x, nodes[0].y);
      for (let i = 1; i < nodes.length; i++) {
        g.lineTo(nodes[i].x, nodes[i].y);
      }
    }
    // for single pixel line widths
    // g.stroke({ pixelLine: true, color: 0x1976d2 })
    g.stroke();
  }, [nodes]);

  return (
    <div
      ref={mainDivRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        overflow: 'hidden'
      }}
    >
      <Application
        backgroundColor={"white"}
        backgroundAlpha={0}
        antialias={true}
        resolution={window ? window.devicePixelRatio : 1}
        autoDensity={true}
        resizeTo={mainDivRef}
        eventMode='static'
      >
        <pixiGraphics draw={drawPath} />
        <SvgPathNodes path={path} onNodeDrag={handleNodeDrag} />
      </Application>
    </div>
  );
};