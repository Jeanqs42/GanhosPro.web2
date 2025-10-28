import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { BellRing, Clock, Save, Loader2, Info } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { notificationService } from '../integrations/capacitor/notifications';

interface NotificationSettingsProps {
  isPremium: boolean;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ isPremium }) => {
  const [settings, setSettings] = useLocalStorage<{ enabled: boolean; time: string }>('ganhospro_notification_settings', { enabled: false, time: '19:00' });
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [currentScheduledTime, setCurrentScheduledTime] = useState<string | null>(null);

  useEffect(() => {
    const fetchScheduledTime = async () => {
      const time = await notificationService.getScheduledReminderTime();
      setCurrentScheduledTime(time);
    };
    fetchScheduledTime();
  }, [settings.enabled]); // Atualiza quando as configurações mudam

  const handleToggleEnabled = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnabled = e.target.checked;
    setSettings(prev => ({ ...prev, enabled: newEnabled }));

    if (newEnabled) {
      const granted = await notificationService.requestPermissions();
      if (granted) {
        await notificationService.scheduleDailyReminder({ enabled: true, time: settings.time });
        toast.success('Lembrete diário ativado!');
      } else {
        // Se a permissão não foi concedida, reverter o toggle na UI
        setSettings(prev => ({ ...prev, enabled: false }));
        toast.error('Não foi possível ativar o lembrete sem permissão.');
      }
    } else {
      await notificationService.cancelDailyReminder();
      toast.success('Lembrete diário desativado.');
    }
    const time = await notificationService.getScheduledReminderTime();
    setCurrentScheduledTime(time);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({ ...prev, time: e.target.value }));
  };

  const handleSaveTime = async () => {
    setIsSaving(true);
    if (settings.enabled) {
      const granted = await notificationService.requestPermissions();
      if (granted) {
        await notificationService.scheduleDailyReminder(settings);
        toast.success('Horário do lembrete atualizado!');
      } else {
        toast.error('Não foi possível atualizar o horário sem permissão.');
      }
    } else {
      toast.info('Ative o lembrete para salvar o horário.');
    }
    const time = await notificationService.getScheduledReminderTime();
    setCurrentScheduledTime(time);
    setIsSaving(false);
  };

  return (
    <div className="bg-bg-card p-6 rounded-lg shadow-xl mb-6">
      <h2 className="text-lg font-semibold text-center mb-4 flex items-center justify-center text-text-heading">
        <BellRing size={20} className="mr-2 text-brand-accent" />
        Lembretes Diários
      </h2>

      <div className="flex items-center justify-between mb-4">
        <label htmlFor="notification-toggle" className="text-text-default text-base font-medium">
          Ativar Lembrete
        </label>
        <input
          type="checkbox"
          id="notification-toggle"
          checked={settings.enabled}
          onChange={handleToggleEnabled}
          className="relative w-10 h-5 transition-colors duration-200 ease-in-out bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-primary data-[checked]:bg-brand-primary"
          role="switch"
          aria-checked={settings.enabled}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="notification-time" className="flex items-center text-sm font-medium text-text-muted mb-1">
          <Clock size={18} className="mr-2" /> Horário do Lembrete
        </label>
        <input
          type="time"
          id="notification-time"
          value={settings.time}
          onChange={handleTimeChange}
          disabled={!settings.enabled}
          className="w-full bg-bg-card border border-border-card rounded-lg px-4 py-2 text-text-default placeholder-text-muted focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
          aria-label="Horário para o lembrete diário"
        />
        <button
          onClick={handleSaveTime}
          disabled={!settings.enabled || isSaving}
          className="w-full mt-3 bg-brand-secondary hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Salvar horário do lembrete"
        >
          {isSaving ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save size={18} className="mr-2" />}
          {isSaving ? 'Salvando...' : 'Salvar Horário'}
        </button>
      </div>

      {settings.enabled && currentScheduledTime && (
        <div className="bg-blue-900 border border-blue-700 text-blue-200 px-4 py-3 rounded-lg text-sm flex items-start mt-4">
          <Info size={18} className="mr-3 mt-1 flex-shrink-0" />
          <div>
            <strong className="font-bold">Lembrete Ativo:</strong>
            <span className="block sm:inline ml-1">Você receberá um lembrete diariamente às {currentScheduledTime}.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;