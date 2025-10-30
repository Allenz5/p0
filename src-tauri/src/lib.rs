use serde::{de::DeserializeOwned, Deserialize, Serialize};
use std::{fs, path::PathBuf};
use tauri::Manager;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
struct SettingsConfig {
    #[serde(default)]
    auto_start: bool,
    #[serde(default)]
    api_key: String,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
struct Profile {
    id: String,
    #[serde(default)]
    name: String,
    #[serde(default)]
    prompt: String,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
struct InputFieldGeneral {
    #[serde(default)]
    hotkey: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
struct SelectionGeneral {
    #[serde(default = "SelectionGeneral::default_enabled")]
    enabled: bool,
}

impl SelectionGeneral {
    fn default_enabled() -> bool {
        true
    }
}

impl Default for SelectionGeneral {
    fn default() -> Self {
        Self {
            enabled: Self::default_enabled(),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
struct InputFieldConfig {
    #[serde(default)]
    profiles: Vec<Profile>,
    #[serde(default)]
    general: InputFieldGeneral,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
struct SelectionConfig {
    #[serde(default)]
    profiles: Vec<Profile>,
    #[serde(default)]
    general: SelectionGeneral,
}

fn config_dir(app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
    let dir = app_handle
        .path()
        .app_config_dir()
        .map_err(|e| e.to_string())?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir)
}

fn config_path(app_handle: &tauri::AppHandle, file_name: &str) -> Result<PathBuf, String> {
    Ok(config_dir(app_handle)?.join(file_name))
}

fn read_config<T>(app_handle: &tauri::AppHandle, file_name: &str) -> Result<T, String>
where
    T: DeserializeOwned + Default,
{
    let path = config_path(app_handle, file_name)?;
    if !path.exists() {
        return Ok(T::default());
    }
    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    serde_json::from_str(&content).map_err(|e| e.to_string())
}

fn write_config<T>(app_handle: &tauri::AppHandle, file_name: &str, data: &T) -> Result<(), String>
where
    T: Serialize,
{
    let path = config_path(app_handle, file_name)?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let json = serde_json::to_string_pretty(data).map_err(|e| e.to_string())?;
    fs::write(path, json).map_err(|e| e.to_string())
}

#[tauri::command]
fn get_config(app_handle: tauri::AppHandle) -> Result<SettingsConfig, String> {
    read_config(&app_handle, "settings.json")
}

#[tauri::command]
fn save_config(app_handle: tauri::AppHandle, config: SettingsConfig) -> Result<(), String> {
    write_config(&app_handle, "settings.json", &config)
}

#[tauri::command]
fn get_input_field_config(app_handle: tauri::AppHandle) -> Result<InputFieldConfig, String> {
    read_config(&app_handle, "input_field.json")
}

#[tauri::command]
fn save_input_field_config(
    app_handle: tauri::AppHandle,
    config: InputFieldConfig,
) -> Result<(), String> {
    write_config(&app_handle, "input_field.json", &config)
}

#[tauri::command]
fn get_selection_config(app_handle: tauri::AppHandle) -> Result<SelectionConfig, String> {
    read_config(&app_handle, "selection.json")
}

#[tauri::command]
fn save_selection_config(
    app_handle: tauri::AppHandle,
    config: SelectionConfig,
) -> Result<(), String> {
    write_config(&app_handle, "selection.json", &config)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            get_config,
            save_config,
            get_input_field_config,
            save_input_field_config,
            get_selection_config,
            save_selection_config
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
