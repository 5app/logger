/**
 * importFresh file
 * @param {string} modulePath - path to the module to import
 * @returns {Promise<*>} Returns the default imported module handler
 */
export async function importFresh(modulePath) {
	const cacheBustingModulePath = `${modulePath}?update=${Date.now()}`;
	return (await import(cacheBustingModulePath)).default;
}
