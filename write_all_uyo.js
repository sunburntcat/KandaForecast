const data = require('./lib/eosio_radiosondes');
const csv = require('./lib/radiosonde_csv_writer.js');

(async () => {

    // Get all launches that went above 990hpa
    const launch_tmp = await data.get_wxballoons3t( 990, true );
    let launches = [];

    for (const launch of launch_tmp) {
        // Check if Emmanuel Patrick was the launcher
        if ( launch.miner === "empatoempato" || launch.miner === "empatoempata")
        {
            // Append to array
            launches.push(launch)
        }
    }

    // Get GPS-enabled launches
    const launch2 = await data.get_ascensionwx( 990, true, 'uyo' );

    // Write to CSV
    csv.data_to_csv( 'launches.csv', launches.concat(launch2) );

})();
