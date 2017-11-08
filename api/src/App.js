import React, { Component } from "react";
import PropTypes from "prop-types";
import { BrowserRouter as Router } from "react-router-dom";
import Drawer from "./Drawer";

class App extends Component {
  static propTypes = {
    instances: PropTypes.array,
    instanceObjects: PropTypes.array,
  };

  static defaultProps = {
    instances: [],
    instanceObjects: [],
  };

  constructor(props) {
    super(props);
    this.state = { ...props };
  }

  componentDidMount() {
    fetch("http://localhost:5000/instances")
      .then(resp => resp.json())
      .then(instances => {
        this.setState({ instances });
        const instanceObject = [];
        const promises = instances.map(instance =>
          fetch(`http://localhost:5000/instances/${instance.name}`)
            .then(resp => resp.json())
            .then(instance => instance),
        );
        Promise.all(promises).then(instanceObjects => {
          this.setState({ instanceObjects });
        });
      })
      .catch(err => {
        console.error(err);
      });
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
