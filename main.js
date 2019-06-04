const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

// SET ENV
process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

//Listen for App to be ready
app.on('ready', function(){
    // Create new Window
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    });
    //Load the HTML File into Window
    mainWindow.loadURL(url.format({
        pathname:path.join(__dirname,'mainWindow.html'),
        protocol:'file',
        slashes:true
    }));
    // Quit Everything with MainWindow Quit
    mainWindow.on('closed',function(){
        app.quit();
    });

    //Build Menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //Insert the Menu
    Menu.setApplicationMenu(mainMenu);
});

//Handle AddWindow
function createAddWindow(){
    // Create new Window
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add Shopping List Item',
        webPreferences: {
            nodeIntegration: true
        }
    });
    //Load the HTML File into Window
    addWindow.loadURL(url.format({
        pathname:path.join(__dirname,'addWindow.html'),
        protocol:'file',
        slashes:true
    }));
    addWindow.on('close', function(){
        addWindow = null;
    });
}

ipcMain.on('item:add',function(e,item){
    //console.log(item);
    mainWindow.webContents.send('item:add',item);
    addWindow.close();
});

// Create Menu Template

const mainMenuTemplate = [
    {
        label:'File',
        submenu: [
            {
                label: 'Add Item',
                click(){
                    createAddWindow();
                }
            },
            {
                label: 'Clear Items',
                click(){
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label:'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q':
                'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    }
];

// If MAC Add, Empty object to menu
if(process.platform =='darwin'){
    mainMenuTemplate.unshift({});
}

// Add Developer Tools items if not in production
if(process.env.NODE_ENV!=='production'){
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle Dev Tools',
                accelerator: process.platform == 'darwin' ? 'Command+I':
                'Ctrl+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    });
}