import pandas as pd

data = pd.read_csv("../income_gini.tsv", sep='\t')

years = data["year"].unique()
years.sort()

f = open("years.txt", "w")
for elm in years:
    f.write(str(elm))
    f.write("\n")
f.close()
