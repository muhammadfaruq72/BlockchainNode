const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const uuid = require('uuid/v1');
const port = process.argv[2];
const rp = require('request-promise');
const mysql = require('mysql');
const EthCrypto = require('eth-crypto');


const nodeAddress = uuid().split('-').join('');

const bitcoin = new Blockchain();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// get entire blockchain
app.get('/blockchain', function (req, res) {
  res.send(bitcoin);
});

app.get('/Data', function (req, res) {

   outputChain('customers');

var chain1 = [];
var chain2 = [];
var chain3 = [];
function outputChain(tableName) {
  var con4 = mysql.createConnection({
    host     : 'localhost', port: 8889,
    user     : 'root',
    password : 'root',
    database : 'test'
  });
  con4.connect(function(err) {
    if (err) throw err;
    const query = "SELECT * FROM " + tableName;
    con4.query(query, function (err, result, fields) {
    if (err) throw err;
    var myArr = Array.from(result);
  

    myArr.forEach(function(entry) {
      if (myArr.length) {
      chain1.push(entry.hashes);
    };
    });
  
    for(var b = 0; b < chain1.length; b++) {
    chain2[b] = chain1[b];
    chain3.push(chain2[b]).chain;
    chain3[b] = JSON.parse(chain3[b]).transactions;
    }
    fruitLoop();

    

    });
    });
  };
var i = 0;
var SmoothieArry = [];
var OriginalText = [];
const fruitLoop = async() => {

function stripUndefined (arr) {
  return arr.reduce(function (result, item) {
    result.push( Array.isArray(item) && !item.length ? stripUndefined(item) : item );
    return result;
  }, []);
}


var Temp = [];
 Temp.push(stripUndefined(chain3));
var j2 = 0;
for(i=0; i<chain3.length; i++){

  for(j=0; j<=Temp[0][i].length; j++){
SmoothieArry.push(Temp[0][i][j2]);
j2 = j2 + 1;
}
j2 = 1;
}

      var filtered = SmoothieArry.filter(function (el) {
        return el != null;
      });
      console.log(filtered);
      for(var b = 0; b < filtered.length; b++) {
      SmoothieArry = EthCrypto.cipher.parse(filtered);
        }


        for(var b = 0; b < filtered.length; b++) {

  const message = await EthCrypto.decryptWithPrivateKey(
    '0x614d0693f15a6f671902d07dddcf41183753f47d8994dd4e4739574dae33e173', // privateKey
    filtered[b] // encrypted-data
  );
  SmoothieArry[b] = message;
  filtered = SmoothieArry.filter(function (el) {
          return el != null;
        });
  
            }

      for(var b = 0; b < filtered.length; b++) {
      filtered[b] = JSON.parse(filtered[b]);
        }
      res.send(filtered);
  }
  });


app.get('/chain', function (req, res) {
	outputChain('customers');
	function outputChain(tableName) {
		var con4 = mysql.createConnection({
		  host     : 'localhost', port: 8889,
		  user     : 'root',
		  password : 'root',
		  database : 'test'
		});
		con4.connect(function(err) {
		  if (err) throw err;
		  const query = "SELECT * FROM " + tableName;
		  con4.query(query, function (err, result, fields) {
		  if (err) throw err;
		  var myArr = Array.from(result);
		
		  var chain1 = [];
		  var chain2 = [];
		  var chain3 = [];
	  
		
		  myArr.forEach(function(entry) {
			if (myArr.length) {
			chain1.push(entry.hashes);
		  };
		  });
		  for(var b = 0; b < chain1.length; b++) {
		  chain2[b] = chain1[b];
		  chain3.push(chain2[b]).chain;
		  chain3[b] = JSON.parse(chain3[b]);
		  }
		  console.log(chain3);
		  res.send(chain3);
		  });
		  });
		};
  });

// create a new transaction
app.post('/transaction', function(req, res) {
	const newTransaction = req.body;
	const blockIndex = bitcoin.addTransactionToPendingTransactions(newTransaction);
	res.json({ note: `Transaction will be added in block ${blockIndex}.` });
});


// broadcast transaction
app.post('/transaction/broadcast', function(req, res) {
	const newTransaction = req.body;
	bitcoin.addTransactionToPendingTransactions(newTransaction);

	const requestPromises = [];
	bitcoin.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/transaction',
			method: 'POST',
			body: newTransaction,
			json: true
		};

		requestPromises.push(rp(requestOptions));
	});

	Promise.all(requestPromises)
	.then(data => {
		res.json({ note: 'Transaction created and broadcast successfully.' });
	});
});


// mine a block
app.get('/mine', function(req, res) {
	const lastBlock = bitcoin.getLastBlock();
	const previousBlockHash = lastBlock['hash'];
	const currentBlockData = {
		transactions: bitcoin.pendingTransactions,
		index: lastBlock['index'] + 1
	};
	const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
	const blockHash = bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce);
	const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, blockHash);

	const requestPromises = [];
	bitcoin.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/receive-new-block',
			method: 'POST',
			body: { newBlock: newBlock },
			json: true
		};

		requestPromises.push(rp(requestOptions));
	});

	Promise.all(requestPromises)
	.then(data => {
		const requestOptions = {
			uri: bitcoin.currentNodeUrl + '/transaction/broadcast',
			method: 'POST',
			body: {
				amount: 12.5,
				sender: "00",
				recipient: nodeAddress
			},
			json: true
		};

		return rp(requestOptions);
	})
	.then(data => {
		res.json({
			note: "New block mined & broadcast successfully",
			block: newBlock
		});
	});

	//addToSql();
	function addToSql() {
		var con3 = mysql.createConnection({
			host     : 'localhost', port: 8889,
			user     : 'root',
			password : 'root',
			database : 'test'
		  });
		  con3.connect(function(err) {
			  if (err) throw err;
			  console.log("Connected!");
			  var sql = "INSERT INTO customers (hashes) VALUES (?)";
			  const toString2 = JSON.stringify(bitcoin.chain[bitcoin.chain.length - 1]);
			  const values = String(newBlock);
			  con3.query(sql, [toString2], function (err, result) {
				if (err) throw err;
				console.log("1 record inserted");
			  });
			});
	};




});


// receive new block
app.post('/receive-new-block', function(req, res) {
	const newBlock = req.body.newBlock;
	const lastBlock = bitcoin.getLastBlock();
	const correctHash = lastBlock.hash === newBlock.previousBlockHash; 
	const correctIndex = lastBlock['index'] + 1 === newBlock['index'];

	if (correctHash && correctIndex) {
		bitcoin.chain.push(newBlock);
		addToSql();
function addToSql() {
	var con3 = mysql.createConnection({
		host     : 'localhost', port: 8889,
		user     : 'root',
		password : 'root',
		database : 'test'
	  });
	  con3.connect(function(err) {
		  if (err) throw err;
		  console.log("Connected!");
		  var sql = "INSERT INTO customers (hashes) VALUES (?)";
		  const toString2 = JSON.stringify(newBlock);
		  const values = String(newBlock);
		  con3.query(sql, [toString2], function (err, result) {
			if (err) throw err;
			console.log("1 record inserted");
		  });
		});
};
		bitcoin.pendingTransactions = [];
		res.json({
			note: 'New block received and accepted.',
			newBlock: newBlock
		});
	} else {
		res.json({
			note: 'New block rejected.',
			newBlock: newBlock
		});
	}
});


// register a node and broadcast it the network
app.post('/register-and-broadcast-node', function(req, res) {
	const newNodeUrl = req.body.newNodeUrl;
	if (bitcoin.networkNodes.indexOf(newNodeUrl) == -1) bitcoin.networkNodes.push(newNodeUrl);

	const regNodesPromises = [];
	bitcoin.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/register-node',
			method: 'POST',
			body: { newNodeUrl: newNodeUrl },
			json: true
		};

		regNodesPromises.push(rp(requestOptions));
	});

	Promise.all(regNodesPromises)
	.then(data => {
		const bulkRegisterOptions = {
			uri: newNodeUrl + '/register-nodes-bulk',
			method: 'POST',
			body: { allNetworkNodes: [ ...bitcoin.networkNodes, bitcoin.currentNodeUrl ] },
			json: true
		};

		return rp(bulkRegisterOptions);
	})
	.then(data => {
		res.json({ note: 'New node registered with network successfully.' });
	});
});


// register a node with the network
app.post('/register-node', function(req, res) {
	const newNodeUrl = req.body.newNodeUrl;
	const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(newNodeUrl) == -1;
	const notCurrentNode = bitcoin.currentNodeUrl !== newNodeUrl;
	if (nodeNotAlreadyPresent && notCurrentNode) bitcoin.networkNodes.push(newNodeUrl);
	res.json({ note: 'New node registered successfully.' });
});


// register multiple nodes at once
app.post('/register-nodes-bulk', function(req, res) {
	const allNetworkNodes = req.body.allNetworkNodes;
	allNetworkNodes.forEach(networkNodeUrl => {
		const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(networkNodeUrl) == -1;
		const notCurrentNode = bitcoin.currentNodeUrl !== networkNodeUrl;
		if (nodeNotAlreadyPresent && notCurrentNode) bitcoin.networkNodes.push(networkNodeUrl);
	});

	res.json({ note: 'Bulk registration successful.' });
});


// consensus
app.get('/consensus', function(req, res) {
	const requestPromises = [];
	bitcoin.networkNodes.forEach(networkNodeUrl => {
		const requestOptions = {
			uri: networkNodeUrl + '/blockchain',
			method: 'GET',
			json: true
		};

		requestPromises.push(rp(requestOptions));
	});

	Promise.all(requestPromises)
	.then(blockchains => {
		const currentChainLength = bitcoin.chain.length;
		let maxChainLength = currentChainLength;
		let newLongestChain = null;
		let newPendingTransactions = null;

		blockchains.forEach(blockchain => {
			if (blockchain.chain.length > maxChainLength) {
				maxChainLength = blockchain.chain.length;
				newLongestChain = blockchain.chain;
				newPendingTransactions = blockchain.pendingTransactions;
			};
		});


		if (!newLongestChain || (newLongestChain && !bitcoin.chainIsValid(newLongestChain))) {
			res.json({
				note: 'Current chain has not been replaced.',
				chain: bitcoin.chain
			});
		}
		else {
			bitcoin.chain = newLongestChain;
			bitcoin.pendingTransactions = newPendingTransactions;
			res.json({
				note: 'This chain has been replaced.',
				chain: bitcoin.chain
			});
		}
	});
});


// get block by blockHash
app.get('/block/:blockHash', function(req, res) { 
	const blockHash = req.params.blockHash;
	const correctBlock = bitcoin.getBlock(blockHash);
	res.json({
		block: correctBlock
	});
});


// get transaction by transactionId
app.get('/transaction/:transactionId', function(req, res) {
	const transactionId = req.params.transactionId;
	const trasactionData = bitcoin.getTransaction(transactionId);
	res.json({
		transaction: trasactionData.transaction,
		block: trasactionData.block
	});
});


// get address by address
app.get('/address/:address', function(req, res) {
	const address = req.params.address;
	const addressData = bitcoin.getAddressData(address);
	res.json({
		addressData: addressData
	});
});


// block explorer
app.get('/block-explorer', function(req, res) {
	res.sendFile('./block-explorer/index.html', { root: __dirname });
});





app.listen(port, function() {
	console.log(`Listening on port ${port}...`);
	var con = mysql.createConnection({
		host     : 'localhost', port: 8889,
		user     : 'root',
		password : 'root',
		database : 'test'
	  });
	  
	  con.connect(function(err) {
		  if (err) throw err;
		  console.log("Connected!");
		  var sql = "DELETE FROM Customers";
		  con.query(sql, function (err, result) {
			if (err) throw err;
			console.log("Entries Deleted on start!");
		  });
		});

		var chainArray = bitcoin.chain[bitcoin.chain.length - 1];
		//addToSql();
function addToSql() {
	var con3 = mysql.createConnection({
		host     : 'localhost', port: 8889,
		user     : 'root',
		password : 'root',
		database : 'test'
	  });
	  con3.connect(function(err) {
		  if (err) throw err;
		  console.log("Connected!");
		  var sql = "INSERT INTO customers (hashes) VALUES (?)";
		  const toString2 = JSON.stringify(chainArray);
		  //const values = String(newBlock);
		  con3.query(sql, [toString2], function (err, result) {
			if (err) throw err;
			console.log("1 record inserted");
		  });
		});
};
});





