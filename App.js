
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
console.disableYellowBox = true;
// The actual chat view itself- a ScrollView of BubbleMessages, with an InputBar at the bottom, which moves with the keyboard
export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      messages: [ {
        _id: uuidv4(),
        text: 'Welcome! I am alpha.',
        createdAt: new Date(),
        user: {
          _id: 1,
          name: 'Alpha',
          avatar: 'https://placeimg.com/140/140/me',
        },
      },],
      inputBarText: ''
    }
  }

  createMessage(text) {
    return {
      _id: uuidv4(),
      text,
      createdAt: new Date(),
      user: {
        _id: 1,
        name: "Alpha",
        avatar: "https://placeimg.com/140/140/ai",
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
  async _sendMessage(messages) {
    let response = {};
    try {
      this.addMessage(messages[0]);
      const axiosInstance = axios.create({
        baseURL,
        timeout: 5000,
      });
      this.toggleLoading();
      response = await axiosInstance.get(`/query?appid=${appId}&input=${messages[0].text}&output=json`);
      const msg = get(response, 'data.queryresult.pods[1].subpods[0].plaintext', false);
      const respMsg = this.createMessage(msg?msg:"Sorry try again");
      this.toggleLoading();
      this.addMessage(respMsg);
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