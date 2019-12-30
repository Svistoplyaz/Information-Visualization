import csv
import sys

if len(sys.argv) < 2:
    print("USE: python ./choose_date.py <year>")

else:
    year = sys.argv[1]
    flag = False
    lines = []

    with open("data.csv") as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=",")
        for line in csv_reader:
            if line[0] == year:
                flag = True
            elif line[0] == str(int(year)+1):
                flag = False
            else:
                if flag:
                    lines.append(line)


    with open("data_map.csv", 'w', newline='') as data_map_file:
        data_writer = csv.writer(data_map_file)
        data_writer.writerow(["name", "code", "gini"])
        for line in lines:
            data_writer.writerow(line)
