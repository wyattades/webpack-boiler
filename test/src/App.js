import React from 'react';
import { hot } from 'react-hot-loader/root';

const Hooked = () => {
  const [text, setText] = React.useState('');

  useEffect(() => {
    // The following line is changed by the test suite:
    const prefix = 'Code that changes';
    let i = 0;
    const intervalId = setInterval(
      () => setText(`${prefix}: interval #${i++}`),
      250,
    );
    return () => clearInterval(intervalId);
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
    await import('./dynamic').then((dynamic) => {
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
