const sha256 = require('sha256');
const currentNodeUrl = process.argv[3];
const uuid = require('uuid/v1');
const mysql = require('mysql');
const EthCrypto = require('eth-crypto');
const entropy = Buffer.from('f2dacff2dacff2dacff2dacff2dacff2dacff2dacff2dacff2dacff2dacff2dacff2dacff2dacff2dacff2dacff2dacff2dacff2dacff2dacff2dacff2dacfdd', 'utf-8'); // must contain at least 128 chars
  const identity = EthCrypto.createIdentity(entropy);

function Blockchain() {


	this.chain = [];
	this.pendingTransactions = [];

	this.currentNodeUrl = currentNodeUrl;
	this.networkNodes = [];

	this.createNewBlock(100, '0', '0');

};


Blockchain.prototype.createNewBlock = function(nonce, previousBlockHash, hash) {
	const newBlock = {
		index: this.chain.length + 1,
		timestamp: Date.now(),
		transactions: this.pendingTransactions,
		nonce: nonce,
		hash: hash,
		previousBlockHash: previousBlockHash
	};

	this.pendingTransactions = [];
	this.chain.push(newBlock);
	var chainArray = this.chain[this.chain.length - 1];
addToSql();
function addToSql() {
	var con3 = mysql.createConnection({
		host: 'localhost',
                user: 'root',
                password: '@00Faruq00@',
                database: 'Blockchain',
                port: 3306,
	  });
	  con3.connect(function(err) {
		  if (err) throw err;
		  console.log("Connected!");
		  var sql = "INSERT INTO nodeOne (hashes) VALUES (?)";
		  const toString2 = JSON.stringify(chainArray);
		  const values = String(newBlock);
		  con3.query(sql, [toString2], function (err, result) {
			if (err) throw err;
			console.log("1 record inserted");
		  });
		});
};



	return newBlock;
};


Blockchain.prototype.getLastBlock = function() {
	return this.chain[this.chain.length - 1];
};


Blockchain.prototype.createNewTransaction = function(title, gender, birth, doctor, hospital, age, laboratory, phone, address, blood) {
	const newTransaction = {
		title: title,
		gender: gender,
		birth: birth,
		doctor: doctor,
		hospital: hospital,
		age: age,
		laboratory: laboratory,
		phone: phone,
		address: address,
		blood: blood,
		transactionId: uuid().split('-').join('')
	};

	return newTransaction;
};


Blockchain.prototype.addTransactionToPendingTransactions = function(transactionObj) {
	console.log(transactionObj);

	(async() => {
		console.log('before start');

		const toString = JSON.stringify(transactionObj);
		console.log('Done');

		const encrypted = await EthCrypto.encryptWithPublicKey(
			'd69c7efcd62cdb246b0eb295ab464b74a1c8cbe9c4f0a36f43dc7fef613fe72a24abdcad0de7485f57ed63169d3923ed7ca852e4bac60f70fdb6517272165c23', // publicKey
			toString // message
		);
		console.log(encrypted);

		const toString1 = EthCrypto.cipher.stringify(encrypted);
		console.log(toString1);
		console.log('Done Again');

		this.pendingTransactions.push(toString1);
	    return this.getLastBlock()['index'] + 1;


	  })();
};


Blockchain.prototype.hashBlock = function(previousBlockHash, currentBlockData, nonce) {
	const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
	const hash = sha256(dataAsString);
	return hash;
};


Blockchain.prototype.proofOfWork = function(previousBlockHash, currentBlockData) {
	let nonce = 0;
	let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
	while (hash.substring(0, 4) !== '0000') {
		nonce++;
		hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
	}

	return nonce;
};



Blockchain.prototype.chainIsValid = function(blockchain) {
	let validChain = true;

	for (var i = 1; i < blockchain.length; i++) {
		const currentBlock = blockchain[i];
		const prevBlock = blockchain[i - 1];
		const blockHash = this.hashBlock(prevBlock['hash'], { transactions: currentBlock['transactions'], index: currentBlock['index'] }, currentBlock['nonce']);
		if (blockHash.substring(0, 4) !== '0000') validChain = false;
		if (currentBlock['previousBlockHash'] !== prevBlock['hash']) validChain = false;
	};

	const genesisBlock = blockchain[0];
	const correctNonce = genesisBlock['nonce'] === 100;
	const correctPreviousBlockHash = genesisBlock['previousBlockHash'] === '0';
	const correctHash = genesisBlock['hash'] === '0';
	const correctTransactions = genesisBlock['transactions'].length === 0;

	if (!correctNonce || !correctPreviousBlockHash || !correctHash || !correctTransactions) validChain = false;

	return validChain;
};


Blockchain.prototype.getBlock = function(blockHash) {
	let correctBlock = null;
	this.chain.forEach(block => {
		if (block.hash === blockHash) correctBlock = block;
	});
	return correctBlock;
};


Blockchain.prototype.getTransaction = function(transactionId) {
	let correctTransaction = null;
	let correctBlock = null;

	this.chain.forEach(block => {
		block.transactions.forEach(transaction => {
			if (transaction.transactionId === transactionId) {
				correctTransaction = transaction;
				correctBlock = block;
			};
		});
	});

	return {
		transaction: correctTransaction,
		block: correctBlock
	};
};


Blockchain.prototype.getAddressData = function(address) {
	const addressTransactions = [];
	this.chain.forEach(block => {
		block.transactions.forEach(transaction => {
			if(transaction.sender === address || transaction.recipient === address) {
				addressTransactions.push(transaction);
			};
		});
	});

	let balance = 0;
	addressTransactions.forEach(transaction => {
		if (transaction.recipient === address) balance += transaction.amount;
		else if (transaction.sender === address) balance -= transaction.amount;
	});

	return {
		addressTransactions: addressTransactions,
		addressBalance: balance
	};
};






module.exports = Blockchain;














