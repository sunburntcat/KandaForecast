const fetch = require('node-fetch');
const {JsonRpc} = require("eosjs");

const chain_endpoint = 'https://kandaweather-mainnet.ddns.net';
const rpc = new JsonRpc( chain_endpoint ,{fetch});

const root_dir = '../../';
const history = require(root_dir + 'lib/eosio_history');

async function print_public_key( trx_id )
{
    const trx = await history.getTransaction(trx_id);

    // Check other details
    let perm_used = trx.actions[0].act.authorization[0].permission;
    let account = trx.actions[0].act.authorization[0].actor;
    let timestamp = trx.actions[0].timestamp;

    const account_info = await rpc.get_account(account); //get alice's account info.  This assumes the account 'alice' has been created on the chain specified in the rpc object.

    let permissions = account_info.permissions;
    let pub_key = '';
    // Look for public key with the same permission as used in the transaction
    for ( const perm of permissions)
    {
        //
        if (perm.perm_name === perm_used)
            // Get the public key
            pub_key = perm.required_auth.keys[0].key;
    }

    // Print the public key
    console.log("Public key for account "+account+":");
    console.log(pub_key);

    // Now we just make sure that permission authorities haven't been updated since then.
    let auth_changes = await history.checkUpdateAuth(account, timestamp);
    if (auth_changes.actions.length>0)
    {
        console.log("  Warning! Permissions for this account have been changed on the blockchain since this transaction.");
    }

}

async function print_signature( trx_id )
{
    const trx = await history.getTransaction(trx_id);

    let sig = trx.actions[0].signatures[0]; // We are only packing one action and signature into trx
    let account = trx.actions[0].act.authorization[0].actor;
    let timestamp = trx.actions[0].timestamp;

    console.log("Signature used: ")
    console.log(sig);

    // Now we just make sure that permission authorities haven't been updated since then.
    let auth_changes = await history.checkUpdateAuth(account, timestamp);
    if (auth_changes.actions.length>0)
    {
        console.log("  Warning! Permissions for this account have been changed on the blockchain since this transaction.");
    }

}

print_public_key('82c01ad90001c104648cf9ad1e6d448cc319e2fd29e9fec17267699f75dcb48d');
print_signature('82c01ad90001c104648cf9ad1e6d448cc319e2fd29e9fec17267699f75dcb48d');


// When streaming table deltas, only the block_id gets included in the websocket stream,
//   so may need extra step to obtain trx_id.