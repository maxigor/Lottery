const assert = require('assert');
const ganache = require('ganache-cli') //local ethereum network
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const { interface, bytecode } = require('../compile.js'); 

let lottery;
let accounts;


beforeEach(async () => {
	accounts = await web3.eth.getAccounts();

	lottery = await new web3.eth.Contract(JSON.parse(interface))
		.deploy({data:bytecode})
		.send({from: accounts[0], gas: '1000000'});
});

describe('Lottery Contract',() => {
	it('Deploys a contract', () => {
		assert.ok(lottery.options.address);
	});

	it("Uma conta entrando no sorteio", async () => {
		await lottery.methods.enter().send({
			from: accounts[0],
			value: web3.utils.toWei('0.02', 'ether')
		});

		const players = await lottery.methods.getPlayers().call({
			from: accounts[0]
		});
		assert.equal(accounts[0], players[0])
		assert.equal(1, players.length)
	});

	it("Varias contas entrando no sorteio", async () => {
		await lottery.methods.enter().send({
			from: accounts[0],
			value: web3.utils.toWei('0.02', 'ether')
		});

		await lottery.methods.enter().send({
			from: accounts[1],
			value: web3.utils.toWei('0.02', 'ether')
		});

		await lottery.methods.enter().send({
			from: accounts[2],
			value: web3.utils.toWei('0.02', 'ether')
		});

		const players = await lottery.methods.getPlayers().call({
			from: accounts[0]
		});
		assert.equal(accounts[0], players[0])
		assert.equal(accounts[1], players[1])
		assert.equal(accounts[2], players[2])
		assert.equal(3, players.length)
	});

	it("Requisita um minimo de ether para entrar no sorteio", async() =>{
		try {
			await lottery.methods.enter().send({
				from: accounts[0],
				value: 10
			});
			asset(false);
		} catch(err) {
			assert(err);
		}
	})

	it("So o manager pode chamar a funcao pickWinner", async () =>{
		try {
			await lottery.methods.pickWinner().send({
				fromt: accounts[1]
			});
			assert(false)
		} catch(err) {
			assert(err);
		}
	});

	it("Envia o dinheiro para o vencedor e reseta o array de jogadores", async () =>{
		await lottery.methods.enter().send({
			from: accounts[0],
			value: web3.utils.toWei('2', 'ether')
		})

		const initialBalance = await web3.eth.getBalance(accounts[0]);
		await lottery.methods.pickWinner().send({from: accounts[0]});
		const finalBalance = await web3.eth.getBalance(accounts[0]);
		const difference = finalBalance - initialBalance;

		assert(difference > web3.utils.toWei('1.8', 'ether'));
	});
});