const ethUtils = require('ethereumjs-util')

const verifyMessageNonce = (userAddress, nonce, signature, web3) => {

  const idString = (new web3.BigNumber(nonce)).toString(16)
  const hashInput = '0'.repeat(64 - idString.length) + idString
  const hash = web3.sha3(hashInput, { encoding: 'hex' })

  // this prefix is required by the `ecrecover` builtin solidity function (other than that it is pretty arbitrary)
  const prefix = "\x19Ethereum Signed Message:\n32";
  const prefixedBytes = web3.fromAscii(prefix) + hash.slice(2)
  const prefixedHash = web3.sha3(prefixedBytes, { encoding: 'hex' })

  const signatureData = ethUtils.fromRpcSig(signature)
  let rutil = ethUtils.bufferToHex(signatureData.r)
  let sutil = ethUtils.bufferToHex(signatureData.s)
  var echashbuf = Buffer.from(prefixedHash.slice(2), 'hex')
  var pubkey = ethUtils.ecrecover(echashbuf, signatureData.v, rutil, sutil)

  // check that the user address is the same as the recoverd address:
  const isValidNonce = userAddress === '0x' + ethUtils.publicToAddress(pubkey).toString('hex')

  return isValidNonce
}

module.exports = {
  verifyMessageNonce
}
