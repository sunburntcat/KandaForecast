const HyperionSocketClient = require('@eosrio/hyperion-stream-client').default;
const { JsonRpc } = require('eosjs');

const fetch = require('node-fetch');

// Init Telos mainnet
const rpc = new JsonRpc('https://kandaweather-mainnet.ddns.net',{fetch});

const client = new HyperionSocketClient('https://telos.caleos.io', {fetch, async: false});
//const client = new HyperionSocketClient('hadfdsf', {fetch, async: true});

const format = require('./formats.js').radiosonde;
const format_meta = require('./formats.js').radiosonde_meta;

async function get_wxballoons3t ( level=1020, all_flag=false)
{
    let contract = "wxballoons3t";

    // Data to be returned
    let data = [];

    // Get launches table from blockchain
    let launches = await rpc.get_table_rows({
        json: true,              // Get the response as json
        code: contract,     // Contract that we target
        scope: contract,         // Account that owns the data
        table: 'launches',        // Table name
        limit: 500               // Maximum number of rows that we want to get
        //reverse = false,         // Optional: Get reversed data
        //show_payer = false,      // Optional: Show ram payer
    });

    launches = launches.rows;

    // Sort launches in descending order based on unix_time
    launches.sort((a, b) => parseFloat(b.unix_time) - parseFloat(a.unix_time));

    // Remove all launches that don't meet level criteria
    launches = launches.filter( item => (item.level_reached < level) )

    // Init counter
    let counter = 0;

    // Loop over launches and only get ones with minimum pressure = level
    for( const launch_fields of launches)
    {
        counter++;
        if ( all_flag === true )
            console.log( "Pulling launch " + counter + " of " + launches.length + " from " + contract );
        else
            console.log( "Pulling launch 1 of 1 from " + contract );
        // 6hr condition is not needed
        delete launch_fields['wx6hrcondition'];

        // Init new json
        let launch = {};
        Object.assign(launch, format_meta);
        launch.contract = contract;

        // Copy other fields into new json
        for ( const field of Object.keys(launch_fields))
        { launch[field] = launch_fields[field]; }

        // Initialize data variable
        launch.data = [];

        // Get observations table
        let observations = await rpc.get_table_rows({
            json: true,              // Get the response as json
            code: 'wxballoons3t',     // Contract that we target
            scope: 'wxballoons3t',         // Account that owns the data
            table: 'observations',        // Table name
            limit: 5000,
            lower_bound: launch.unix_time
        });

        // Loop over observations
        for (const observation of observations.rows) {
            if ( observation.launch_id === launch.launch_id )
            {
                let obs = {};
                Object.assign(obs, format);

                obs.unix_time_s = observation.unix_time;
                obs.pressure_hpa = observation.pressure_hpa;
                obs.temperature_c = observation.temperature_c;
                obs.dewPoint_c = observation.dewPoint_c;
                //obs.elevation2_m = observation.elevation_m;

                launch.data.push(obs);
            }
        } // end observation for loop

        // Append the information
        data.push(launch);

        // If only final launch was requested we stop
        if ( all_flag === false )
            break;

    } // end launch for loop

    return data;
}

async function get_all_ascensionwx( level=1020, location='all')
{
    let locations;
    if (location === 'all')
    {
        locations = ['uyo','acc','dal','any'];
    } else {
        locations = [ location ]
    }

    // Full data object to be returned
    let data = [];

    for (const loc of locations)
    {
        let contract = 'ascension' + loc;

        // Get launches table from blockchain
        let launches = await rpc.get_table_rows({
            json: true,              // Get the response as json
            code: contract,     // Contract that we target
            scope: contract,         // Account that owns the data
            table: 'launches',        // Table name
            limit: 500               // Maximum number of rows that we want to get
        });

        launches = launches.rows;

        // Sort launches in descending order based on unix_time
        launches.sort((a, b) => parseFloat(b.unix_time) - parseFloat(a.unix_time));

        // Remove all launches that don't meet level criteria
        launches = launches.filter( item => (item.level_reached < level) )

        // Init counter
        let counter = 0;

        // Loop over launches and only get ones with minimum pressure = level
        for( const launch_fields of launches )
        {
            counter++;
            console.log( "Pulling launch " + counter + " of " + launches.length + " from " + contract );

            // init jnew json
            let launch = {};
            Object.assign(launch, format_meta);
            launch.contract = contract;

            // Copy other fields into launch json
            for ( const field of Object.keys(launch_fields))
            { launch[field] = launch_fields[field]; }

            // Get observations
            launch.data = await get_ascensionwx_obs(contract, launch.launch_id);

            // Append the information
            data.push(launch);

        } // end launch for loop
    } // end location loop

    return data;
}

async function get_single_ascensionwx_launch( contract, launch_id )
{
    // Get launches table from blockchain
    let launch_fields = await rpc.get_table_rows({
        json: true,              // Get the response as json
        code: contract,     // Contract that we target
        scope: contract,         // Account that owns the data
        table: 'launches',        // Table name
        limit: 1,               // Maximum number of rows that we want to get
        lower_bound: launch_id,
        upper_bound: launch_id
    });

    launch_fields = launch_fields.rows[0];

    let launch = {};
    Object.assign(launch, format_meta);
    launch.contract = contract;

    // Copy other fields into launch json
    for ( const field of Object.keys(launch_fields))
    { launch[field] = launch_fields[field]; }

    // Get observations
    launch.data = await get_ascensionwx_obs(contract, launch.launch_id);

    return launch;
}

async function get_ascensionwx_obs( contract, launch_id )
{
    let data = [];

    // Get observations table
    let observations = await rpc.get_table_rows({
        json: true,              // Get the response as json
        code: contract,     // Contract that we target
        scope: contract,         // Account that owns the data
        table: 'observations',        // Table name
        index_position: 2,  // Secondary index
        key_type: 'name',   // launch_id is inherently an eosio name
        limit: 5000,
        lower_bound: launch_id,
        upper_bound: launch_id
    });

    // Loop over observations
    for (const observation of observations.rows) {

        let obs = {};
        Object.assign(obs, format);

        obs.unix_time_s = observation.unix_time;
        obs.pressure_hpa = observation.pressure_hpa;
        obs.temperature_c = observation.temperature_c;
        obs.humidity_percent = observation.humidity_percent;
        obs.latitude_deg = observation.latitude_deg;
        obs.longitude_deg = observation.longitude_deg;
        obs.elevation_gps_m = observation.elevation_gps_m;
        obs.elevation2_m = observation.elevation2_m;
        obs.flags = observation.flags;

        data.push(obs);
    } // end observation for loop

    return data;

}

async function listen_ascensionwx_once( func, contract)
{
    contract = "delphioracle";

    //const table = "observations";
    const table = "global";

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
        await func(data, ack);
        console.log("Disconnecting...");
        client.disconnect();
    };


    // Initiate the connection
    client.connect();

}

exports.get_wxballoons3t = get_wxballoons3t;
exports.get_all_ascensionwx = get_all_ascensionwx;
exports.get_single_ascensionwx_launch = get_single_ascensionwx_launch;

exports.listen_ascensionwx_once = listen_ascensionwx_once;