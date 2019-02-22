import React from 'react';
import { hot } from 'react-hot-loader/root';


class App extends React.Component {

  static staticProp = 'foo';

  myProp = 'bar';

  state = {
    dynamic: null,
  }

  componentDidMount() {
    import('./dynamic')
    .then((dynamic) => {
      this.setState({ dynamic: dynamic.default() });
    });
  }

  render () {
    const { dynamic } = this.state;

    return (
      <div>
        <h1>
          Test on page: {window.location.href}
        </h1>
        <p>{this.myProp}</p>
        <p>{App.staticProp}</p>
        <p>{dynamic}</p>
      </div>
    );
  }
}

export default hot(App);
