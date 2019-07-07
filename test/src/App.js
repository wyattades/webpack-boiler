import React from 'react';
import { hot } from 'react-hot-loader/root';

class App extends React.Component {
  static staticProp = 'foo';

  myProp = 'bar';

  state = {
    dynamic: null,
  };

  async componentDidMount() {
    await import('./dynamic').then((dynamic) => {
      this.setState({ dynamic: dynamic.default() });
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log('Async works!');
  }

  render() {
    const { dynamic } = this.state;

    return (
      <div>
        <h1>Test on page: {window.location.href}</h1>
        <p id="hot_reload_test">Here is some text!</p>
        <p>{this.myProp}</p>
        <p>{App.staticProp}</p>
        <p>{dynamic}</p>
      </div>
    );
  }
}

export default hot(App);
