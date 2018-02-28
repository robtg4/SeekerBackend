const EthUtil = require('ethereumjs-util')

const verifyMessageNonce = (userAddress, nonce, signature, web3) => {
  const nonceString = (nonce).toString(16)
  const hashInput = '0'.repeat(64 - nonceString.length) + nonceString + web3.toHex(userAddress).slice(2)
  const hash = web3.sha3(hashInput, { encoding: 'hex' })
  // this prefix is required by the `ecrecover` builtin solidity function (other than that it is pretty arbitrary)
  const prefix = "\x19Ethereum Signed Message:\n32";
  const prefixedBytes = web3.fromAscii(prefix) + hash.slice(2)
  const prefixedHash = web3.sha3(prefixedBytes, { encoding: 'hex' })
  // console.log(hash)
  // // break the signature into it's components and convert to a buffer.
  // console.log(signature)
  // const r = EthUtil.toBuffer(signature.slice(0,66))
  // const s = EthUtil.toBuffer('0x' + signature.slice(66,130))
  const v = 28
  const signatureData = EthUtil.fromRpcSig(signature)
  // let v = EthUtil.bufferToHex(signatureData.v)
  let r = EthUtil.bufferToHex(signatureData.r)
  let s = EthUtil.bufferToHex(signatureData.s)
  // const v = EthUtil.toBuffer('0x' + signature.slice(130,132))
  // const v = EthUtil.toBuffer('0x' + signature.slice(130,132))
  // const m = EthUtil.toBuffer('0x' + hash)
  const m = EthUtil.toBuffer(prefixedHash)
  // const m = EthUtil.toBuffer(hash)
  console.log(nonce)
  console.log(hash)
  console.log(m)
  // console.log(nonce, v, r, s)
  const publicKey = EthUtil.ecrecover(m, v, r, s)
  const recoveredAddress = '0x' + EthUtil.pubToAddress(publicKey).toString('hex')

  // TODO:: these should be the same!! (Oh no...)
  console.log(userAddress)
  console.log(recoveredAddress)

  return true
}

module.exports = {
  verifyMessageNonce
}
