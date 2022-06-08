const storeKey = 'verse_reminder_calendar_url';

chrome.storage.sync.get([storeKey], function (result) {
  const targetUrl = result[storeKey];

  if (targetUrl) {
    const dayXpath = () => `.//div[@class="date-text"][@role="list"][text()="${new Date().getDate()}"]/..`;
    const eventXpath = './/div[@class="s-cv-entry-innerframe s-cv-text"]';

    function log(data, title = '') {
      console.group(title || 'Verse reminder');
      console.log(data);
      console.groupEnd();
    }

    function $x(path, node = document) {
      var xpath = document.evaluate(path, node, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      var temp = [];
      for (var i = xpath.snapshotLength - 1; i >= 0; i--) {
        temp.push(xpath.snapshotItem(i));
      }
      return temp;
    }

    function scan4events(eventNodes = []) {
      const notifications = [];
      const today = new Date();
      let upcomingCount = 0;
      eventNodes?.forEach((node) => {
        const time = $x('.//div[1]', node)[0];
        const subject = $x('.//div[2]', node)[0];
        const [hours, minutes] = time.textContent.split(':');
        const when = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes).getTime();
        // add notification
        notifications.push({
          when,
          subject: subject.textContent,
        });
        if (Date.now() <= when) {
          upcomingCount++;
        }
      });
      chrome.runtime.sendMessage({ type: 'set-verse-alerts', notifications }, () => {
        let msgEventList = '';
        notifications.reverse().forEach((alert) => {
          msgEventList += `- ${alert.subject} at ${new Date(alert.when).toLocaleTimeString('ru-RU').replace(/:\d{2}$/g, '')}\n`
        });

        log(msgEventList, `Scheduled ${upcomingCount} events. All today's events:`);
        if (upcomingCount) {
          alert(`You are going to be notified about ${upcomingCount} event(s).\nAll today's events:\n${msgEventList}`);
        }
      });
    }

    function waitForCalendar(delay, maxAttempts, callback) {
      let atempts = 0;
      const checkCalendar = setInterval(() => {
        const dayNode = $x(dayXpath())[0];
        const eventNodes = $x(eventXpath, dayNode);

        if (eventNodes.length || atempts > maxAttempts) {
          clearInterval(checkCalendar);

          if (callback) {
            callback(eventNodes);
          }
        } else {
          atempts++;
        }
      }, delay);
    }

    document.onreadystatechange = function () {
      if (document.readyState === 'complete' && window.location.href.includes(targetUrl) && Notification) {
        Notification.requestPermission().then(function (permission) {
          if (permission === 'granted') {
            waitForCalendar(2000, 10, (eventNodes) => {
              // scan for events
              scan4events(eventNodes);
            });
          } else {
            log(`Notifications ${permission}`);
          }
        });
      }
    };
  }
});


