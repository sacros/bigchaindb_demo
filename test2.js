const driver = require('bigchaindb-driver')
const conn = new driver.Connection('https://test.bigchaindb.com/api/v1/', { app_id: '012a2f5e', app_key: 'aeb69fe1ebd43ae4966b1fe565593d0a' })

const alice = new driver.Ed25519Keypair()
const bob = new driver.Ed25519Keypair()
const chris = new driver.Ed25519Keypair()

console.log('Alice: ', alice.publicKey)
console.log('Bob: ', bob.publicKey)
console.log('Chris: ', chris.publicKey)

assetdata = {
        'laptop': {
                'model_number': 'MacbookPro',
                'manufacturer': 'Apple',
        }
}

metadata = {
    'country': 'IN'
}
var txTransferBobSigned;

const txCreateAliceSimple = driver.Transaction.makeCreateTransaction(
        assetdata,
        metadata,
        [ driver.Transaction.makeOutput(
                        driver.Transaction.makeEd25519Condition(alice.publicKey))
        ],
        alice.publicKey
)

const txCreateAliceSimpleSigned = driver.Transaction.signTransaction(txCreateAliceSimple, alice.privateKey)
console.log('\n\nPosting signed create transaction for Alice:\n', txCreateAliceSimpleSigned)

conn.postTransaction(txCreateAliceSimpleSigned)
        .then(() => conn.pollStatusAndFetchTransaction(txCreateAliceSimpleSigned.id))
        .then(() => {
                const txTransferBob = driver.Transaction.makeTransferTransaction(
                        [{ tx: txCreateAliceSimpleSigned, output_index: 0 }],
                        [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(bob.publicKey))],
                        {'newOwner': 'Bob'}
                )
                txTransferBobSigned = driver.Transaction.signTransaction(txTransferBob, alice.privateKey)
                console.log('\n\nPosting signed transaction to Bob:\n', txTransferBobSigned)

                return conn.postTransaction(txTransferBobSigned)
        })
        .then(res => conn.pollStatusAndFetchTransaction(res.id))

        .then(tx => {
                const txTransferChris = driver.Transaction.makeTransferTransaction(
                        [{ tx: txTransferBobSigned, output_index: 0 }],
                        [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(chris.publicKey))],
                        {'newOwner': 'Chris'}
                )

                let txTransferChrisSigned = driver.Transaction.signTransaction(txTransferChris, bob.privateKey)
                console.log('\n\nPosting signed transaction to Chris:\n', txTransferChrisSigned)

                return conn.postTransaction(txTransferChrisSigned)
        })
        .then(res => conn.pollStatusAndFetchTransaction(res.id))
        .then(tx => console.log('yo','\n\n\n\n',tx,'\n\n\n','yo'))
/*        .then(() => conn.listOutputs(alice.publicKey, true))
        .then(listSpentOutputs => {
                console.log("\nSpent outputs for Alice: ", listSpentOutputs.length) // Spent outputs: 1
                return conn.listOutputs(alice.publicKey, false)
        })
        .then(listUnspentOutputs => {
                console.log("Unspent outputs for Alice: ", listUnspentOutputs.length) // Unspent outputs: 0
                return conn.listOutputs(bob.publicKey, true)
        })
        .then(listSpentOutputs => {
                console.log("\nSpent outputs for Bob: ", listSpentOutputs.length) // Spent outputs: 1
                return conn.listOutputs(bob.publicKey, false)
        })
        .then(listUnspentOutputs => {
                console.log("Unspent outputs for Bob: ", listUnspentOutputs.length) // Unspent outputs: 0
                return conn.listOutputs(chris.publicKey, true)
        })
        .then(listSpentOutputs => {
                console.log("\nSpent outputs for Chris: ", listSpentOutputs.length) // Spent outputs: 0
                return conn.listOutputs(chris.publicKey, false)
        })
        .then(listUnspentOutputs => {
                console.log("Unspent outputs for Chris: ", listUnspentOutputs.length) // Unspent outputs: 1
        })
        .catch(res => {console.log(res)})
*/