'use strict';

const Nes = require('nes/client');
const ws = new Nes.Client('ws://localhost:8000');
const React = require('react');
const ReactDOM = require('react-dom');

const MessageList = React.createClass({
  getInitialState: () => {

    return {messages: []};
  },
  componentDidMount: function() {

    ws.connect((err) => {

      ws.subscribe('/messages', (update) => {

        let messages = this.state.messages;
        let updatedMessages = messages.concat([update]);
        this.setState({messages: updatedMessages});
      }, (err) => {

        if (err) {
          console.error(err);
        }
      });
    });
  },
  render: function() {
    const messageNodes = this.state.messages.map((message) => {
      return (
        <Message key={message.id}>
        {message.payload}
        </Message>
      );
    });

    return (
      <div className="messageList">
      {messageNodes}
      </div>
    );
  }
});

const Message = React.createClass({
  render: function() {
    return (
      <div className="message">
      {this.props.children}
      </div>
    );
  }
})

ReactDOM.render(
  <MessageList />,
  document.getElementById('app')
);
