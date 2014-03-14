$(document).ready(function() {

  var M = 2;
  var N = 3;

  var bitcore = require('bitcore');
  bitcore.buffertools.extend();
  
  var Key = bitcore.Key;
  var util = bitcore.util;
  var networks = bitcore.networks;
  var network = networks.livenet;
  var Address = bitcore.Address;
  var Script = bitcore.Script;

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
  for (var i = 0; i<N; i++) {
    var privQR = new QRCode("privQR"+(i+1), {
      width: 96,
      height: 96,
      colorDark : "#d9534f",
      colorLight : "#ffffff",
    });
    privQRs.push(privQR);
    var pubQR = new QRCode("pubQR"+(i+1), {
      width: 96,
      height: 96,
      colorDark : "#5cb85c",
      colorLight : "#ffffff",
    });
    pubQRs.push(pubQR);
  }
  var pubQR = new QRCode("pubQR", {
    width: 256,
    height: 256,
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
      var privHex = k.private.toHex();
      var pubHex = k.public.toHex();
      privQRs[i].makeCode(privHex);
      pubQRs[i].makeCode(pubHex);
      $('#private'+(i+1)).html(' <span class="label label-danger">priv</span> '+privHex);
      $('#public'+(i+1)).html(pubHex+' <span class="label label-success">pub</span> ');
    }
    var redeemScript = getRedeemScript(ks);
    var hash = util.sha256ripe160(redeemScript.buffer);
    var addr = new Address(network.addressScript, hash);
    pubQR.makeCode(addr.toString());
    $('#public').text(addr.toString());
  });
  $('#gen').click();
  $('#net').click(function() {
    network = network === networks.livenet? networks.testnet : networks.livenet;
    $('#gen').click();
  });
  $('#print').click(function() {
    $('#controls').hide();
    $('.page-header').hide();
    window.print();
    $('#controls').show();
    $('.page-header').show();
  });
});
