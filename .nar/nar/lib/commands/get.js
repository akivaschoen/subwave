// Generated by LiveScript 1.3.1
var progress, nar, common, program, echo, exit, isUrl, createBar, onDownload, onError, onProgress, updateBar, get;
progress = require('progress');
nar = require('../nar');
common = require('./common');
program = require('commander');
echo = common.echo, exit = common.exit, isUrl = common.isUrl, createBar = common.createBar, onDownload = common.onDownload, onError = common.onError, onProgress = common.onProgress, updateBar = common.updateBar;
program.command('get <url>').description('\n  Download archive from HTTP server').usage('<url> [options]').option('-o, --output <path>', 'Output directory. Default to current directory').option('-f, --filename <name>', 'Downloaded filename. Default taken from URL path name').option('-u, --user <user>', 'HTTP autenticantion user').option('-p, --password <password>', 'HTTP user password').option('--proxy <url>', 'Proxy server URL to use').option('--timeout <number>', 'HTTP request timeout').option('--strict-ssl', 'Enable strict SSL').option('-d, --debug', 'Enable debug mode. More information will be shown').on('--help', function(){
  return echo('  Usage examples:\n\n    $ nar get http://server.net/app.nar\n    $ nar get http://server.net/app.nar --user john --password pa$s\n    $ nar get http://server.net/app.nar --proxy http://proxy:3128\n    $ nar get http://server.net/app.nar --strict-ssl --timeout 60000\n\t');
}).action(function(){
  return get.apply(this, arguments);
});
get = function(url, options){
  var debug, output, strictSsl, bar, opts, onEnd, download, e;
  debug = options.debug, output = options.output, strictSsl = options.strictSsl;
  bar = createBar();
  opts = {
    url: url,
    dest: output,
    strictSSL: strictSsl,
    filename: options.filename,
    timeout: options.timeout,
    proxy: options.proxy
  };
  if (options.user) {
    opts.auth = {
      user: options.user,
      password: options.password
    };
  }
  if (!isUrl(
  url)) {
    exit(1)(
    echo("Invalid URL. Cannot download the archive"));
  }
  onEnd = function(it){
    updateBar(
    bar)(
    bar.total);
    return echo(
    "\nDownloaded in: " + it);
  };
  download = function(){
    return nar.get(opts).on('download', onDownload).on('progress', onProgress(
    bar)).on('error', onError(
    debug)).on('end', onEnd);
  };
  try {
    return download();
  } catch (e$) {
    e = e$;
    return onError(debug)(
    "Cannot download the archive: " + e.message);
  }
};