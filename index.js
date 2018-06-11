module.exports = function (bundler) {
    bundler.addAssetType('js', require.resolve('./AtomicAsset'));
    bundler.addAssetType('jsx', require.resolve('./AtomicAsset'));
};