// script.js
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('register-button').addEventListener('click', registerAttendance);
  document.getElementById('download-button').addEventListener('click', downloadReport);
  document.getElementById('display-button').addEventListener('click', displayReport);
});

function registerAttendance() {
  const workerName = document.getElementById('worker-name').value;
  const inTime = document.getElementById('in-time').value;
  const outTime = document.getElementById('out-time').value;
  const leaveOptions = document.getElementById('leave-options').value;

  // Create an object to represent the attendance record
  const attendanceRecord = {
    date: new Date().toLocaleDateString(),
    workerName,
    inTime,
    outTime,
    leaveOptions,

  };

  // Save the attendance record to chrome.storage.local
  chrome.storage.local.get({ attendanceRecords: [] }, function (data) {
    const records = data.attendanceRecords;
    records.push(attendanceRecord);

    chrome.storage.local.set({ attendanceRecords: records }, function () {
      // Log success or handle any other logic
      console.log('Attendance recorded:', attendanceRecord);
    });
  });
  updateCalendar();
}

function downloadReport() {
  chrome.storage.local.get({ attendanceRecords: [] }, function (data) {
    const records = data.attendanceRecords;
    const csvContent = records.map(record => Object.values(record).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance_report.csv';
    a.click();
  });
}

function displayReport() {
  chrome.storage.local.get({ attendanceRecords: [] }, function (data) {
    const records = data.attendanceRecords;
    const tableBody = document.querySelector('#attendance-report tbody');

    // Clear existing rows
    tableBody.innerHTML = '';

    // Add new rows
    records.forEach(record => {
      const newRow = document.createElement('tr');
      newRow.innerHTML = `
        <td>${record.date}</td>
        <td>${record.workerName}</td>
        <td>${record.inTime}</td>
        <td>${record.outTime}</td>
        <td>${record.leaveOptions}</td>
      `;
      tableBody.appendChild(newRow);
    });
  });
  updateCalendar();
}
function updateCalendar() {
  chrome.storage.local.get({ attendanceRecords: [] }, function (data) {
    const records = data.attendanceRecords;
    const calendarContainer = document.getElementById('calendar');

    // Clear existing entries
    calendarContainer.innerHTML = '';

    // Create a dictionary to store attendance status for each date
    const dateStatus = {};

    // Populate dateStatus based on the attendance records
    records.forEach(record => {
      const date = record.date;
      const status = record.leaveOptions === 'leave' ? 'leave' : 'present';
      dateStatus[date] = status;
    });

    // Add entries to the calendar
    for (const date in dateStatus) {
      const entry = document.createElement('div');
      entry.className = `calendar-entry ${dateStatus[date]}`;
      entry.textContent = `${date}: ${dateStatus[date]}`;
      calendarContainer.appendChild(entry);
    }
  });
}