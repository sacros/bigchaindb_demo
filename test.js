const util = require('util')
const driver = require('bigchaindb-driver')

const alice = new driver.Ed25519Keypair()
const bob = new driver.Ed25519Keypair()

console.log('\nAlice: ', alice.publicKey)
console.log('Bob: ', bob.publicKey,'\n')

const assetdata = {
        'sacros coin': {
                'serial_number': '#srscn001',
                'manufacturer': 'SVAM',
        }
}

const metadata = {'country': 'india'}

const txCreateAliceSimple = driver.Transaction.makeCreateTransaction(
        assetdata,
        metadata,
        [ driver.Transaction.makeOutput(
                        driver.Transaction.makeEd25519Condition(alice.publicKey))
        ],
        alice.publicKey
)

const txCreateAliceSimpleSigned = driver.Transaction.signTransaction(txCreateAliceSimple, alice.privateKey)

let conn = new driver.Connection('https://test.bigchaindb.com/api/v1/', { app_id: '012a2f5e', app_key: 'aeb69fe1ebd43ae4966b1fe565593d0a' })

console.log('\nSigned Transaction is \n', util.inspect(txCreateAliceSimpleSigned, false, null))

conn.postTransaction(txCreateAliceSimpleSigned)
        .then(() => conn.pollStatusAndFetchTransaction(txCreateAliceSimpleSigned.id))
        .then(retrievedTx => console.log('\nTransaction', retrievedTx.id, 'successfully posted.\n'))
        .then(() => conn.getStatus(txCreateAliceSimpleSigned.id))
        .then(status => console.log('\nRetrieved status method 2: ', status, '\n'))
        
        .then(() => {
                const txTransferBob = driver.Transaction.makeTransferTransaction(
                        [{ tx: txCreateAliceSimpleSigned, output_index: 0 }],
                        [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(bob.publicKey))],
                        {price: '100 dollars'}
                )

                let txTransferBobSigned = driver.Transaction.signTransaction(txTransferBob, alice.privateKey)
                console.log('\nPosting signed transaction: ', util.inspect(txTransferBobSigned, false, null),'\n')

                return conn.postTransaction(txTransferBobSigned)
        })
        
        .then(res => {
                console.log('\nResponse from BDB server:', util.inspect(res, false, null),'\n')
                return conn.pollStatusAndFetchTransaction(res.id)
        })
        .then(tx => {
                console.log('\n',util.inspect(tx, false, null),'\n')
                console.log('Is Bob the owner?', tx['outputs'][0]['public_keys'][0] == bob.publicKey)
                console.log('Was Alice the previous owner?', tx['inputs'][0]['owners_before'][0] == alice.publicKey )
        })
        
        .then(() => conn.searchAssets('SVAM'))
        .then(assets => console.log('Found assets with manufacturer SVAM:', assets))
        .then(() => conn.searchMetadata('india'))
        .then(assets => console.log('Found assets with country india:', assets))