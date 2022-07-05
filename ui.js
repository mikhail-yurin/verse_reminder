const urlKey = 'outlook_calendar_url';
const intervalsKey = 'outlook_reminder_intervals';
const eventsKey = 'outlook_reminder_events';
const input = document.getElementById('target_url');
const button = document.getElementById('submit');
const list = document.getElementById('list');
const intervalsBlock = document.getElementById('intervals');
const availableIntervals = [0, 1, 5, 10, 15, 30, 60];

// Display interval checkboxes
if (intervalsBlock) {
  availableIntervals.forEach((inteval) => {
    const column = document.createElement('div');
    column.setAttribute('class', 'column');
    const checkBox = document.createElement('input');
    checkBox.setAttribute('type', 'checkbox');
    checkBox.setAttribute('id', `min_${inteval}`);
    const label = document.createElement('label');
    label.innerHTML = `${inteval}`;
    column.appendChild(checkBox);
    column.appendChild(label);
    intervalsBlock.appendChild(column);
  });
}
// Notifications settings
chrome.storage.sync.get([intervalsKey], function (result) {
  if (result[intervalsKey]) {
    const intervals = JSON.parse(result[intervalsKey]);
    intervals?.forEach((interval) => {
      const control = document.getElementById(`min_${interval}`);
      control.checked = true;
    });
  }
});

// Url settings
if (input) {
  chrome.storage.sync.get([urlKey], function (result) {
    if (result[urlKey]) {
      input.value = result[urlKey];
    }
  });
}

button.onclick = () => {
  // Get intervals
  const intervals = [];
  availableIntervals.forEach((interval) => {
    const control = document.getElementById(`min_${interval}`);
    if (control?.checked) {
      intervals.push(interval);
    }
  });

  // Save
  chrome.storage.sync.set({
    [urlKey]: /https:\/\/[^\/]+/g.exec(input.value)?.[0],
    [intervalsKey]: JSON.stringify(intervals),
  }, function () {
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

// Event list
chrome.storage.sync.get([eventsKey]).then((result) => {
  if (list && result[eventsKey]) {
    const now = Date.now();

    result[eventsKey]?.forEach(({ subject, preview, location, start, end }) => {
      const li = document.createElement('li');
      const event = document.createElement('div');
      event.className = 'list';

      const subjectContainer = document.createElement('div');
      const timeStart = `${new Date(start).toLocaleTimeString('ru-RU').replace(/:\d{2}$/g, '')} - ${new Date(end).toLocaleTimeString('ru-RU').replace(/:\d{2}$/g, '')}`;
      subjectContainer.innerHTML = `<b>${subject}</b> <span class="time">${timeStart}</span>`;
      event.appendChild(subjectContainer);

      const previewContainer = document.createElement('div');
      if (preview) {
        previewContainer.innerText = preview.replace(/[\r\n]+/g, '\r\n');
        previewContainer.className = 'preview';
        event.appendChild(previewContainer);
      }

      const locationContainer = document.createElement('div');
      if (location) {
        locationContainer.innerText = location;
        event.appendChild(locationContainer);
      };

      if (now > new Date(end).getTime()) {
        li.className = 'past';
      }
      li.appendChild(event);
      list.appendChild(li);
    });
  }
});
