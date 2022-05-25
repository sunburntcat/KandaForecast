Pull IoT data from live weather balloon contracts using Hyperion

Data flow
- Listen for datapoints on recent launch to be 15 minutes apart
- Query all datapoints from the launch with Hyperion query
- Send raw data to CSV file
- Call python script to pre-process the data 

Python Pre-Process
1. Convert all the  data into relevant ML-ingest format (wind instead of lat/lon, etc.)
2. Calculate any derived quantities
3. Choose which ML models are to be run (rain/flood, 300/500hpa, wind speed included/not included)
5. Interpolate the data to fit defined grid (sfc , 1000hpa, 950hpa, etc.)

Python Process
1. Call machine learning models with the data

Python Post-process
1. Give forecast percentage
2. Output to SQL file



**Prerequisites:**

- Python >= 3
- Nodejs

**Usage:**

$ npm install & node listen_and_forecast.js
