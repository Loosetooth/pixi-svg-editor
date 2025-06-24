import { FederatedPointerEvent, Graphics } from 'pixi.js';
import { useCallback, useRef, useEffect } from 'react';
import { useApplication } from '@pixi/react';
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
  const appState = useApplication();
  const app = appState.app;
  // Track which node is being dragged
  const dragNodeRef = useRef<number | null>(null);

  // Clean up listeners on unmount
  useEffect(() => {
    app.stage.eventMode = 'static';
    app.stage.hitArea = app.screen;
    return () => {
      app.stage.off('pointermove');
      app.stage.off('pointerup');
      app.stage.off('pointerupoutside');
    };
  }, [app]);

  // Drag move handler
  const onDragMove = useCallback(
    (event: FederatedPointerEvent) => {
      if (dragNodeRef.current !== null) {
        const pos = event.getLocalPosition(app.stage);
        onNodeDrag(dragNodeRef.current, pos.x, pos.y);
      }
    },
    [app, onNodeDrag]
  );

  // Drag end handler
  const onDragEnd = useCallback(() => {
    if (dragNodeRef.current !== null) {
      app.stage.off('pointermove', onDragMove);
      dragNodeRef.current = null;
    }
  }, [app, onDragMove]);

  // Draw a single node
  const drawNode = useCallback(
    (g: Graphics, node: SvgNode) => {
      g.clear();
      g.setStrokeStyle({ width: 2, color: 0x1976d2 });
      g.fill(0xffffff);
      g.rect(node.x - 5, node.y - 5, 10, 10);
      g.interactive = true;
      g.cursor = 'pointer';
      g.eventMode = 'static';
      g.removeAllListeners();
      g.on('pointerdown', function (event: FederatedPointerEvent) {
        dragNodeRef.current = node.idx;
        app.stage.on('pointermove', onDragMove);
      });
      g.stroke();
      g.fill();
    },
    [app, onDragMove]
  );

  // Attach global drag end listeners once
  useEffect(() => {
    app.stage.on('pointerup', onDragEnd);
    app.stage.on('pointerupoutside', onDragEnd);
    return () => {
      app.stage.off('pointerup', onDragEnd);
      app.stage.off('pointerupoutside', onDragEnd);
    };
  }, [app, onDragEnd]);

  return (
    <>
      {nodes.map((node) => (
        <pixiGraphics key={node.idx} draw={(g: Graphics) => drawNode(g, node)} />
      ))}
    </>
  );
}
