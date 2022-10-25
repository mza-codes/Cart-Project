// Theme Controls

const page = document.querySelector('#page');
const toggle = page.querySelector('.toggle-input');
const toggleIcon = page.querySelector('.toggle-icon');

// set theme and localStorage on page load
setCheckedState();

function setCheckedState() {
  if (localStorage.color) {
    page.classList.replace(page.classList[0], localStorage.color)
  }
}

function toggleTheme() {
  replaceClass();
  updateLocalStorage();
}

let click = 0
function replaceClass() {
  click += 1
  const theme = ['light', 'dark', 'lightpink', 'blue', 'pale', 'lime', 'xlpink', 'darkblue', 'xlbrown', 'lightbrown', 'orange', 'purple']
  if (click == theme.length) { click = 0 }
  page.classList.replace(page.classList[0], theme[click])
  console.log(page.classList[0]);
  updateLocalStorage()
}

function updateLocalStorage() {
  localStorage.setItem('color', page.classList[0]);
}

// toggle.addEventListener('change', toggleTheme);

// ---- ENDS HERE ----//

// -------------------------O L D------------------------------------------- //

// // Theme Controls

// // const page = document.querySelector('.page');
// const page = document.getElementById('page');
// const toggle = page.querySelector('.toggle-input');
// const toggleIcon = page.querySelector('.toggle-icon');

// // set theme and localStorage on page load
// setCheckedState();

// function setCheckedState() {
//   // checks if localStorage has a "checked" value set at all
//   if (!(localStorage.checked === undefined)) {
//     // if it does, it sets the state of the toggle accordingly
//     toggle.checked = isTrue(localStorage.getItem('checked'));
//     // after setting the toggle state, the theme is adjusted according to the checked state
//     toggleTheme();
//   }
// }

// function toggleTheme() {
//   // Toggle theme based on state of checkbox
//   replaceClass();
//   // replace icons on page
//   toggleIconTheme();
//   // set the value of the "checked" key in localStorage
//   updateLocalStorage();
// }

// function replaceClass() {
//   if (toggle.checked) {
//     page.classList.replace('light', 'dark');
//   } else {
//     page.classList.replace('dark', 'light');
//   }
// }

// function toggleIconTheme() {
//   // Replace icons not able to be targeted by css variables
//   if (page.classList.contains('light')) {
//     toggleIcon.src = '/images/moon0.svg';
//     toggleIcon.alt = 'Theme';
//   } else {
//     toggleIcon.src = '/images/moon.png';
//     toggleIcon.alt = 'Theme';
//   }
// }

// function updateLocalStorage() {
//   localStorage.setItem('checked', toggle.checked);
// }

// function isTrue(value) {
//   // convert string to boolean
//   return value === 'true';
// }

// // Toggle theme any time the state of the checkbox changes
// toggle.addEventListener('change', toggleTheme);

// // ---- ENDS HERE ----//