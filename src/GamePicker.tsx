import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { Schedule } from './types'
import { Link } from 'react-router';
import { getTodayGames } from './api'
import {
  addDays,
  formatDisplayDate,
  formatScheduleGameStartTime,
  getAvailableDateWindow,
  getScheduleGameStartTimestamp,
} from './utils/dateTime'
import './GamePicker.css'
import { BaseballDiamondSpinner, NavBar } from './components';

/**
 * GamesPicker Component
 * 
 * Displays the schedule of games for a selected date. Allows the user to navigate between days and click on 
 * individual games to view deeper advanced stats.
 */
export function GamesPicker() {
  const { todayStr, latestAvailableDateStr } = getAvailableDateWindow();
  const [schedule, setSchedule] = useState<Schedule>([])
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(() => latestAvailableDateStr);
  const nextDate = addDays(currentDate, 1);
  const isNextDayDisabled = nextDate >= todayStr;
  const gamesByStartTime = useMemo(() => {
    const groupedGames = new Map<string, Schedule>();

    [...schedule]
      .sort((a, b) => getScheduleGameStartTimestamp(a) - getScheduleGameStartTimestamp(b))
      .forEach((game) => {
        const localStartTime = formatScheduleGameStartTime(game);
        const games = groupedGames.get(localStartTime) ?? [];
        groupedGames.set(localStartTime, [...games, game]);
      });

    return Array.from(groupedGames, ([startTime, games]) => ({ startTime, games }));
  }, [schedule]);

  useEffect(() => {
    getTodayGames(currentDate)
      .then((scheduleData) => {
        setSchedule(scheduleData);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        console.error("Error fetching games", err);
      });
  }, [currentDate]);

  const handlePrevDay = () => { setLoading(true); setCurrentDate((prev) => addDays(prev, -1)); };
  const handleNextDay = () => {
    if (!isNextDayDisabled) {
      setLoading(true);
      setCurrentDate(nextDate);
    }
  };
  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setLoading(true);
      setCurrentDate(e.target.value > latestAvailableDateStr ? latestAvailableDateStr : e.target.value);
    }
  };

  return (
    <main className="game-picker-page">
      <NavBar />

      <header className="game-picker-header">
        <h1>Game Picker</h1>
        <h2>Games for {formatDisplayDate(currentDate)}</h2>
      </header>
      
      <section className="games-section">
        <div className="date-controls">
          <button className="date-btn" onClick={handlePrevDay}>Previous Day</button>
          <input
            type="date"
            value={currentDate}
            max={latestAvailableDateStr}
            className="date-input"
            onChange={handleDateChange}
          />
          <button className="date-btn" onClick={handleNextDay} disabled={isNextDayDisabled}>Next Day</button>
        </div>
        <div className="games-list" aria-busy={loading}>
          {loading ? (
            <BaseballDiamondSpinner
              message="Finding games..."
              className="games-list__spinner"
            />
          ) : (
            gamesByStartTime.map(({ startTime, games }) => (
              <div key={startTime} className="game-time-group">
                <h3 className="game-time-heading">{startTime}:</h3>
                {games.map((game) => (
                  <Link key={game.gamePk} to={`/game/${game.gamePk}`}>
                    <h3>{game.teams.away.team.name} @ {game.teams.home.team.name}</h3>
                  </Link>
                ))}
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  ) 
}
