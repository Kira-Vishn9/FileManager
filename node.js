const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const readline = require('readline');
const crypto = require("crypto");

const args = process.argv.slice(2);
const username = args.find(arg => arg.startsWith('--username=')).split('=')[1];

console.log(`Welcome to the File Manager, ${username}!\n`);

let currentDirectory = process.cwd();

function printCurrentDirectory() {
    console.log(`You are currently in ${currentDirectory}\n`);
}

function listFiles() {
    const files = fs.readdirSync(currentDirectory).sort();

    for (const file of files) {
        const filePath = path.join(currentDirectory, file);
        const fileType = fs.statSync(filePath).isDirectory() ? 'directory' : 'file';
        console.log(`${file} (${fileType})`);
    }

    callPropmpt()
}

function changeDirectory(directory) {
    const newDirectory = path.join(currentDirectory, directory);
    if (fs.existsSync(newDirectory) && fs.statSync(newDirectory).isDirectory()) {
        currentDirectory = newDirectory;
        printCurrentDirectory();
    } else {
        console.log('Invalid directory path\n');
    }
}

function navigateUp() {
    const parentDirectory = path.dirname(currentDirectory);
    if (parentDirectory !== currentDirectory) {
        currentDirectory = parentDirectory;
        printCurrentDirectory();
    } else {
        console.log('You are already in the root directory\n');
    }
}

function readFile(filePath) {
    const fileStream = fs.createReadStream(filePath);
    fileStream.on('data', data => process.stdout.write(data.toString()));
    fileStream.on('end', () => {
        console.log('\n');
        callPropmpt();
    });
}

function createFile(fileName) {
    const filePath = path.join(currentDirectory, fileName);
    fs.writeFileSync(filePath, '');
    console.log(`File '${fileName}' created successfully\n`);
    callPropmpt();
}

function renameFile(oldPath, newName) {
    const newPath = path.join(currentDirectory, newName);
    fs.renameSync(oldPath, newPath);
    console.log(`File '${oldPath}' renamed to '${newName}'\n`);
    callPropmpt();
}

function copyFile(sourcePath, destinationPath) {
    const sourceStream = fs.createReadStream(sourcePath);
    const destinationStream = fs.createWriteStream(destinationPath);

    sourceStream.pipe(destinationStream);
    destinationStream.on('finish', () => {
        console.log(`File '${sourcePath}' copied to '${destinationPath}'\n`);
        callPropmpt();
    });
}

function moveFile(sourcePath, destinationPath) {
    fs.rename(sourcePath, destinationPath, err => {
        if (err) {
            console.log('Operation failed\n');
        } else {
            console.log(`File '${sourcePath}' moved to '${destinationPath}'\n`);
        }
        callPropmpt();
    });
}

function deleteFile(filePath) {
    fs.unlink(filePath, err => {
        if (err) {
            console.log('Operation failed\n');
        } else {
            console.log(`File '${filePath}' deleted successfully\n`);
        }
        callPropmpt();
    });
}

function getOSInfo(command) {
    switch (command) {
        case '--EOL':
            console.log(`End-Of-Line: ${require('os').EOL}\n`);
            break;
        case '--cpus':
            const cpus = require('os').cpus();
            console.log('CPUs:');
            cpus.forEach((cpu, index) => {
                console.log(`CPU ${index + 1}: ${cpu.model} ${cpu.speed}GHz`);
            });
            console.log();
            break;
        case '--homedir':
            console.log(`Home directory: ${require('os').homedir()}\n`);
            break;
        case '--username':
            console.log(`Current username: ${require('os').userInfo().username}\n`);
            break;
        case '--architecture':
            console.log(`CPU architecture: ${process.arch}\n`);
            break;
        default:
            console.log('Invalid command\n');
            break;
    }
    callPropmpt();
}
function calculateHash(filePath) {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256');
    const fileStream = fs.createReadStream(filePath);

    fileStream.on('data', data => hash.update(data));
    fileStream.on('end', () => {
        console.log(`Hash of '${filePath}': ${hash.digest('hex')}\n`);
        callPropmpt();
    });
}

function compressFile(filePath, destinationPath) {
    const fileStream = fs.createReadStream(filePath);
    const gzipStream = zlib.createBrotliCompress();
    const destinationStream = fs.createWriteStream(destinationPath);

    fileStream.pipe(gzipStream).pipe(destinationStream);
    destinationStream.on('finish', () => {
        console.log(`File '${filePath}' compressed to '${destinationPath}'\n`);
        callPropmpt();
    });
}

function decompressFile(filePath, destinationPath) {
    const fileStream = fs.createReadStream(filePath);
    const gunzipStream = zlib.createBrotliDecompress();
    const destinationStream = fs.createWriteStream(destinationPath);

    fileStream.pipe(gunzipStream).pipe(destinationStream);
    destinationStream.on('finish', () => {
        console.log(`File '${filePath}' decompressed to '${destinationPath}'\n`);
        callPropmpt();
    });
}



function addListeners(rl) {
    rl.on('line', line => {
        const [command, ...args] = line.trim().split(' ');

        switch (command) {
            case 'ls':
                listFiles();
                break;
            case 'cd':
                changeDirectory(args[0]);
                break;
            case 'up':
                navigateUp();
                break;
            case 'cat':
                readFile(path.join(currentDirectory, args[0]));
                break;
            case 'add':
                createFile(args[0]);
                break;
            case 'rn':
                renameFile(path.join(currentDirectory, args[0]), args[1]);
                break;
            case 'cp':
                copyFile(path.join(currentDirectory, args[0]), path.join(currentDirectory, args[1]));
                break;
            case 'mv':
                moveFile(path.join(currentDirectory, args[0]), path.join(currentDirectory, args[1]));
                break;
            case 'rm':
                deleteFile(path.join(currentDirectory, args[0]));
                break;
            case 'os':
                getOSInfo(args[0]);
                break;
            case 'hash':
                calculateHash(path.join(currentDirectory, args[0]));
                break;
            case 'compress':
                compressFile(path.join(currentDirectory, args[0]), path.join(currentDirectory, args[1]));
                break;
            case 'decompress':
                decompressFile(path.join(currentDirectory, args[0]), path.join(currentDirectory, args[1]));
                break;
            default:
                console.log('Invalid input\n');
                callPropmpt()
                break;
        }



    }).on('close', () => {
        console.log(`Thank you for using File Manager, ${username}, goodbye!`);
    });
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
addListeners(rlGlobal)
printCurrentDirectory();
callPropmpt()




