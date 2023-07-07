import React from 'react';
import {useDraggable} from '@dnd-kit/core';

type DraggableProps={
  children: React.ReactNode
  index: any
}

export function Draggable(props:DraggableProps) {
  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: props.index || "draggable",
  });
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {props.children}
    </div>
  );
}