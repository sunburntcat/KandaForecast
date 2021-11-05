const data = require('../lib/eosio_radiosondes');

(async () => {
    // Get last GPS-enabled launch in Uyo, Nigeria
    //   which is located very close to Douala, Cameroon
    const launch = await data.get_ascensionwx( undefined, false, 'uyo' );

    // Observation data resides in the "data" key of each json object
    console.log(launch);
})();

