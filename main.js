'use strict';

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
const config = new Store();
const autologinStore = new Store({name: "autologin"});

let lastActiveWindow;
let autologinWindow;

const menu = Menu.buildFromTemplate([{
    label: 'Клиент',
    submenu: [{
        label: 'Новое окно',
        click: function (menuItem, browserWindow, event) {
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
            click: function (menuItem, browserWindow, event) {
                browserWindow.setAlwaysOnTop(browserWindow.isAlwaysOnTop());
            }
        },
        {
            type: 'separator'
        },
        {
            label: 'Скрыть/показать чат',
            click: function (menuItem, browserWindow, event) {
                browserWindow.webContents.executeJavaScript('toggleChat()');
            }
        },
        {
            type: 'separator'
        },
        {
            label: 'Путь к игре',
            click: function (menuItem, browserWindow, event) {
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

ipcMain.on('autologinDo', (event, login) => {
    tzAutologin(lastActiveWindow, login, autologinStore.get(login));
    event.returnValue = '';
});
ipcMain.on('autologinAdd', (event, login, password) => {
    autologinStore.set(login, password);
    event.returnValue = autologinStore.store;
});
ipcMain.on('autologinRemove', (event, login) => {
    autologinStore.delete(login);
    event.returnValue = autologinStore.store;
});
ipcMain.on('autologinLoad', (event) => {
    event.returnValue = autologinStore.store;
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
        icon: __dirname + '/icon.png',

        useElectronNet: true
    });

    gameWindow.loadURL('http://localhost:5192/');


    //gameWindow.webContents.openDevTools();

    gameWindow.on('closed', function () {
        gameWindow = null
    });
    gameWindow.on('focus', function () {
        lastActiveWindow = gameWindow;
        gameWindow.webContents.executeJavaScript('document.title=pageTitle+" (активное окно)";');
        gameWindow.webContents.executeJavaScript('unfreeze();');
    });
    gameWindow.on('blur', function () {
        gameWindow.webContents.executeJavaScript('document.title=pageTitle;');
    });

    lastActiveWindow = gameWindow;
}

function selectTZdir() {
    const pathArray = dialog.showOpenDialogSync({
        properties: ['openDirectory'],
        title: 'Путь к папке с TimeZero'
    });

    if (pathArray !== undefined) {
        config.set('tzdir', pathArray[0]);
    }
    app.relaunch();
    app.exit(0);
}

function tzAutologin(browserWindow, login, password) {
    browserWindow.webContents.executeJavaScript('autologinLogin="' + login + '"; autologinPassword="' + password + '";RestartClient();');
    browserWindow.focus();
}

function showAutologin(browserWindow) {
    if (autologinWindow === undefined || autologinWindow.isDestroyed()) {
        autologinWindow = new BrowserWindow({
            width: 600,
            height: 600,
            resizable: false,
            minimizable: false,
            maximizable: false,
            modal: true, show: false,
            webPreferences: {
                nodeIntegration: true
            },
            alwaysOnTop: true,
            icon: __dirname + '/icon.png'
        });

        autologinWindow.loadURL('http://localhost:5192/autologin.html');

        //autologinWindow.webContents.openDevTools();
        autologinWindow.once('ready-to-show', () => {
            autologinWindow.show();
        });
        autologinWindow.removeMenu();
    } else {
        autologinWindow.focus();
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
    });

    app.on('ready', function () {
        autoUpdater.checkForUpdatesAndNotify();
        if (!config.has('tzdir')) {
            if (fs.existsSync('C:\\Program Files (x86)\\TimeZero\\')) {
                config.set('tzdir', 'C:\\Program Files (x86)\\TimeZero\\');
            } else if (fs.existsSync('C:\\Program Files\\TimeZero\\')) {
                config.set('tzdir', 'C:\\Program Files\\TimeZero\\');
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
        } else if (!fs.existsSync(config.get('tzdir') + '//tz.swf')) {
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
            let serveTZ = serveStatic(config.get('tzdir'));
            let serveFiles = [''];

            fs.readdirSync("./game/").forEach(file => {
                serveFiles.push(file);
            });

            let server = http.createServer(function (req, res) {
                let done = finalhandler(req, res);

                let file = req.url.split('?')[0].split('#')[0].substr(1);
                if (file.indexOf('i/locations/') !== -1) {
                    serve(req, res, done);
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
}

function getLinuxFlashPath() {
    let flashPath = '';
    if (fs.existsSync('/usr/lib/pepperflashplugin-nonfree/')) {
        flashPath = '/usr/lib/pepperflashplugin-nonfree/libpepflashplayer.so';
    } else if (fs.existsSync('/usr/lib/pepflashplugin-installer/')) {
        flashPath = '/usr/lib/pepflashplugin-installer/libpepflashplayer.so';
    } else if (fs.existsSync('/usr/lib/pepper-plugins/')) {
        flashPath = '/usr/lib/pepper-plugins/libpepflashplayer.so';
    }
    return flashPath;
}

try {
    let flashPath = '';
    switch (process.platform) {
        case 'win32':
            flashPath = app.getPath('pepperFlashSystemPlugin');
            break
        case 'darwin':
            flashPath = "/Library/Internet"+" "+"Plug-Ins/PepperFlashPlayer/PepperFlashPlayer.plugin/Contents/MacOS/PepperFlashPlayer";
            break
        case 'linux':
            app.commandLine.appendSwitch('--no-sandbox'); //work around, Electron bug https://github.com/electron/electron/issues/20309
            flashPath = getLinuxFlashPath();
            break
    }
    app.commandLine.appendSwitch('ppapi-flash-path', flashPath);
} catch (e) {
    shell.openExternal('https://get.adobe.com/ru/flashplayer/otherversions/');
    app.exit(0);
    return;
}
