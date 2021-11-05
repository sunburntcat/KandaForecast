const data = require('../lib/eosio_radiosondes');

const csv = require('../lib/radiosonde_csv_writer.js');

(async () => {
    // Get last launch, regardless of height reached
    //const launch1 = await data.get_wxballoons3t( undefined, false );

    // Get all launches that went above 500 hpa
    const launch1 = await data.get_wxballoons3t( 500, true );

    // Get last launches across all locations
    const launch2 = await data.get_ascensionwx( undefined, false, 'all' );

    // Get only all launches that flew higher than 500hPa in Uyo
    //const launch2 = await data.get_ascensionwx( 950, true, 'uyo' );

    //console.log( launch1 );

    csv.data_to_csv( 'launches.csv', launch1.concat(launch2) );

})();


