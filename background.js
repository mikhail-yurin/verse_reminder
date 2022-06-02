const icon = './icon48.png';
const remindBeforeMinutes = [0, 1, 10];

chrome.runtime.onMessage.addListener(({ type, notifications = [] }) => {
  if (type === 'set-verse-alerts') {
    // save events to storage
    chrome.storage.sync.set({ verse_reminder_events: notifications });

    notifications?.forEach((alert) => {
      remindBeforeMinutes.forEach((interval) => {
        const name = alert.subject + (interval > 0 ? ` [starts in ${interval} min]` : ' [starts now]');
        const when = alert.when - (interval * 60 * 1000);
        if (Date.now() <= when) {
          chrome.alarms.create(name, { when });
        }
      });
    });
  }
});

chrome.alarms.onAlarm.addListener(({ name, scheduledTime }) => {
  chrome.notifications.create(
    name + scheduledTime, // notificationId
    {
      type: 'basic',
      iconUrl: icon,
      title: name,
      message: new Date(scheduledTime).toLocaleTimeString('ru-RU').replace(/:\d{2}$/g, ''),
    },
    () => { },
  );
});
