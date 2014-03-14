$(document).ready(function() {

  var M = 2;
  var N = 3;

  var bitcore = require('bitcore');
  bitcore.buffertools.extend();
  
  var Key = bitcore.Key;
  var util = bitcore.util;
  var networks = bitcore.networks;
  var network = networks.testnet;
  var Address = bitcore.Address;
  var Script = bitcore.Script;
  var PrivateKey = bitcore.PrivateKey;

  var getPubKeys = function(ks) {
    return ks.map(function(k){
      return k.public;
    });
  };

  var getSortedPubKeys = function(ks) {
    var pubKeys = getPubKeys(ks);
    //sort lexicographically, i.e. as strings, i.e. alphabetically
    return pubKeys.sort(function(buf1, buf2) {
      var len = buf1.length > buf1.length ? buf1.length : buf2.length;
      for (var i = 0; i <= len; i++) {
        if (buf1[i] === undefined)
          return -1; //shorter strings come first
        if (buf2[i] === undefined)
          return 1;
        if (buf1[i] < buf2[i])
          return -1;
        if (buf1[i] > buf2[i])
          return 1;
        else
          continue;
      }
      return 0;
    });
  };

  var getRedeemScript = function(ks) {
    var pubKeys = getSortedPubKeys(ks);
    var script = Script.createMultisig(M, pubKeys);
    return script;
  };

  var privQRs = [];
  var pubQRs = [];
  var PRIV_SIZE = 128;
  var PUB_SIZE = 128;
  var ADDR_SIZE = 256;
  for (var i = 0; i<N; i++) {
    var privQR = new QRCode("privQR"+(i+1), {
      width: PRIV_SIZE,
      height: PRIV_SIZE,
      colorDark : "#d9534f",
      colorLight : "#ffffff",
    });
    privQRs.push(privQR);
    var pubQR = new QRCode("pubQR"+(i+1), {
      width: PUB_SIZE,
      height: PUB_SIZE,
      colorDark : "#5cb85c",
      colorLight : "#ffffff",
    });
    pubQRs.push(pubQR);
  }
  var pubQR = new QRCode("pubQR", {
    width: ADDR_SIZE,
    height: ADDR_SIZE,
  });
  $('#gen').click(function() {
    $('#print').prop('disabled', false);
    var ks = [];
    for (var i = 0; i<N; i++) {
      var k = Key.generateSync();
      ks.push(k);
    }
    for (var i = 0; i<N; i++) {
      var k = ks[i];
      var pk = new PrivateKey(network.keySecret, k.private, k.compressed);
      var privHex = pk.toString();
      var pubHex = k.public.toHex();
      privQRs[i].makeCode(privHex);
      pubQRs[i].makeCode(pubHex);
      $('#private'+(i+1)).html(' <span class="label label-danger">priv</span> '+privHex);
      $('#public'+(i+1)).html(pubHex+' <span class="label label-success">pub</span> ');
    }
    var redeemScript = getRedeemScript(ks);
    var hash = util.sha256ripe160(redeemScript.buffer);
    var addr = new Address(network.addressScript, hash);
    $('#netname').text(network === networks.livenet ? 'livenet' : 'testnet');
    pubQR.makeCode(addr.toString());
    $('#public').text(addr.toString());
  });
  $('#gen').click();
  $('#net').click(function() {
    network = network === networks.livenet? networks.testnet : networks.livenet;
    $('#gen').click();
    $('#net').toggleClass('btn-success btn-warning');
  });
  $('#print').click(function() {
    $('#controls').hide();
    $('.page-header').hide();
    window.print();
    $('#controls').show();
    $('.page-header').show();
  });
});
