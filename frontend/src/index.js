
const btnDrakMode = document.querySelector('.darkMode');



btnDrakMode.addEventListener('click', () => {
    app.state.darkMode = !app.state.darkMode;
});