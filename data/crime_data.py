#!/usr/bin/env python3                                                                                                     

# make sure to install these packages before running:                                                                     
# pip install pandas                                                                                                      
# pip install sodapy                                                                                                      

import pandas as pd
from sodapy import Socrata

# Unauthenticated client only works with public data sets. Note 'None'                                                    
# in place of application token, and no username or password:                                                             
client = Socrata("data.lacity.org", None)

# Example authenticated client (needed for non-public datasets):                                                          
# client = Socrata(data.lacity.org,                                                                                       
#                  MyAppToken,                                                                                            
#                  userame="user@example.com",                                                                            
#                  password="AFakePassword")                                                                              

#function by default will return 100 elements of the crime data, can pass in your own value in as a parameter
#note: 2114179 is the maximum number to extract 
def get_crime_data(num=1000):
    #results are returned as a JSON from the API and then converted to a list of dictionaries by sodapy
    results = client.get("63jg-8b9z", limit=num)

    #convert to dataframe
    results_df = pd.DataFrame.from_records(results)
    return results_df
                                                                                              