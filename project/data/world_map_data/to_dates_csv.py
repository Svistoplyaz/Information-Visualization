#!/usr/bin/env python3

import pandas as pd
import subprocess

years_file = open("years.txt", "r")
years = []
data = pd.DataFrame()

for year in years_file:
    subprocess.call("./choose_date.py "+str(year), shell=True)
    years.append(year)

years_file.close()




