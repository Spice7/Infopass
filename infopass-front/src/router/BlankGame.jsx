import React from "react";
import { Route } from "react-router-dom";
import BlankGame from "../pages/BlankGame/BlankGameMain";
import BlankGameMain from "../pages/BlankGame/BlankGameMain";
import BlankGameSingle from "../pages/BlankGame/BlankGameSingle";
import BlankGameLobby from "../pages/BlankGame/BlankGameLobby";
import RoomWaitPage from "../pages/BlankGame/RoomWaitPage";
import BlankGameMulti from "../pages/BlankGame/BlankGameMulti";
const blankgame = [
  <Route key="blankgame" path="/blankgamemain" element={<BlankGameMain />} />,
  <Route
    key="blankgamesingle"
    path="/blankgamesingle"
    element={<BlankGameSingle />}
  />,
  <Route
    key="blankgamelobby"
    path="/blankgamelobby"
    element={<BlankGameLobby />}
  />,
  <Route
    key="roomwaitpage"
    path="/blankgame/wait/:roomId"
    element={<RoomWaitPage />}
  />,
  <Route
    key="blankgamemulti"
    path="/blankgamemulti"
    element={<BlankGameMulti />}
  />,
];

export default blankgame;
