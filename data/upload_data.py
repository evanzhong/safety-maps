#!/usr/bin/env python3                                                                                                     

import pandas as pd 
import pymongo
from pymongo import MongoClient
import ssl

#data = pd.read_pickle('./pickle_files/May20_data.pkl')

data = pd.read_pickle('./pickle_files/Jun1_data_merged_removed_areas_buildings.pkl')

#connect to the Mongo client and bypasse SSL certificate requirements
client = MongoClient("mongodb+srv://daviddeng8:safetymaps@crimedata-pebxn.mongodb.net/test?retryWrites=true&w=majority", ssl=True, ssl_cert_reqs=ssl.CERT_NONE)

#creates? or maybe just accesses the database 
db = client['data']

#creates collection from the database 
crime_data = db["no_freeways_bigger_and_badder_crime_data"]

#converts dataframe into a dictionary
data_dict = data.to_dict(orient='records')

#uploads
crime_data.insert_many(data_dict)