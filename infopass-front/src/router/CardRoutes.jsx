import React from 'react';
import { Route } from 'react-router-dom';
import CardMain from '../games/card';

const CardRoutes = (
    <Route key="card-main" path="/card/main" element={<CardMain />} />
);

export default CardRoutes;
