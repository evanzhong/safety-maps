#!/usr/bin/env python3                                                                                                     

import pandas as pd 
import crime_data   
import location_data 

#might need to split this up and run each pickling individually if lacking ram


#the maximum number of crime data points we can query
max_crime_elems = 2114179

#save the dataframes to pickle files for easier access 
crime_df = crime_data.get_crime_data(max_crime_elems)
crime_df.to_pickle('crime_data.pkl')

loc_df = location_data.get_location_data()
loc_df.to_pickle('location_data.pkl')
