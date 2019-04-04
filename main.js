const {
    electron,
    app,
    Menu,
    BrowserWindow,
    dialog,
    shell
} = require('electron')
const path = require('path')
const url = require('url')
const http = require('http');
const finalhandler = require('finalhandler');
const serveStatic = require('serve-static');
const fs = require('fs')
const Store = require('electron-store');
const store = new Store();
const { autoUpdater } = require("electron-updater")

const serveFiles = ["/game.ru.html", "/servers.xml", "/logreader.swf", "/logreader.html", "/js/tz.js"];

function createWindow() {

    let gameWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        minWidth: 1004,
        minHeight: 460,
        useContentSize: true,
        webPreferences: {
            plugins: true,
        },
        icon: __dirname + '/icon.png'
    })

    gameWindow.loadURL('http://localhost:5192/game.ru.html')

    //gameWindow.webContents.openDevTools()

    gameWindow.on('closed', function() {
        gameWindow = null
    })
}

function createLogreader() {

    let logreaderWindow = new BrowserWindow({
        title: 'Log Reader',
        width: 800,
        height: 920,
        resizable: false,
        useContentSize: true,
        webPreferences: {
            plugins: true,
        },

        icon: __dirname + '/icon.png'
    })

    logreaderWindow.loadURL('http://localhost:5192/logreader.html')

    //gameWindow.webContents.openDevTools()

    logreaderWindow.on('closed', function() {
        logreaderWindow = null
    })
    logreaderWindow.setMenu(null);
}

function selectTZdir() {
    const pathArray = dialog.showOpenDialog({
        properties: ['openDirectory'],
        title: 'Путь к папке с TimeZero'
    });

    if (pathArray !== undefined) {
        store.set('tzdir', pathArray[0]);
    }
    app.relaunch();
    app.exit(0);
}
app.on('ready', function() {
	autoUpdater.checkForUpdatesAndNotify();
    if (!store.has('tzdir')) {
        if (false && fs.existsSync('C:\\Program Files (x86)\\TimeZero\\')) {
            store.set('tzdir', 'C:\\Program Files (x86)\\TimeZero\\');
        } else if (false && fs.existsSync('C:\\Program Files\\TimeZero\\')) {
            store.set('tzdir', 'C:\\Program Files\\TimeZero\\');
        } else {
            const response = dialog.showMessageBox({
                title: 'Путь к папке с TimeZero',
                type: 'question',
                message: 'Не найден путь с установленной игрой.',
                buttons: ['Указать путь', 'Скачать официальный клиент TimeZero', 'Выход']
            });
            if (response == 0) {
                selectTZdir()
            } else if (response == 1) {
                shell.openExternal('https://www.timezero.ru/download.ru.html');
                app.exit(0);
            } else if (response == 2) {
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
        if (response == 0) {
            selectTZdir()
        } else if (response == 1) {
            shell.openExternal('https://www.timezero.ru/download.ru.html');
            app.exit(0);
        } else if (response == 2) {
            app.exit(0);
        }
    } else {
        var serve = serveStatic("./game/");
        var serveTZ = serveStatic(store.get('tzdir'));

        var server = http.createServer(function(req, res) {
            var done = finalhandler(req, res);

            let file = req.url.split('?')[0].split('#')[0];
            if (serveFiles.includes(file)) {
                serve(req, res, done);
            } else {
                serveTZ(req, res, done);
            }
        });

        server.listen(5192);

        let menu = Menu.buildFromTemplate([{
                label: 'Клиент',
                submenu: [{
                        label: 'Новое окно',
                        click: function() {
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
                        click: function(menuItem, browserWindow, event) {
                            browserWindow.setAlwaysOnTop(menuItem.checked);
                        }
                    },
                    {
                        type: 'separator'
                    }, {
                        label: 'Путь к игре',
                        click: function() {
                            selectTZdir()
                        }
                    },
                    {
                        label: 'Инструменты разработчика',
                        role: 'toggledevtools'
                    },
                ]
            },
            {
                label: 'Автологин',
                submenu: [{
                        label: 'admin',
                        click: function(menuItem, browserWindow, event) {
                            browserWindow.loadURL('http://localhost:5192/game.ru.html?login=admin&password=123');
                        }
                    },
                    {
                        label: 'admin2',
                        click: function(menuItem, browserWindow, event) {
                            browserWindow.loadURL('http://localhost:5192/game.ru.html?login=admin2&password=123');
                        }
                    },
                ]
            },
            {
                label: 'Packetlogger',
                click: function(menuItem, browserWindow, event) {
                    createLogreader()
                }
            }
        ])
        Menu.setApplicationMenu(menu)

        createWindow();
    }
})

app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    //if (gameWindow === null) {
    //    createWindow()
    //  }
})

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
    app.quit()
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        createWindow();
    })
}

let pluginName
switch (process.platform) {
    case 'win32':
        if (process.arch === 'x64') {
            pluginName = 'pepflashplayer64.dll'
        } else {
            pluginName = 'pepflashplayer32.dll'
        }
        break
    case 'darwin':
        if (process.arch === 'x64') {
            pluginName = 'PepperFlashPlayer64.plugin'
        } else {
            pluginName = 'PepperFlashPlayer32.plugin'
        }
        break
    case 'linux':
        if (process.arch === 'x64') {
            pluginName = 'libpepflashplayer64.so'
        } else {
            pluginName = 'libpepflashplayer32.so'
        }
        break
}
app.commandLine.appendSwitch('ppapi-flash-path', path.join((__dirname.includes(".asar") ? process.resourcesPath : __dirname), 'lib', pluginName));
app.commandLine.appendSwitch('ppapi-flash-version', '32.0.0.156')