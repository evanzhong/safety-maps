import location_data

loc_df = location_data.get_location_data()
loc_df.to_pickle('freeways_and_buildings_removed_location_data.pkl')