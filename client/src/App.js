import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignUp from './Components/SignUp';
import Login from './Components/Login';
import UserPreferences from './Components/UserPreferences';
import Meals from './Components/Meals';
import Homepage from './Components/HomePage';
import Favorites from './Components/Favorites';
import ChatPage from './Components/Chat';

const App = () => {
  return (
<Router>
  <Routes>
    <Route path="/" element={<SignUp />} />
    <Route path="/login" element={<Login />} />
    <Route path="/homepage" element={<Homepage />} />
    <Route path="/userpreferences" element={<UserPreferences />} />
    <Route path="/meals" element={<Meals />} />
    <Route path="/favorites" element={<Favorites />} />
    <Route path="/chat" element={<ChatPage />} />
  </Routes>
</Router>
  );
};

export default App;
