// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;    

contract Lottery {
	address payable manager;
	address payable[] public players;

	constructor(){
		manager = payable(msg.sender);
	}

	function enter() public payable {
        require(msg.value > .01 ether);
		players.push(payable(msg.sender));
	}

    function random() private view returns(uint) {
        return uint(keccak256(abi.encodePacked(block.difficulty,block.timestamp, players)));
    }

    function pickWinner() public {
        require(msg.sender == manager);
        uint index = random() % players.length;
        players[index].transfer(address(this).balance); //this - referencia ao contrato
        delete players;
    }


}