const {
    electron,
    app,
    Menu,
    BrowserWindow,
    dialog,
    shell,
    ipcMain
} = require('electron');
const path = require('path');
const url = require('url');
const http = require('http');
const finalhandler = require('finalhandler');
const serveStatic = require('serve-static');
const fs = require('fs');
const {autoUpdater} = require("electron-updater");
const Store = require('electron-store');
const store = new Store();

const serveFiles = ["/", "/index.html", "/servers.xml", "/autologin.html", "/custom.css"];

let lastActiveWindow;
let autologinWindow;

const menu = Menu.buildFromTemplate([{
    label: 'Клиент',
    submenu: [{
        label: 'Новое окно',
        click: function () {
            createWindow();
        }
    },
        {
            label: 'Перезагрузка',
            role: 'reload',
        },
        {
            label: 'Принудительная перезагрузка',
            role: 'forcereload',
        },
        {
            type: 'separator'
        },
        {
            label: 'Полноэкранный режим',
            role: 'togglefullscreen'
        },
        {
            label: 'Всегда сверху',
            type: 'checkbox',
            checked: false,
            click: function (menuItem, browserWindow, event) {
                browserWindow.setAlwaysOnTop(menuItem.checked);
            }
        },
        {
            type: 'separator'
        }, {
            label: 'Путь к игре',
            click: function () {
                selectTZdir()
            }
        },
        {
            label: 'Инструменты разработчика',
            role: 'toggledevtools'
        },
    ]
}, {
    label: 'Автологин',
    click: function (menuItem, browserWindow, event) {
        showAutologin(browserWindow);
    }
}
]);
Menu.setApplicationMenu(menu);

ipcMain.on('autologin', (event, login, password) => {
    tzAutologin(lastActiveWindow, login, password);
    event.returnValue = 'L:' + login + "p:" + password;
});

function createWindow() {

    let gameWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        minWidth: 1004,
        minHeight: 460,
        //useContentSize: true,
        webPreferences: {
            plugins: true,
            nodeIntegration: true
        },
        icon: __dirname + '/icon.png', frame: false
    });

    gameWindow.loadURL('http://localhost:5192/');

    //gameWindow.webContents.openDevTools();

    gameWindow.on('closed', function () {
        gameWindow = null
    });

    lastActiveWindow = gameWindow;
}

function selectTZdir() {
    const pathArray = dialog.showOpenDialogSync({
        properties: ['openDirectory'],
        title: 'Путь к папке с TimeZero'
    });

    if (pathArray !== undefined) {
        store.set('tzdir', pathArray[0]);
    }
    app.relaunch();
    app.exit(0);
}

function tzSetVar(browserWindow, variable, value) {
    browserWindow.webContents.executeJavaScript('tz.SetVariable("' + variable + '","' + value + '");');
}

function tzAutologin(browserWindow, login, password) {
    tzSetVar(browserWindow, "_level0.skin_login.mc_login.login.text", login);
    tzSetVar(browserWindow, "_level0.skin_login.mc_login.psw.text", password);
    tzSetVar(browserWindow, "_level0.skin_login.mc_login.btn_enter.releasing", "");
}

function showAutologin(browserWindow) {
    if (autologinWindow === undefined || autologinWindow.isDestroyed()) {
        autologinWindow = new BrowserWindow({
            modal: true, show: false, frame: false,
            webPreferences: {
                nodeIntegration: true
            }
        });
        autologinWindow.loadURL('http://localhost:5192/autologin.html');
        autologinWindow.once('ready-to-show', () => {
            autologinWindow.show();
        });
        autologinWindow.removeMenu();
    }
}

autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
    const dialogOpts = {
        type: 'info',
        buttons: ['Restart', 'Later'],
        title: 'Install Updates',
        message: process.platform === 'win32' ? releaseNotes : releaseName,
        detail: 'A new version has been downloaded. Restart the application to apply the updates.'
    };

    dialog.showMessageBox(dialogOpts, (response) => {
        if (response === 0) {
            autoUpdater.quitAndInstall();
        }
    });
});

app.on('ready', function () {
    autoUpdater.checkForUpdatesAndNotify();
    if (!store.has('tzdir')) {
        if (fs.existsSync('C:\\Program Files (x86)\\TimeZero\\')) {
            store.set('tzdir', 'C:\\Program Files (x86)\\TimeZero\\');
        } else if (fs.existsSync('C:\\Program Files\\TimeZero\\')) {
            store.set('tzdir', 'C:\\Program Files\\TimeZero\\');
        } else {
            const response = dialog.showMessageBox({
                title: 'Путь к папке с TimeZero',
                type: 'question',
                message: 'Не найден путь с установленной игрой.',
                buttons: ['Указать путь', 'Скачать официальный клиент TimeZero', 'Выход']
            });
            if (response === 0) {
                selectTZdir()
            } else if (response === 1) {
                shell.openExternal('https://www.timezero.ru/download.ru.html');
                app.exit(0);
            } else if (response === 2) {
                app.exit(0);
            }
        }
    } else if (!fs.existsSync(store.get('tzdir') + '//tz.swf')) {
        const response = dialog.showMessageBox({
            title: 'Путь к папке с TimeZero',
            type: 'warning',
            message: 'tz.swf не найден.',
            buttons: ['Указать путь', 'Скачать официальный клиент TimeZero', 'Выход']
        });

        if (response === 0) {
            selectTZdir()
        } else if (response === 1) {
            shell.openExternal('https://www.timezero.ru/download.ru.html');
            app.exit(0);
        } else if (response === 2) {
            app.exit(0);
        }
    } else {
        let serve = serveStatic("./game/", {'index': ['index.html']});
        let serveTZ = serveStatic(store.get('tzdir'));

        let server = http.createServer(function (req, res) {
            let done = finalhandler(req, res);

            let file = req.url.split('?')[0].split('#')[0];
            if (file.indexOf('i/locations/') !== -1) {
            } else if (serveFiles.includes(file)) {
                serve(req, res, done);
            } else {
                serveTZ(req, res, done);
            }
        });

        server.listen(5192);


        createWindow();
    }
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    //if (gameWindow === null) {
    //    createWindow()
    //  }
});

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit()
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        createWindow();
    })
}

let pluginName;
switch (process.platform) {
    case 'win32':
        if (process.arch === 'x64') {
            pluginName = 'pepflashplayer64.dll'
        } else {
            pluginName = 'pepflashplayer32.dll'
        }
        break;
    case 'darwin':
        if (process.arch === 'x64') {
            pluginName = 'PepperFlashPlayer64.plugin'
        } else {
            pluginName = 'PepperFlashPlayer32.plugin'
        }
        break;
    case 'linux':
        if (process.arch === 'x64') {
            pluginName = 'libpepflashplayer64.so'
        } else {
            pluginName = 'libpepflashplayer32.so'
        }
        break
}
app.commandLine.appendSwitch('ppapi-flash-path', path.join((__dirname.includes(".asar") ? process.resourcesPath : __dirname), 'lib', pluginName));
app.commandLine.appendSwitch('ppapi-flash-version', '32.0.0.156');