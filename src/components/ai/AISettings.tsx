import React, { useState, useEffect } from 'react';
import { Settings, Check, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAIStore } from '../../hooks/useAI';
import { AIProviderId, PROVIDER_MODELS } from '../../types/ai';
import {
  saveProviderConfig, getConfig, testConnection,
} from '../../services/aiProvider';
import './AISettings.css';

const PROVIDERS: { id: AIProviderId; name: string; requiresKey: boolean }[] = [
  { id: 'openai', name: 'OpenAI', requiresKey: true },
  { id: 'anthropic', name: 'Anthropic', requiresKey: true },
  { id: 'gemini', name: 'Google Gemini', requiresKey: true },
  { id: 'openrouter', name: 'OpenRouter', requiresKey: true },
  { id: 'ollama', name: 'Ollama (Local)', requiresKey: false },
  { id: 'local', name: 'Custom Endpoint', requiresKey: false },
];

export const AISettingsPanel: React.FC = () => {
  const { settings, updateSettings } = useAIStore();
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [activeProvider, setActiveProvider] = useState<AIProviderId>(settings.provider);

  const providerConfig = getConfig(activeProvider);
  const models = PROVIDER_MODELS[activeProvider] || [];

  useEffect(() => {
    const config = getConfig(activeProvider);
    setApiKey(config.apiKey);
    setBaseUrl(config.baseUrl);
    setTestResult(null);
  }, [activeProvider]);

  const handleSaveProvider = () => {
    saveProviderConfig({
      ...providerConfig,
      id: activeProvider,
      apiKey,
      baseUrl,
      enabled: true,
    });
  };

  const handleTest = async () => {
    handleSaveProvider();
    setTesting(true);
    setTestResult(null);
    const ok = await testConnection(activeProvider);
    setTestResult(ok ? 'success' : 'error');
    setTesting(false);
  };

  return (
    <div className="ai-settings">
      <div className="ai-settings-header">
        <Settings size={16} />
        <span>AI Settings</span>
      </div>

      <div className="ai-settings-section">
        <label className="ai-settings-label">Provider</label>
        <div className="ai-provider-grid">
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              className={`ai-provider-btn ${activeProvider === p.id ? 'active' : ''}`}
              onClick={() => setActiveProvider(p.id)}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {PROVIDERS.find((p) => p.id === activeProvider)?.requiresKey && (
        <div className="ai-settings-section">
          <label className="ai-settings-label">API Key</label>
          <div className="ai-api-key-wrap">
            <input
              type={showApiKey ? 'text' : 'password'}
              className="ai-settings-input"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter API key..."
            />
            <button className="ai-eye-btn" onClick={() => setShowApiKey(!showApiKey)}>
              {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
      )}

      <div className="ai-settings-section">
        <label className="ai-settings-label">Base URL</label>
        <input
          type="text"
          className="ai-settings-input"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder="Default endpoint URL"
        />
      </div>

      <div className="ai-settings-section">
        <label className="ai-settings-label">Model</label>
        <select
          className="ai-settings-select"
          value={settings.model}
          onChange={(e) => updateSettings({ model: e.target.value })}
        >
          {models.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
          {models.length === 0 && <option value="">No models available</option>}
        </select>
      </div>

      <div className="ai-settings-section">
        <label className="ai-settings-label">Temperature: {settings.temperature.toFixed(1)}</label>
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={settings.temperature}
          onChange={(e) => updateSettings({ temperature: parseFloat(e.target.value) })}
          className="ai-settings-range"
        />
        <div className="ai-range-labels">
          <span>Precise</span>
          <span>Creative</span>
        </div>
      </div>

      <div className="ai-settings-section">
        <label className="ai-settings-label">Max Tokens</label>
        <input
          type="number"
          className="ai-settings-input"
          value={settings.maxTokens}
          onChange={(e) => updateSettings({ maxTokens: parseInt(e.target.value) || 2048 })}
          min={256}
          max={32768}
          step={256}
        />
      </div>

      <div className="ai-settings-section">
        <label className="ai-settings-label">Explanation Level</label>
        <div className="ai-level-btns">
          {(['beginner', 'intermediate', 'expert'] as const).map((level) => (
            <button
              key={level}
              className={`ai-level-btn ${settings.explanationLevel === level ? 'active' : ''}`}
              onClick={() => updateSettings({ explanationLevel: level })}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="ai-settings-actions">
        <button className="ai-test-btn" onClick={handleTest} disabled={testing}>
          {testing ? <Loader2 size={14} className="spin" /> : <Check size={14} />}
          {testing ? 'Testing...' : 'Test Connection'}
        </button>
        {testResult === 'success' && <span className="ai-test-success">Connected!</span>}
        {testResult === 'error' && <span className="ai-test-error">Connection failed</span>}
      </div>

      <button className="ai-save-btn" onClick={handleSaveProvider}>Save Provider Settings</button>
    </div>
  );
};
