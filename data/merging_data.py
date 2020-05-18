#!/usr/bin/env python3                                                                                                     

import pandas as pd   
import os
from sklearn.neighbors import BallTree
from sklearn.preprocessing import MinMaxScaler
import numpy as np

#load all data files 
loc_data = pd.read_pickle("./pickle_files/location_data.pkl")
cleaned_crime_data = pd.read_pickle("./pickle_files/cleaned_crime_data.pkl")

#resets index of crime data
final_crime_data = cleaned_crime_data.reset_index()

#drops duplicated streets: need to check if this is allowed, and resets the index 
final_loc_data = loc_data.drop_duplicates('name').reset_index()

#grabs only the coordinates from the final location data
loc_coords = final_loc_data['coords']

print (loc_coords)
print (final_loc_data)

#print (final_crime_data)

#print (final_crime_data['lat'].apply(lambda lat: float(lat) * np.pi / 180))

### implement K-nearest neighbors algorithm to get crime coefficient for points

def get_nearest(input_points, crime_points, k_neighbors=10):
    '''calculate the nearest neighbors: input_points being the coordinates to check, 
    current_points being the points already on the map, k_neighbors being the number of neighbors to account for
    '''

    #make a tree from the crime points to improve speed of computation
    tree = BallTree(crime_points, leaf_size=15, metric="haversine")

    #get the index of the returned values as well as the distance to those values 
    distances, indices = tree.query(input_points, k=k_neighbors)

    #doesn't seem like the transpose is necessary?
    #distances = distances.transpose()
    indices = indices.transpose()

    #note here that distances is returned in radians, need to change back to distance in meters 
    return distances

    
def nearest_neighbor(input_points, crime_points):
    ''' for every single point in input_points, return the distance to the nearest crime_points
        thus, at the end, the length of the input_points array should be the same as the returned array
    '''

    #convert coordinates to radians in a numpy array

    #crime data conversions
    crime_radians_lat = crime_points['lat'].apply(lambda lat: float(lat) * np.pi / 180).to_list()
    crime_radians_lon = crime_points['lon'].apply(lambda lon: float(lon) * np.pi / 180).to_list()

    #turning results into a tuple of lat and lon
    crime_radians_coords = list(map(lambda x, y: (x, y), crime_radians_lat, crime_radians_lon))
    crime_radians_coords = np.array(crime_radians_coords)

    #street data conversions
    input_radians_coords = []

    #goes through each list of coordinates and converts them into radians
    for coord in input_points['coords'].iteritems():
        coord_list = coord[1]
        converted = [(elem[0] * np.pi / 180, elem[1] * np.pi / 180) for elem in coord_list]
        input_radians_coords.append(converted)

    input_radians_coords = np.array(input_radians_coords)

    #currently testing with just the first coordinate in each street segment
    test_input = [input_radians_coords[i][0] for i in range(len(input_radians_coords))]
    test_input = np.array(test_input)
    
    dist = get_nearest(test_input, crime_radians_coords)

    #converts 10 nearest neighbors into an average distance from crime 
    avg_dist = np.array([np.mean(dist[i]) for i in range(len(dist))])

    #print (avg_dist)

    return avg_dist


scaler = MinMaxScaler()
dist = nearest_neighbor(final_loc_data, final_crime_data)
scaled_dist = scaler.fit_transform(dist.reshape(-1, 1))
final_loc_data['dist_from_crime'] = scaled_dist

print (final_loc_data)


