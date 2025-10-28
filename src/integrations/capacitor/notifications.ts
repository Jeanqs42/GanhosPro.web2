import { LocalNotifications } from '@capacitor/local-notifications';
import toast from 'react-hot-toast';

const NOTIFICATION_ID = 100; // ID fixo para o lembrete diário
const NOTIFICATION_TAG = 'daily_earnings_reminder';

interface NotificationScheduleOptions {
  enabled: boolean;
  time: string; // Formato "HH:MM"
}

export const notificationService = {
  async requestPermissions(): Promise<boolean> {
    try {
      const result = await LocalNotifications.requestPermissions();
      if (result.display === 'granted') {
        return true;
      } else {
        toast.error('Permissão para notificações negada. Você pode ativá-las nas configurações do seu dispositivo.');
        return false;
      }
    } catch (error) {
      console.error('Erro ao solicitar permissões de notificação:', error);
      toast.error('Não foi possível solicitar permissões de notificação.');
      return false;
    }
  },

  async scheduleDailyReminder(options: NotificationScheduleOptions): Promise<void> {
    await LocalNotifications.cancel({ identifiers: [{ id: NOTIFICATION_ID }] });

    if (!options.enabled) {
      console.log('Lembrete diário desativado.');
      return;
    }

    const [hours, minutes] = options.time.split(':').map(Number);

    if (isNaN(hours) || isNaN(minutes)) {
      console.error('Horário de notificação inválido:', options.time);
      toast.error('Horário de lembrete inválido. Por favor, defina um horário válido.');
      return;
    }

    const now = new Date();
    let scheduleDate = new Date();
    scheduleDate.setHours(hours, minutes, 0, 0);

    // Se o horário já passou para hoje, agende para amanhã
    if (scheduleDate.getTime() <= now.getTime()) {
      scheduleDate.setDate(scheduleDate.getDate() + 1);
    }

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: NOTIFICATION_ID,
            title: 'Hora de Registrar seus Ganhos!',
            body: 'Não se esqueça de adicionar suas corridas de hoje para manter seu controle financeiro em dia.',
            schedule: {
              at: scheduleDate,
              repeats: true,
              every: 'day',
            },
            sound: 'default',
            attachments: [],
            actionTypeId: '',
            extra: { tag: NOTIFICATION_TAG },
          },
        ],
      });
      console.log(`Lembrete diário agendado para ${options.time} (primeira notificação em ${scheduleDate.toLocaleString()}).`);
    } catch (error) {
      console.error('Erro ao agendar notificação:', error);
      toast.error('Não foi possível agendar o lembrete diário.');
    }
  },

  async cancelDailyReminder(): Promise<void> {
    try {
      await LocalNotifications.cancel({ identifiers: [{ id: NOTIFICATION_ID }] });
      console.log('Lembrete diário cancelado.');
    } catch (error) {
      console.error('Erro ao cancelar notificação:', error);
    }
  },

  async clearNotificationForToday(): Promise<void> {
    try {
      const pending = await LocalNotifications.getPending();
      const dailyReminder = pending.notifications.find(n => n.id === NOTIFICATION_ID);

      if (dailyReminder && dailyReminder.schedule?.at) {
        const scheduledTime = new Date(dailyReminder.schedule.at);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        scheduledTime.setHours(0, 0, 0, 0);

        // Se a notificação agendada é para hoje, cancele-a e reagende para amanhã
        if (scheduledTime.getTime() === today.getTime()) {
          console.log('Lembrete de hoje cancelado, reagendando para amanhã.');
          await LocalNotifications.cancel({ identifiers: [{ id: NOTIFICATION_ID }] });
          // Reagendar para amanhã com base nas configurações salvas
          const savedOptions = JSON.parse(localStorage.getItem('ganhospro_notification_settings') || '{}');
          if (savedOptions.enabled && savedOptions.time) {
            const [hours, minutes] = savedOptions.time.split(':').map(Number);
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(hours, minutes, 0, 0);

            await LocalNotifications.schedule({
              notifications: [
                {
                  id: NOTIFICATION_ID,
                  title: 'Hora de Registrar seus Ganhos!',
                  body: 'Não se esqueça de adicionar suas corridas de hoje para manter seu controle financeiro em dia.',
                  schedule: {
                    at: tomorrow,
                    repeats: true,
                    every: 'day',
                  },
                  sound: 'default',
                  attachments: [],
                  actionTypeId: '',
                  extra: { tag: NOTIFICATION_TAG },
                },
              ],
            });
          }
        }
      }
    } catch (error) {
      console.error('Erro ao limpar notificação de hoje:', error);
    }
  },

  async getScheduledReminderTime(): Promise<string | null> {
    try {
      const pending = await LocalNotifications.getPending();
      const dailyReminder = pending.notifications.find(n => n.id === NOTIFICATION_ID);
      if (dailyReminder && dailyReminder.schedule?.at) {
        const date = new Date(dailyReminder.schedule.at);
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
      }
      return null;
    } catch (error) {
      console.error('Erro ao obter horário do lembrete agendado:', error);
      return null;
    }
  },
};