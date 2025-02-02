import { Button, Grid, Typography } from "@material-ui/core";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import CheckIcon from "@material-ui/icons/Check";
import React, { ReactElement, useEffect } from "react";
import { combineLatest, of } from "rxjs";
import { mergeMap } from "rxjs/operators";
import {
  DockerSettings,
  dockerSettings$,
  isWSL2$,
  restart$,
} from "../../common/dockerUtil";
import LinkToDiscord from "../LinkToDiscord";
import RowsContainer from "../RowsContainer";
import InfoBar from "./InfoBar";

const RestartRequired = (): ReactElement => {
  useEffect(() => {
    combineLatest([dockerSettings$(), isWSL2$()])
      .pipe(
        mergeMap(([dockerSettings, isWSL2]) => {
          const { wslEngineEnabled } = dockerSettings as DockerSettings;
          console.log("wslEngineEnabled", wslEngineEnabled);
          console.log("isWSL2", isWSL2);
          if (wslEngineEnabled && !isWSL2) {
            console.log(
              "TODO: change wslEngineEnabled to false since only WSL 1 is supported"
            );
          }
          return of(true);
        })
      )
      .subscribe((r) => {
        console.log("settings have been updated", r);
      });
  });
  return (
    <RowsContainer>
      <Grid item container>
        <InfoBar text="Docker Installed!" icon={CheckIcon} />
      </Grid>
      <Grid item container justify="center" direction="column">
        <Typography variant="h6" component="h2" align="center">
          System reboot required to continue.
        </Typography>
        <Typography
          variant="overline"
          component="p"
          color="textSecondary"
          align="center"
        >
          After reboot, please reopen XUD UI.
        </Typography>
      </Grid>
      <Grid item container justify="flex-end">
        <Grid item container justify="flex-end">
          <Button
            variant="contained"
            color="primary"
            disableElevation
            endIcon={<ArrowForwardIcon />}
            onClick={() => {
              restart$().subscribe(() => {
                window.close();
              });
            }}
          >
            Reboot PC
          </Button>
        </Grid>
        <LinkToDiscord />
      </Grid>
    </RowsContainer>
  );
};

export default RestartRequired;
