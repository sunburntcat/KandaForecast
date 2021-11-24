const root_dir = '../../';

const radiosondes = require(root_dir + 'lib/eosio_radiosondes');
const listener = require(root_dir + 'lib/eosio_listeners');
const csv = require(root_dir + 'lib/radiosonde_csv_writer.js');

var spawn = require('child_process').spawn;

(async () => {

    let contract = 'ascensionacc';

    // Define function of what to do when new data is received.
    const func = async (data, ack) => {
        /*
        NOTE:
               When used with listen_eosio_table, this function must return false, if
                  the user would like to continue listening to the table
               If the incoming data meets your criteria to stop listening, then you
                  should return true.
         */

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
            let filename = "intermediate/" + launch_id + ".csv";
            await csv.data_to_csv( filename , launch );

            // Run python ML model using the CSV file
            console.log("Initiating python script, but not waiting.");

            // Python .py file created by running
            //     jupyter nbconvert --to python Kanda_Real-time_connector_script.ipynb
            // And then changing the csv file name to sys.argv[1] , which allows us to pass the
            //   filename to the python script
            let python = spawn('python3',['Kanda_Real-time_connector_script.py', filename]);

            // Request the connection be closed
            return true;

        } else {
            // Target level not yet reached so keep listening
            return false;
        }

    };

    await listener.watch_table( func, contract, "observations" );

})();

