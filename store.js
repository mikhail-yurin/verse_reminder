const storeKey = 'verse_reminder_calendar_url';
const input = document.getElementById('target_url');
const button = document.getElementById('submit');

if (input) {
  chrome.storage.sync.get([storeKey], function (result) {
    if (result[storeKey]) {
      input.value = result[storeKey];
    }
  });
}

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