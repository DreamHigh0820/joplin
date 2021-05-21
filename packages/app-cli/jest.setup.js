const { afterEachCleanUp } = require('@joplin/lib/testing/test-utils.js');
const { shimInit } = require('@joplin/lib/shim-init-node.js');
const shim = require('@joplin/lib/shim').default;
const sharp = require('sharp');

let keytar;
try {
	keytar = shim.platformSupportsKeyChain() ? require('keytar') : null;
} catch (error) {
	console.error('Cannot load keytar - keychain support will be disabled', error);
	keytar = null;
}

shimInit(sharp, keytar);

global.afterEach(async () => {
	await afterEachCleanUp();
});
