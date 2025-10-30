import { invoke } from "@tauri-apps/api/core";

type ChangeViewHandler = (view: string) => void;
type ProcessingHandler = (processing: boolean) => void;
type SelectorHandler = (payload: any) => void;

declare global {
  interface Window {
    api: any;
  }
}

const changeViewListeners = new Set<ChangeViewHandler>();
const processingListeners = new Set<ProcessingHandler>();
const selectorListeners = new Set<SelectorHandler>();

const emitChangeView = (view: string) => {
  changeViewListeners.forEach((cb) => {
    try {
      cb(view);
    } catch (error) {
      console.error("onChangeView listener error", error);
    }
  });
};

const emitProcessing = (processing: boolean) => {
  processingListeners.forEach((cb) => {
    try {
      cb(processing);
    } catch (error) {
      console.error("onAIProcessing listener error", error);
    }
  });
};

const emitSelectorData = (payload: any) => {
  selectorListeners.forEach((cb) => {
    try {
      cb(payload);
    } catch (error) {
      console.error("onSelectorData listener error", error);
    }
  });
};

async function safeInvoke<T>(command: string, payload: Record<string, unknown> | undefined, fallback: T): Promise<T> {
  try {
    return await invoke<T>(command, payload);
  } catch (error) {
    console.warn(`${command} failed`, error);
    return fallback;
  }
}

const defaultConfig = { autoStart: false, apiKey: "" };
const defaultInputFieldConfig = { profiles: [], general: { hotkey: "" } };
const defaultSelectionConfig = { profiles: [], general: { enabled: true } };

const api = {
  async getConfig() {
    return safeInvoke("get_config", undefined, defaultConfig);
  },
  async saveConfig(config: unknown) {
    await invoke("save_config", { config });
  },

  async getInputFieldConfig() {
    return safeInvoke("get_input_field_config", undefined, defaultInputFieldConfig);
  },
  async saveInputFieldConfig(config: unknown) {
    await invoke("save_input_field_config", { config });
  },

  async getSelectionConfig() {
    return safeInvoke("get_selection_config", undefined, defaultSelectionConfig);
  },
  async saveSelectionConfig(config: unknown) {
    await invoke("save_selection_config", { config });
  },

  onChangeView(handler: ChangeViewHandler) {
    changeViewListeners.add(handler);
    return () => changeViewListeners.delete(handler);
  },
  changeView(view: string) {
    emitChangeView(view);
  },
  openSettings() {
    emitChangeView("settings");
  },

  onAIProcessing(handler: ProcessingHandler) {
    processingListeners.add(handler);
    return () => processingListeners.delete(handler);
  },
  setAIProcessing(processing: boolean) {
    emitProcessing(processing);
  },

  onSelectorData(handler: SelectorHandler) {
    selectorListeners.add(handler);
    return () => selectorListeners.delete(handler);
  },
  emitSelectorData(payload: any) {
    emitSelectorData(payload);
  },

  showMainWindow() {
    emitChangeView("inputfield");
  },
  chooseSelectorIndex(_token: string, _index: number) {
    // Implement Tauri logic if needed later
  }
};

if (typeof window !== "undefined") {
  window.api = api;
}

export {};
