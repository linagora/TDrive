import React from 'react';
import {useDroppable} from '@dnd-kit/core';

type DroppableProps={
  children: React.ReactNode
  id: any
}

export function Droppable(props:DroppableProps) {
  const {setNodeRef} = useDroppable({
    id: "droppable",
  });
  
  return (
    <div ref={setNodeRef}>
      {props.children}
    </div>
  );
}
  
