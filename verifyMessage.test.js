require("babel-polyfill");

import { assert, expect } from 'chai'
import { signNonce } from './utils/nonceSign'
import { verifyMessageNonce } from './verifyMessage'
const privateKeyProvider = require('./utils/privateKeyProviderEngine')
const TestRPC = require('ganache-cli')
const Web3 = require('web3')
const Promise = require('bluebird');


describe("verifyMessage", () => {
  // const privKey = '0x4e6d25d39985ffd002a291323e73d819cf43da0a493a9304eac37bda6fedec5d'
  // const publicKey = '0xbd61a5620DBd79473DF9C26BD0CEa42B1ce3dc70'
  let web3
  let accounts

  // beforeEach(() => {
  // })

  it('should veryfy a correctly generated signature', async () => {
    web3 = new Web3() //Genache for now make configurable
    // NOTE:: Following 2 lines left here only for reference:
    // const gasPayingAccount = web3.eth.accounts.privateKeyToAccount(privKey)
    // web3.setProvider(new privateKeyProvider(privKey, 'http://localhost:8545'))

    web3.setProvider(TestRPC.provider())
    if (typeof web3.eth.getAccountsPromise === 'undefined') {
      Promise.promisifyAll(web3.eth, { suffix: 'Promise' });
    }
    const accounts = await web3.eth.getAccountsPromise()
    console.log(accounts)
    // left here for curiosity, why the hell is this not the same as `accounts` ???
    console.log(Object.keys(TestRPC.provider().manager.state.accounts))

    const nonce = Math.floor(Math.random() * 80000000)

    const signedNonce = await signNonce(nonce, accounts[0], web3)

    assert(verifyMessageNonce(accounts[0], nonce, signedNonce, web3))
  })
})
