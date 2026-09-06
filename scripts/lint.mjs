
import fs from "fs"; import path from "path";
const root=process.cwd(); const files=[];
function walk(d){for(const n of fs.readdirSync(d)){if(n==="node_modules"||n===".git")continue;const p=path.join(d,n),s=fs.statSync(p);s.isDirectory()?walk(p):files.push(p)}}
walk(root); let errors=[];
const data=JSON.parse(fs.readFileSync(path.join(root,"data/projects.json"),"utf8"));
if(data.length!==11)errors.push(`Expected 11 projects, found ${data.length}`);
for(const p of data){if(!p.slug||!p.title||!p.summary||!p.accent)errors.push(`Incomplete project ${p.slug||"unknown"}`); const route=path.join(root,"work",p.slug,"index.html"); if(!fs.existsSync(route))errors.push(`Missing route ${p.slug}`)}
for(const f of files.filter(f=>f.endsWith(".html"))){const s=fs.readFileSync(f,"utf8"); if(!/<meta name="viewport"/.test(s) && !f.endsWith("404.html"))errors.push(`Missing viewport: ${f}`)}
const js=fs.readFileSync(path.join(root,"assets/site.js"),"utf8"); if(/Lorem ipsum/i.test(js))errors.push("Lorem ipsum found");
if(errors.length){console.error(errors.join("\n"));process.exit(1)} console.log(`Validated ${data.length} projects and ${files.filter(f=>f.endsWith(".html")).length} HTML routes.`);
