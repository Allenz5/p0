declare global {
  interface Window {
    api: any;
  }
}

const defaultApi = {
  // Settings APIs
  async getConfig() {
    return { autoStart: false, apiKey: '' };
  },
  async saveConfig(_config: any) {
    return true;
  },

  // InputField APIs
  async getInputFieldConfig() {
    return { profiles: [], general: { hotkey: '' } };
  },
  async saveInputFieldConfig(_config: any) {
    return true;
  },

  // Selection APIs
  async getSelectionConfig() {
    return { profiles: [], general: { enabled: true } };
  },
  async saveSelectionConfig(_config: any) {
    return true;
  },

  // UI / events
  onChangeView(_cb: (view: string) => void) {
    // no-op
  },
  openSettings() {
    // In Tauri, you might open a route/window; leaving no-op for now
  },
  onAIProcessing(_cb: (processing: boolean) => void) {
    // no-op
  },
  showMainWindow() {
    // no-op
  },
  onSelectorData(_cb: (payload: any) => void) {
    // no-op
  },
  chooseSelectorIndex(_token: string, _index: number) {
    // no-op
  }
};

if (typeof window !== 'undefined' && !window.api) {
  window.api = defaultApi;
}

export {};
