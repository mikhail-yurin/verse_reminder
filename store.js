const storeKey = 'verse_reminder_calendar_url';
const input = document.getElementById('target_url');
const button = document.getElementById('submit');
const list = document.getElementById('list');

if (input) {
  chrome.storage.sync.get([storeKey], function (result) {
    if (result[storeKey]) {
      input.value = result[storeKey];
    }
  });
}

chrome.alarms.getAll().then((alerts) => {
  if (list) {
    const uniqueAlerts = [
      ...new Map(
        alerts
          .map((alert) => ({ ...alert, name: alert.name.replace(/\s?\[.*\].*/, '') }))
          .map((item) => [item['name'], item])
      ).values()];

    uniqueAlerts.forEach(({ name, scheduledTime }) => {
      const li = document.createElement('li');
      li.innerText = `${name} ${new Date(scheduledTime)}`;
      list.appendChild(li);
    });
  }
}).catch((err) => { });

button.onclick = () => {
  chrome.storage.sync.set({ [storeKey]: input.value?.replace(/https?:\/\//, '') }, function () {
    button.style.backgroundColor = '#70BB66';
    button.setAttribute('disabled', true);
    button.innerHTML = 'Saved';
    setTimeout(() => {
      button.style.backgroundColor = 'grey';
      button.removeAttribute('disabled');
      button.innerHTML = 'Save';
    }, 1000);
  });
}