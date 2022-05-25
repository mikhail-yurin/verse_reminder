const icon = './icon48.png';
const remindBeforeMinutes = [0, 1, 10];

chrome.runtime.onMessage.addListener(({ type, notifications = [] }) => {
  if (type === 'set-verse-alerts') {
    notifications.push({ subject: 'from the past', when: Date.now() - 6000000 });
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

// todo: save in storage?
// chrome.storage.local.set({ name });

chrome.alarms.onAlarm.addListener(({ name, scheduledTime }) => {
  chrome.notifications.create(
    name + scheduledTime, // notificationId
    {
      type: 'basic',
      iconUrl: icon,
      title: name,
      message: new Date(scheduledTime).toString(),
    },
    () => { },
  );
});
