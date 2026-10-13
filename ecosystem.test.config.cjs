module.exports={apps:[{
 name:'baozhong-forum-test',cwd:__dirname,
 script:'node_modules/next/dist/bin/next',args:'start -H 127.0.0.1 -p 3001',
 interpreter:'node',instances:1,exec_mode:'fork',autorestart:true,
 max_restarts:5,min_uptime:'10s',restart_delay:3000,
 env:{NODE_ENV:'production',DATABASE_PROVIDER:'postgresql'},
}]};
