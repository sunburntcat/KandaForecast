const radiosondes = require('./lib/eosio_radiosondes');
const csv = require('./lib/radiosonde_csv_writer.js');

(async () => {

    let contract = 'ascensiondal';

    // Define function of what to do when new data is received.
    const func = async (data, ack) => {

        console.log(data);
        //let launch_id = data.content.data.launch_id;
        let launch_id = 'ocw1k5zzkwml';

        //if ( data.content.data.pressure_hpa < 500)
        //{

            // Get the launch information and data
            let launch = await radiosondes.get_single_ascensionwx_launch( contract, launch_id);

            // Write the data to CSV file
            csv.data_to_csv( "intermediate/" + launch_id + ".csv", launch );

            // Run python ML model using the CSV file

        //}
    };

    await radiosondes.listen_ascensionwx_once( func, contract );

})();

