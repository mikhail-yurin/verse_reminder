const icon = './icon48.png';
const intervalsKey = 'verse_reminder_intervals';

chrome.runtime.onMessage.addListener(({ type, notifications = [] }) => {
  if (type === 'set-verse-alerts') {
    // save events to storage
    chrome.storage.sync.set({ verse_reminder_events: notifications });

    // get intervals
    chrome.storage.sync.get([intervalsKey], function (result) {
      if (result[intervalsKey]) {
        const intervals = JSON.parse(result[intervalsKey]);

        notifications?.forEach((alert) => {
          intervals.forEach((interval) => {
            const name = JSON.stringify({title: alert.subject, time: alert.when, interval});
            const when = alert.when - (interval * 60 * 1000);
            if (Date.now() <= when) {
              // add alarm for upcoming event
              chrome.alarms.create(name, { when });
            } else {
              // remove alarm for past event
              chrome.alarms.clear(name);
            }
          });
        });
      }
    });

  }
});

chrome.alarms.onAlarm.addListener(({ name, scheduledTime }) => {
  const {title, time, interval} = JSON.parse(name);
  chrome.notifications.create(
    name + scheduledTime, // notificationId
    {
      type: 'basic',
      iconUrl: icon,
      // title: title + (interval > 0 ? ` [starts in ${interval} min]` : ' [starts now]'),
      // message: new Date(parseInt(time, 10)).toLocaleTimeString('ru-RU').replace(/:\d{2}$/g, ''),
      title: interval > 0 ? `Starts in ${interval} min` : 'Starts now',
      message: `${title} at ${new Date(parseInt(time, 10)).toLocaleTimeString('ru-RU').replace(/:\d{2}$/g, '')}`,
    },
    () => { },
  );
});
