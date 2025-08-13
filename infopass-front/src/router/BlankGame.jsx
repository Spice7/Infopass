import React from "react";
import { Route } from "react-router-dom";
import BlankGame from "../pages/BlankGame/BlankGameMain";
import BlankGameMain from "../pages/BlankGame/BlankGameMain";
import BlankGameSingle from "../pages/BlankGame/BlankGameSingle";

const blankgame =[
<Route key="blankgame" path="/blankgamemain" element={<BlankGameMain />} />,
<Route key="blankgamesingle" path="/blankgamesingle" element={<BlankGameSingle />} />
]
 
export default blankgame;
