# 2019-wid

Extracts of the [World Inequality Database](https://wid.world/).

## How to view and interact with these visualizations:

* Make sure that the current directory is set to Information-Visualization-master. Run a web server, [python3 -m http.server], and at http://localhost:8000/project/viz/ you will find all the available visualizations. 

* http://localhost:8000/project/viz/2d_dot_space.html depicts a 2d dot space showing the evolution of the corresponding wealth and poverty for countries in different regions. Drag the top slider to change the year, and select which region you would like to hide/show at specifically by clicking on its colored rectangle in the legend. Mousing over a dot will tell you the source of that data point. To specifically track a certain country, click on the dot to make it black.

* http://localhost:8000/project/viz/Cumulated%20Income.html shows the cumulated income for the United States of America. In this mapping, you can drag the top bar to change the year.

* http://localhost:8000/project/viz/interactive_wm.html shows the Gini Index for different countries of the world, where the data was available. They color key in the bottom left corner indicates the Gini Index range, but by hovering over a country you can see the precise value. You can select year from the drop down menu in the top left corner.

## Content

* **data/** the data in [tsv](https://bl.ocks.org/mbostock/3305937).
	* **countries.tsv** country codes
	* **income_gini.tsv** [GINI index](https://en.wikipedia.org/wiki/Gini_coefficient) of income per country and year
	* **income_averages.tsv** income average per country and year (constant 2015 euro)
	* **income/** income share per country
	* **world_map_data/** files used for the world map visualization
	  * **choose_date.py** choose date with "python choose_date.py \<year\>"
	  * **data.csv** whole data related to gini index
	  * **data_map.csv** data related to gini index for the choosen year
* **viz/** sample visualisations
* **vendor/** vendorized d3 library

## Data structure

Income data table are given per country.
The attributes present in the tables are:

* **country** the country code
* **year** the year for the data
* **low** the lower bound of the population quantile (from 0. to 1.)
* **high** the upper bound of the population quantile (from 0. to 1.)
* **width** the width of the quntile (high-low)
* **share** the share of the total income captured by this [low, high] quantile
* **cumul** the cumulative share of the quantiles, i.e. the share of [0., high]