import React, { useEffect, useState } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { Database, Settings as SettingsIcon, Crown, Home } from 'lucide-react';
import Dashboard from './Dashboard';
import History from './History';
import Settings from './Settings';
import Premium from './Premium';
import { RunRecord, AppSettings } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { notificationService } from '../src/integrations/capacitor/notifications'; // Importando o serviço de notificação

const AppLayout: React.FC = () => {
  const { 
    getAllRecords, 
    saveRecord: saveRecordOffline, 
    deleteRecord: deleteRecordOffline,
    isInitialized,
    pendingOperations,
  } = useOfflineSync();

  const [records, setRecords] = useState<RunRecord[]>([]);
  const [settings, setSettings] = useLocalStorage<AppSettings>('ganhospro_settings', { costPerKm: 0.75 });
  const [isPremium, setIsPremium] = useLocalStorage<boolean>('ganhospro_is_premium', false);
  const [notificationSettings] = useLocalStorage<{ enabled: boolean; time: string }>('ganhospro_notification_settings', { enabled: false, time: '19:00' });

  useEffect(() => {
    if (isInitialized) {
      const fetchRecords = async () => {
        const fetchedRecords = await getAllRecords();
        setRecords(fetchedRecords);
      };
      fetchRecords();
    }
  }, [isInitialized, getAllRecords, pendingOperations.length]);

  // Efeito para inicializar/reagendar notificações ao carregar o app
  useEffect(() => {
    const initializeNotifications = async () => {
      if (notificationSettings.enabled) {
        const granted = await notificationService.requestPermissions();
        if (granted) {
          await notificationService.scheduleDailyReminder(notificationSettings);
        } else {
          // Se a permissão foi negada na inicialização, desativar o lembrete na UI
          // Isso é tratado dentro do NotificationSettings, mas é bom ter um fallback aqui.
          // No entanto, o useLocalStorage já manterá o estado, então não precisamos de setSettings aqui.
        }
      } else {
        await notificationService.cancelDailyReminder();
      }
    };
    initializeNotifications();
  }, [notificationSettings.enabled, notificationSettings.time]); // Depende das configurações de notificação

  const addOrUpdateRecord = async (record: RunRecord) => {
    const success = await saveRecordOffline(record);
    if (success) {
      setRecords(prevRecords => {
        const existingIndex = prevRecords.findIndex(r => r.id === record.id);
        if (existingIndex > -1) {
          const updatedRecords = [...prevRecords];
          updatedRecords[existingIndex] = record;
          return updatedRecords;
        } else {
          return [...prevRecords, record];
        }
      });
    }
    return success;
  };

  const deleteRecord = async (id: string) => {
    const success = await deleteRecordOffline(id);
    if (success) {
      setRecords(prevRecords => prevRecords.filter(r => r.id !== id));
    }
    return success;
  };

  return (
    <div className="flex flex-col h-screen font-sans bg-bg-default text-text-default">
      <main className="flex-grow overflow-y-auto p-4 pb-20">
        <Routes>
          <Route path="/" element={<Dashboard records={records} settings={settings} addOrUpdateRecord={addOrUpdateRecord} deleteRecord={deleteRecord} isPremium={isPremium} />} />
          <Route path="/history" element={<History records={records} deleteRecord={deleteRecord} settings={settings} />} />
          <Route path="/settings" element={<Settings settings={settings} setSettings={setSettings} isPremium={isPremium} />} />
          <Route path="/premium" element={<Premium records={records} settings={settings} isPremium={isPremium} setIsPremium={setIsPremium} />} />
        </Routes>
      </main>
      <footer className="fixed bottom-0 left-0 right-0 bg-bg-card border-t border-border-card shadow-lg">
        <nav className="flex justify-around items-center h-16">
          <NavLink end to="/app" className={({ isActive }) => `flex flex-col items-center justify-center w-full text-xs transition-colors ${isActive ? 'text-brand-primary' : 'text-text-muted hover:text-brand-primary'}`} aria-label="Ir para Início">
            <Home size={24} />
            <span>Início</span>
          </NavLink>
          <NavLink to="/app/history" className={({ isActive }) => `flex flex-col items-center justify-center w-full text-xs transition-colors ${isActive ? 'text-brand-primary' : 'text-text-muted hover:text-brand-primary'}`} aria-label="Ir para Histórico">
            <Database size={24} />
            <span>Histórico</span>
          </NavLink>
           <NavLink to="/app/premium" className={({ isActive }) => `flex flex-col items-center justify-center w-full text-xs transition-colors ${isActive ? 'text-brand-primary' : 'text-text-muted hover:text-brand-primary'}`} aria-label="Ir para Premium">
             <div className="relative">
              <Crown size={24} className={isPremium ? 'text-yellow-400' : 'text-brand-accent'} />
              {!isPremium && <span className="absolute -top-2 -right-2 bg-brand-accent text-gray-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">PRO</span>}
             </div>
            <span>Premium</span>
          </NavLink>
          <NavLink to="/app/settings" className={({ isActive }) => `flex flex-col items-center justify-center w-full text-xs transition-colors ${isActive ? 'text-brand-primary' : 'text-text-muted hover:text-brand-primary'}`} aria-label="Ir para Ajustes">
            <SettingsIcon size={24} />
            <span>Ajustes</span>
          </NavLink>
        </nav>
      </footer>
    </div>
  );
};

export default AppLayout;