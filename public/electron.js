const electron = require("electron");
const { Menu, Tray } = require("electron");
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require("path");
const isDev = require("electron-is-dev");
const { ipcHandler, execCommand } = require("./ipc");
const { combineLatest } = require("rxjs");
const { take } = require("rxjs/operators");

let mainWindow, tray;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 680,
    backgroundColor: "#303030",
    show: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, "./assets/512x512.png"),
    webPreferences: {
      preload: path.join(__dirname, "./preload.js"),
      worldSafeExecuteJavaScript: true,
      contextIsolation: true,
    },
  });
  mainWindow.loadURL(
    isDev
      ? "https://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );
  mainWindow.on("closed", () => (mainWindow = null));
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });
  ipcHandler(mainWindow);

  mainWindow.on("minimize", (e) => {
    e.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on("close", (e) => {
    if (!app.isQuiting) {
      e.preventDefault();
      mainWindow.hide();
      tray.setContextMenu(trayMenuWithShow);
    }
  });
}

const trayMenuWithShow = Menu.buildFromTemplate([
  {
    label: "Show",
    click: () => {
      mainWindow.show();
      tray.setContextMenu(trayMenuWithHide);
    },
  },
  {
    label: "Quit",
    click: () => {
      app.isQuiting = true;
      app.quit();
    },
  },
]);

const trayMenuWithHide = Menu.buildFromTemplate([
  {
    label: "Hide",
    click: () => {
      mainWindow.hide();
      tray.setContextMenu(trayMenuWithShow);
    },
  },
  {
    label: "Quit",
    click: () => {
      app.isQuiting = true;
      app.quit();
    },
  },
]);

app
  .whenReady()
  .then(() => {
    tray = new Tray(path.join(__dirname, "./assets/512x512.png"));
    tray.setContextMenu(trayMenuWithHide);
  })
  .catch((e) => {
    console.log(e);
  });

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  combineLatest([
    execCommand("docker stop mainnet_xud_1"),
    execCommand("docker stop mainnet_connext_1"),
    execCommand("docker stop mainnet_lndbtc_1"),
    execCommand("docker stop mainnet_lndltc_1"),
    execCommand("docker stop mainnet_utils_1"),
    execCommand("docker stop mainnet_proxy_1"),
    execCommand("docker stop mainnet_boltz_1"),
  ])
    .pipe(take(1))
    .subscribe(() => {});
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// SSL/TSL: self signed certificate support
app.on(
  "certificate-error",
  (event, _webContents, _url, _error, _certificate, callback) => {
    event.preventDefault();
    callback(true);
  }
);

app.on("before-quit", () => {
  app.isQuiting = true;
});
