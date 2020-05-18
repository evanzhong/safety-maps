#!/usr/bin/env python3                                                                                                     

import pandas as pd 
import crime_data   
import location_data 

#might need to split this up and run each pickling individually if lacking ram

#the maximum number of crime data points we can query

max_crime_elems = 2114179

#save the dataframes to pickle files for easier access

#PICKLING CRIME DATA 
crime_df = crime_data.get_crime_data(max_crime_elems)
crime_df.to_pickle('crime_data.pkl')

#keep only the last 200000 cases
cleaned_crime_df = crime_data.tail(200000)

#keep only the coordinates and the descriptions 
lat = cleaned_crime_df['lat']
lon = cleaned_crime_df['lon']
description = cleaned_crime_df['crm_cd_desc']
cleaned_crime_data = pd.concat([lat, lon, description], axis=1)
cleaned_crime_data.to_pickle('cleaned_crime_data.pkl')

#PICKLING LOCATION DATA 
loc_df = location_data.get_location_data()
loc_df.to_pickle('location_data.pkl')

