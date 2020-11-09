const { execCommandVerbose, rootDir } = require('./tool-utils');
const sqlts = require('@rmp135/sql-ts').default;
const fs = require('fs-extra');

async function main() {
	// Run the CLI app once so as to generate the database file
	process.chdir(`${rootDir}/packages/app-cli`);
	await execCommandVerbose('npm', ['start', '--', 'version']);

	const sqlTsConfig = {
		'client': 'sqlite3',
		'connection': {
			'filename': `${require('os').homedir()}/.config/joplindev-desktop/database.sqlite`,
		},
		'tableNameCasing': 'pascal',
		'singularTableNames': true,
		'useNullAsDefault': true, // To disable warning "sqlite does not support inserting default values"
		'excludedTables': [
			'main.notes_fts',
			'main.notes_fts_segments',
			'main.notes_fts_segdir',
			'main.notes_fts_docsize',
			'main.notes_fts_stat',
		],
	};

	const definitions = await sqlts.toObject(sqlTsConfig);

	const tsString = sqlts.fromObject(definitions, sqlTsConfig)
		.replace(/": /g, '"?: ');
	const header = `// AUTO-GENERATED BY ${__filename.substr(rootDir.length + 1)}`;

	const targetFile = `${rootDir}/packages/lib/services/database/types.ts`;
	console.info(`Writing type definitions to ${targetFile}...`);
	await fs.writeFile(targetFile, `${header}\n\n${tsString}`, 'utf8');
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
