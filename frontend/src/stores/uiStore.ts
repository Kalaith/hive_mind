import { create } from 'zustand';

export interface UIState {
  activePanel: 'hive' | 'evolution' | 'goals' | 'stats';
  isSettingsOpen: boolean;
  isSaveMenuOpen: boolean;
  isHelpOpen: boolean;
  selectedUnitType: string | null;
  notifications: Notification[];
  gameSpeed: number;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
  duration?: number;
}

interface UIStore extends UIState {
  // Panel management
  setActivePanel: (panel: UIState['activePanel']) => void;
  
  // Modal management
  openSettings: () => void;
  closeSettings: () => void;
  openSaveMenu: () => void;
  closeSaveMenu: () => void;
  openHelp: () => void;
  closeHelp: () => void;
  closeAllModals: () => void;
  
  // Unit selection
  selectUnit: (unitType: string) => void;
  clearUnitSelection: () => void;
  
  // Notification system
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Game speed control
  setGameSpeed: (speed: number) => void;
}

const initialState: UIState = {
  activePanel: 'hive',
  isSettingsOpen: false,
  isSaveMenuOpen: false,
  isHelpOpen: false,
  selectedUnitType: null,
  notifications: [],
  gameSpeed: 1,
};

export const useUIStore = create<UIStore>((set, get) => ({
  ...initialState,
  
  // Panel management
  setActivePanel: (panel) => set({ activePanel: panel }),
  
  // Modal management
  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),
  openSaveMenu: () => set({ isSaveMenuOpen: true }),
  closeSaveMenu: () => set({ isSaveMenuOpen: false }),
  openHelp: () => set({ isHelpOpen: true }),
  closeHelp: () => set({ isHelpOpen: false }),
  closeAllModals: () =>
    set({
      isSettingsOpen: false,
      isSaveMenuOpen: false,
      isHelpOpen: false,
    }),
  
  // Unit selection
  selectUnit: (unitType) => set({ selectedUnitType: unitType }),
  clearUnitSelection: () => set({ selectedUnitType: null }),
  
  // Notification system
  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    
    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));
    
    // Auto-remove notification after duration (default 5 seconds)
    const duration = notification.duration || 5000;
    setTimeout(() => {
      get().removeNotification(newNotification.id);
    }, duration);
  },
  
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id),
    })),
  
  clearNotifications: () => set({ notifications: [] }),
  
  // Game speed control
  setGameSpeed: (speed) => set({ gameSpeed: speed }),
}));