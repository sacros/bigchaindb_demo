const conn = new BigchainDB.Connection('https://test.bigchaindb.com/api/v1/', {
    app_id: '012a2f5e',
    app_key: 'aeb69fe1ebd43ae4966b1fe565593d0a'
})

var wsUri = "wss://test.bigchaindb.com:443/api/v1/streams/valid_transactions";

var userName = window.prompt('Hi, user! Welcome to Chirpy. Entr name', '')
var userKeys = new BigchainDB.Ed25519Keypair();
console.log(userKeys)

const chirpProtocol = 'chirp8'

var chirp = function () {
    var content = document.getElementById('content').value

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
            .then(tx=>{
                console.dir(tx)    
            })
    console.log('Chirp sent by: ', userName)
    document.getElementById('content').value = ''
}


var setWebSocket = function()
{
        websocket = new WebSocket(wsUri);
        websocket.onopen = function(evt) { onOpen(evt) };
        websocket.onclose = function(evt) { onClose(evt) };
        websocket.onmessage = function(evt) { onMessage(evt) };
        websocket.onerror = function(evt) { onError(evt) };
}
function onOpen(evt)
{
        writeAlertMessage("CONNECTED");
}

function onClose(evt)
{
        writeAlertMessage("DISCONNECTED");
}

function onMessage(evt)
{
        console.log('Event is:', evt)        
        writeToScreen(evt.data)
}

function onError(evt)
{
        writeToScreen('<span style="color: red;">ERROR:</span> ' + evt.data);
}
function writeToScreen(message)
{
    var url = 'https://test.bigchaindb.com/api/v1/transactions/'
    var tid = JSON.parse(message).transaction_id
    url += tid
    console.log('\n\n\nmessage is: \n\n\n', tid)
    conn.searchAssets(tid)
        .then(asset => {
            console.log(asset[0].data)
            document.getElementById('chirps').innerHTML = '<div style="width:90%;background-color:white; overflow:auto; margin-bottom:5px; border-radius:8px"><p style="margin:7px">'+asset[0].data.name+'-<br>'+asset[0].data.content+'</p></div>' + document.getElementById('chirps').innerHTML
        })
}

function writeAlertMessage(message)
{
        var alert = document.createElement("div");
        alert.className = "alert alert-success";
        alert.setAttribute("role", "alert");
        alert.innerHTML = message;
        document.getElementById('alert').appendChild(alert);
}



var load = function () {
    conn.searchAssets(chirpProtocol)
        .then(assets => {
            return assets.map(asset => asset.data)
        })
        .then(assets => assets.sort((a,b) => new Date(b.time) - new Date(a.time)).reverse())
        .then(tx => {
            console.log(tx)
            console.log(tx.length)
            for (var t=0;t<tx.length;t++){
                console.log(tx[t])
                document.getElementById('chirps').innerHTML = '<div style="width:90%; background-color:white; overflow:auto; margin-bottom:5px;border-radius:8px"><p style="margin: 7px">'+tx[t].name+'-<br>'+tx[t].content+'</p></div>' + document.getElementById('chirps').innerHTML
            }
        })
    console.log('Chirps loaded')
    setWebSocket();
}
load()