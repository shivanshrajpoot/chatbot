import { Dialogflow_V2 } from 'react-native-dialogflow';

import React, { Component } from 'react';
import axios from 'axios';
const appId = "UEQPPX-R77WYHH5JP";
const baseURL = `http://api.wolframalpha.com/v2`;
import { GiftedChat } from 'react-native-gifted-chat';
import uuidv4 from 'uuid/v4';
import emojiUtils from 'emoji-utils';
import SlackMessage from './SlackMessage';
import { get } from 'lodash';
import { Text } from "react-native";
import { dialogflowConfig } from './env';
console.disableYellowBox = true;

const BOT_USER = {
    _id: 1,
    name: 'FAQ Bot',
    avatar: 'https://i.imgur.com/7k12EPD.png',
  };
// The actual chat view itself- a ScrollView of BubbleMessages, with an InputBar at the bottom, which moves with the keyboard

export default class DialogFlow extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      messages: [ {
        _id: uuidv4(),
        text: 'Welcome! I am Cilory ChatBot.',
        createdAt: new Date(),
        user: BOT_USER,
        quickReplies: {
          type: 'radio', // or 'checkbox',
          keepIt: true,
          values: [
            {
              title: 'How can I Track my order status?',
              value: 'How can I Track my order status?',
            },
            {
              title: 'How can I cancel or change my order?',
              value: 'How can I cancel or change my order?',
            },
            {
              title: 'Do you accepts returns?',
              value: 'Do you accepts returns?',
            },
          ],
        },
      },],
      inputBarText: ''
    }
  }
  componentDidMount() {
    Dialogflow_V2.setConfiguration(
      dialogflowConfig.client_email,
      dialogflowConfig.private_key,
      Dialogflow_V2.LANG_ENGLISH_US,
      dialogflowConfig.project_id
    );
  }
  createMessage(text, userId=1) {
    return {
      _id: uuidv4(),
      text,
      createdAt: new Date(),
      user: {
        _id: userId,
        name: userId===1 ? "Alpha": "You",
        avatar: userId===1 ? "https://placeimg.com/140/140/ai": "https://placeimg.com/140/140/me",
      },
    };
  }
  
  addMessage(message) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, message),
    }));
  }

  toggleLoading(){
    this.setState({ isLoading: !this.state.isLoading });
  }

  dialogFlowQuery(query) {
    this.toggleLoading();
    Dialogflow_V2.requestQuery(
      query,
      result => {
        console.log("result", result);
        const msg = get(result, 'queryResult.fulfillmentMessages[0].text.text[0]', false);
        const respMsg = this.createMessage(msg?msg:"Sorry try again");
        this.toggleLoading();
        this.addMessage(respMsg);
        },
        error => console.log(error)
    );
  }
  async _sendMessage(messages) {
    try {
      this.addMessage(messages[0]);
      let message = messages[0].text;
      this.dialogFlowQuery(message);
    } catch (error) {
      console.error(error);
    }
  }

  onSend(messages = []) {
    this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }))
  }

  renderMessage(props) {
    const { currentMessage: { text: currText } } = props;

    let messageTextStyle;

    // Make "pure emoji" messages much bigger than plain text.
    if (currText && emojiUtils.isPureEmojiString(currText)) {
      messageTextStyle = {
        fontSize: 28,
        // Emoji get clipped if lineHeight isn't increased; make it consistent across platforms.
        lineHeight: Platform.OS === 'android' ? 34 : 30,
      };
    }

    return (
      <SlackMessage {...props} messageTextStyle={messageTextStyle} />
    );
  }
  render() {
    return (
            <GiftedChat
              messages={this.state.messages}
              onSend={messages => this._sendMessage(messages)}
              onQuickReply={message => {
                console.log("message12377823872", message);
                const msg = this.createMessage(message[0].value, 2);
                this.addMessage(msg);
                this.dialogFlowQuery(message[0].value);
              }}
              isAnimated={true}
              renderAvatarOnTop={true}
              // renderMessage={this.renderMessage}
              renderFooter={() => 
                this.state.isLoading &&
                  <Text style={{ margin: 10, padding: 5 }}>Thinking...</Text>
              }
              user={{
                _id: 2,
                name: "You",
                avatar: "https://placeimg.com/140/140/me",
              }}
              extraData={this.state.isLoading}
          />
    );
  }
}