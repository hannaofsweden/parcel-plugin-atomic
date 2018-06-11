const JSAsset = require('parcel-bundler/src/assets/JSAsset');
const Atomizer = require('atomizer');
const fs = require('fs');
const path = require('path');

class AtomicAsset extends JSAsset {
  constructor(name, pkg, options) {
    super(name, pkg, options);
    this.atomizer = new Atomizer({verbose: true});
  }

  async parse(source) {
    let returnValue = await super.parse(source);
    this.classes=[];
    if (!this.relativeName.startsWith('node_modules')) {
      this.classes = this.atomizer.findClassNames(source);
    }
    return returnValue;
  }

  async generate() {
    if (!this.classes || !this.classes.length) {
      return super.generate();
    }
    const path = require.main.filename.split('node_modules')[0];
    const configFile = path + '.atomic-config';
    const optionsFile = path + '.atomic-options';
    let config={};
    let options={};
    if (fs.existsSync(configFile)) {
      config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    }
    if (fs.existsSync(optionsFile)) {
      options = JSON.parse(fs.readFileSync(optionsFile, 'utf8'));
    }
    const finalConfig = this.atomizer.getConfig(this.classes, config);
    const css = this.atomizer.getCss(config, options);

    let js = '';
    if (this.options.hmr) {
      this.addDependency('_css_loader');

      js = `
        var reloadCSS = require('_css_loader');
        reloadCSS();
      `;
    }

    let returnValue=[];
    if (css) returnValue.push({
      type: 'css',
      value: String(css),
      cssModules: false
    });
    let jsGenerated = await super.generate();
    returnValue.push({
      type: 'js',
      value: js + jsGenerated.js,
      sourceMap: jsGenerated.map
    });
    return returnValue;
  }

}

module.exports = AtomicAsset;