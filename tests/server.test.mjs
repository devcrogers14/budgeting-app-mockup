// Integration checks for page assets, legacy redirects, private-file protection and the local chat API. A fake reply provider keeps these tests independent of API keys.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile, access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';
import {once} from 'node:events';
import {createBudgetronServer} from '../server/server.mjs';

const root = new URL('../',import.meta.url);
const pages={index:'home',goals:'goals',accounts:'accounts',pie:'spending-chart',spending:'transactions',calendar:'calendar'};

test('organized website: pages, shared assets, old links, and chat API',async(testContext)=>{
  let received;
  const server=createBudgetronServer({
    loadSettings:async()=>({configured:true,key:'test-only',model:'gemini-3.5-flash-lite'}),
    generateReply:async(input)=>{received=input;return 'Mock response: your sample budget is available.';},
  });
  server.listen(0,'127.0.0.1');await once(server,'listening');
  const serverBaseUrl=`http://127.0.0.1:${server.address().port}`;
  testContext.after(async()=>{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));});

  await testContext.test('each page has its own HTML, CSS and JS; all links load',async()=>{
    for(const page of Object.values(pages)){
      const path=`pages/${page}/${page}.html`;
      const response=await fetch(`${serverBaseUrl}/${path}`);
      assert.equal(response.status,200,path);
      const html=await response.text();
      assert.equal(html,await readFile(new URL(path,root),'utf8'));
      assert.ok(html.includes(`href="${page}.css"`));
      assert.ok(html.includes(`src="${page}.js"`));
      const scripts=[];
      for(const [,target]of html.matchAll(/(?:href|src)="([^"#]+)"/g)){
        if(/^(https?:|data:)/.test(target))continue;
        const targetURL=new URL(target,new URL(path,root));targetURL.search='';targetURL.hash='';
        await access(fileURLToPath(targetURL));
        const httpTarget=new URL(target,`${serverBaseUrl}/${path}`);
        const resource=await fetch(httpTarget);
        assert.equal(resource.status,200,`${path}: ${target}`);
        if(target.endsWith('.js')){assert.match(resource.headers.get('content-type'),/javascript/);scripts.push(await resource.text());}
        if(target.endsWith('.css'))assert.match(resource.headers.get('content-type'),/text\/css/);
      }
      // Classic scripts share a lexical scope: catch duplicate declarations as well as syntax errors.
      new Script(scripts.join('\n;\n'),{filename:path});
    }
  });
  await testContext.test('old URLs and homepage preserve query parameters',async()=>{
    for(const [old,page]of Object.entries(pages)){
      const response=await fetch(`${serverBaseUrl}/${old}.html?category=Food&add=purchase`,{redirect:'manual'});
      assert.equal(response.status,302);
      assert.equal(response.headers.get('location'),`/pages/${page}/${page}.html?category=Food&add=purchase`);
    }
    assert.equal((await fetch(serverBaseUrl,{redirect:'manual'})).headers.get('location'),'/pages/home/home.html');
    for(const [old,target] of [['/pages/overview/overview.html','/pages/home/home.html'],['/pages/spending/spending.html','/pages/transactions/transactions.html']]){
      const response=await fetch(`${serverBaseUrl}${old}?add=transaction`,{redirect:'manual'});
      assert.equal(response.status,302);
      assert.equal(response.headers.get('location'),target+'?add=transaction');
    }
  });
  await testContext.test('private files, traversal and server source are blocked',async()=>{
    for(const path of ['/.env','/.env.example','/.git/config','/server/server.mjs','/server/chat-policy.mjs','/tests/server.test.mjs','/README.md','/javascript files/../server/server.mjs','/pages/overview/../../.env','/assets/js/app.js']){
      assert.equal((await fetch(serverBaseUrl+path)).status,404,path);
    }
    assert.equal((await fetch(`${serverBaseUrl}/pages/goals/goals.html`,{method:'POST'})).status,405);
    const head=await fetch(`${serverBaseUrl}/javascript files/state.js`,{method:'HEAD'});
    assert.equal(head.status,200);assert.equal(await head.text(),'');
  });
  await testContext.test('chat status and response use the expected client contract',async()=>{
    const state=await(await fetch(`${serverBaseUrl}/api/chat/status`)).json();
    assert.deepEqual(state,{configured:true,provider:'Gemini',model:'gemini-3.5-flash-lite'});
    const input={messages:[{role:'user',content:'How is my sample budget?'}],budget:{income:300000}};
    const response=await fetch(`${serverBaseUrl}/api/chat`,{method:'POST',headers:{'Content-Type':'application/json',Origin:serverBaseUrl},body:JSON.stringify(input)});
    assert.equal(response.status,200);assert.match((await response.json()).reply,/Mock response/);
    assert.deepEqual(received.messages,input.messages);assert.deepEqual(received.budget,input.budget);
  });
  await testContext.test('chat rejects malformed input and requests from another website',async()=>{
    const post=(body,origin=serverBaseUrl)=>fetch(`${serverBaseUrl}/api/chat`,{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body});
    assert.equal((await post('{')).status,400);
    assert.equal((await post(JSON.stringify({messages:[]}))).status,400);
    assert.equal((await post(JSON.stringify({messages:[{role:'user',content:'Hello'}]}),'http://example.com')).status,403);
  });
});
