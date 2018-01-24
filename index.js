const conn = new BigchainDB.Connection('https://test.bigchaindb.com/api/v1/', {
    app_id: '012a2f5e',
    app_key: 'aeb69fe1ebd43ae4966b1fe565593d0a'
})

//const conn = new BigchainDB.Connection('https://main.ipdb.io/api/v1/')

var userName = window.prompt('Hi, user! Welcome to Chirpy. Entr name', '')
var userKeys = new BigchainDB.Ed25519Keypair();
console.log(userKeys)

const chirpProtocol = 'chirp8'

var chirp = function () {
    var content = document.querySelector('#content').value

    var tx = BigchainDB.Transaction.makeCreateTransaction(
        {
            'def-type': chirpProtocol,
            'name': userName,
            'content': content,
            'time': new Date().getTime()
        },
        null,
        [BigchainDB.Transaction.makeOutput(
            BigchainDB.Transaction.makeEd25519Condition(userKeys.publicKey)
        )],
        userKeys.publicKey
    )
    console.log(tx)
    txSigned = BigchainDB.Transaction.signTransaction(tx, userKeys.privateKey)
    console.log(txSigned)
    conn.postTransaction(txSigned)
    //    .then(tx=> alert(tx))
            .then(tx=>{
                console.dir(tx)    
                document.getElementById('chirps').innerHTML = '<p>'+tx.asset.data.name+'-'+tx.asset.data.content+'</p>' + document.getElementById('chirps').innerHTML
            })
    console.log('Chirp sent by: ', userName)
}

var load = function () {
    conn.searchAssets('chirpProtocol')
        .then(assets => {
            console.log(assets)
            return assets.map(asset => asset.data)
        })
        .then(assets => assets.sort((a,b) => new Date(b.date) - new Date(a.date)).reverse())
        .then(tx => document.getElementById('chirps').innerHTML = '<p>'+tx.asset.data.name+'-'+tx.asset.data.content+'</p>' + document.getElementById('chirps').innerHTML)
    console.log('Chirps loaded')
}
load()