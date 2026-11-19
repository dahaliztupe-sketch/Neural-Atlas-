import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AstrolabeNodeId } from './worldAnchors';

interface WorldSceneContextValue {
  selectedNodeId: AstrolabeNodeId;
  hoveredNodeId: AstrolabeNodeId | null;
  setSelectedNodeId: (id: AstrolabeNodeId) => void;
  setHoveredNodeId: (id: AstrolabeNodeId | null) => void;
}

const WorldSceneContext = createContext<WorldSceneContextValue | undefined>(undefined);

export const WorldSceneProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<AstrolabeNodeId>('cs-problem-solving');
  const [hoveredNodeId, setHoveredNodeId] = useState<AstrolabeNodeId | null>(null);

  return (
    <WorldSceneContext.Provider
      value={{
        selectedNodeId,
        hoveredNodeId,
        setSelectedNodeId,
        setHoveredNodeId,
      }}
    >
      {children}
    </WorldSceneContext.Provider>
  );
};

export function useWorldScene(): WorldSceneContextValue {
  const ctx = useContext(WorldSceneContext);
  if (!ctx) {
    throw new Error('useWorldScene must be used inside WorldSceneProvider');
  }
  return ctx;
}
