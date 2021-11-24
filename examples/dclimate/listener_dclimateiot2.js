const root_dir = '../../';

const listener = require(root_dir + 'lib/eosio_listeners');

(async () => {

    let contract = 'dclimateiot2';

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
        console.log(data.content.data);

        // Here, dclimate can call a nodejs package that submits the data to IPFS
        //  e.g. https://js.ipfs.io/

    };

    // Begin actually watching the eosio blockchain table called "observations"
    await listener.watch_table( func, contract, "observations" );

})();

