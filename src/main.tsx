import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Routes, Route } from 'react-router'
import './index.css'
import { Game } from './Game.tsx'
import { GamesPicker } from './GamePicker.tsx'
import { Players } from './Players.tsx'
import { Teams } from './Teams.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename='moneyball'>
      <Routes>
        <Route path="game/:gamePk" element={<Game />} />
        <Route path="games-picker" element={<GamesPicker />} />
        <Route path="players" element={<Players />} />
        <Route path="teams" element={<Teams />} />
        <Route path="/" element={<Navigate to="/games-picker/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
