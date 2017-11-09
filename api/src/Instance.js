import React from "react";
import PropTypes from "prop-types";
import Card, { CardContent, CardHeader } from "material-ui/Card";

export default class Instance extends React.Component {
  static defaultProps = {
    name: "",
  };

  constructor(props) {
    super(props);
    this.state = { ...props };
  }

  // componentDidMount() {
  //   fetch(`http://localhost:5000/instances/${this.state.name}`)
  //     .then(resp => resp.json())
  //     .then(info =>
  //       this.setState({
  //         info,
  //       }),
  //     );
  // }

  render() {
    return (
      <div className="card">
        <Card>
          <CardHeader title={"NAME"} subheader="Minecraft Server Instance" />
          <CardContent>
            <pre>{JSON.stringify(this.state.data, null, 2)}</pre>
          </CardContent>
        </Card>
      </div>
    );
  }
}
