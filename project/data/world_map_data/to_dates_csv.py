#!/usr/bin/env python3

#Create a csv for each year
#Save the csv in dates_csv folder

import subprocess

years_file = open("years.txt", "r")

for year in years_file:
    subprocess.call("./choose_date.py "+str(year), shell=True)

years_file.close()




