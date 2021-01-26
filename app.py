import json
from flask import Flask, render_template, request, redirect, Response, jsonify
import pandas as pd
import numpy as np
from util import raw_data, prepare_for_client, continuous_features
from sampling import (random_sampling, stratified_sampling)
from sklearn.decomposition import PCA
from sklearn import manifold
from sklearn.metrics import pairwise_distances
from sklearn import preprocessing
from sklearn.preprocessing import MinMaxScaler

import scipy.spatial.distance

app = Flask(__name__)


@app.route("/", methods=['POST', 'GET'])
def index():
    global df
    chart_data = df.to_dict(orient='records')
    chart_data = json.dumps(chart_data, indent=2)
    data = {'chart_data': chart_data}
    return render_template("index.html", data=data)


@app.route("/data", methods=['GET'])
def get_data():
    global df
    rs_df = random_sampling(df)
    print(len(rs_df))
    rs_df = stratified_sampling(df)
    print(len(rs_df))
    print(calculate_pca(df))
    chart_data = df.to_dict(orient='records')
    chart_data = json.dumps(chart_data, indent=2)
    data = {'chart_data': chart_data}
    return data


@app.route("/screeplot", methods=['GET'])
def screeplot():
    global df
    sample = request.args.get('sample')
    sampled_df = df
    if sample == 'random':
        sampled_df = random_sampling(df)
    elif sample == 'stratified':
        ssd_arr, sampled_df = stratified_sampling(df)
    per_var, t3_attrs, t2_pcs = calculate_pca(sampled_df)
    sp_df = pd.DataFrame(
        {'label': ['PC' + str(x) for x in range(1, 16)],
         'variance_ratio': per_var.tolist()[0:15],
         'variance_ratio_cumsum': np.cumsum(per_var.tolist()[0:15]).tolist()})
    data = prepare_for_client(sp_df)
    return data


@app.route("/pcaplot", methods=['GET'])
def pcaplot():
    global df
    sample = request.args.get('sample')
    sampled_df = df
    if sample == 'random':
        sampled_df = random_sampling(df)
    elif sample == 'stratified':
        ssd_arr, sampled_df = stratified_sampling(df)
    X = sampled_df
    pca_data = PCA(n_components=2)
    pca_data.fit(X)
    X = pca_data.transform(X)
    sp_df = pd.DataFrame(X)
    if sample == 'stratified':
        sp_df['clusterid'] = np.nan
        x = 0
        for index, row in sampled_df.iterrows():
            sp_df['clusterid'][x] = row['Label']
            x = x + 1
    data = prepare_for_client(sp_df)
    return data


@app.route("/mdsplot", methods=['GET'])
def mds():
    global df
    sample = request.args.get('sample')
    metric = request.args.get('metric')
    print('metric', metric)
    if metric == 'correlation':
        df[df.columns] = preprocessing.scale(df)
    sampled_df = df
    if sample == 'random':
        sampled_df = random_sampling(sampled_df)
    elif sample == 'stratified':
        ssd_arr, sampled_df = stratified_sampling(sampled_df)
    mds_data = manifold.MDS(n_components=2, dissimilarity='precomputed')
    similarity = pairwise_distances(sampled_df, metric=metric)
    X = mds_data.fit_transform(similarity)
    mds_df = pd.DataFrame(X)
    if sample == 'stratified':
        mds_df['clusterid'] = np.nan
        x = 0
        for index, row in sampled_df.iterrows():
            mds_df['clusterid'][x] = row['Label']
            x = x + 1
    data = prepare_for_client(mds_df)
    return data


@app.route("/scatterplotMatrix", methods=['GET'])
def scatterplot_matrix():
    global df
    sample = request.args.get('sample')
    spm_df = df
    if sample == 'unsampled':
        sampled_df = df
        t3 = t3_highest_pca_loadings(sampled_df)
        spm_df = sampled_df[df.columns[t3]]
    elif sample == 'random':
        sampled_df = df.sample(frac = 0.25)
        t3 = t3_highest_pca_loadings(sampled_df)
        spm_df = sampled_df[df.columns[t3]]
    elif sample == 'stratified':
        ssd_arr, sampled_df = stratified_sampling(df)
        sampled_df_ = sampled_df.copy()
        del sampled_df_['Label']
        t3 = t3_highest_pca_loadings(sampled_df_)
        spm_df = sampled_df[df.columns[t3]]
        spm_df['clusterid'] = np.nan
        for i, row in sampled_df.iterrows():
            spm_df['clusterid'][i] = row['Label']

    data = prepare_for_client(spm_df)
    return data


def calculate_pca(data):
    pca = PCA()
    pca.fit(data)
    pca_results = np.round(pca.explained_variance_ratio_*100, decimals=1)
    loadings = np.sum(np.square(pca.components_[:3]), axis=0)
    indices_of_top_3_attributes = loadings.argsort()[-3:][::-1]
    top_two_components = pca.components_[:2]
    return pca_results, indices_of_top_3_attributes, top_two_components


def t3_highest_pca_loadings(data):
    if 'Label' in data:
        del data['Label']
    pca = PCA(n_components=3)  # intrinsic dimensionality is 3
    pca.fit_transform(data)
    loadings = pca.components_
    loadings_df = pd.DataFrame(loadings)
    sum_of_sq_loadings = []
    for i in range(0, len(loadings_df.columns)):
        sq_arr = []
        sum = 0
        sqrt_sums = 0
        for j in range(0, len(loadings_df)):
            sq = np.square(loadings_df[i][j])
            sq_arr.append(sq)
        sum = np.sum(sq_arr)
        sqrt_sums = np.sqrt(sum)
        sum_of_sq_loadings.append(sqrt_sums)
    loadings_ = pd.DataFrame(np.transpose(loadings))
    loadings_['sum_of_squares'] = sum_of_sq_loadings
    loadings_['features'] = data.columns
    highest_loaded_attributes = sorted(range(len(sum_of_sq_loadings)), key=lambda k: sum_of_sq_loadings[k], reverse=True)[:3]
    print('PCA LOADINGS VS ATTRIBUTES')
    print(loadings_)
    print('Highest loaded attributes are')
    print(data.columns[highest_loaded_attributes])
    return highest_loaded_attributes


@app.route("/scatter_plt_test", methods=['GET'])
def scatter_plt_test():
    global le_df
    criteria = ['Schooling', 'Life expectancy ']
    selected_countries = ['Afghanistan', 'India', 'Algeria', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan']
    sc_plt_df = le_df[le_df['Country'].isin(selected_countries)][criteria]
    sc_plt_df.columns = ['X', 'Y']
    data = prepare_for_client(sc_plt_df)
    return data


if __name__ == "__main__":
    le_df = pd.read_csv('data/Life_Expectancy_Data.csv')
    df = raw_data()
    app.run(debug=True)
