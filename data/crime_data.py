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

# Returns limit number of results, returned as JSON from API / converted to Python list of                                             
# dictionaries by sodapy.                                                                                                 

#following line gets all the crime data
#results = client.get("63jg-8b9z", limit=2114179)

results = client.get("63jg-8b9z", limit=1000)

# Convert to pandas DataFrame                                                                                             
results_df = pd.DataFrame.from_records(results)

print (results_df)