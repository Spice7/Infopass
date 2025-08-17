import React from 'react';
import { Route } from 'react-router-dom';
import CardMain from '../games/card';

const CardRoutes = (
    <Route path="/card" element={<CardMain />} />
);

export default CardRoutes;
