from pybaseball import statcast_single_game
import statsapi as MLB_API

#pull a specific game, analyze just that game, generalize afterwards

#get the single game integer
# game = MLB_API.last_game()

# game = statcast_single_game()
print("lookup team")
print(f"Toronto = {MLB_API.lookup_team("tor")}")
print(f"Last Game = {MLB_API.last_game(141)}")
print(f"last game info = ")