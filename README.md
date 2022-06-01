# Calendar events reminder
it gives you browser notifications about your meetings from the calendar for the current day

## Installation
- clone this repository
- go to chrome://extensions/
- enable switch "Developer mode"
- click the button "Load unpacked"
- select the folder were you have cloned the repository

## Usage
### this should be done once (to configure a terget page for the script):
- click the extension icon in Chrome
- enter the url of the calendar page
- click "Save"
### this should be done every day (script parses the calendar page and schedules alerts for the current day):
- open your calendar
- in case everything is working you will get an alert about created notifications


You can change the variable _remindBeforeMinutes_ in https://github.com/mikhail-yurin/verse_reminder/blob/main/background.js to configure when you want to get alerts
