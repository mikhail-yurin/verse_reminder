const urlKey = 'verse_reminder_calendar_url';
const intervalsKey = 'verse_reminder_intervals';
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
    [urlKey]: input.value?.replace(/https?:\/\//, ''),
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
chrome.storage.sync.get(['verse_reminder_events']).then((result) => {
  if (list && result['verse_reminder_events']) {
    result['verse_reminder_events']?.reverse().forEach(({ subject, when }) => {
      const li = document.createElement('li');
      li.innerText = `${subject} \n${new Date(when).toLocaleTimeString('ru-RU')}`.replace(/:\d{2}$/g, '');
      list.appendChild(li);
    });
  }
});
