import type { GameState } from '../stores/gameStore';

export interface SaveSlot {
  id: string;
  name: string;
  timestamp: number;
  gameState: GameState;
  version: string;
  playTime: number;
}

export interface SaveMetadata {
  hiveName: string;
  level: number;
  totalUnits: number;
  evolutionPoints: number;
  thumbnail?: string;
}

const saveKeyPrefix = 'hive-mind-save-';
const saveSlotsKey = 'hive-mind-save-slots';
const currentSaveVersion = '1.0.0';
const maxSaveSlots = 5;

export class SaveSystem {
  static getSaveSlots(): SaveSlot[] {
    try {
      const slotsData = localStorage.getItem(saveSlotsKey);
      if (!slotsData) return [];
      
      const slots = JSON.parse(slotsData) as SaveSlot[];
      return slots.sort((a, b) => b.timestamp - a.timestamp); // Most recent first
    } catch (error) {
      console.error('Failed to load save slots:', error);
      return [];
    }
  }
  
  static saveGame(gameState: GameState, slotName?: string): SaveSlot {
    const timestamp = Date.now();
    const saveId = `save-${timestamp}`;
    
    const saveSlot: SaveSlot = {
      id: saveId,
      name: slotName || `Auto Save ${new Date(timestamp).toLocaleString()}`,
      timestamp,
      gameState: { ...gameState },
      version: currentSaveVersion,
      playTime: gameState.settings.totalPlaytime,
    };
    
    // Save the individual slot
    localStorage.setItem(saveKeyPrefix + saveId, JSON.stringify(saveSlot));
    
    // Update slots index
    const existingSlots = this.getSaveSlots();
    const updatedSlots = [saveSlot, ...existingSlots];
    
    // Limit number of saves
    if (updatedSlots.length > maxSaveSlots) {
      const removedSlots = updatedSlots.splice(maxSaveSlots);
      // Clean up old saves
      removedSlots.forEach(slot => {
        localStorage.removeItem(saveKeyPrefix + slot.id);
      });
    }
    
    localStorage.setItem(saveSlotsKey, JSON.stringify(updatedSlots));
    
    return saveSlot;
  }
  
  static loadGame(saveId: string): GameState | null {
    try {
      const saveData = localStorage.getItem(saveKeyPrefix + saveId);
      if (!saveData) return null;
      
      const saveSlot = JSON.parse(saveData) as SaveSlot;
      
      // Version compatibility check
      if (saveSlot.version !== currentSaveVersion) {
        console.warn('Save version mismatch, attempting migration');
        return this.migrateSave(saveSlot);
      }
      
      return saveSlot.gameState;
    } catch (error) {
      console.error('Failed to load save:', error);
      return null;
    }
  }
  
  static deleteSave(saveId: string): boolean {
    try {
      // Remove the save file
      localStorage.removeItem(saveKeyPrefix + saveId);
      
      // Update slots index
      const existingSlots = this.getSaveSlots();
      const updatedSlots = existingSlots.filter(slot => slot.id !== saveId);
      localStorage.setItem(saveSlotsKey, JSON.stringify(updatedSlots));
      
      return true;
    } catch (error) {
      console.error('Failed to delete save:', error);
      return false;
    }
  }
  
  static renameSave(saveId: string, newName: string): boolean {
    try {
      const saveData = localStorage.getItem(saveKeyPrefix + saveId);
      if (!saveData) return false;
      
      const saveSlot = JSON.parse(saveData) as SaveSlot;
      saveSlot.name = newName;
      
      // Update the save file
      localStorage.setItem(saveKeyPrefix + saveId, JSON.stringify(saveSlot));
      
      // Update slots index
      const existingSlots = this.getSaveSlots();
      const updatedSlots = existingSlots.map(slot => 
        slot.id === saveId ? { ...slot, name: newName } : slot
      );
      localStorage.setItem(saveSlotsKey, JSON.stringify(updatedSlots));
      
      return true;
    } catch (error) {
      console.error('Failed to rename save:', error);
      return false;
    }
  }
  
  static exportSave(saveId: string): string | null {
    try {
      const saveData = localStorage.getItem(saveKeyPrefix + saveId);
      if (!saveData) return null;
      
      const saveSlot = JSON.parse(saveData) as SaveSlot;
      return btoa(JSON.stringify(saveSlot)); // Base64 encode
    } catch (error) {
      console.error('Failed to export save:', error);
      return null;
    }
  }
  
  static importSave(encodedSave: string, customName?: string): SaveSlot | null {
    try {
      const saveData = atob(encodedSave); // Base64 decode
      const saveSlot = JSON.parse(saveData) as SaveSlot;
      
      // Generate new ID and timestamp
      const timestamp = Date.now();
      const newSaveId = `import-${timestamp}`;
      
      const importedSlot: SaveSlot = {
        ...saveSlot,
        id: newSaveId,
        name: customName || `Imported: ${saveSlot.name}`,
        timestamp,
      };
      
      // Save the imported slot
      localStorage.setItem(saveKeyPrefix + newSaveId, JSON.stringify(importedSlot));
      
      // Update slots index
      const existingSlots = this.getSaveSlots();
      const updatedSlots = [importedSlot, ...existingSlots].slice(0, maxSaveSlots);
      localStorage.setItem(saveSlotsKey, JSON.stringify(updatedSlots));
      
      return importedSlot;
    } catch (error) {
      console.error('Failed to import save:', error);
      return null;
    }
  }
  
  static getQuickSave(): SaveSlot | null {
    const slots = this.getSaveSlots();
    return slots.find(slot => slot.name.startsWith('Quick Save')) || null;
  }
  
  static quickSave(gameState: GameState): SaveSlot {
    return this.saveGame(gameState, `Quick Save ${new Date().toLocaleString()}`);
  }
  
  static getSaveMetadata(gameState: GameState): SaveMetadata {
    const totalUnits = Object.values(gameState.units).reduce((sum, count) => sum + count, 0);
    const level = Math.floor(gameState.evolution.points / 100) + 1; // Simple level calculation
    
    return {
      hiveName: 'The Hive', // Could be customizable later
      level,
      totalUnits,
      evolutionPoints: gameState.evolution.points,
    };
  }
  
  static clearAllSaves(): boolean {
    try {
      const slots = this.getSaveSlots();
      slots.forEach(slot => {
        localStorage.removeItem(saveKeyPrefix + slot.id);
      });
      localStorage.removeItem(saveSlotsKey);
      return true;
    } catch (error) {
      console.error('Failed to clear all saves:', error);
      return false;
    }
  }
  
  private static migrateSave(saveSlot: SaveSlot): GameState | null {
    // Handle version migrations here
    // For now, just return the game state as-is
    console.log('Migrating save from version', saveSlot.version, 'to', currentSaveVersion);
    return saveSlot.gameState;
  }
  
  static getStorageUsage(): { used: number; available: number; percentage: number } {
    try {
      const used = JSON.stringify(localStorage).length;
      const available = 5 * 1024 * 1024; // Approximate localStorage limit (5MB)
      const percentage = (used / available) * 100;
      
      return { used, available, percentage };
    } catch {
      return { used: 0, available: 5 * 1024 * 1024, percentage: 0 };
    }
  }
}
