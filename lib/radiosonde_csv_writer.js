const fs = require('fs');

const format = require('./formats.js').radiosonde;
const format_meta = require('./formats.js').radiosonde_meta;

// This library module takes an eosio_radiosondes or eosio_iot JSON object and
//   outputs this data to a .csv file
function data_to_csv( filename, pull_blockchain_json )
{
    console.log("Writing data to CSV files.");

    // Make json be part of an array, if it's not already.
    if ( !Array.isArray( pull_blockchain_json ) )
    {
        pull_blockchain_json = [ pull_blockchain_json ];
    }

    //////////// Write metadata file /////////////
    let basename = filename.split('.')[0];
    let meta_headers = Object.keys( format_meta );

    // Remove the "data" key (Note: "data" must be last element)
    meta_headers.pop();

    try {
        fs.unlinkSync(basename + "_meta.csv");
    }
    catch {
        console.log("Ignoring unlink.")
    }

    writeHeader( basename + "_meta.csv" , meta_headers.join() + "\n" );

    // Loop over all blockchain json objects provided
    for (const json of pull_blockchain_json )
    {
        // Init line string
        let line = "";

        // Loop over meta_header fields from json
        for ( const key of meta_headers )
        {
            if( typeof json[key] !== "undefined")
            { line = line + json[key] + ","; }
            else
            { line = line + ","; }
        }

        fs.appendFileSync(basename + "_meta.csv", line + "\n", function (err) {
            if (err) throw err;
        });

    } // end loop over blockchain jsons

    //////////// Write Data file /////////////

    // Get headers and put into a string
    const obs_headers = Object.keys( format ) ;
    obs_headers.unshift( "launch_id" ); // Add "contract" to beginning

    try {
        fs.unlinkSync( filename );
    }
    catch {
        console.log("Ignoring unlink.")
    }
    writeHeader( filename, obs_headers.join() + "\n");

    // Loop over all blockchain json objects provided
    for (const json of pull_blockchain_json )
    {
        if ( json["data"] === undefined )
        { continue; }

        // Loop over each observation inside "data" field
        for ( const obs of json["data"] )
        {
            // Init line string with contract name
            let line = json["launch_id"];

            // Loop over each observation piece
            for ( const field of obs_headers )
            {
                if( typeof obs[field] !== "undefined")
                { line = line + obs[field] + ","; }
                else
                { line = line + ","; }
            }

            fs.appendFileSync( filename, line + "\n", function (err) {
                if (err) throw err;
            });
        } // End loop over observations
    } // end loop over blockchain jsons


}

function writeHeader(filename, fields)
{
    fs.writeFileSync(filename, fields, function (err) {
        if (err) throw err;
    });
}

exports.data_to_csv = data_to_csv;
