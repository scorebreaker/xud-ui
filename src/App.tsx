import CssBaseline from "@material-ui/core/CssBaseline";
import { createMuiTheme, Theme, withStyles } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
import { Provider } from "mobx-react";
import React, { ReactElement } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { isWindows } from "./common/appUtil";
import { XUD_DOCKER_LOCAL_MAINNET_URL } from "./constants";
import Dashboard from "./dashboard/Dashboard";
import { Path } from "./router/Path";
import ConnectToRemote from "./setup/ConnectToRemote";
import Create from "./setup/create/Create";
import DownloadDocker from "./setup/create/DownloadDocker";
import IncorrectWslSettings from "./setup/create/IncorrectWslSettings";
import InstallDocker from "./setup/create/InstallDocker";
import RestartRequired from "./setup/create/RestartRequired";
import StartingXud from "./setup/create/StartingXud";
import DockerNotDetected from "./setup/DockerNotDetected";
import Landing from "./setup/Landing";
import WaitingDockerStart from "./setup/WaitingDockerStart";
import { useDockerStore } from "./stores/dockerStore";
import { useSettingsStore } from "./stores/settingsStore";

const darkTheme = createMuiTheme({
  palette: {
    type: "dark",
  },
});

const GlobalCss = withStyles((theme: Theme) => {
  return {
    "@global": {
      "::-webkit-scrollbar": {
        width: 8,
      },
      "::-webkit-scrollbar-track": {
        background: theme.palette.background.default,
      },
      "::-webkit-scrollbar-thumb": {
        borderRadius: "4px",
        background: theme.palette.background.paper,
      },
      "::-webkit-scrollbar-thumb:hover": {
        background: theme.palette.grey[700],
      },
      "::-webkit-scrollbar-corner": {
        backgroundColor: "transparent",
      },
      "#root": {
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      },
    },
  };
})(() => null);

const settingsStore = useSettingsStore({
  xudDockerUrl: XUD_DOCKER_LOCAL_MAINNET_URL,
});

const dockerStore = useDockerStore({
  isInstalled: false,
  isRunning: false,
});

localStorage.removeItem("rebootRequired");

function App(): ReactElement {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <GlobalCss />
      <Provider settingsStore={settingsStore} dockerStore={dockerStore}>
        <Router>
          <Switch>
            <Route path={Path.CONNECT_TO_REMOTE}>
              <ConnectToRemote />
            </Route>
            <Route path={Path.DASHBOARD}>
              <Dashboard />
            </Route>
            <Route path={Path.DOWNLOAD_DOCKER}>
              <DownloadDocker />
            </Route>
            <Route path={Path.INSTALL_DOCKER}>
              <InstallDocker />
            </Route>
            <Route path={Path.STARTING_XUD}>
              <StartingXud />
            </Route>
            <Route path={Path.RESTART_REQUIRED}>
              <RestartRequired />
            </Route>
            <Route path={Path.START_ENVIRONMENT}>
              <Create />
            </Route>
            <Route path={Path.WAITING_DOCKER_START}>
              <WaitingDockerStart />
            </Route>
            <Route path={Path.INCOMPATIBLE_WSL_SETTINGS}>
              <IncorrectWslSettings />
            </Route>
            <Route path={Path.HOME}>
              {isWindows() ? <Landing /> : <DockerNotDetected />}
            </Route>
          </Switch>
        </Router>
      </Provider>
    </ThemeProvider>
  );
}

export default App;
