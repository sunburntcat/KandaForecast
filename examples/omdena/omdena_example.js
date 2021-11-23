const data = require('./lib/eosio_radiosondes');
const csv = require("./lib/radiosonde_csv_writer.js");
const radiosondes = require("./lib/eosio_radiosondes");

(async () => {

    // This was a good launch out of Dallas "ascensiondal" that reached 335 hPa
    let launch_id = "yglsqhbocku2";

    // Get launch data
    let launch = await radiosondes.get_single_ascensionwx_launch( "ascensiondal", launch_id);

    // Store data as CSV file
    await csv.data_to_csv( "intermediate/" + launch_id + ".csv", launch );

})();

