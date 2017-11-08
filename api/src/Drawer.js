import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "material-ui/styles";
import Drawer from "material-ui/Drawer";
import AppBar from "material-ui/AppBar";
import Toolbar from "material-ui/Toolbar";
import Typography from "material-ui/Typography";
import Divider from "material-ui/Divider";
import Paper from "material-ui/Paper";
import List, { ListItem, ListItemIcon, ListItemText } from "material-ui/List";
import ComputerIcon from "material-ui-icons/Computer";
import { Route, Link } from "react-router-dom";
import Instance from "./Instance";
import NotFoundCard from "./NotFoundCard";
import Card, { CardContent, CardHeader, CardActions } from "material-ui/Card";
import Button from "material-ui/Button";
import AddIcon from "material-ui-icons/Add";
import { createPod, deletePod } from "./lib";

const drawerWidth = 240;
const styles = theme => ({
  root: {
    width: "100%",
    height: "100vh",
    zIndex: 1,
    overflow: "hidden",
  },
  appFrame: {
    position: "relative",
    display: "flex",
    width: "100%",
    height: "100%",
  },
  appBar: {
    position: "absolute",
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    overflow: "scroll",
  },
  drawerPaper: {
    position: "relative",
    height: "100%",
    width: drawerWidth,
  },
  drawerHeader: theme.mixins.toolbar,
  content: {
    backgroundColor: theme.palette.background.default,
    width: "100%",
    padding: theme.spacing.unit * 3,
    height: "calc(100% - 56px)",
    marginTop: 56,
    overflow: "scroll",
    [theme.breakpoints.up("sm")]: {
      height: "calc(100% - 64px)",
      marginTop: 64,
    },
  },
  drawerLink: {
    textDecoration: "none",
    color: "black",
    opacity: 1,
  },
});

function instanceControls(instance) {
  return (
    <Card style={{ width: "25vw", minWidth: "25vw", marginBottom: "2em" }} key={instance.metadata.name}>
      <CardContent>
        <Typography type="headline" component="h2">
          {instance.metadata.name}
        </Typography>
        <Typography component="p">IP Address: {instance.status.hostIP}</Typography>
      </CardContent>
      <CardActions>
        <Button
          dense
          color="accent"
          onClick={() => {
            deletePod(instance.metadata.name);
          }}
        >
          Delete
        </Button>
      </CardActions>
    </Card>
  );
}

function PermanentDrawer(props) {
  const { classes } = props;

  return (
    <div className={classes.root}>
      <div className={classes.appFrame}>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <Typography type="title" color="inherit" noWrap>
              KubeKraft
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          type="permanent"
          classes={{
            paper: classes.drawerPaper,
          }}
        >
          <div className={classes.drawerHeader} />
          <Divider />
          <List>
            {props.instances.map(instance => (
              <Link className={classes.drawerLink} to={`/instances/${instance.name}`} key={instance.name}>
                <ListItem button>
                  <ListItemIcon>
                    <ComputerIcon />
                  </ListItemIcon>
                  <ListItemText primary={instance.name} />
                </ListItem>
              </Link>
            ))}
          </List>
        </Drawer>
        <main className={classes.content}>
          <Route
            exact
            path="/instances/:name([^\/]+)"
            render={({ match }) => {
              // const instance = props.instances.find(potential => potential.name === match.params.name);
              const instance = props.instanceObjects.find(potential => potential.metadata.name === match.params.name);
              return instance ? (
                <Card>
                  <CardHeader title={instance.metadata.name} subheader="Minecraft Server Instance" />
                  <CardContent>
                    <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(instance, null, 2)}</pre>
                  </CardContent>
                </Card>
              ) : (
                <NotFoundCard heading="Container not found :(" />
              );
            }}
          />
          <Route
            exact
            path="/"
            render={() => (
              <div
                elevation={4}
                style={{
                  paddingTop: 16,
                  paddingBottom: 16,
                  paddingLeft: 16,
                }}
              >
                <div style={{ display: "flex", width: "100%", justifyContent: "space-around", flexFlow: "wrap" }}>
                  {props.instanceObjects.map(instanceObject => instanceControls(instanceObject))}
                </div>
                <Button
                  fab
                  color="primary"
                  aria-label="add"
                  className={classes.button}
                  onClick={() => {
                    createPod();
                  }}
                >
                  <AddIcon />
                </Button>
              </div>
            )}
          />
        </main>
      </div>
    </div>
  );
}

PermanentDrawer.propTypes = {
  classes: PropTypes.object.isRequired,
  instances: PropTypes.array,
  instanceObjects: PropTypes.array,
};

export default withStyles(styles)(PermanentDrawer);
