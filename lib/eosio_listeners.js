const HyperionSocketClient = require('@eosrio/hyperion-stream-client').default;
const fetch = require('node-fetch');

const client = new HyperionSocketClient('https://telos.caleos.io', {fetch, async: false});
//const client = new HyperionSocketClient('hadfdsf', {fetch, async: true});

async function watch_table( func, contract, table)
{

    client.onConnect = () => {
        client.streamDeltas({
            code: contract,
            table: table,
            scope: contract,
            payer: '',
            start_from: 0,
            read_until: 0,
        });

        console.log("Listening to "+table+" table on contract "+contract+" ...");
    }

    // Set the async function passed by the user
    client.onData = async (data, ack) => {
        let kill_sig = await func(data, ack);
        if (kill_sig) {
            client.disconnect();
        }
    };

    // Initiate the connection
    client.connect();

}

exports.watch_table = watch_table;
