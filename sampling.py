import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt
import random
from util import raw_data


def stratified_sampling(data):
    np_arr = np.array(data)
    ssd_arr = []
    for i in range(2, 20):
        kmeans = KMeans(n_clusters=i)
        kmeans.fit(np_arr)
        ssd_arr.append(kmeans.inertia_)

    # fig = plt.figure()
    # ax = fig.add_subplot(111)
    # ax.plot(range(2, 20), ssd_arr, marker='o', markeredgecolor='r', color='b')
    # plt.grid(True)
    # plt.xlabel('Number of clusters')
    # plt.ylabel('Sum of Squared Errors (SSE)')
    # plt.title('Elbow plot for K-Means clustering')
    # plt.xticks(range(2, 20, 2))
    # plt.show()

    # clear elbow at k=3
    kmeans = KMeans(n_clusters=3)
    kmeans.fit(np_arr)
    data['Label'] = kmeans.labels_
    cluster_sizes = np.bincount(kmeans.labels_)
    stratified_sampling_results = pd.DataFrame(columns=data.columns)
    for i in range(3):
        cluster_size = cluster_sizes[i]
        cluster_records = data[data['Label'] == i]
        sample_size = int(cluster_size * 0.25)
        stratified_sampling_results = pd.concat(
            [stratified_sampling_results, cluster_records.iloc[random.sample(range(cluster_size), sample_size)]])
    return ssd_arr, stratified_sampling_results


def random_sampling(df):
    np_arr = np.array(df)
    sample_size = int(0.25 * len(np_arr))
    random_points = random.sample(range(len(np_arr)), sample_size)
    random_sample = np_arr[random_points]
    return random_sample

stratified_sampling(raw_data())