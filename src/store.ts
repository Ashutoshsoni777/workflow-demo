import { create } from 'zustand';

type NodeStatus = {
  status: 'pending' | 'running' | 'success' | 'failed';
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
          ...state.nodeStatus[id],
          ...update,
          timestamp: new Date().toISOString(),
        },
      },
    })),
  setSelectedNode: (id) => set({ selectedNode: id }),
}));