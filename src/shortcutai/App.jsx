import React, { useState, useEffect } from 'react';
import './App.css';
import InputField from './InputField';
import Settings from './Settings';

function App() {
  const [currentView, setCurrentView] = useState('inputfield');

  useEffect(() => {
    if (window.api && window.api.onChangeView) {
      const unsubscribe = window.api.onChangeView((view) => {
        setCurrentView(view);
      });
      return unsubscribe;
    }
  }, []);

  const renderContent = () => {
    switch (currentView) {
      case 'inputfield':
        return <InputField />;
      case 'selection':
        return (
          <div className="view-content">
            <h1>Selection View</h1>
            <p className="view-description">
              This is the Selection view. Here you can work with selected text.
            </p>
          </div>
        );
      case 'screenshot':
        return (
          <div className="view-content">
            <h1>ScreenShot View</h1>
            <p className="view-description">
              This is the ScreenShot view. Here you can capture and process screenshots.
            </p>
          </div>
        );
      case 'settings':
        return <Settings />;
      default:
        return (
          <div className="view-content">
            <h1>Hello Electron 👋</h1>
            <p className="message">Welcome to your React + Electron application!</p>
            <div className="info">
              <p>Select a view from the menu bar:</p>
              <ul>
                <li><strong>Settings</strong> - Configure the app</li>
                <li><strong>InputField</strong> - Process text input</li>
              </ul>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="app">
      <div className="content-container">
        {renderContent()}
      </div>
    </div>
  );
}

export default App;
