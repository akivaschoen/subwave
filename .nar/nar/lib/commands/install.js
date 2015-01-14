// Generated by LiveScript 1.3.1
var nar, common, program, echo, extend, createBar, onExtract, onDownload, onStart, onError, onProgress, onEntry, updateBar, onDownloadEnd, install;
nar = require('../nar');
common = require('./common');
program = require('commander');
echo = common.echo, extend = common.extend, createBar = common.createBar, onExtract = common.onExtract, onDownload = common.onDownload, onStart = common.onStart, onError = common.onError, onProgress = common.onProgress, onEntry = common.onEntry, updateBar = common.updateBar, onDownloadEnd = common.onDownloadEnd;
program.command('install <archive>').description('\n  Install archive').usage('<archive> [options]').option('-o, --output <path>', 'Install directory. Default to node_modules').option('-f, --filename <name>', 'Downloaded filename. Default taken from URL path name').option('-u, --user <user>', 'HTTP autenticantion user').option('-p, --password <password>', 'HTTP user password').option('--proxy <url>', 'Proxy server URL to use').option('--timeout <number>', 'HTTP request timeout').option('--strict-ssl', 'Enable strict SSL').option('-d, --debug', 'Enable debug mode. More information will be shown').option('-v, --verbose', 'Enable verbose mode. A lot of information will be shown').option('-s, --save', 'Save as runtime dependency in package.json').option('-sd, --save-dev', 'Save as development dependency in package.json').option('-sp, --save-peer', 'Save as peer dependency in package.json').option('-g, --global', 'Install as global dependency').option('--clean', 'Remove downloaded file after install').on('--help', function(){
  return echo('  Usage examples:\n\n    $ nar install app.nar --save\n    $ nar install app.nar -o some/dir\n    $ nar install app.nar --debug\n    $ nar install http://server.net/app-0.1.0.nar\n\t');
}).action(function(){
  return install.apply(this, arguments);
});
install = function(archive, options){
  var debug, verbose, output, strictSsl, bar, opts, onStart, onEnd, extract, e;
  debug = options.debug, verbose = options.verbose, output = options.output, strictSsl = options.strictSsl;
  bar = createBar();
  opts = extend(options, {
    path: archive,
    dest: output,
    strictSSL: strictSsl
  });
  if (options.user) {
    opts.auth = {
      user: options.user,
      password: options.password
    };
  }
  onStart = function(){
    return echo(
    "Installing archive...");
  };
  onEnd = function(it){
    return echo(
    "Installed in: " + it.dest);
  };
  extract = function(){
    var installer;
    installer = nar.install(opts).on('start', onStart).on('progress', onProgress(
    bar)).on('download', onDownload).on('error', onError(
    debug)).on('downloadEnd', onDownloadEnd(
    bar)).on('end', onEnd);
    if (debug || verbose) {
      return installer.on('entry', onEntry(
      'Extract'));
    }
  };
  try {
    return extract();
  } catch (e$) {
    e = e$;
    return onError(debug)(
    "Cannot install the archive: " + e.message);
  }
};