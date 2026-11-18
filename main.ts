import {readFileSync,writeFileSync,mkdirSync,readdirSync,copyFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildBoard} from './dashboard/model.js';
import {buildDossier} from './vendor/makefun-board.ts';
const root=dirname(fileURLToPath(import.meta.url));
const out=process.env.MAKEFUN_OUTPUT_DIR||'/output';
const input=process.env.MAKEFUN_SNAPSHOT_FILE||'/input/snapshot.json';
const snapshot=JSON.parse(readFileSync(input,'utf8'));
const board=buildBoard(snapshot);
function copyTree(source:string,destination:string){mkdirSync(destination,{recursive:true});for(const entry of readdirSync(source,{withFileTypes:true})){const a=join(source,entry.name),b=join(destination,entry.name);if(entry.isDirectory())copyTree(a,b);else if(entry.isFile())copyFileSync(a,b);else throw new Error('Only ordinary static files are accepted');}}
mkdirSync(out,{recursive:true});
copyTree(join(root,'dashboard'),join(out,'dashboard'));
copyTree(join(root,'screenshots'),join(out,'screenshots'));
writeFileSync(join(out,'board.json'),JSON.stringify(board));
writeFileSync(join(out,'data.js'),'window.BEACON='+JSON.stringify(board).replaceAll('<','\\u003c')+';\n');
writeFileSync(join(out,'dossier.json'),buildDossier(out,{text_max_bytes:65536}));
