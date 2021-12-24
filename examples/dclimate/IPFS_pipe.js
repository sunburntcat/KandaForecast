
/*
    Note that this tool can be used in case dClimate wants to reduce the dependency
      on the Websocket (realtime IPFS pipe) or grab other data that was submitted to
      the chain after a certain period of time.
 */

const root_dir = '../../';
const history = require(root_dir + 'lib/eosio_history');

async function get_prior_data( begin_time_iso_date )
{
    // Note there is a hard limit of 1000 observations allowed in the interval
    // With 10 sensors submitting every 15 minutes, this means we can call this once
    //   per day and still be OK.
    // Adding more sensors means this HTTP query needs to happen more frequently
    let data = await history.getActions('dclimateiot4','submitdata', begin_time_iso_date);

    let ipfs_data = [];

    for (const obs of data.actions)
    {
        ipfs_data.push( {
            'timestamp':obs.timestamp,
            'trx_id':obs.trx_id,
            'data':obs.act.data
        })
    }

    console.log(ipfs_data);
    return ipfs_data;

}

// One day prior
let hours_prior = 24;

let start = new Date( (Date.now() - hours_prior*60*60*1000) );
ipfs_data = get_prior_data( start.toISOString() );

// Here, dclimate can call a nodejs package that submits the data to IPFS
//  e.g. https://js.ipfs.io/





