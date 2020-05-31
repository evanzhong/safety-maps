import location_data

loc_df = location_data.get_location_data()
loc_df.to_pickle('new_bigger_location_data.pkl')