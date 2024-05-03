User
'use strict';

const fs = require('fs');

process.stdin.resume();
process.stdin.setEncoding('utf-8');

let inputString = '';
let currentLine = 0;

process.stdin.on('data', function (inputStdin) {
	inputString += inputStdin;
});

process.stdin.on('end', function () {
	inputString = inputString.split('\n');

	main();
});

function readLine() {
	return inputString[currentLine++];
}



/*
 * Complete the 'executeQueries' function below.
 *
 * The function is expected to return a STRING.
 * The function accepts STRING_ARRAY lines as parameter.
 */

function executeQueries(lines) {
	function Database() {
		this.data = {};

		this.isEmpty = (key) => {
			return this.GET(key) === '';
		}

		/**
		* 
		* @param {string} key Data key
		* @param {any=} val Value or null. If null any data at provided key will be erased. If data is already stored value will be incremented by value.
		* @returns {Boolean} True if operation handled successfully or \n False if data wasn\'nt stored at provided key.
		*/
		this.dataTransaction = (key, val = null) => {
			if (!val) { // delete
				const wasEmpty = this.isEmpty(key);
				const newOH = this.data[key].operationHistory + 1;
				this.data[key] = { value: null, operationHistory: newOH };
				return !wasEmpty;
			}

			const dCopy = this.data[key];
			this.data[key] = !dCopy
				? { value: val, operationHistory: 1 }
				: {
					...dCopy,
					value: (dCopy.value || 0) + val, // Ensure value is initialized to 0 if undefined
					operationHistory: dCopy.operationHistory + (val || 1) // Increment operationHistory by 1 if val is not provided
				}; // create or increment
		}
	}

	Database.prototype.GET = function (key) {
		return this.data[key]?.value ?? '';
	}

	Database.prototype.SET_OR_INC = function (key, value) {
		this.dataTransaction(key, value);
		return `${this.data[key].value}`;
	}

	Database.prototype.DELETE = function (key) {
		return this.dataTransaction(key);
	}

	Database.prototype.TOP_N_KEYS = function (n) {
		this.database.data.sort((a, b) => {
			if (a.operationHistory !== b.operationHistory) {
				return a.operationHistory - b.operationHistory;
			}
			// otherwise comparing first letters from two keys
			return Object.keys(a).sort()[0].localeCompare(Object.keys(b).sort()[0]);
		})

		return Object.keys(this.database).slice(0, n - 1);
	}

	const db = new Database();
	let result = []
	lines.forEach(command => {
		const c = command.split(' ');
		const key = c[1] + c[2]
		const val = c[3];
		switch (c[0]) {
			case 'GET':
				result.push(db.GET(key));
				break;
			case 'SET_OR_INC':
				result.push(db.SET_OR_INC(key, val));
				break;
			case 'DELETE':
				result.push(db.DELETE(key));
				break;
			case 'TOP_N_KEYS':
				result.push(db.TOP_N_KEYS(val));
				break;
		}
	})
	return result;
}

function main() {
	const ws = fs.createWriteStream(process.env.OUTPUT_PATH);

	const linesCount = parseInt(readLine().trim(), 10);

	let lines = [];

	for (let i = 0; i < linesCount; i++) {
		const linesItem = readLine();
		lines.push(linesItem);
	}

	const result = executeQueries(lines);

	ws.write(result + '\n');

	ws.end();
}
