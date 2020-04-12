import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import './App.css';
import { Architect } from '../Architect';
import { GameFinder } from '../GameFinder';
import { Lobby } from '../Lobby';
import { Game } from '../Game';
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
      players: [],
      winner: -1
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
          this.setState(state => ({ selections: { ...state.selections, [payload.index]: payload.value }, winner: payload.winner }))
        }
        if (payload.type === "playeradded") {
          this.setState(_ => ({ players: [...payload.players] }))
        }
        if (payload.type === "branch") {
          const { previousGameId, nextGameId } = payload;
          fetch(`/api/join`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                previousGameId,
                nextGameId
              })
            })
            .then(r => r.json())
            .then(_ => {
              window.location.href = `/lobby/${nextGameId}`;
            })
            .catch(error => {
              console.log(error)
            })
        }
        if (payload.type === 'gamestarted') {
          window.location.href = `/game/${payload.gameId}`;
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
      players,
      winner,
    } = this.state;

    return (
      <Router>
          <Switch>
            <Route path="/architect">
              <Architect />
            </Route>
            <Route path="/lobby/:id">
              <Lobby client={client} players={players} />
            </Route>
            <Route path="/join/:id">
              <GameFinder client={client} hasInvitation />
            </Route>
            <Route path="/game/:id">
              <Game client={client} selections={selections} winner={winner} />
            </Route>
            <Route path="/">
              <GameFinder client={client} />
            </Route>
          </Switch>
      </Router>
    );
  }
}

export default App;