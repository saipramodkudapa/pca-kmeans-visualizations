import numpy as np
import pandas as pd
import json


def continuous_features():
    return ['age', 'overall', 'potential', 'value', 'wage', 'skill_moves', 'international_reputation',
            'crossing', 'finishing', 'headingaccuracy', 'shortpassing', 'volleys', 'dribbling', 'curve',
            'fkaccuracy', 'longpassing', 'ballcontrol', 'acceleration', 'sprintspeed', 'agility',
            'reactions', 'balance', 'shotpower', 'jumping', 'stamina', 'strength', 'longshots', 'aggression',
            'interceptions', 'positioning', 'vision', 'penalties', 'composure', 'marking', 'standingtackle',
            'slidingtackle', 'gkdiving', 'gkhandling', 'release_clause']


def raw_data():
    df = pd.read_csv('data/fifa_player_attributes.csv')
    categorical_features = ['work_rate']
    df['wage'] = df['wage'].replace(np.nan, 'm0.0m').replace('€0', 'm0.0m').apply(lambda x: float(x[1:-1]))
    df['value'] = df['value'].replace(np.nan, 'm0.0m').replace('€0', 'm0.0m').apply(lambda x: x[1:-1])
    df['release_clause'] = df['release_clause'].replace(np.nan, 'm0.0m').replace('€0', 'm0.0m')\
        .apply(lambda x: float(x[1:-1]))
    for col in categorical_features:
        dummies = pd.get_dummies(df[col], prefix=col)
        df = pd.concat([df, dummies], axis=1)
        df.drop(col, axis=1, inplace=True)
    df.drop('name', axis=1, inplace=True)
    return df


def prepare_for_client(df):
    chart_data = df.to_dict(orient='records')
    chart_data = json.dumps(chart_data, indent=2)
    data = {'chart_data': chart_data}
    return data
