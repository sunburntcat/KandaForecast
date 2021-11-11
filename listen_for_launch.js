const radiosondes = require('./lib/eosio_radiosondes');
const csv = require('./lib/radiosonde_csv_writer.js');

(async () => {

    let contract = 'ascensionuyo';

    // Define function of what to do when new data is received.
    const func = async (data, ack) => {

        //let contract = data.content.data.contract; Ideally we want to know which contract it came from
        let launch_id = data.content.data.launch_id;
        let level = data.content.data.pressure_hpa;

        // Helpful to watch progress of balloon
        console.log(level);

        const target = 500;

        if ( level < target )
        {
            // Get the launch information and data
            console.log("Target level reached. Getting launch data...");
            let launch = await radiosondes.get_single_ascensionwx_launch( contract, launch_id);

            // Write the data to CSV file
            await csv.data_to_csv( "intermediate/" + launch_id + ".csv", launch );

            // Run python ML model using the CSV file
            console.log("Initiating python script, but not waiting.");

            // Request the connection be closed
            return true;

        } else {
            // Target level not yet reached so keep listening
            return false;
        }

    };

    await radiosondes.listen_ascensionwx_once( func, contract );

})();

