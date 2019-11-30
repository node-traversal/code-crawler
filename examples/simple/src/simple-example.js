import React from 'react';
import PropTypes from 'prop-types';

class Greeting extends React.Component {
  render() {
    return (
      <h1>Hello, {this.props.firstName}</h1>
    );
  }
}

Greeting.propTypes = {
  firstName: PropTypes.string
};

export default Greeting;