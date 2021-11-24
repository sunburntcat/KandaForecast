const root_dir = '../../';

const listener = require(root_dir + 'lib/eosio_listeners');

(async () => {

    let contract = 'dclimateiot2';

    // Define function of what to do when new data is received.
    const func = async (data, ack) => {
        /*
        NOTE:
            When used with listen_eosio_table, this function should return false, if
                the user would like to continue listening to the table
            If the incoming data meets your criteria to stop listening, then you
                should return true and the listner object will close the websocket.
        */

        //let launch_id = data.content.data.launch_id;

        // Prints out the blockchain state change
        console.log(data.content.data);

        // Here, dclimate can call a nodejs package that submits the data to IPFS
        //  e.g. https://js.ipfs.io/

        return false;
    };

    await listener.watch_table( func, contract, "observations" );

})();

