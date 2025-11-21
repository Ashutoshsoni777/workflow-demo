import { create } from 'zustand';

export type NodeStatusType = 'pending' | 'running' | 'success' | 'failed';

export type NodeStatus = {
  status: NodeStatusType;
  timestamp: string;
  error?: string;
};

type Store = {
  nodeStatus: Record<string, NodeStatus>;
  selectedNode: string | null;
  setNodeStatus: (id: string, update: Partial<NodeStatus>) => void;
  setSelectedNode: (id: string | null) => void;
};

export const useStore = create<Store>((set) => ({
  nodeStatus: {},
  selectedNode: null,

  setNodeStatus: (id, update) =>
    set((state) => ({
      nodeStatus: {
        ...state.nodeStatus,
        [id]: {
          ...(state.nodeStatus[id] || { status: 'pending' as NodeStatusType, timestamp: new Date().toISOString() }),
          ...update,
          status: update.status ?? (state.nodeStatus[id]?.status || 'pending'),
          timestamp: new Date().toISOString(), 
        },
      },
    })),

  setSelectedNode: (id) => set({ selectedNode: id }),
}));