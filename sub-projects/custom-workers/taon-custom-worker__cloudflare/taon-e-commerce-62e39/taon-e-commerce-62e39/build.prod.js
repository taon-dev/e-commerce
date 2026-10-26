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
  minify: true,
	legalComments: 'none',
	metafile: true,
	inject: [
		path.resolve(process.cwd(), 'src/esbuild-tslib-inject.ts'),
	],
	mainFields: ['module', 'main'],
	external,
});

if (isWatchBuild) {

	await ctx.watch();
	console.log('[PROD] Compilation Done...');
} else {

	const result = await ctx.rebuild();
	console.log('[PROD] Single build Done...');

	const report = await analyzeMetafile(result.metafile, {
		verbose: true,
	});

	fse.writeFileSync(
		path.join(process.cwd(), 'metadata'),
		report,
		'utf8',
	);
	console.log('[PROD] Metadata Analysiis Done...');
	process.exit(0)
}

