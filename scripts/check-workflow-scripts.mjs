import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const missingBindingOrImport = new Set([2304, 2305, 2306, 2307, 2459, 2552, 2580, 2614, 2724, 18004]);
const defaults = ['scripts/check-runtime-baseline.mjs', 'scripts/check-staged-scope.mjs', 'scripts/check-database-boundaries.mjs', 'scripts/check-workflow-scripts.mjs', 'scripts/test-workflow-script-quality.mjs'];

/** Compile in-memory sources; only installed declarations may be read from disk. */
export function checkSources(sources) {
  const inputs = new Map([...sources].map(([name, source]) => [path.resolve(name), source]));
  const options = {
    allowJs: true, checkJs: true, noEmit: true, skipLibCheck: true,
    target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext, types: ['node'],
    noUncheckedSideEffectImports: true, allowImportingTsExtensions: true,
  };
  const host = ts.createCompilerHost(options);
  const originalRead = host.readFile;
  const originalExists = host.fileExists;
  const installedDeclarationsRoot = fs.realpathSync(path.join(root, 'node_modules'));
  const declaration = (name) => {
    const eligible = (file) => /\.d\.(?:ts|mts|cts)$/.test(file) || path.basename(file) === 'package.json';
    if (!eligible(name)) return false;
    let canonical;
    try { canonical = fs.realpathSync(name); } catch { return false; }
    const relative = path.relative(installedDeclarationsRoot, canonical);
    return eligible(canonical) && relative !== '' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative)
      && relative !== '..';
  };
  host.readFile = (name) => inputs.get(path.resolve(name)) ?? (declaration(name) ? originalRead(name) : undefined);
  host.fileExists = (name) => inputs.has(path.resolve(name)) || (declaration(name) && originalExists(name));
  host.getSourceFile = (name, languageVersion) => {
    const source = host.readFile(name);
    return source === undefined ? undefined : ts.createSourceFile(name, source, languageVersion, true);
  };
  host.writeFile = () => { throw new Error('Workflow source checking cannot emit files'); };
  const program = ts.createProgram([...inputs.keys()], options, host);
  const diagnostics = [];
  for (const name of inputs.keys()) {
    const source = program.getSourceFile(name);
    if (!source) throw new Error('Selected workflow source could not be parsed');
    const scanner = ts.createScanner(ts.ScriptTarget.ESNext, false, ts.LanguageVariant.Standard, inputs.get(name));
    let suppressed = false;
    for (let token = scanner.scan(); token !== ts.SyntaxKind.EndOfFileToken; token = scanner.scan()) {
      if ((token === ts.SyntaxKind.SingleLineCommentTrivia || token === ts.SyntaxKind.MultiLineCommentTrivia)
          && /@ts-(?:nocheck|ignore|expect-error)\b/.test(scanner.getTokenText())) suppressed = true;
    }
    if (suppressed) {
      diagnostics.push({ file: name, line: 1, column: 1, code: 'suppression', message: 'Selected workflow scripts must not suppress compiler diagnostics' });
    }
    for (const item of [...program.getSyntacticDiagnostics(source), ...program.getSemanticDiagnostics(source).filter((item) => missingBindingOrImport.has(item.code))]) {
      const location = source.getLineAndCharacterOfPosition(item.start ?? 0);
      diagnostics.push({ file: name, line: location.line + 1, column: location.character + 1, code: item.code, message: ts.flattenDiagnosticMessageText(item.messageText, ' ') });
    }
  }
  return diagnostics;
}

/** Admit finite, regular, canonical public script paths before reading source. */
export function admitScriptFiles(entries, companions = []) {
  if (!entries.length) throw new Error('Select at least one workflow script');
  const admitted = new Set();
  for (const [entry, companion] of [...entries.map((entry) => [entry, false]), ...companions.map((entry) => [entry, true])]) {
    const allowed = companion
      ? /^(?:scripts|lib)\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]+\.(?:mjs|cjs|js|ts|mts|cts)$/
      : /^scripts\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]+\.(?:mjs|cjs|js)$/;
    if (typeof entry !== 'string' || !allowed.test(entry)
        || entry.split('/').some((part) => /^(?:private|secrets?|credentials?|runtime|data|backups?|uploads?)$/i.test(part))) {
      throw new Error('Only explicit canonical public script entries and source companions are admitted');
    }
    const absolute = path.join(root, entry);
    if (fs.realpathSync(absolute) !== absolute || !fs.lstatSync(absolute).isFile()) {
      throw new Error('Workflow source must be a regular file without symlink traversal');
    }
    if (admitted.has(absolute)) throw new Error('Duplicate workflow script');
    admitted.add(absolute);
  }
  return [...admitted];
}

export function main(args) {
  const entries = [], companions = [];
  for (let index = 0; index < args.length; index++) {
    if (args[index] === '--include') {
      if (!args[index + 1] || args[index + 1].startsWith('--')) throw new Error('Missing companion source');
      companions.push(args[++index]);
    } else entries.push(args[index]);
  }
  const files = admitScriptFiles(entries.length ? entries : defaults, companions);
  const started = performance.now();
  const diagnostics = checkSources(new Map(files.map((file) => [file, fs.readFileSync(file, 'utf8')])));
  for (const item of diagnostics) {
    console.error(`${path.relative(root, item.file)}:${item.line}:${item.column} TS${item.code}: ${item.message}`);
  }
  if (diagnostics.length) return 1;
  console.log(`Workflow script quality passed (${files.length} selected files, ${Math.round(performance.now() - started)}ms; static only, no target execution).`);
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try { process.exitCode = main(process.argv.slice(2)); }
  catch { console.error('Workflow script selection or compiler setup failed; use canonical public script paths and explicit source companions. No target was executed.'); process.exitCode = 2; }
}
