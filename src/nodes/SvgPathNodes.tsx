import { FederatedPointerEvent, Graphics } from 'pixi.js';
import { useCallback } from 'react';
import { parseSimplePath, type SvgNode } from './nodes';

type SvgPathNodesProps = {
  path: string;
  onNodeDrag: (idx: number, x: number, y: number) => void;
};

// Helper to store drag state outside the Graphics object
type DragState = {
  dragging: boolean;
  data: FederatedPointerEvent | null;
  pointerId?: number;
};

export function SvgPathNodes({ path, onNodeDrag }: SvgPathNodesProps) {
  const nodes = parseSimplePath(path);

  console.log("Parsed nodes:", nodes)

  // Drag logic: for now, just log drag events
  const drawNode = useCallback((g: Graphics, node: SvgNode) => {
    g.clear();
    g.setStrokeStyle({ width: 2, color: 0x1976d2 });
    g.fill(0xffffff);
    g.rect(node.x - 5, node.y - 5, 10, 10);
    g.interactive = true;
    g.cursor = 'pointer';
    g.eventMode = 'static';
    // Use a closure to store drag state
    const dragState: DragState = { dragging: false, data: null };
    g.on('pointerdown', (event: any) => {
      g.alpha = 0.5;
      dragState.dragging = true;
      dragState.data = event.data;
    });
    g.on('pointerup', () => {
      g.alpha = 1;
      dragState.dragging = false;
      dragState.data = null;
    });
    g.on('pointerupoutside', () => {
      g.alpha = 1;
      dragState.dragging = false;
      dragState.data = null;
    });
    g.on('pointermove', () => {
      if (dragState.dragging && dragState.data) {
        const pos = dragState.data.getLocalPosition(g.parent);
        onNodeDrag(node.idx, pos.x, pos.y);
      }
    });
    g.stroke();
    g.fill();
  }, [onNodeDrag]);

  return (
    <>
      {nodes.map((node) => (
        <pixiGraphics key={node.idx} draw={(g: Graphics) => drawNode(g, node)} />
      ))}
    </>
  );
}
