const driver = require('bigchaindb-driver')
const util = require('util')

const sacros = new driver.Ed25519Keypair()
const sacra = new driver.Ed25519Keypair()
const ancmnt = new driver.Ed25519Keypair()

console.log('\n\nsacros: ',sacros)
console.log('sacra: ',sacra)
console.log('ancmnt: ',ancmnt,'\n\n')

const assetdata = {
    'test_property': {
        'type': '7',
        'sector':'17',
        'type': 'flat'
    },
    'test_property': {
        'type': '8',
        'sector':'18',
        'type': 'apartment'
    },
    'test_property': {
        'type': '9',
        'sector':'19',
        'type': 'plot'
    }
}

const metadata = {'city': 'delhi'}

const txCreateSacrosSimple = driver.Transaction.makeCreateTransaction(
    assetdata,
    metadata,
    [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(sacros.publicKey))],
    sacros.publicKey
)

const txCreateSacrosSimpleSigned = driver.Transaction.signTransaction(txCreateSacrosSimple, sacros.privateKey)

console.log('\nSigned Transaction: \n',util.inspect(txCreateSacrosSimpleSigned, false, null),'\n\n')

let conn = new driver.Connection('https://test.bigchaindb.com/api/v1/', {app_id: '012a2f5e', app_key: 'aeb69fe1ebd43ae4966b1fe565593d0a'})

conn.postTransaction(txCreateSacrosSimpleSigned)
    .then((res) => {
        return conn.pollStatusAndFetchTransaction(res.id)
    })
    .then(retrievedTx => console.log('\n\n',util.inspect(retrievedTx, false, null),'\n\n'))
    .then(() => conn.getStatus(txCreateSacrosSimpleSigned.id))
    .then(status => console.log('\n\n',status,'\n\n'))
    
    .then(() => {
        const txTransferSacra = driver.Transaction.makeTransferTransaction(
            [{tx: txCreateSacrosSimpleSigned, output_index: 0}],
            [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(sacra.publicKey))],
            {cost: '₹1200000'}
        )

        let txTransferSacraSigned = driver.Transaction.signTransaction(txTransferSacra, sacros.privateKey)
        console.log('\n\n','Signed Transaction',util.inspect(txTransferSacraSigned, false, null),'\n\n')
        return conn.postTransaction(txTransferSacraSigned)
    })
    .then(res => {
        console.log('\n\nResponse from BigchainDB server: ',util.inspect(res, false, null),'\n\n')
        return conn.pollStatusAndFetchTransaction(res.id)
    })
    .then(tx => {
        console.log('\n\n',util.inspect(tx, false, null), '\n\n')
        console.log('\n\nTransferring to ancmnt\n\n')
        console.log('\n\ntxTransferSacraSigned is\n\n')        
        // const txTransferAncmnt = driver.Transaction.makeTransferTransaction(
        //     [{tx: txTransferSacraSigned, output_index: 0}],
        //     [driver.Transaction.makeOutput(driver.makeEd25519Condition(ancmnt.publicKey))],
        //     {price: '₹1500000'}
        // )
        const txTransferAncmnt = driver.Transaction.makeTransferTransaction(
            [{ tx: tx, output_index: 0 }],
            [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(ancmnt.publicKey))],
            {'price': '15000000'}
    )
        console.log('working,',txTransferAncmnt)
        let txTransferAncmntSigned = driver.Transaction.signTransaction(txTransferAncmnt, sacra.privateKey)
        console.log('\n\n','Signed Transaction',util.inspect(txTransferAncmntSigned),'\n\n')
        return conn.postTransaction(txTransferAncmntSigned)
    })
    .then((res) => {
        console.log('\n\nResponse from BigchainDB server: ',util.inspect(res, false, null),'\n\n')        
        return conn.pollStatusAndFetchTransaction(res.id)
    })
    .then(tx => console.log('\n\n\n',util.inspect(tx, false, null),'\n\n\n'))
    
    /*
    .then(() => conn.searchAssets('plot'))
    .then(assets => console.log(assets))
    .then(() => conn.searchMetadata('delhi'))
    .then(assets => console.log(assets))
    */
    
    .then(() => conn.listOutputs(sacros.publicKey, true))
    .then(listSpentOutputs => {
            console.log("\nSpent outputs for Sacros: ", listSpentOutputs) // Spent outputs: 1
            return conn.listOutputs(sacros.publicKey, false)
    })
    .then(listUnspentOutputs => {
            console.log("Unspent outputs for Sacros: ", listUnspentOutputs) // Unspent outputs: 0
            return conn.listOutputs(sacra.publicKey, true)
    })
    .then(listSpentOutputs => {
        console.log("\nSpent outputs for Sacra: ", listSpentOutputs) // Spent outputs: 1
        return conn.listOutputs(sacra.publicKey, false)
    })
    .then(listUnspentOutputs => {
        console.log("Unspent outputs for Sacra: ", listUnspentOutputs) // Unspent outputs: 0
        return conn.listOutputs(ancmnt.publicKey, true)
    })
    .then(listSpentOutputs => {
        console.log("\nSpent outputs for Ancmnt: ", listSpentOutputs) // Spent outputs: 1
        return conn.listOutputs(ancmnt.publicKey, false)
    })
    .then(listUnspentOutputs => {
        console.log("Unspent outputs for Ancmnt: ", listUnspentOutputs) // Unspent outputs: 0
        //return conn.listOutputs(bob.publicKey, true)
    })