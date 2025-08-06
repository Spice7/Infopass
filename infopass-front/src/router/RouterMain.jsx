import React from "react";
import { Route, Routes } from "react-router-dom";
import AdminRoutes from "./AdminRoutes";
import Ranking from "./Ranking";

const RouterMain = () => {
  return (
    <div>
      <Routes>
       {Ranking}
        {AdminRoutes}
        <Route path="*" element={<h1>잘못된 주소입니다</h1>} />
      </Routes>
    </div>
  );
};

export default RouterMain;
