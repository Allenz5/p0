import { useState, useEffect } from 'react';

export function useSelection() {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [generalConfig, setGeneralConfig] = useState({ enabled: true });

  useEffect(() => {
    loadSelectionConfig();
  }, []);

  const loadSelectionConfig = async () => {
    try {
      const config = await window.api.getSelectionConfig();
      setProfiles(config.profiles || []);
      const general = config.general || {};
      const enabled = general.enabled !== undefined ? Boolean(general.enabled) : true;
      setGeneralConfig({ enabled });
    } catch (error) {
      console.warn('Selection config API not available yet; using defaults');
    }
  };

  const saveConfig = async () => {
    try {
      if (!window.api || !window.api.saveSelectionConfig) return;
      await window.api.saveSelectionConfig({
        profiles,
        general: generalConfig,
      });
    } catch (error) {
      console.error('Error saving Selection config:', error);
    }
  };

  const handleAddProfile = () => {
    if (profiles.length >= 9) {
      alert('Maximum 9 profiles allowed (use number keys 1-9 to select).');
      return;
    }

    let profileNumber = profiles.length + 1;
    let newName = `Profile ${profileNumber}`;
    while (profiles.some(p => p.name === newName)) {
      profileNumber++;
      newName = `Profile ${profileNumber}`;
    }
    const newProfile = {
      id: Date.now().toString(),
      name: newName,
      prompt: '',
    };
    const updatedProfiles = [...profiles, newProfile];
    setProfiles(updatedProfiles);
    setSelectedProfileId(newProfile.id);
  };

  const handleProfileClick = (profileId) => {
    setSelectedProfileId(profileId);
  };

  const handleDeleteProfile = (profileId) => {
    if (profiles.length <= 1) {
      alert('Cannot delete the last profile. You must have at least one profile.');
      return;
    }

    const updatedProfiles = profiles.filter((p) => p.id !== profileId);
    setProfiles(updatedProfiles);
    if (selectedProfileId === profileId) {
      setSelectedProfileId(null);
    }
  };

  const handleProfileUpdate = (field, value) => {
    if (field === 'name' && !value.trim()) {
      return;
    }

    const updatedProfiles = profiles.map((p) =>
      p.id === selectedProfileId ? { ...p, [field]: value } : p
    );
    setProfiles(updatedProfiles);
  };

  const handleGeneralConfigUpdate = (field, value) => {
    setGeneralConfig({ ...generalConfig, [field]: value });
  };

  useEffect(() => {
    if (profiles.length > 0 || typeof generalConfig.enabled === 'boolean') {
      saveConfig();
    }
  }, [profiles, generalConfig]);

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId);

  return {
    profiles,
    selectedProfileId,
    setSelectedProfileId,
    generalConfig,
    handleAddProfile,
    handleProfileClick,
    handleDeleteProfile,
    handleProfileUpdate,
    handleGeneralConfigUpdate,
    selectedProfile,
  };
}
