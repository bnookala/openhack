import React, { Component } from "react";
import PropTypes from "prop-types";
import { BrowserRouter as Router } from "react-router-dom";
import Drawer from "./Drawer";
import { getInstances, getInstance } from "./lib";

class App extends Component {
  static propTypes = {
    instances: PropTypes.array,
    instanceObjects: PropTypes.array,
    activeInstanceObjects: PropTypes.array,
  };

  static defaultProps = {
    instances: [],
    instanceObjects: [],
    activeInstanceObjects: [],
  };

  constructor(props) {
    super(props);
    this.state = { ...props };
  }

  updateInstances = () => {
    getInstances()
      .then(instances => {
        this.setState({ instances });
        const instanceObject = [];
        const promises = instances.map(instance => getInstance(instance.name).then(instance => instance));
        Promise.all(promises).then(instanceObjects => {
          // const activeInstanceObjects = instanceObjects.filter(
          //   instanceObject => typeof instanceObject.metadata.deletionTimestamp === "undefined",
          // );
          this.setState({ instanceObjects });
        });
      })
      .catch(err => {
        console.error(err);
      });
  };

  componentDidMount() {
    this.updateInstances();
    setInterval(() => {
      this.updateInstances();
    }, 3000);
  }

  render() {
    return (
      <Router>
        <Drawer instances={this.state.instances} instanceObjects={this.state.instanceObjects} />
      </Router>
    );
  }
}

export default App;
