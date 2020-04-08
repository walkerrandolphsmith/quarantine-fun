import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import './App.css';
import { CandidateGame } from '../CandidateGame';
import { Game } from '../Game';
import { GameMaster } from '../GameMaster';
import { w3cwebsocket as W3CWebSocket } from "websocket";

function getClient() {
  const isHTTPS = window.location.href.startsWith("https");
  const scheme = isHTTPS ? 'wss': 'ws';
  const port = isHTTPS ? 443 : 3003;
  const client = new W3CWebSocket(`${scheme}://${window.location.hostname}:${port}`);
  return client;
}

export class App extends React.Component {
  constructor() {
    super();
    this.state = {
      selections: {},
      client: null,
    }
  }

  timeout = 2500;

  componentDidMount() {
    this.connect();
  }

  connect = () => {
    let that = this;
    let connectInterval;
    let client = getClient();

    client.onopen = () => {
      console.log('websocket connection open')
      this.setState({ client });
      that.timeout = 2500;
      clearTimeout(connectInterval)
    }

    client.onclose = e => {
      console.log(
          `Socket is closed. Reconnect will be attempted in ${Math.min(
              10000 / 1000,
              (that.timeout + that.timeout) / 1000
          )} second.`,
          e.reason
      );

      that.timeout = that.timeout + that.timeout;
      connectInterval = setTimeout(this.check, Math.min(10000, that.timeout));
    };

    client.onerror = err => {
      console.error(
          "Socket encountered error: ",
          err.message,
          "Closing socket"
      );

      client.close();
    }

    client.onmessage = (message) => {
      try {
        var payload = JSON.parse(message.data);
        if (payload.type === "revealcard") {
          this.setState(state => ({ selections: { ...state.selections, [payload.index]: payload.value } }))
        }
      } catch (e) {
        console.log('This doesn\'t look like a valid JSON: ', message.data);
        return;
      }
    }
  }

  check = () => {
    const { client } = this.state;
    if (!client || client.readyState === WebSocket.CLOSED) this.connect();
  }

  render() {
    const {
      client,
      selections,
    } = this.state;

    return (
      <Router>
          <Switch>
            <Route path="/game/:id">
              <GameMaster client={client} selections={selections} />
            </Route>
            <Route path="/play/:id">
              <Game client={client} selections={selections} />
            </Route>
            <Route path="/">
              <CandidateGame />
            </Route>
          </Switch>
      </Router>
    );
  }
}

export default App;