const data = require('./lib/eosio_radiosondes');

const client = data.client;

(async () => {

    // Define function of what to do when new data is received.
    const func = async (data, ack) => {
        if ( data.content.data.pressure_hpa < 500)
        {
            console.log('Level reached!');
        }
    };

    await data.watch_ascensionwx( func, undefined );

})();

