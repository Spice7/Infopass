import React from "react";
import { Route } from "react-router-dom";
import BlankGame from "../pages/BlankGame/BlankGameMain";
import BlankGameMain from "../pages/BlankGame/BlankGameMain";
import BlankGameSingle from "../pages/BlankGame/BlankGameSingle";
import BlankGameLobby from "../pages/BlankGame/BlankGameLobby";
import RoomWaitPage from "../pages/BlankGame/RoomWaitPage";
import BlankGameMulti from "../pages/BlankGame/BlankGameMulti";
import RequireLogin from "@/user/RequireLogin";
const blankgame = [
  <Route key="blankgame" path="/blankgamemain" element={<RequireLogin><BlankGameMain /></RequireLogin>} />,
  <Route
    key="blankgamesingle"
    path="/blankgamesingle"
    element={<RequireLogin><BlankGameSingle /></RequireLogin>}
  />,
  <Route
    key="blankgamelobby"
    path="/blankgamelobby"
    element={<RequireLogin><BlankGameLobby /></RequireLogin>}
  />,
  <Route
    key="roomwaitpage"
    path="/blankgame/wait/:roomId"
    element={<RequireLogin><RoomWaitPage /></RequireLogin>}
  />,
  <Route
    key="blankgamemulti"
    path="/blankgamemulti"
    element={<RequireLogin><BlankGameMulti /></RequireLogin>}
  />,
];

export default blankgame;
