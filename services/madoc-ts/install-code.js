const { genSalt, hash } = require('bcrypt');
const { red, white, bold, bgMagenta, bgGreen } = require('chalk');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function passwordHash(password) {
  const salt = await genSalt(14);
  return hash(password, salt);
}

function success(code) {
  passwordHash(code).then(c => {
    console.log(`
${bgGreen`Success!`}

    ${bold`Passphrase`}: ${`${code}`}
    ${bold`Code`}:       ${`${c}`}

${white`
In order to use your installation code, add the following to your .env file 
or to the env inside of the madoc-ts container.`}

${`MADOC_INSTALLATION_CODE="${c}"`}
${white`
And restart the container. When you navigate to Madoc you will be prompted 
for the passphrase, which will be validated against this code. 
You will then be prompted to install Madoc (first site, admin user).
`}

${bgMagenta`Once you have completed this installation process, you should remove this 
environment variable.`}
`);
    readline.close();
  });
}

readline.question('Type a passphrase: ', code => {
  if (!code || !code.trim()) {
    console.log(red`Invalid passphrase`);
    return;
  }

  success(code);
});
