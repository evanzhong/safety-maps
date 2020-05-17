#!/usr/bin/env python3                                                                                                     

'''
NOTE: currently this is set to my (David's) local Postgres, where the OSM data is stored in.
This script provides a way of accessing that data as long as it's present in a database called "osm" in Postgres.
Make sure that you have the module psycopg2 installed.
If you're having some problems on Mac, try adding the line "export LIBRARY_PATH=$LIBRARY_PATH:/usr/local/opt/openssl/lib/" to your ~/.zshrc file. 
Store username and password for database account as your own environment variables. 
'''

import psycopg2
import pandas as pd 
import types
import os 

try:
    #create a connection with the Postgres database 
    connection = psycopg2.connect(user = os.environ.get("DB_USER"), password = os.environ.get("DB_PASS"), host = "localhost", port = 5432, database = "osm")

    #cursor object allows us to use python to execute Postgres commands 
    cursor = connection.cursor()

    #executes a database query
    #cursor.execute("""SELECT * FROM planet_osm_ways""")

    #currently fetches just the result query result, in the form of a tuple
    #results = cursor.fetchone()

    #prints out the query result 
    #print (results)

    print ("connected")
    
#catch errors
except (Exception, psycopg2.Error) as error :
    print ("Error while connecting to PostgreSQL", error)

#function to create dataframes from cursor 
def create_dataframe(query, database=connection):
    #query should be a SQL query, pandas takes care of the dataframe transformation
    return pd.read_sql_query(query, database)

ways_query = "SELECT * FROM planet_osm_ways"
ways_df = create_dataframe(ways_query)

print (ways_df.shape)

nodes_query = "SELECT * FROM planet_osm_nodes"
nodes_df = create_dataframe(nodes_query)

print (nodes_df.shape)

#Series object that contains all the metainformation about the way, including the na,e which is what we're after
names_in_way = ways_df['tags']

#checking the type of the resulting object (it's a series)
#print (names_in_way, type(names_in_way))

#print (names_in_way[0])

#for i in range (len(names_in_way[0])):
#    if names_in_way[0][i] == 'name':
#        print (names_in_way[0][i+1])
#        break


#list to hold all the street names
street_names = [] 

#loop through all the ways
for item in names_in_way.iteritems():
    #array should be the second element of the tuple returned by iteritems, which is what arr is set to
    arr = item[1]

    #checks that there exists an array to iterate through
    if isinstance(arr, list) == False:
        street_names.append(None)
        continue
    #loop through the elements of this array to gather the name
    for i in range (len(arr)):
        #since the name of the street always follows after 'name' in the list, we add the element after name to the list and break the loop
        if arr[i] == 'name':
            street_names.append(arr[i + 1])
            break

        #append none if there is no name (the way isn't a street)
        if i == len(arr) - 1:
            street_names.append(None)

street_names = pd.Series(street_names)        

#append the names to the ways dataframe
ways_df['name'] = street_names

#ditch ways without a name, since they're clearly not streets
ways_df = ways_df.dropna()
print (ways_df)

#closes all connections 
cursor.close()
connection.close()
print ("closed")