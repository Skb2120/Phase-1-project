import { useEffect, useState } from 'react';

export type DemoScenario = 'normal' | 'node-3-failed' | 'backup-active' | 'recovered';

const storageKey = 'can-monitor-demo-scenario';
const changeEvent = 'can-monitor-demo-scenario-change';

function readScenario(): DemoScenario {
  const saved = window.localStorage.getItem(storageKey);
  return saved === 'node-3-failed' || saved === 'backup-active' || saved === 'recovered'
    ? saved
    : 'normal';
}

export function setDemoScenario(scenario: DemoScenario) {
  window.localStorage.setItem(storageKey, scenario);
  window.dispatchEvent(new CustomEvent<DemoScenario>(changeEvent, { detail: scenario }));
}

export function useDemoScenario() {
  const [scenario, setScenario] = useState<DemoScenario>(readScenario);

  useEffect(() => {
    const updateScenario = () => setScenario(readScenario());
    const handleStorage = (event: StorageEvent) => {
      if (event.key === storageKey) updateScenario();
    };
    const handleScenarioChange = (event: Event) => {
      setScenario((event as CustomEvent<DemoScenario>).detail);
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(changeEvent, handleScenarioChange);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(changeEvent, handleScenarioChange);
    };
  }, []);

  return scenario;
}
