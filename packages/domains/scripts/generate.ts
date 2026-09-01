import { Project } from 'ts-morph';
import path from 'path';
import fs from 'fs';
import { log } from 'console';

// Script is always run from the package root (packages/domains)
const root = process.cwd();

// Map TypeScript primitive types -> TypeSpec types
function tsTypeToTsp(typeName: string): string {
  const t = typeName.trim();

  // Handle union types: Date | null -> utcDateTime | null
  if (t.includes('|')) {
    return t
      .split('|')
      .map((subType) => tsTypeToTsp(subType.trim()))
      .join(' | ');
  }

  // Handle array types: T[] -> T[]
  if (t.endsWith('[]')) {
    const inner = t.slice(0, -2);
    return `${tsTypeToTsp(inner)}[]`;
  }

  switch (t) {
    case 'string':
      return 'string';
    case 'number':
      return 'int32';
    case 'boolean':
      return 'boolean';
    case 'Date':
      return 'utcDateTime';
    case 'null':
      return 'null';
    default:
      return t;
  }
}

function buildModelBlock(
  name: string,
  props: { name: string; optional: boolean; typeText: string }[],
): string {
  const lines: string[] = [];
  lines.push(`  model ${name} {`);

  // Base fields that are replaced by ...BaseEntity; spread
  const BASE_FIELDS = ['id', 'createdAt', 'updatedAt', 'deletedAt'];

  const hasBaseFields = props.some((p) => BASE_FIELDS.includes(p.name));
  const domainProps = props.filter((p) => !BASE_FIELDS.includes(p.name));

  if (hasBaseFields) {
    lines.push(`    ...BaseEntity;`);
    if (domainProps.length > 0) lines.push('');
  }

  for (const prop of domainProps) {
    const tspType = tsTypeToTsp(prop.typeText);
    lines.push(`    ${prop.name}${prop.optional ? '?' : ''}: ${tspType};`);
  }

  lines.push('  }');
  return lines.join('\n');
}

const SKIP_PROPS = new Set(['schema']);

const entitiesGlob = path.join(root, 'src/entities/**/*.ts');
const outPath = path.join(
  root,
  '../../packages/client/spec/models/entities.tsp',
);

const project = new Project({
  tsConfigFilePath: path.join(root, 'tsconfig.json'),
  skipAddingFilesFromTsConfig: true,
});

project.addSourceFilesAtPaths(entitiesGlob);

fs.mkdirSync(path.dirname(outPath), { recursive: true });

const blocks: string[] = [];

for (const sourceFile of project.getSourceFiles()) {
  // Generate TypeSpec enums from TypeScript enums
  for (const en of sourceFile.getEnums()) {
    const enumName = en.getName();
    if (!enumName) continue;

    const lines: string[] = [];
    lines.push(`  enum ${enumName} {`);

    for (const member of en.getMembers()) {
      const memberName = member.getName();
      const value = member.getValue();
      if (typeof value === 'string') {
        lines.push(`    ${memberName}: "${value}",`);
      } else if (typeof value === 'number') {
        lines.push(`    ${memberName}: ${value},`);
      } else {
        lines.push(`    ${memberName},`);
      }
    }

    lines.push('  }');
    blocks.push(lines.join('\n'));
  }

  // Generate TypeSpec models from TypeScript interfaces
  for (const iface of sourceFile.getInterfaces()) {
    const name = iface.getName();
    if (!name) continue;

    const props = iface.getProperties().map((p) => ({
      name: p.getName(),
      optional: p.hasQuestionToken(),
      typeText: p.getTypeNode()?.getText() ?? p.getType().getText(p),
    }));

    blocks.push(buildModelBlock(`${name}`, props));
  }

  // Generate TypeSpec models from TypeScript type aliases
  for (const typeAlias of sourceFile.getTypeAliases()) {
    const name = typeAlias.getName();
    if (!name) continue;

    const typeNode = typeAlias.getTypeNode();
    if (!typeNode) continue;

    const typeObj = typeAlias.getType();
    if (!typeObj.isObject()) continue;

    const props = typeObj.getProperties().map((sym) => {
      const decl = sym.getDeclarations()?.[0];
      const optional = sym.isOptional();
      let typeText: string;
      if (decl !== undefined && 'getTypeNode' in decl) {
        const node = (
          decl as { getTypeNode?: () => { getText(): string } | undefined }
        ).getTypeNode;
        typeText = node
          ? (node.call(decl)?.getText() ??
            sym.getTypeAtLocation(decl).getText())
          : sym.getTypeAtLocation(decl).getText();
      } else if (decl !== undefined) {
        typeText = sym.getTypeAtLocation(decl).getText();
      } else {
        typeText = sym.getDeclaredType().getText();
      }
      return { name: sym.getName(), optional, typeText };
    });

    blocks.push(buildModelBlock(`${name}`, props));
  }

  // Generate TypeSpec models from TypeScript classes
  for (const cls of sourceFile.getClasses()) {
    const className = cls.getName();
    if (!className) continue;

    const props = cls
      .getProperties()
      .filter((p) => !SKIP_PROPS.has(p.getName()))
      .map((p) => ({
        name: p.getName(),
        optional: p.hasQuestionToken(),
        typeText: p.getTypeNode()?.getText() ?? p.getType().getText(p),
      }));

    blocks.push(buildModelBlock(`${className}`, props));
  }
}

// Build BaseEntity template and write final output
const baseEntityTemplate = `  model BaseEntity {
    id: string;
    createdAt: utcDateTime;
    updatedAt: utcDateTime;
  }`;

const finalTspContent = `namespace Domain.Entity;\n\n${baseEntityTemplate}\n\n${blocks.join('\n\n')}\n`;

fs.writeFileSync(outPath, finalTspContent, 'utf-8');
log(`Generated: ${outPath}`);
