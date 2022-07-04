const urlKey = 'outlook_calendar_url';

chrome.storage.sync.get([urlKey], function (result) {
  const targetUrl = result[urlKey];

  if (targetUrl) {
    document.onreadystatechange = function () {
      if (document.readyState === 'complete' && window.location.href.includes(targetUrl) && Notification) {
        Notification.requestPermission().then(function (permission) {
          if (permission === 'granted') {
            chrome.runtime.sendMessage({ type: 'keep_alive' }, () => {});
          } else {
            console.error(`Notifications ${permission}`);
          }
        });
      }
    };
  }
});
