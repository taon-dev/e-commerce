import { context, analyzeMetafile } from 'esbuild';
import fse from 'fs-extra';
import path from 'path';
import external from './external';

const isWatchBuild = process.argv.includes('-w') || process.argv.includes('--watch');
const ctx = await context({
	entryPoints: ['src/index.ts'],
	outfile: 'dist/worker.js',
	bundle: true,
	format: 'esm',
	platform: 'node',
	treeShaking: true,
  // minify: true,
	// legalComments: 'none',
	metafile: true,
	inject: [
		path.resolve(process.cwd(), 'src/esbuild-tslib-inject.ts'),
	],
	mainFields: ['module', 'main'],
	external,
});

if (isWatchBuild) {

	await ctx.watch();
	console.log('[DEV] Compilation Done...');
} else {

	const result = await ctx.rebuild();
	console.log('[DEV] Single build Done...');

	const report = await analyzeMetafile(result.metafile, {
		verbose: true,
	});

	fse.writeFileSync(
		path.join(process.cwd(), 'metadata'),
		report,
		'utf8',
	);
	console.log('[DEV] Metadata Analysiis Done...');
	process.exit(0)
}




// Optional: build immediately


// // build.ts
// import { build } from 'esbuild';
// import { analyzeMetafile } from 'esbuild';
// import fse from 'fs-extra'
// import path from 'path';

// const result = await build({
//   entryPoints: ['src/index.ts'],
//   outfile: 'dist/worker.js',
//   bundle: true,
//   // banner: {
//   //   js: `console.log("### USING CUSTOM TAON ESBUILD BUNDLE ###");`,
//   // },
//   legalComments: 'none',
//   format: 'esm',
//   platform: 'node',
//   // minify: true,
//   treeShaking: true,
//   // 🔥 FIX HERE
//   inject: [
//     path.resolve(process.cwd(), 'src/esbuild-tslib-inject.ts'),
//   ],

//   mainFields: ['module', 'main'],

//   // VERY IMPORTANT
//   external: [
//     "express",//  ✅
//     "express-session", //  ✅
//     'node:*',//  ✅
//     'fs',//  ✅
//     'path',//  ✅
//     'http',//  ✅
//     'http2',//  ✅
//     'buffer',//  ✅
//     'url',//  ✅
//     'electron',//  ✅
//     'body-parser', //  ✅
//     'cookie-parser', //  ✅
//     'method-override', //  ✅
//     'child_process', //  ✅
//     'cors', //  ✅
//     'crypto',//  ✅
//     'os',//  ✅
//     'net',//  ✅
//     'tls',//  ✅
//     'pg',//  ✅
//     'mysql',//  ✅
//     'mysql2',//  ✅
//     'mariadb',//  ✅
//     'sql.js',//  ✅
//     'mongodb',//  ✅
//     'sqlite3',//  ✅
//     'better-sqlite3', //  ✅
//     'highlight.js',//  ✅
//     'cheerio',//  ✅
//     '@inquirer/editor',//  ✅
//     '@inquirer/core',//  ✅
//     '@inquirer/prompts',//  ✅
//     'prompts',//  ✅
//     'inquirer',//  ✅
//     'enquirer',//  ✅
//     'engine.io-client',//  ✅
//     'chokidar',//  ✅
//     'copy-paste',//  ✅
//     'cross-spawn-async', //  ✅
//     'inquirer-select-pro',//  ✅
//     'socket.io-client',//  ✅
//     'socket.io',//  ✅
//     'cfonts',//  ✅
//     'node-notifier',//  ✅
//     '@huggingface/transformers',//  ✅
//     'dbus-next', //  ✅
//     '@parcel/watcher', //  ✅
//     'favicons', //  ✅
//     'multer',//  ✅

//     // 'taon-typeorm',
//     // 'jscodeshift',
//     // 'js-yaml',
//     // 'mime-db', // 200kb
//     // 'json-stringify-safe',
//     // 'progress',
//     // 'notifiers',
//     // 'iconv-lite',
//     // 'mime-types',

//     // 'mkdirp',
//     // 'json-stringify-safe',
//   ], // don't externalize tslib
//   metafile: true
// });




// const res = await analyzeMetafile(result.metafile, { verbose: true });
// fse.writeFileSync(path.join(process.cwd(), 'metadata'), res, {
//   encoding: 'utf-8'
// });