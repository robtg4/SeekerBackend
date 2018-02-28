require("babel-polyfill")

import { computeMintedSignature, computeNonceSignature } from './utils/tokenIssue'
import { assert, expect } from 'chai'
import { verifyMessageNonce } from './verifyMessage'
const privateKeyProvider = require('./utils/privateKeyProviderEngine')
const TestRPC = require('ganache-cli')
const Web3 = require('web3')
const Promise = require('bluebird')


describe("verifyMessage", async () => {
  const privKey = '0x4e6d25d39985ffd002a291323e73d819cf43da0a493a9304eac37bda6fedec5d'
  // const publicKey = '0xbd61a5620DBd79473DF9C26BD0CEa42B1ce3dc70'
  let web3
  let accounts

  beforeEach(async () => {
    web3 = new Web3() //Genache for now make configurable

    web3.setProvider(new privateKeyProvider(privKey, 'http://localhost:7545'))
    if (typeof web3.eth.getAccountsPromise === 'undefined') {
      Promise.promisifyAll(web3.eth, { suffix: 'Promise' });
    }
    accounts = await web3.eth.getAccountsPromise()
  })

  it('should veryfy a correctly generated signature', async () => {
    const {
      prefixedHash,
      signature,
    } = await computeNonceSignature(1, accounts[0], web3)

    const isCorrectSignature = verifyMessageNonce(accounts[0], 1, signature, web3)
    assert(isCorrectSignature)
  })
})
