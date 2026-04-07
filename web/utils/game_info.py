import statsapi as MLB_API
from datetime import date, timedelta
import pandas as pd
from pybaseball import statcast_single_game

def get_yesterdays_games() -> list[int]:
    today = date.today() - timedelta(days=1)
    return MLB_API.schedule(date=today.isoformat())

def get_single_game_details(game_id) -> list[int]:
    print(game_id)
    game_info:pd.DataFrame = statcast_single_game(game_id)
    details = {}
    details['home'] = game_info.iloc[0]['home_team']
    details['away'] = game_info.iloc[0]['away_team']
    details['home_score'] = game_info['post_home_score'].max()
    details['away_score'] = game_info['post_away_score'].max()
    return details