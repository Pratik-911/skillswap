import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import axios from 'axios';
import { MessageCircle, Send, ArrowLeft, Calendar, User } from 'lucide-react';
import './Chat.css';

const Chat = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const { socket, sendMessage } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (userId) {
      openChat(userId);
    }
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (socket) {
      socket.on('newMessage', handleNewMessage);
      return () => {
        socket.off('newMessage');
      };
    }
  }, [socket, currentChat]);

  const fetchConversations = async () => {
    try {
      const response = await axios.get('/messages/conversations');
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const openChat = async (partnerId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/messages/${partnerId}`);
      setMessages(response.data.messages || []);
      setCurrentChat(response.data.otherUser);
      
      // Mark messages as read
      await markMessagesAsRead(partnerId);
    } catch (error) {
      console.error('Error opening chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async (partnerId) => {
    try {
      // Update local conversations to mark as read
      setConversations(prev => 
        prev.map(conv => 
          conv.partner._id === partnerId 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleNewMessage = (messageData) => {
    if (currentChat && messageData.senderId === currentChat._id) {
      setMessages(prev => [...prev, messageData]);
      markMessagesAsRead(currentChat._id);
    } else {
      // Update conversation list with new message
      fetchConversations();
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentChat || sending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const response = await axios.post('/messages', {
        receiverId: currentChat._id,
        content: messageContent
      });

      const sentMessage = response.data.message;
      setMessages(prev => [...prev, sentMessage]);
      
      // Send via socket for real-time delivery
      if (socket) {
        sendMessage(currentChat._id, messageContent);
      }

      // Update conversations list
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageContent); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  if (loading && !currentChat) {
    return <div className="loading-spinner">Loading conversations...</div>;
  }

  return (
    <div className="chat-page">
      <div className="chat-container">
        {/* Conversations Sidebar */}
        <div className={`conversations-sidebar ${currentChat ? 'mobile-hidden' : ''}`}>
          <div className="sidebar-header">
            <h2>
              <MessageCircle size={20} />
              Messages
            </h2>
          </div>
          
          <div className="conversations-list">
            {conversations.length > 0 ? (
              conversations.map((conversation) => (
                <div
                  key={conversation.partner._id}
                  className={`conversation-item ${
                    currentChat?._id === conversation.partner._id ? 'active' : ''
                  }`}
                  onClick={() => openChat(conversation.partner._id)}
                >
                  <div className="conversation-avatar">
                    {conversation.partner.avatar ? (
                      <img src={conversation.partner.avatar} alt={conversation.partner.name} />
                    ) : (
                      conversation.partner.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="conversation-content">
                    <div className="conversation-header">
                      <h4>{conversation.partner.name}</h4>
                      <span className="conversation-time">
                        {formatMessageTime(conversation.lastMessage.createdAt)}
                      </span>
                    </div>
                    <div className="conversation-preview">
                      <p>{conversation.lastMessage.content}</p>
                      {conversation.unreadCount > 0 && (
                        <span className="unread-badge">{conversation.unreadCount}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-conversations">
                <MessageCircle size={48} />
                <h3>No conversations yet</h3>
                <p>Start chatting with your matches to begin skill exchanges</p>
                <Link to="/matches" className="btn btn-primary">
                  Find Matches
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`chat-area ${!currentChat ? 'mobile-hidden' : ''}`}>
          {currentChat ? (
            <>
              {/* Chat Header */}
              <div className="chat-header">
                <button 
                  className="back-button mobile-only"
                  onClick={() => setCurrentChat(null)}
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="chat-partner-info">
                  <div className="partner-avatar">
                    {currentChat.avatar ? (
                      <img src={currentChat.avatar} alt={currentChat.name} />
                    ) : (
                      currentChat.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="partner-details">
                    <h3>{currentChat.name}</h3>
                    <div className="partner-skills">
                      {currentChat.skillsToTeach?.slice(0, 3).map((skill, index) => (
                        <span key={index} className="skill-tag">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="chat-actions">
                  <Link 
                    to={`/appointments`}
                    className="btn btn-outline btn-sm"
                  >
                    <Calendar size={16} />
                    Book Session
                  </Link>
                </div>
              </div>

              {/* Messages */}
              <div className="messages-container">
                {loading ? (
                  <div className="loading-spinner">Loading messages...</div>
                ) : messages.length > 0 ? (
                  messages.map((message, index) => (
                    <div
                      key={message._id || index}
                      className={`message ${
                        message.senderId._id === user.id ? 'sent' : 'received'
                      }`}
                    >
                      <div className="message-content">
                        <p>{message.content}</p>
                        <span className="message-time">
                          {formatMessageTime(message.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-messages">
                    <MessageCircle size={48} />
                    <h3>Start the conversation</h3>
                    <p>Send a message to begin your skill exchange journey</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="message-form">
                <div className="message-input-container">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="message-input"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    className="send-button"
                    disabled={!newMessage.trim() || sending}
                  >
                    <Send size={18} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="no-chat-selected">
              <MessageCircle size={64} />
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the sidebar to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
