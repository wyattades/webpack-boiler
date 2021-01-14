import { hot } from 'react-hot-loader/root';
import React, { useState, useEffect } from 'react';

const Hooked = () => {
  const [text, setText] = useState('');

  useEffect(() => {
    // The following line is changed by the test suite:
    const prefix = 'Code that changes';

    const timeoutId = setTimeout(() => setText(prefix), 500);
    return () => clearTimeout(timeoutId);
  }, []);

  return <p id="hot_reload_2">{text}</p>;
};

class App extends React.Component {
  static staticProp = 'foo';

  myProp = 'bar';

  state = {
    dynamic: null,
  };

  async componentDidMount() {
    await import(/* webpackChunkName: "buzz" */ './dynamic').then((dynamic) => {
      this.setState({ dynamic: dynamic.default() });
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log('Async works!');
  }

  render() {
    const { dynamic } = this.state;

    return (
      <>
        <ul>
          <li>PAGE_URL={window.location.href}</li>
          <li>THIS_PROP={this.myProp}</li>
          <li>STATIC_PROP={App.staticProp}</li>
          <li>DYNAMIC={dynamic}</li>
          <li>NODE_ENV={process.env.NODE_ENV}</li>
        </ul>
        <hr />
        {/* The following line is changed by the test suite: */}
        <p id="hot_reload_1">Here is some text!</p>
        <hr />
        <Hooked />
      </>
    );
  }
}

export default hot(App);
