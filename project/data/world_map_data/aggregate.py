#!/usr/bin/env python3

#Aggregate all csv by year
#Needs to run to_dates_csv.py before

import pandas as pd

data = pd.DataFrame()

years_file = open("years.txt", "r")
for year in years_file:
    data = data.append(pd.read_csv("./dates_csv/data_map" + str(int(year)) + ".csv"))

years_file.close()

data.to_csv("agg_dates_data.csv", encoding='utf-8', index=False)
