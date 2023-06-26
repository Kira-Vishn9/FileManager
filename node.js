const readline = require("readline");


const args = process.argv.slice(2);
const username = args.find(arg => arg.startsWith('--username=')).split('=')[1];

console.log(`Welcome to the File Manager, ${username}!\n`);

const getCurrentDirectory = () => process.cwd();

function printCurrentDirectory() {
    console.log(`You are currently in ${getCurrentDirectory()}\n`);
}


function getRl() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: 'Enter a command: ',
    });

    return rl
}

function callPropmpt() {
    rlGlobal.prompt()
}

const rlGlobal = getRl();
printCurrentDirectory();
callPropmpt()
