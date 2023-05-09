import { useState } from "react";
import server from "./server";
import { keccak256 } from 'ethereum-cryptography/keccak';
import { utf8ToBytes, bytesToHex } from 'ethereum-cryptography/utils';
import * as secp from 'ethereum-cryptography/secp256k1';



function Transfer({ address, privateKey, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    const message = `Transfer ${sendAmount} funds from account ${address} to account ${recipient}`; 
    const messageHash = keccak256(utf8ToBytes(message));
     // Debugging: Log the message and message hash
     console.log("Message:", message);
     console.log("Message Hash:", bytesToHex(messageHash));
    const [ signature, recoveryBit ] = await secp.sign(messageHash, privateKey, { recovered: true });
   // Debugging: Log the signature and recovery bit
    console.log("Signature:", bytesToHex(signature));
    console.log("Recovery Bit:", recoveryBit);
    try {     
      const {
        data: { balance },
      } = await server.post(`send`, {
        sender: address,
        amount: parseInt(sendAmount),
        recipient,
        signature: bytesToHex(signature),
        recoveryBit,
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;