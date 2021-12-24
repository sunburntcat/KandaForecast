const root_dir = '../../';

const history = require(root_dir + 'lib/eosio_history');

(async () => {

    let contract = 'dclimateiot4';

    // Define function of what to do when new data is received.
    const func = async (data, ack) => {
        /*
            This is a callback function that instructs nodejs what to do when data
            is added to an eosio table.
        NOTE:
            Note if you would like to stop listening to the blockchain when your data
            meets a certain criteria, return true on this function and the connection will be closed.
        */

        // Prints out the data submitted to the chain from the iot device.
        console.log("Timestamp: "+data.content.timestamp);
        console.log("Blockchain trx id: "+data.content.trx_id)
        console.log(data.content.act.data);
        console.log();

        // Here, dclimate can call a nodejs package that submits the data to IPFS
        //  e.g. https://js.ipfs.io/

    };

    // Begin actually watching the eosio blockchain table called "observations"
    await history.listen_for_actions( func, contract, "submitdata" );

})();

