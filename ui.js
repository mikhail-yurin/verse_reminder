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

chrome.storage.sync.get(['verse_reminder_events']).then((result) => {
  if (list && result['verse_reminder_events']) {
    result['verse_reminder_events']?.reverse().forEach(({ subject, when }) => {
      const li = document.createElement('li');
      li.innerText = `${subject} \n${new Date(when).toLocaleTimeString('ru-RU')}`.replace(/:\d{2}$/g, '');
      list.appendChild(li);
    });
  }
});

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