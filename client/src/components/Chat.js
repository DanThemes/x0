import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { GameContext } from '../context/StateContext';
import socket from '../util/socket';
import moment from 'moment';

const appendMessage = (data) => {
  const chatEl = document.querySelector('.chat-body');
  const messageContainer = document.createElement('div');
  messageContainer.className = 'message';
  if (data.user.id === socket.id) {
    messageContainer.classList.add('mine');
  }

  const messageHeader = document.createElement('div');
  messageHeader.className = 'message-header';
  messageHeader.innerHTML = `${moment(data.date).format('L HH:mm:ss')} <strong>${data.user.username}</strong>:`;

  const messageBody = document.createElement('div');
  messageBody.className = 'message-body';
  messageBody.textContent = data.message;

  messageContainer.append(messageHeader, messageBody);
  chatEl.append(messageContainer);
}

const Chat = () => {
  const [message, setMessage] = useState('');
  const { state } = useContext(GameContext);

  const chatBodyRef = useRef();

  const handleSendMessage = useCallback(() => {
    if (!message) return;

    console.log('send')
    socket.emit('send_message', {
      user: state.user,
      date: new Date().getTime(),
      message
    })
    setMessage('');
  });

  const handleSubmitOnEnterKey = e => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  }

  useEffect(() => {
    if (!state.user.connected) return;

    socket.on('receive_message', data => {
      appendMessage(data);
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    })

    return () => {
      socket.off('receive_message');
    }
  }, [])

  return (
    <div className="chat">
      <h4>Global Chat</h4>

      <div className="chat-body" ref={chatBodyRef}></div>
      <input type="text" placeholder="Message..." value={message} onChange={e => setMessage(e.target.value)} onKeyPress={handleSubmitOnEnterKey} className="send-message" />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  )
}

export default Chat