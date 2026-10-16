// Run only on the verified ECS checkout after Certbot has issued both names.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { X509Certificate } = require('node:crypto');

const domain = 'bzuniforum.cn';
const root = path.resolve(__dirname, '..');
const envFile = path.join(root, '.env');
const nginxFile = '/etc/nginx/conf.d/baozhong.conf';
const hookFile = '/etc/letsencrypt/renewal-hooks/deploy/baozhong-nginx.sh';
const certificate = `/etc/letsencrypt/live/${domain}`;
const nginxConfig = `server {
    listen 80;
    server_name ${domain} www.${domain};
    location ^~ /.well-known/acme-challenge/ {
        root /var/www/letsencrypt;
        default_type text/plain;
        try_files $uri =404;
    }
    location / { return 301 https://${domain}$request_uri; }
}
server {
    listen 443 ssl;
    server_name ${domain} www.${domain};
    ssl_certificate ${certificate}/fullchain.pem;
    ssl_certificate_key ${certificate}/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    client_max_body_size 10m;
    if ($host = www.${domain}) { return 301 https://${domain}$request_uri; }
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }
}
`;

function run(command, args, options = {}) {
  const r = spawnSync(command, args, { cwd: root, encoding: 'utf8', timeout: 120000, ...options });
  if (r.status !== 0) throw Error(`${command} 执行失败；配置切换已停止。`);
  return r.stdout || '';
}
function checkDatabaseResponse(args) {
  const response = run('curl', ['--fail', '--silent', '--show-error', '--max-time', '15', ...args]);
  if (JSON.parse(response).ok !== true) throw Error('网站数据库健康检查失败。');
}
function envValue(text, key) {
  const line = text.split('\n').find(line => new RegExp('^\\s*' + key + '\\s*=').test(line));
  return line?.slice(line.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '');
}

async function main() {
  if (!process.argv.includes('--apply')) {
    console.log('计划：验证证书、管理员密码和新版服务；备份 forum_db_v2、.env、Nginx；启用域名 HTTPS 和登录地址，增加证书续期重载钩子。失败时恢复配置。使用 --apply 执行。');
    return;
  }
  if (process.platform !== 'linux' || process.getuid() !== 0 || root !== '/root/baozhong-forum-test') throw Error('仅允许在已核实的 ECS 项目目录由 root 执行。');
  const originalEnv = fs.readFileSync(envFile, 'utf8');
  const originalNginx = fs.readFileSync(nginxFile, 'utf8');
  const originalHook = fs.existsSync(hookFile) ? { data: fs.readFileSync(hookFile), mode: fs.statSync(hookFile).mode & 0o777 } : null;
  const connectionString = envValue(originalEnv, 'DATABASE_URL');
  const db = new URL(connectionString);
  if (envValue(originalEnv, 'DATABASE_PROVIDER') !== 'postgresql' || db.hostname !== '127.0.0.1' || db.pathname !== '/forum_db_v2') throw Error('数据库配置与预期不符，未修改配置。');
  const cert = new X509Certificate(fs.readFileSync(certificate + '/fullchain.pem'));
  if (!cert.checkHost(domain) || !cert.checkHost('www.' + domain) || Date.parse(cert.validTo) <= Date.now()) throw Error('证书域名或有效期检查失败。');
  if (!cert.checkPrivateKey(require('node:crypto').createPrivateKey(fs.readFileSync(certificate + '/privkey.pem')))) throw Error('证书与私钥不匹配。');
  run('nginx', ['-t']);
  checkDatabaseResponse(['http://127.0.0.1:3001/api/db-test']);

  const { Client } = require('pg');
  const client = new Client({ connectionString, connectionTimeoutMillis: 10000 });
  try {
    await client.connect();
    const admins = (await client.query('SELECT username, password FROM "User" WHERE role = $1', ['admin'])).rows;
    if (!admins.length) throw Error('尚未找到管理员账号，未修改配置。');
    for (const admin of admins) {
      if (admin.username && await require('bcryptjs').compare(admin.username, admin.password)) throw Error('管理员密码仍与账号相同。请先在服务器用 configure-admin.ts 设置不同的强密码，再运行本脚本。');
    }
  } finally { await client.end(); }

  const backup = `/root/baozhong-backups/public-${Date.now()}`;
  fs.mkdirSync(backup, { recursive: true, mode: 0o700 });
  fs.writeFileSync(backup + '/test.env', originalEnv, { mode: 0o600 });
  fs.writeFileSync(backup + '/nginx.conf', originalNginx, { mode: 0o600 });
  if (originalHook) fs.writeFileSync(backup + '/renew-hook', originalHook.data, { mode: 0o600 });
  const dumpFile = backup + '/forum_db_v2.dump';
  const fd = fs.openSync(dumpFile, 'wx', 0o600);
  try { run('runuser', ['-u', 'postgres', '--', 'pg_dump', '-Fc', '-d', 'forum_db_v2'], { cwd: '/tmp', stdio: ['ignore', fd, 'pipe'] }); }
  finally { fs.closeSync(fd); }
  // Listing an archive does not connect to PostgreSQL; keep root-only backups private.
  run('pg_restore', ['--list', dumpFile], { cwd: '/tmp' });

  let updated = originalEnv;
  for (const [key, value] of Object.entries({ NEXTAUTH_URL: `https://${domain}`, NEXTAUTH_URL_INTERNAL: 'http://127.0.0.1:3001' })) {
    updated = updated.replace(new RegExp('^\\s*' + key + '\\s*=.*$', 'gm'), '');
    updated += `\n${key}=${value}\n`;
  }
  try {
    fs.writeFileSync(envFile, updated, { mode: 0o600 });
    fs.chmodSync(envFile, 0o600);
    run('pm2', ['restart', 'baozhong-forum-test', '--update-env']);
    checkDatabaseResponse(['--retry', '10', '--retry-connrefused', '--retry-delay', '1', 'http://127.0.0.1:3001/api/db-test']);
    fs.writeFileSync(nginxFile, nginxConfig);
    run('nginx', ['-t']);
    run('systemctl', ['reload', 'nginx']);
    checkDatabaseResponse(['--resolve', `${domain}:443:127.0.0.1`, `https://${domain}/api/db-test`]);
    fs.mkdirSync(path.dirname(hookFile), { recursive: true, mode: 0o755 });
    fs.writeFileSync(hookFile, '#!/bin/sh\nset -e\n/usr/sbin/nginx -t\n/usr/bin/systemctl reload nginx\n', { mode: 0o700 });
    fs.chmodSync(hookFile, 0o700);
  } catch (error) {
    fs.writeFileSync(envFile, originalEnv, { mode: 0o600 });
    fs.writeFileSync(nginxFile, originalNginx);
    if (originalHook) { fs.writeFileSync(hookFile, originalHook.data); fs.chmodSync(hookFile, originalHook.mode); }
    else if (fs.existsSync(hookFile)) fs.unlinkSync(hookFile);
    const results = [spawnSync('pm2', ['restart', 'baozhong-forum-test', '--update-env']), spawnSync('nginx', ['-t'])];
    if (results[1].status === 0) results.push(spawnSync('systemctl', ['reload', 'nginx']));
    console.log(results.every(r => r.status === 0) ? '已恢复原配置并重启原服务。' : '配置文件已恢复，服务恢复检查未通过，需要人工核查。');
    throw error;
  }
  console.log(`完成：域名 HTTPS 转发、登录地址及本机数据库检查通过。备份：${backup}`);
  console.log('仍需确认阿里云安全组允许 TCP 443，并从手机流量验证公网访问；还需验证自动续期和进程开机启动。');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
