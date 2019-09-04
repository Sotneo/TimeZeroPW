const ipc = require('electron').ipcRenderer;
const remote = require('electron').remote;

const autologinUsersDiv = document.getElementById("autologinUsers");

const autoLoginAddLogin = document.getElementById("autoLoginAddLogin");
const autoLoginAddPassword = document.getElementById("autoLoginAddPassword");

let autologinUsers;

function autologinDo(obj) {
    let login = obj.parentElement.dataset.login;
    ipc.sendSync('autologinDo', login)
}

function autologinAdd() {
    var login = autoLoginAddLogin.value;
    var password = autoLoginAddPassword.value;
    if (true) {
        autoLoginAddLogin.value = '';
        autoLoginAddPassword.value = '';
        autologinUsers = ipc.sendSync('autologinAdd', login, password);

        autologinDraw();
    }
}

function autologinRemove(obj) {
    let login = obj.parentElement.dataset.login;

    if (confirm("Удалить " + login + " из автологина?")) {
        autologinUsers = ipc.sendSync('autologinRemove', login);
        autologinDraw();
    }
}

function autologinLoad() {
    autologinUsers = ipc.sendSync('autologinLoad');
    autologinDraw();
}

function autologinDraw() {
    console.log(autologinUsers);
    let result = "";

    for (let [login, password] of Object.entries(autologinUsers)) {

        result += "<div class='autoLoginUser' data-login='" + login + "'>";
        result += "<a onclick='autologinDo(this)'>" + login + "</a> ";
        result += "<a onclick='autologinRemove(this)'>&times;</a>";
        result += "</div>";

    }

    autologinUsersDiv.innerHTML = result;
}

autologinLoad();