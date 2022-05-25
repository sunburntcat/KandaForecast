Pull IoT data from live weather balloon contracts using Hyperion

Data flow
- Listen for radiosonde to hit 500hPa using Hyperion websocket
- Query all datapoints from the launch with Hyperion query
- Send raw data to CSV file
- Call python script to pre-process the data 

Python Pre-Process
1. Choose which ML model is best (rain or flood prediciton, 300 or 500hpa version, wind speed included/not included)
2. Convert all the launch data into relevant ML-ingest format (wind instead of lat/lon, etc.)
3. Calculate any derived quantities
4. Interpolate/extrapolate the data to fit defined grid (sfc , 1000hpa, 950hpa, etc.)

Python Process
1. Call machine learning model with the data

Python Post-process
1. Give forecast percentage
2. Output to SQL file



**Prerequisites:**

- Python >= 3
- Nodejs

**Usage:**

$ npm install & node listen_and_forecast.js
