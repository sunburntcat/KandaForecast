
const radiosonde = {
    "unix_time_s" : undefined,
    "pressure_hpa" : undefined,
    "temperature_c" : undefined,
    "dewPoint_c" : undefined,
    "humidity_percent" : undefined,
    "latitude_deg" : undefined,
    "longitude_deg" : undefined,
    "wind_direction_deg" : undefined,
    "wind_speed_mps" : undefined,
    "elevation_gps_m" : undefined,
    "elevation2_m" : undefined,
    "flags" : undefined
}

const radiosonde_meta = {
    "contract" : undefined,
    "launch_id" : undefined,
    "unix_time" : undefined,
    "miner" : undefined,
    "assistant" : undefined,
    "surf_pressure" : undefined,
    "level_reached" : undefined,
    "device_type" : undefined,
    "wxcondition" : undefined,
    "if_released" : undefined,
    "last_known_lat" : undefined,
    "last_known_lon" : undefined,
    "last_known_elev" : undefined,
    "wx12hrcondition" : undefined
}

const ground_sensor = {
    "unix_time_s" : undefined,
    "pressure_hpa" : undefined,
    "temperature_c" : undefined,
    "dewPoint_c" : undefined,
    "humidity_percent" : undefined,
    "wind_direction_deg" : undefined,
    "wind_speed_mps" : undefined,
    "rain_rate_1hr_mm" : undefined,
    "rain_rate_6hr_mm" : undefined,
    "rain_rate_24hr_mm" : undefined,
    "soil_moisture_vol" : undefined,
    "soil_temperature_c" : undefined,
    "flags" : undefined
}

exports.radiosonde = radiosonde;
exports.radiosonde_meta = radiosonde_meta;

exports.ground_sensor = ground_sensor;
