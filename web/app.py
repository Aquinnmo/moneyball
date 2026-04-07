from flask import Flask, render_template
from .utils.game_info import *
from pybaseball import statcast_single_game
import pandas as pd

app = Flask(__name__)

@app.route('/')
def welcome_page():
    games = get_yesterdays_games()
    return render_template("home.html", games=games)

@app.route('/game/<game_id>')
def game_report(game_id):
    details = get_single_game_details(game_id)
    return render_template("game_report.html", details=details)