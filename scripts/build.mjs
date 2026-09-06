
import fs from "fs"; import path from "path";
const src=process.cwd(), out=path.join(src,"dist"); fs.rmSync(out,{recursive:true,force:true}); fs.mkdirSync(out,{recursive:true});
for(const n of ["index.html","404.html","about","work","assets","data"]){fs.cpSync(path.join(src,n),path.join(out,n),{recursive:true})}
console.log("Static production build written to dist/");
