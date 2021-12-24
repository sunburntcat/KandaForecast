const HyperionSocketClient = require('@eosrio/hyperion-stream-client').default;
const fetch = require('node-fetch');

const https = require("https");

const history_endpoint = 'https://telos.caleos.io';

const client_names = [
    'https://telos.caleos.io',
    'https://telos.eosphere.io',
    'http://api.kainosbp.com'
];

async function listen_for_actions( func, contract, actionName)
{
    let client_found = false;
    let clients = [];

    // Initialize all possible clients
    for (let i in client_names) {
        let client_name = client_names[i];
        clients.push(new HyperionSocketClient(client_name, {fetch: fetch, async: false}));
    }

    for (let i in clients)
    {
        let client = clients[i];

        // Callback that sets what to do if the client successfully connects
        client.onConnect = () => {
            // Stream actions using first client that is able to connect
            if ( !client_found )
            {
                console.log("Choosing client " + client.socketURL);
                client.streamActions({
                    contract: contract,
                    action: actionName,
                    account: '',
                    start_from: 0,
                    read_until: 0,
                });
                console.log("Listening to "+actionName+" action on contract "+contract+" ...");
                client_found = true;
            } else {
                // Disconnect subsequent connections
                let tmp = console.log;
                console.log = function() {} // suppress annoying output of disconnect function
                client.disconnect();
                console.log = tmp;
            }
        }

        // Set the async function passed by the user
        client.onData = async (data, ack) => {
            let kill_sig = await func(data, ack);

            // Kill the connection if the passed async function requests it
            if (kill_sig) {
                // Print disconnecting time

                client.disconnect();
            }
        };

        // Attempt client connection
        client.connect();

    } // end for loop

}

let getTransaction = function (trx_id) {
    let url = history_endpoint + "/v2/history/get_transaction?id=" + trx_id;
    return new Promise(function (resolve) {
        https.get(url, (resp) => {
            let data = '';

            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                resolve(JSON.parse(data));
            });
        });

    })
};

let getActions = function (account, actionName, start_time) {

    let url = history_endpoint + "/v2/history/get_actions?"
        +"account="+account
        +"&act.name="+actionName
        +"&after="+start_time
        +"&limit=1000"; // Note that 1000 is the max allowable limit by the server

    return new Promise(function (resolve) {
        https.get(url, (resp) => {
            let data = '';

            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                resolve(JSON.parse(data));
            });
        });

    })
};

let checkUpdateAuth = function (device, time) {
    let url = history_endpoint + "/v2/history/get_actions?account="+device+"&after="+time+"&act.name=updateauth";
    return new Promise(function (resolve) {
        https.get(url, (resp) => {
            let data = '';

            // A chunk of data has been recieved.
            resp.on('data', (chunk) => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                resolve(JSON.parse(data));
            });
        });

    })
};

exports.listen_for_actions = listen_for_actions;
exports.getTransaction = getTransaction;
exports.getActions = getActions;
exports.checkUpdateAuth = checkUpdateAuth;
