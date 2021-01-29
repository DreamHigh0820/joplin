"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const tool_utils_1 = require("./tool-utils");
const sqlts = require('@rmp135/sql-ts').default;
const fs = require('fs-extra');
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // Run the CLI app once so as to generate the database file
        process.chdir(`${tool_utils_1.rootDir}/packages/app-cli`);
        yield tool_utils_1.execCommand2('npm start -- version');
        const sqlTsConfig = {
            'client': 'sqlite3',
            'connection': {
                'filename': `${require('os').homedir()}/.config/joplindev-desktop/database.sqlite`,
            },
            'tableNameCasing': 'pascal',
            'singularTableNames': true,
            'useNullAsDefault': true,
            'excludedTables': [
                'main.notes_fts',
                'main.notes_fts_segments',
                'main.notes_fts_segdir',
                'main.notes_fts_docsize',
                'main.notes_fts_stat',
            ],
        };
        const definitions = yield sqlts.toObject(sqlTsConfig);
        definitions.tables = definitions.tables.map((t) => {
            t.columns.push({
                nullable: false,
                name: 'type_',
                type: 'int',
                optional: true,
                isEnum: false,
                propertyName: 'type_',
                propertyType: 'number',
            });
            return t;
        });
        const tsString = sqlts.fromObject(definitions, sqlTsConfig)
            .replace(/": /g, '"?: ');
        const header = `// AUTO-GENERATED BY ${__filename.substr(tool_utils_1.rootDir.length + 1)}`;
        const targetFile = `${tool_utils_1.rootDir}/packages/lib/services/database/types.ts`;
        console.info(`Writing type definitions to ${targetFile}...`);
        yield fs.writeFile(targetFile, `${header}\n\n${tsString}`, 'utf8');
    });
}
main().catch((error) => {
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=generate-database-types.js.map