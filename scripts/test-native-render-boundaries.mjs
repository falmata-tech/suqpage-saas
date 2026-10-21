import assert from 'node:assert/strict';
import ts from 'typescript';

// A falsy string in `condition && <Element>` remains a raw text child.
// React Native View rejects that child; Text/Copy intentionally accept strings.
const config=ts.readConfigFile('apps/mobile/tsconfig.json',ts.sys.readFile);
assert.equal(config.error,undefined);
const parsed=ts.parseJsonConfigFileContent(config.config,ts.sys,'apps/mobile');
const program=ts.createProgram(parsed.fileNames,parsed.options),checker=program.getTypeChecker(),violations=[];
for(const source of program.getSourceFiles()){
 if(!source.fileName.includes('/apps/mobile/')||!source.fileName.endsWith('.tsx')||source.fileName.includes('/node_modules/'))continue;
 function visit(node){
  if(ts.isJsxExpression(node)&&node.expression&&node.parent&&(ts.isJsxElement(node.parent)||ts.isJsxFragment(node.parent))){
   const value=node.expression;
   if(ts.isBinaryExpression(value)&&value.operatorToken.kind===ts.SyntaxKind.AmpersandAmpersandToken){
    let parent=node.parent;while(parent&&!ts.isJsxElement(parent))parent=parent.parent;
    const tag=parent?.openingElement.tagName.getText(source),type=checker.getTypeAtLocation(value.left),parts=type.isUnion()?type.types:[type];
    if(!['Text','Copy','LinkedText'].includes(tag)&&parts.some(part=>(part.flags&ts.TypeFlags.String)||(part.flags&ts.TypeFlags.StringLiteral)&&part.value==='')){
     violations.push(`${source.fileName.split('/apps/mobile/')[1]}:${source.getLineAndCharacterOfPosition(node.getStart()).line+1}: ${value.left.getText(source)}`);
    }
   }
  }
  ts.forEachChild(node,visit);
 }
 visit(source);
}
assert.deepEqual(violations,[],'Falsy strings must render null/false outside native Text; use an explicit boolean condition.');
console.log('PASS native conditional rendering cannot emit empty string children under View.');
