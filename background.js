const icon = './icon48.png';
const intervalsKey = 'outlook_reminder_intervals';
const urlKey = 'outlook_calendar_url';
const eventsKey = 'outlook_reminder_events';

const processEvents = (items = []) => {
  const today = new Date();
  // today.setDate(today.getDate() + 1); // fix: temporary for testing
  const todaysEvents = [];

  items?.forEach((item) => {
    if (!item.IsCancelled && new Date(item.Start).toDateString() === today.toDateString()) {
      todaysEvents.push({
        subject: item.Subject,
        preview: item.Preview,
        location: item.Location?.DisplayName,
        start: item.Start,
        // start: new Date(new Date().getTime() + 2 * 60000).toISOString(), // fix: temporary for testing
        end: item.End,
      });
    }
  });

  // save today's events to storage for displaying in UI
  chrome.storage.sync.set({ [eventsKey]: todaysEvents });

  chrome.notifications.create(
    'calendar parsed',
    {
      type: 'basic',
      iconUrl: icon,
      title: 'Got all your events',
      message: `You have ${todaysEvents.length} event(s) today`,
    },
    () => { },
  );

  // get intervals
  chrome.storage.sync.get([intervalsKey], function (result) {
    if (result[intervalsKey]) {
      const intervals = JSON.parse(result[intervalsKey]);

      todaysEvents?.forEach((event) => {
        intervals.forEach((interval) => {
          const name = JSON.stringify({ title: event.subject, start: event.start, interval });
          const when = new Date(event.start).getTime() - (interval * 60 * 1000);
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
};

chrome.runtime.onMessage.addListener(({ type }) => {
  if (type === 'keep_alive') {
    console.log('reminder is alive');
  }
});

chrome.storage.sync.get([urlKey], function (result) {
  const targetUrl = result[urlKey];
  if (targetUrl) {
    chrome.webRequest.onSendHeaders.addListener(
      function (details) {
        if (
          details.initiator === targetUrl
          && details.url.includes('action=GetCalendarView')
          && !details.requestHeaders.find(({ name }) => name === 'is_reminder_ext')
        ) {
          const headers = {};
          details.requestHeaders?.forEach(({ name, value }) => {
            headers[name] = value;
          });
          headers.is_reminder_ext = true;

          fetch(details.url, {
            method: details.method,
            headers,
          })
            .then(res => res.json())
            .then(res => {
              processEvents(res?.Body?.Items);
            })
            .catch(err => console.log(err))
        }
      },
      // filters
      {
        urls: [
          '<all_urls>',
        ],
        types: ['xmlhttprequest']
      },
      ['requestHeaders']);
  }
});

chrome.alarms.onAlarm.addListener(({ name, scheduledTime }) => {
  const { title, start, interval } = JSON.parse(name);
  chrome.notifications.create(
    name + scheduledTime, // notificationId
    {
      type: 'basic',
      iconUrl: icon,
      title: interval > 0 ? `Starts in ${interval} min` : 'Starts now',
      message: `${title} at ${new Date(parseInt(start, 10)).toLocaleTimeString('ru-RU').replace(/:\d{2}$/g, '')}`,
    },
    () => { },
  );
});
