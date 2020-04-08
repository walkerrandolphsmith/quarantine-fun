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

const scheme = window.location.href.startsWith("https") ? 'wss': 'ws';
const client = new W3CWebSocket(`${scheme}://${window.location.hostname}:80`);

export class App extends React.Component {
  constructor() {
    super();
    this.state = {
      selections: {},
    }
  }

  componentWillMount() {
    client.onopen = function () {
      console.log('websocket connection open')
    };

    client.onerror = function (error) {
      console.log('websocket connection error', error)
    };

    client.onmessage = (message) => {
      try {
        var payload = JSON.parse(message.data);
        if (payload.type === "identifier") {
          client.id = payload.id;
        }

        if (payload.type === "cardselection") {
          console.log('card selection occured by another player', payload);
        }

        if (payload.type === "revealcard") {
          this.setState(state => ({ selections: { ...state.selections, [payload.index]: payload.value } }))
        }
      } catch (e) {
        debugger;
        console.log('This doesn\'t look like a valid JSON: ', message.data);
        return;
      }
    }
  }

  render() {
    return (
      <Router>
          <Switch>
            <Route path="/game/:id">
              <GameMaster client={client} selections={this.state.selections} />
            </Route>
            <Route path="/play/:id">
              <Game client={client} selections={this.state.selections} />
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