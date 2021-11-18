#!/usr/bin/env python
# coding: utf-8

# In[145]:


# Usage:
# This Python Notebook takes data from a real-time Kanda weather balloon launch CSV file and transforms it into the same
#   variables used as input into the ML model trained with IGRA data.
#
# The main goals are performed:
#   1. Removal of "ground" based observations
#   2. Calculation of lat/lon points into U and V wind components
#   3. Reformat CSV data into same DF format used as input into ML model.


# In[146]:


import pandas as pd
import numpy as np
import sys
from datetime import datetime, timedelta

pd.set_option('display.max_rows', None)


# In[147]:


import math

def haversine(coord1, coord2):

    R = 6372800  # Earth radius in meters

    lat1, lon1 = coord1
    lat2, lon2 = coord2

    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi       = math.radians(lat2 - lat1)
    dlambda    = math.radians(lon2 - lon1)

    a = math.sin(dphi/2)**2 +         math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2

    return 2*R*math.atan2(math.sqrt(a), math.sqrt(1 - a))


#https://www.movable-type.co.uk/scripts/latlong.html

def direction(coord1, coord2):

    lat1, lon1 = coord1
    lat2, lon2 = coord2

    phi1, phi2 = math.radians(lat1), math.radians(lat2)

    lambda1, lambda2 = math.radians(lon1), math.radians(lon2);


    y = math.sin(lambda2 - lambda1) * math.cos(phi2);
    x = math.cos(phi1)*math.sin(phi2) - math.sin(phi1)*math.cos(phi2)*math.cos(lambda2 - lambda1);

    theta = math.atan2(y, x); # radians

    return theta


def wind_spd(coord1, coord2, time_delta_s):
    # Returns wind speed

    distance = haversine(coord1, coord2);
    return distance / time_delta_s; # m/s



def wind_direction(coord1, coord2):
    # Returns direction that wind is coming from
    
    wind_dir = direction(coord1, coord2);
    
    # Return direction in degrees where wind is coming FROM
    #  ... To get where wind is HEADED, instead use (math.degrees(dir) + 360) % 360

    return (math.degrees(wind_dir) +180) % 360;


# In[148]:


df=pd.read_csv(sys.argv[1])
df


# First we remove all datapoints located on the ground. 
# 
# These can be defined as any points with elevation2_m in the vacinity of 0-2 meters or close to 65535. The 65535 number is just an overflow value produced when negative values accidentally try to render as uint16 datatypes on the blockchain.

# In[149]:


# Remove any values located on the ground
print(np.iinfo(np.uint16).max)
df = df[ (df['elevation2_m'] >= 3) & (df['elevation2_m'] < (np.iinfo(np.uint16).max - 3)) ]
df


# In[150]:


# Here, we'll create a new pandas Dataframe resembling the relevant information from the CSV file.
#
# This new DF can be used as input into the ML model.

# Define function to convert unix timestamp to 12UTC datetime
def unixtime_to_launchtime(unix_time):
    
    timestamp_full = datetime.fromtimestamp( unix_time );
    
    # Get amount of time passed since 12UTC
    delta = timedelta( 
        hours=timestamp_full.hour - 12 , 
        minutes=timestamp_full.minute ,
        seconds=timestamp_full.second)
    
    # Return the difference.
    return timestamp_full - delta
    

# Create a new df frame that resembles model input
df_model = pd.DataFrame({'datetime': df["unix_time_s"].apply( lambda x: unixtime_to_launchtime(x) ),
                         'pressure': df["pressure_hpa"],
                         'temperature': df["temperature_c"],
                         'relativeHumidity': df["humidity_percent"]});
df_model


# We convert latitude and longitude measured from the GPS receiver into wind speed and direction, and then add those columns to our new dataframe.

# In[151]:


# Define arrays to store U_wind and V_wind
U_wind = [];
V_wind = []

s_time = df['unix_time_s'].iloc[0];
end_time = df['unix_time_s'].iloc[-1];

# Calculate the U and V wind, given the latitude and longitude values reported by the GPS
#
# The reasoning here is that the balloon's location is directly proportional to the wind speed
#    in non-extreme wind shear conditions.
#
#   Theoretically, we would use the "flags" variable here to see if the GPS was accurate enough to use a smaller window of time
#      like 30 seconds instead.
#   For simplicity, we'll just take the 1-minute average wind.

# Loop over each observation
for ind in df.index:
    
    time = df['unix_time_s'][ind];
    
    # If too close to beginning or end of file
    if ( time - s_time < 30 or end_time - time < 30 ):
        U_wind.append(np.nan);
        V_wind.append(np.nan);
        continue;
    
    # Get starting grid point by looking back in time 30 seconds
    counter1 = 0;
    while ( (df['unix_time_s'][ind] - df['unix_time_s'][ind-counter1]) < 30 ):
        counter1 = counter1 + 1;
    lat_1 = df['latitude_deg'][ind-counter1];
    lon_1 = df['longitude_deg'][ind-counter1];
    
    
    # Get end grid point by looking forward in time 30 seconds
    counter2 = 0;
    while ( (df['unix_time_s'][ind+counter2] - df['unix_time_s'][ind] ) < 30 ):
        counter2 = counter2 + 1;
    lat_2 = df['latitude_deg'][ind+counter2];
    lon_2 = df['longitude_deg'][ind+counter2];
    
    # Get time difference
    dt = df['unix_time_s'][ind+counter2] - df['unix_time_s'][ind-counter1];
    
    # Calculate U and V wind (essentially wind speed in x and y direction)
    u_wind = wind_spd( [lat_1, lon_1] , [lat_1, lon_2], dt);
    if ( lon_2 < lon_1 ):
        u_wind = - u_wind;
    v_wind = wind_spd( [lat_1, lon_1] , [lat_2, lon_1], dt);
    if( lat_2 < lat_1 ):
        v_wind = - v_wind;
        
    U_wind.append(u_wind);
    V_wind.append(v_wind);
    
# Store the U and V wind into new columns
df_model["wind_U_component"] = U_wind;
df_model["wind_V_component"] = V_wind;

# NaNs at the beginning of the launch are typical. Not enough time has elapsed to get
#    an accurate reading on speed and direction
df = df_model

print(df)

    


# Next we will derive atmospheric variables from the single launch, just like we would for IGRA2

# After that, we can process it through our forecasting notebook(s)

# In[ ]:




