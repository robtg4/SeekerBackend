
const Wallet = require('ethereumjs-wallet')
const EthUtil = require('ethereumjs-util')

// var bip39 = require("bip39");
// var hdkey = require('ethereumjs-wallet/hdkey');
var ProviderEngine = require("web3-provider-engine");
var FiltersSubprovider = require('web3-provider-engine/subproviders/filters.js');
var HookedSubprovider = require('web3-provider-engine/subproviders/hooked-wallet.js');
var Web3Subprovider = require("web3-provider-engine/subproviders/web3.js");
var Web3 = require("web3");
var Transaction = require('ethereumjs-tx');

function privateKeyProvider(privateKey, provider_url) {
  this.wallets = {};
  this.addresses = [];

  const privateKeyBuffer = EthUtil.toBuffer(privateKey)
  const wallet = Wallet.fromPrivateKey(privateKeyBuffer)
  const addr = wallet.getAddressString()

  this.addresses.push(addr);
  this.wallets[addr] = wallet;

  const tmp_accounts = this.addresses;
  const tmp_wallets = this.wallets;

  this.engine = new ProviderEngine();
  this.engine.addProvider(new HookedSubprovider({
    getAccounts: function(cb) { cb(null, tmp_accounts) },
    getPrivateKey: function(address, cb) {
      if (!tmp_wallets[address]) { return cb('Account not found'); }
      else { cb(null, tmp_wallets[address].getPrivateKey().toString('hex')); }
    },
    signTransaction: function(txParams, cb) {
      let pkey;
      if (tmp_wallets[txParams.from]) { pkey = tmp_wallets[txParams.from].getPrivateKey(); }
      else { cb('Account not found'); }
      var tx = new Transaction(txParams);
      tx.sign(pkey);
      var rawTx = '0x' + tx.serialize().toString('hex');
      cb(null, rawTx);
    },
    signMessage: function(a, cb) {
      // TODO:: THIS FUNCTION IS BROKEN!
      let pkey;
      if (tmp_wallets[a.from]) { pkey = tmp_wallets[a.from].getPrivateKey(); }
      else { cb('Account not found'); }
      const hashed = EthUtil.hashPersonalMessage(a.data)
      const result = EthUtil.ecsign(hashed, pkey)
      cb(result)
    }
  }));
  this.engine.addProvider(new FiltersSubprovider());
  this.engine.addProvider(new Web3Subprovider(new Web3.providers.HttpProvider(provider_url)));
  this.engine.start(); // Required by the provider engine.
};

privateKeyProvider.prototype.sendAsync = function() {
  this.engine.sendAsync.apply(this.engine, arguments);
};

privateKeyProvider.prototype.send = function() {
  return this.engine.send.apply(this.engine, arguments);
};

// returns the address of the given address_index, first checking the cache
privateKeyProvider.prototype.getAddress = function(idx) {
  console.log('getting addresses', this.addresses[0], idx)
  if (!idx) { return this.addresses[0]; }
  else { return this.addresses[idx]; }
}

// returns the addresses cache
privateKeyProvider.prototype.getAddresses = function() {
  return this.addresses;
}

module.exports = privateKeyProvider;
