from pybaseball import statcast_single_game, playerid_reverse_lookup
import matplotlib.pyplot as plt
import statsapi as MLB_API
import pandas as pd
import base64
from io import BytesIO
from pathlib import Path
import webbrowser

def last_game_report() -> None:
    valid_teams = ["ana","ari","atl","bal","bos","chc","cws","cin","cle","col",
                "det","hou","kc","kcr","lad","mia","mil","min","nym","nyy",
                "ath","phi","pit","sd","sdp","sf","sfg","sea","stl","tb","tbr",
                "tex","tor","was"]
    team = None

    print('-----Generate a report on a teams last played game-----\n')
    print('Enter \'teams\' for a list of the valid team abbreviations')

    while True:
        team = str(input("Enter team you would like to look up: ")).lower()
        if team not in valid_teams and not team ==  'teams':
            print('Please enter a valid team abbreviation')
        else:
            if team == 'teams':
                print(valid_teams)
            else:
                break

    team_id = MLB_API.lookup_team(team)[0]['id']
    last_game_id = MLB_API.last_game(team_id)
    game_info:pd.DataFrame = statcast_single_game(last_game_id)
    if not game_info.empty:
        print("Got Game! 👍")
    else:
        raise RuntimeError("Failed to get game")

    home_team = game_info.iloc[0]['home_team']
    away_team = game_info.iloc[0]['away_team']

    #open the html in create

    with open('report.html', 'w', encoding='utf-8') as f:
        try:
            #html metadata
            f.write(f'<!doctype html>\n<html><head><meta charset="utf-8"><title>{team.upper()} Previous Game Report</title></head><body>\n')
            
            f.write(f'<h1>{team.upper()}\'s last game {f'vs {away_team}' if home_team.upper() == team.upper() else f'@ {home_team}'}</h1>')

            f.write('<h1>Game Info</h1>\n')
            f.write(f"<p>Game Date: {game_info.iloc[0]['game_date']}</p>\n")
            f.write(f"<p><strong>Matchup:</strong> {away_team} @ {home_team}</p>\n")
            f.write(
                f"<p><strong>Final Score:</strong> {game_info['post_away_score'].max()} - {game_info['post_home_score'].max()}</p>\n"
            )
            if not game_info.iloc[0]['inning'] == 9:
                f.write(f"<p><strong>Extra innings:</strong> {game_info.iloc[0]['inning']}</p>\n")

            f.write('<h1>Batter Info</h1>\n')

            batters = game_info['batter'].unique().tolist()
            f.write(f"<h2>Total Unique Batters: {len(batters)}</h2>\n")

            names:pd.DataFrame = playerid_reverse_lookup(batters, key_type='mlbam')
            batters:list[tuple[int, str, str]] = list(zip(names['key_mlbam'], names['name_first'], names['name_last']))

            batters.sort(key=lambda d: d[2].lower())

            batter_info = []

            for batter in batters:
                woba = float(round(game_info.loc[game_info['batter'] == batter[0], 'estimated_woba_using_speedangle'].mean(), 3))
                xslg = float(round(game_info.loc[game_info['batter'] == batter[0], 'estimated_slg_using_speedangle'].mean(), 3))
                if pd.isna(woba):
                    woba = 0
                if pd.isna(xslg):
                    xslg = 0
                b_data = {
                    'id': batter[0],
                    'first_name': batter[1].capitalize(),
                    'last_name': batter[2].capitalize(),
                    'total_estimated_woba': float(round(game_info.loc[game_info['batter'] == batter[0], 'estimated_woba_using_speedangle'].sum(), 3)),
                    'total_estimated_slg': float(round(game_info.loc[game_info['batter'] == batter[0], 'estimated_slg_using_speedangle'].sum(), 3)),
                    'total_wops': float(round(game_info.loc[game_info['batter'] == batter[0], 'estimated_woba_using_speedangle'].sum(), 3)) +
                    float(round(game_info.loc[game_info['batter'] == batter[0], 'estimated_slg_using_speedangle'].sum(), 3)),
                    'home_team': game_info.loc[game_info['batter'] == batter[0], 'inning_topbot'].iloc[0] == 'Bot',
                    'woba':woba,
                    'xslg':xslg,
                    'wops': round(woba + xslg, 3)
                }
                batter_info.append(b_data)
                f.write('<section>\n')
                f.write(f"<h3>{b_data['first_name']} {b_data['last_name']}</h3>\n")
                f.write(f"<p>Team: {home_team if b_data['home_team'] else away_team}</p>\n")
                f.write(f"<ul><li>wOBA: {b_data['woba']}</li>\n")
                f.write(f"<li>xSLG: {b_data['xslg']}</li>\n")
                f.write(f"<li>wOPS: {b_data['wops']}</li>\n")
                f.write(f"<li>Estimated times reaching base: {b_data['total_estimated_woba']}</li>\n")
                f.write(f"<li>Estimated total bases: {b_data['total_estimated_slg']}</li>\n")
                f.write(f"<li>Total wOPS: {b_data['total_wops']}</li></ul>\n")
                f.write('</section>\n')

            home_info = []
            away_info = []
            for batter in batter_info:
                if batter['home_team']:
                    home_info.append(batter)
                else:
                    away_info.append(batter)

            def write_team_info(team_info:list, home_away:bool) -> None:
                team_name = home_team if home_away else away_team
                f.write(f"<h1>{team_name} Team Info</h1>\n")
                f.write(f"<ul><li>Team wOBA: {round(sum(batter['woba'] for batter in team_info) / len(team_info), 3)}</li>\n")
                f.write(f"<li>Team xSLG: {round(sum(batter['xslg'] for batter in team_info) / len(team_info), 3)}</li>\n")
                f.write(f"<li>Team wOPS: {round(sum(batter['wops'] for batter in team_info) / len(team_info), 3)}</li>\n")
                f.write(f"<li>Estimated times reaching base: {sum(batter['total_estimated_woba'] for batter in team_info)}</li>\n")
                f.write(f"<li>Estimated bases: {sum(batter['total_estimated_slg'] for batter in team_info)}</li></ul>\n")

            write_team_info(home_info, True)
            write_team_info(away_info, False)

            f.write('<h1>Game Analysis</h1>\n')
            winometer = sum(batter['total_estimated_slg'] for batter in home_info) / (sum(batter['total_estimated_slg'] for batter in home_info) + sum(batter['total_estimated_slg'] for batter in away_info))
            f.write(f"<p>{home_team} Deserve-to-Win-O-Meter: {round(winometer, 4) * 100}%</p>\n")
            f.write(f"<p>{away_team} Deserve-to-Win-O-Meter: {round(1 - winometer, 4) * 100}%</p>\n")
            f.write(f'<h3>{home_team if winometer >= 0.5 else away_team} deserved to win this game</h3>\n')

            def write_current_plot_as_figure(title:str) -> None:
                buffer = BytesIO()
                plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
                buffer.seek(0)
                image_b64 = base64.b64encode(buffer.read()).decode('ascii')
                buffer.close()
                f.write('<figure>\n')
                f.write(
                    f'<img src="data:image/png;base64,{image_b64}" alt="{title}" style="max-width: 100%; height: auto;"/>\n'
                )
                f.write('</figure>\n')
                plt.close()

            f.write('<h1>Graphs</h1>\n')
            f.write('<h2>Averages</h2>\n')

            #Averages Graphs

            #wOBA graph
            sorted_batters = sorted(batter_info, key=lambda b: b['woba'])
            categories = [b['last_name'] for b in sorted_batters]
            values = [b['woba'] for b in sorted_batters]
            colors = ['blue' if b['home_team'] else 'red' for b in sorted_batters]

            plt.figure(figsize=(8, max(4, len(categories) * 0.4)))
            bars = plt.barh(categories, values, color=colors)
            plt.xlabel('wOBA')
            plt.ylabel('Player')
            plt.title('wOBA')
            plt.gca().invert_yaxis()
            for bar, v in zip(bars, values):
                plt.text(bar.get_width() + (max(values) if values else 0) * 0.01, bar.get_y() + bar.get_height() / 2, f'{v:.3f}', va='center')
            plt.tight_layout()
            write_current_plot_as_figure('Average wOBA')

            #xSLG graph
            sorted_batters = sorted(batter_info, key=lambda b: b['xslg'])
            categories = [b['last_name'] for b in sorted_batters]
            values = [b['xslg'] for b in sorted_batters]
            colors = ['blue' if b['home_team'] else 'red' for b in sorted_batters]

            plt.figure(figsize=(8, max(4, len(categories) * 0.4)))
            bars = plt.barh(categories, values, color=colors)
            plt.xlabel('xSLG')
            plt.ylabel('Player')
            plt.title('xSLG')
            plt.gca().invert_yaxis()
            for bar, v in zip(bars, values):
                plt.text(bar.get_width() + (max(values) if values else 0) * 0.01, bar.get_y() + bar.get_height() / 2, f'{v:.3f}', va='center')
            plt.tight_layout()
            write_current_plot_as_figure('Average xSLG')

            #wOPS graph
            sorted_batters = sorted(batter_info, key=lambda b: b['wops'])
            categories = [b['last_name'] for b in sorted_batters]
            values = [b['wops'] for b in sorted_batters]
            colors = ['blue' if b['home_team'] else 'red' for b in sorted_batters]
            plt.figure(figsize=(8, max(4, len(categories) * 0.4)))
            bars = plt.barh(categories, values, color=colors)
            plt.xlabel('wOPS')
            plt.ylabel('Player')
            plt.title('wOPS')
            plt.gca().invert_yaxis()
            for bar, v in zip(bars, values):
                plt.text(bar.get_width() + (max(values) if values else 0) * 0.01, bar.get_y() + bar.get_height() / 2, f'{v:.3f}', va='center')
            plt.tight_layout()
            write_current_plot_as_figure('Average wOPS')

            #Graphs for Totals
            f.write('<h2>Totals</h2>\n')

            #wOBA graph
            sorted_batters = sorted(batter_info, key=lambda b: b['total_estimated_woba'])
            categories = [b['last_name'] for b in sorted_batters]
            values = [b['total_estimated_woba'] for b in sorted_batters]
            colors = ['blue' if b['home_team'] else 'red' for b in sorted_batters]

            plt.figure(figsize=(8, max(4, len(categories) * 0.4)))
            bars = plt.barh(categories, values, color=colors)
            plt.xlabel('wOBA')
            plt.ylabel('Player')
            plt.title('Total Game wOBA')
            plt.gca().invert_yaxis()
            for bar, v in zip(bars, values):
                plt.text(bar.get_width() + (max(values) if values else 0) * 0.01, bar.get_y() + bar.get_height() / 2, f'{v:.3f}', va='center')
            plt.tight_layout()
            write_current_plot_as_figure('Total Game wOBA')

            #xSLG graph
            sorted_batters = sorted(batter_info, key=lambda b: b['total_estimated_slg'])
            categories = [b['last_name'] for b in sorted_batters]
            values = [b['total_estimated_slg'] for b in sorted_batters]
            colors = ['blue' if b['home_team'] else 'red' for b in sorted_batters]

            plt.figure(figsize=(8, max(4, len(categories) * 0.4)))
            bars = plt.barh(categories, values, color=colors)
            plt.xlabel('xSLG')
            plt.ylabel('Player')
            plt.title('Total Game xSLG')
            plt.gca().invert_yaxis()
            for bar, v in zip(bars, values):
                plt.text(bar.get_width() + (max(values) if values else 0) * 0.01, bar.get_y() + bar.get_height() / 2, f'{v:.3f}', va='center')
            plt.tight_layout()
            write_current_plot_as_figure('Total Game xSLG')

            #wOPS graph
            sorted_batters = sorted(batter_info, key=lambda b: b['total_wops'])
            categories = [b['last_name'] for b in sorted_batters]
            values = [b['total_wops'] for b in sorted_batters]
            colors = ['blue' if b['home_team'] else 'red' for b in sorted_batters]
            plt.figure(figsize=(8, max(4, len(categories) * 0.4)))
            bars = plt.barh(categories, values, color=colors)
            plt.xlabel('wOPS')
            plt.ylabel('Player')
            plt.title('Total Game wOPS')
            plt.gca().invert_yaxis()
            for bar, v in zip(bars, values):
                plt.text(bar.get_width() + (max(values) if values else 0) * 0.01, bar.get_y() + bar.get_height() / 2, f'{v:.3f}', va='center')
            plt.tight_layout()
            write_current_plot_as_figure('Total Game wOPS')
            
            f.write('</body></html>')
        except Exception as e:
            raise e
    report_path = Path('report.html').resolve()
    webbrowser.open_new_tab(report_path.as_uri())
    print(f"Report generated and opened in browser: {report_path}")