#!/usr/bin/env python3                                                                                                     

import pandas as pd   
import os
from sklearn.neighbors import BallTree
from sklearn.preprocessing import MinMaxScaler
import numpy as np

#load all data files 
#loc_data = pd.read_pickle("./pickle_files/location_data.pkl")
loc_data = pd.read_pickle("./pickle_files/freeways_and_buildings_removed_location_data.pkl")
cleaned_crime_data = pd.read_pickle("./pickle_files/cleaned_crime_data.pkl")

#resets index of crime data
final_crime_data = cleaned_crime_data.reset_index()

#drops duplicated streets: need to check if this is allowed, and resets the index 
#final_loc_data = loc_data.drop_duplicates('name').reset_index()
final_loc_data = loc_data

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

    n = 0

    #goes through each list of coordinates and converts them into radians
    for coord in input_points['coords'].iteritems():
        print (n)
        n = n + 1
        coord_list = coord[1]
        converted = [(elem[0] * np.pi / 180, elem[1] * np.pi / 180) for elem in coord_list]
        input_radians_coords.append(converted)

    input_radians_coords = np.array(input_radians_coords)

    #currently testing with just the first coordinate in each street segment
    test_input = [input_radians_coords[i][0] for i in range(len(input_radians_coords))]
    test_input = np.array(test_input)
    
    #get_nearest returns a list of lists of 10 distances from the nearest crimes from the locations in test_input
    #dist should have the same length as the number of streets in our input 
    dist = get_nearest(test_input, crime_radians_coords)
    print (len(dist))

    #converts 10 nearest neighbors into an average distance from crime 
    avg_dist = np.array([np.mean(dist[i]) for i in range(len(dist))])

    #calling the function to generate lists of values for the coordinates
    print (input_radians_coords[0])

    #list to hold a list of the average crime score for each point on a street segment 
    result_crime_coefficients = []

    n = 0

    #loop through and get comprehensive crime ratings for each geocoord
    for i in range(len(input_radians_coords)):
        print (n)
        n = n + 1
        temp = np.array(input_radians_coords[i])
        values = get_nearest(temp, crime_radians_coords)
        avg_values = [np.mean(values[i]) for i in range(len(values))]
        avg_values = np.array(avg_values)
        result_crime_coefficients.append(avg_values)

    #result_crime_coefficients = np.array(result_crime_coefficients)

    #print (avg_dist)
    #print (result_crime_coefficients)

    return avg_dist, result_crime_coefficients

#customScaler uses min and max values found through iterating through each result 
def customScaler(X, x_min, x_max):
    return ((X - x_min) / (x_max - x_min)) 

#scale the distances to be a value between 0 and 1, with 1 being the furthest away from crime and 0 being the closest 
scaler = MinMaxScaler()

#dist_total currently contains a numpy array of lists of crime coefficients
dist_single, dist_total = nearest_neighbor(final_loc_data, final_crime_data)
scaled_dist_single = scaler.fit_transform(dist_single.reshape(-1, 1))

#find the min and max values in dist_total
x_min = (np.min([np.min(arr) for arr in dist_total]))
x_max = (np.max([np.max(arr) for arr in dist_total]))

#scale using custom scaler
scaled_dist_total = [customScaler(arr, x_min, x_max).tolist() for arr in dist_total]

#add scaled results to dataframe
final_loc_data['dist_from_crime_single_val'] = scaled_dist_single
final_loc_data['dist_from_crime_all_vals'] = scaled_dist_total

#drop unnecessary columns 
#final_loc_data = final_loc_data.drop(['index'], axis=1)
print (final_loc_data)

final_loc_data.to_pickle("Jun1_data_merged_removed_areas_buildings.pkl")