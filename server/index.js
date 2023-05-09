const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const { keccak256 } = require('ethereum-cryptography/keccak');
const secp = require('ethereum-cryptography/secp256k1');
const { utf8ToBytes, hexToBytes, bytesToHex } = require('ethereum-cryptography/utils');


app.use(cors());
app.use(express.json());

const balances = {
  "0473f8442bcb474e54bc9b5be4a612c447674e1beeb7c93cb704ae1c3344797a767eede0fbf32bababd80c5b12bf4773feb0ee62272b3dc0ab55d52fc6ab0b01cc": 100, // dan
  "04c83857b1b8462fa5adafe50428cabc177ccf559de956e61e1116c385f07b7b2a9e32afcb182c1de48ab2d425a7d0014758718d36fbad4925ccdebb51b7e4c4ec": 50,  //al
  "0489dbf8af99eb76fb707163e4a475088504587a2ee21d10ad49beb424d40227547ab99d0b702beeda02d163d5f26d6a02b1b621c0dec16260bc07bca1e9602eff": 75,  //joe
};


app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
// To Do: get a signature from the client-side application
// recover the public address from the signature

const { sender, recipient, amount, signature, recoveryBit } = req.body; 
    const message = `Transfer ${amount} funds from account ${sender} to account ${recipient}`;
    const messageHash = keccak256(utf8ToBytes(message));
    const sSignature = hexToBytes(signature);
    const recoveredAddress = bytesToHex(secp.recoverPublicKey(messageHash, sSignature ,recoveryBit));

    // Debugging: Log the recovered address
    console.log("Message:", message);
    console.log("Message Hash:", bytesToHex(messageHash));
    console.log("Signature:", bytesToHex(sSignature));
    console.log("Recovery Bit:", recoveryBit);
    
  console.log("Recovered Address:", recoveredAddress);

  if (recoveredAddress !== sender) {
    res.status(400).json({ message: "Invalid signature" });
  } else {
    setInitialBalance(sender);
    setInitialBalance(recipient);

    // Signature is valid, proceed with the transfer
    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }
  }  
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}


