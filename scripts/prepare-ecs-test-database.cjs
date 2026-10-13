// Run on the user's ECS only, after the existing database backup succeeds.
const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const target='forum_db_v2';
function admin(sql,database='postgres'){
 const r=spawnSync('runuser',['-u','postgres','--','psql','-At','-v','ON_ERROR_STOP=1','-d',database,'-c',sql],{cwd:'/tmp',encoding:'utf8'});
 if(r.status!==0)throw Error('数据库管理员操作失败，已停止。');return r.stdout.trim();
}
function main(){
 if(!process.argv.includes('--apply')){console.log('计划：保留 forum_db，新建空库 forum_db_v2，添加仅本机的密码认证规则，验证成功后备份并更新项目 .env。使用 --apply 执行。');return;}
 if(process.platform!=='linux'||process.getuid()!==0)throw Error('此脚本仅供 ECS 的 root 用户执行。');
 const root=path.resolve(__dirname,'..'),envFile=path.join(root,'.env');
 let text=fs.readFileSync(envFile,'utf8');
 const line=text.split('\n').find(s=>/^\s*DATABASE_URL\s*=/.test(s));
 if(!line)throw Error('项目 .env 缺少 DATABASE_URL。');
 const u=new URL(line.slice(line.indexOf('=')+1).trim().replace(/^["']|["']$/g,''));
 if(!['postgres:','postgresql:'].includes(u.protocol)||decodeURIComponent(u.username)!=='forum_user'||!['/forum_db','/forum_db_v2'].includes(u.pathname))throw Error('现有账号或数据库与已核实的 ECS 配置不符。');
 const exists=admin(`SELECT count(*) FROM pg_database WHERE datname='${target}'`)==='1';
 if(exists&&admin("SELECT count(*) FROM information_schema.tables WHERE table_schema='public'",target)!=='0')throw Error('forum_db_v2 已有数据；未覆盖，也未修改配置。');
 const method=admin("SELECT CASE WHEN rolpassword LIKE 'SCRAM-SHA-256%' THEN 'scram-sha-256' WHEN rolpassword LIKE 'md5%' THEN 'md5' ELSE 'missing' END FROM pg_authid WHERE rolname='forum_user'");
 if(!['scram-sha-256','md5'].includes(method))throw Error('数据库账号没有可用的密码认证信息。');
 if(!exists){const r=spawnSync('runuser',['-u','postgres','--','createdb','--owner','forum_user',target],{cwd:'/tmp',encoding:'utf8'});if(r.status!==0)throw Error('新建空库失败，旧库未修改。');}
 const dir='/root/baozhong-backups',stamp=Date.now();fs.mkdirSync(dir,{recursive:true,mode:0o700});fs.chmodSync(dir,0o700);
 const hba=admin('SHOW hba_file'),original=fs.readFileSync(hba,'utf8');
 const hbaBackup=path.join(dir,`pg_hba-${stamp}.backup`);fs.copyFileSync(hba,hbaBackup);fs.chmodSync(hbaBackup,0o600);
 try{
  const rule=`host ${target} forum_user 127.0.0.1/32 ${method}\n`;
  if(!original.startsWith(rule))fs.writeFileSync(hba,rule+original);
  if(admin('SELECT count(*) FROM pg_hba_file_rules WHERE error IS NOT NULL')!=='0')throw Error('认证配置检查失败。');
  if(admin('SELECT pg_reload_conf()')!=='t')throw Error('配置重载失败。');
  const r=spawnSync('psql',['--no-password','-h','127.0.0.1','-p',u.port||'5432','-U','forum_user','-d',target,'-c','SELECT 1;'],{cwd:'/tmp',encoding:'utf8',env:{...process.env,PGPASSWORD:decodeURIComponent(u.password),PGCONNECT_TIMEOUT:'5'}});
  if(r.status!==0)throw Error('新库账号连接验证失败，项目配置未修改。');
 }catch(error){fs.writeFileSync(hba,original);admin('SELECT pg_reload_conf()');throw error;}
 const envBackup=path.join(dir,`env-before-v2-${stamp}.backup`);fs.copyFileSync(envFile,envBackup);fs.chmodSync(envBackup,0o600);
 u.hostname='127.0.0.1';u.pathname='/'+target;
 text=text.replace(/^\s*DATABASE_URL\s*=.*$/m,()=>`DATABASE_URL="${u.toString()}"`);
 text=/^\s*DATABASE_PROVIDER\s*=/m.test(text)?text.replace(/^\s*DATABASE_PROVIDER\s*=.*$/m,'DATABASE_PROVIDER=postgresql'):text+'\nDATABASE_PROVIDER=postgresql\n';
 fs.writeFileSync(envFile,text);fs.chmodSync(envFile,0o600);
 console.log('完成：空库 forum_db_v2 已创建，账号连接验证通过，项目配置已切换。旧 forum_db 未修改。');
 console.log('下一步运行正式迁移和大学/专业初始化；不要对旧库执行初始迁移。');
}
try{main();}catch(error){console.error(error.message);process.exitCode=1;}
