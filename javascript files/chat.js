// Real Gemini chat. API credentials stay in the local server's .env file.
(() => {
  const historyKey='budgetron-chat-history-v1';
  let history=[];
  try {const saved=JSON.parse(sessionStorage.getItem(historyKey));if(Array.isArray(saved))history=saved.filter(item=>item && ['user','assistant'].includes(item.role) && typeof item.content==='string').slice(-14);}catch{}
  let pending=false;
  const robot='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="6" width="18" height="15" rx="5"/><path d="M12 6V3m-3 13h6"/><circle cx="8" cy="12" r="1" fill="currentColor"/><circle cx="16" cy="12" r="1" fill="currentColor"/></svg>';
  const launcher=document.createElement('button');launcher.className='chat-launcher';launcher.type='button';launcher.setAttribute('aria-label','Chat with Budgetron');launcher.setAttribute('aria-expanded','false');launcher.setAttribute('aria-controls','budgetron-chat');launcher.innerHTML=robot+'<span>Ask Budgetron</span>';
  const panel=document.createElement('section');panel.id='budgetron-chat';panel.className='budgetron-chat';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-labelledby','chat-title');
  panel.innerHTML=`<div class="chat-header"><span class="chat-avatar">${robot}</span><div><h2 id="chat-title">Budgetron AI</h2><p>Your budgeting sidekick</p></div><button type="button" class="text-button chat-close" aria-label="Close chat">×</button></div>
    <div class="chat-toolbar"><span class="chat-provider">Powered by Gemini</span><button type="button" class="text-button" id="chat-new">New Chat</button></div>
    <div id="chat-messages" class="chat-messages" role="log" aria-label="Conversation with Budgetron" aria-live="polite" aria-relevant="additions"></div>
    <div class="chat-composer"><p id="chat-connection" class="chat-connection" role="status"></p><label class="chat-share"><input id="chat-share-budget" type="checkbox" checked> Include my sample budget</label>
    <form id="chat-form"><label class="sr-only" for="chat-input">Message Budgetron</label><textarea id="chat-input" rows="2" maxlength="2000" placeholder="Ask about your spending, goals, or anything else…" required></textarea><button id="chat-send" type="submit" aria-label="Send message">↑</button></form><p class="chat-footnote">AI can make mistakes. Shared messages and sample budget data go to Google.</p></div>`;
  document.body.append(launcher,panel);
  const messages=panel.querySelector('#chat-messages'),input=panel.querySelector('#chat-input'),send=panel.querySelector('#chat-send'),newChat=panel.querySelector('#chat-new'),connection=panel.querySelector('#chat-connection'),share=panel.querySelector('#chat-share-budget');
  try{share.checked=sessionStorage.getItem('budgetron-share-budget')!=='false';}catch{}
  share.addEventListener('change',()=>{try{sessionStorage.setItem('budgetron-share-budget',String(share.checked));}catch{}});
  function persist(){try{sessionStorage.setItem(historyKey,JSON.stringify(history.slice(-14)));}catch{}}
  function formatText(container,text){
    for(const line of text.split('\n')){
      if(!line.trim())continue;
      const paragraph=document.createElement('p');
      if(/^\s*[-*]\s/.test(line))paragraph.className='chat-bullet';
      const clean=line.replace(/^\s*[-*]\s/,'');
      for(const part of clean.split(/(\*\*[^*]+\*\*)/g)){
        if(part.startsWith('**')&&part.endsWith('**')){const strong=document.createElement('strong');strong.textContent=part.slice(2,-2);paragraph.append(strong);}
        else paragraph.append(document.createTextNode(part));
      }
      container.append(paragraph);
    }
  }
  function bubble(role,text){
    const item=document.createElement('article');item.className=`chat-message ${role}`;
    const label=document.createElement('span');label.className='chat-message-label';label.textContent=role==='user'?'You':'Budgetron';
    const content=document.createElement('div');formatText(content,text);item.append(label,content);messages.append(item);messages.scrollTop=messages.scrollHeight;return item;
  }
  function renderHistory(){
    messages.replaceChildren();
    if(!history.length){
      const welcome=document.createElement('div');welcome.className='chat-welcome';
      const title=document.createElement('h3');title.textContent='Your money. Your questions.';
      const subtitle=document.createElement('p');subtitle.textContent='A little clarity starts with a question. Choose one below or ask your own.';
      welcome.append(title,subtitle);
      for(const text of ['Do I have enough saved for an emergency?','Does my budget match my spending?','Am I spending more than I earn?','How can I reach my savings goal?','What payments do I have coming up?']){
        const button=document.createElement('button');button.type='button';button.className='chat-suggestion secondary';
        const spark=document.createElement('span');spark.className='chat-suggestion-spark';spark.textContent='✳';spark.setAttribute('aria-hidden','true');
        const label=document.createElement('span');label.textContent=text;
        const arrow=document.createElement('span');arrow.className='chat-suggestion-arrow';arrow.setAttribute('aria-hidden','true');arrow.innerHTML='<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m8 5 5 5-5 5"/></svg>';
        button.append(spark,label,arrow);button.addEventListener('click',()=>ask(text));welcome.append(button);
      }
      messages.append(welcome);
    }else history.forEach(item=>bubble(item.role,item.content));
  }
  function snapshot(){
    if(!share.checked)return null;
    const budget=typeof data==='object'?data:null;if(!budget)return null;
    const date=isoDate(new Date()),month=date.slice(0,7);
    const purchases=budget.events.filter(item=>item.kind==='purchase'&&item.date.startsWith(month));
    const spent=purchases.reduce((sum,item)=>sum+item.amount,0);
    const categoryTotals=Object.fromEntries(Object.keys(categories).map(name=>[name,purchases.filter(item=>item.category===name).reduce((sum,item)=>sum+item.amount,0)/100]));
    return {date,currency:'USD',amountUnits:'dollars',monthlyIncome:budget.income/100,spentThisMonth:spent/100,incomeLeftAfterSpending:(budget.income-spent)/100,categoryTotals,
      accounts:budget.accounts.slice(0,20).map(item=>({bank:item.bank,type:item.type,balance:item.balance/100,monthlyAllocation:item.allocation/100})),
      goals:(budget.goals||[budget.goal]).slice(0,12).map(goal=>({name:goal.name,target:goal.target/100,saved:goalSavings(goal)/100,dueDate:goal.dueDate||null,tracks:goal.accountId?'one savings account':'all savings accounts'})),
      recentPurchases:[...purchases].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,12).map(item=>({name:item.name,date:item.date,category:item.category,amount:item.amount/100})),
      upcomingPayments:budget.events.filter(item=>item.kind==='planned'&&item.date>=date).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,12).map(item=>({name:item.name,date:item.date,amount:item.amount/100})),
      transferRule:budget.transfer?{amount:budget.transfer.amount/100,nextDate:budget.transfer.date,repeatMonthly:budget.transfer.repeat}:null};
  }
  function showConnectionHelp(message){
    connection.textContent=message+' ';
    const link=document.createElement('a');link.href='http://127.0.0.1:3000/';link.textContent='Open the local Budgetron website';connection.append(link);
  }
  async function checkConnection(){
    if(location.protocol==='file:'){
      showConnectionHelp('AI chat needs the local server. Run Start Budgetron.bat, then use the website it opens.');return false;
    }
    try{
      const response=await fetch('/api/chat/status',{cache:'no-store',signal:AbortSignal.timeout(5000)});
      if(!response.ok || !response.headers.get('content-type')?.includes('application/json'))throw new Error('Not the Budgetron server');
      const state=await response.json();
      if(state.provider!=='Gemini' || typeof state.configured!=='boolean')throw new Error('Not the Budgetron server');
      connection.textContent=state.configured?'AI is ready.':'Add your Gemini key to .env and save it. Then send your question again.';
      return state.configured;
    }catch{
      showConnectionHelp('AI chat needs the Budgetron server. Run Start Budgetron.bat; VS Code Live Server and GitHub Pages cannot run the AI server.');return false;
    }
  }
  async function ask(text,retry=false){
    text=text.trim();if(!text||pending)return;
    if(!await checkConnection())return;
    pending=true;send.disabled=true;newChat.disabled=true;panel.setAttribute('aria-busy','true');
    messages.querySelector('.chat-welcome')?.remove();messages.querySelectorAll('.chat-error').forEach(item=>item.remove());
    if(!retry)bubble('user',text);
    input.value='';
    const thinking=bubble('assistant','Thinking…');thinking.classList.add('chat-thinking');
    const requestHistory=[...history.slice(-14),{role:'user',content:text}];
    try{
      const response=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:requestHistory,budget:snapshot()}),signal:AbortSignal.timeout(55000)});
      const result=await response.json();if(!response.ok)throw new Error(result.error||'The AI is unavailable. Please try again.');
      if(typeof result.reply!=='string'||!result.reply.trim())throw new Error('No response received. Please try again.');
      thinking.remove();bubble('assistant',result.reply);history=[...requestHistory,{role:'assistant',content:result.reply}].slice(-14);persist();connection.textContent='AI is ready.';
    }catch(error){
      thinking.remove();const item=document.createElement('div');item.className='chat-error';item.setAttribute('role','alert');
      const textNode=document.createElement('p');textNode.textContent=error.name==='TimeoutError'?'The AI took too long. Try again.':error.message;
      const retryButton=document.createElement('button');retryButton.type='button';retryButton.className='text-button';retryButton.textContent='Try Again';retryButton.addEventListener('click',()=>ask(text,true));item.append(textNode,retryButton);messages.append(item);
    }finally{pending=false;send.disabled=false;newChat.disabled=false;panel.removeAttribute('aria-busy');messages.scrollTop=messages.scrollHeight;}
  }
  launcher.addEventListener('click',()=>{
    panel.hidden=!panel.hidden;launcher.setAttribute('aria-expanded',String(!panel.hidden));
    if(!panel.hidden){checkConnection();input.focus({preventScroll:true});messages.scrollTop=messages.scrollHeight;}
  });
  panel.querySelector('.chat-close').addEventListener('click',()=>{panel.hidden=true;launcher.setAttribute('aria-expanded','false');launcher.focus({preventScroll:true});});
  panel.addEventListener('keydown',(event)=>{if(event.key==='Escape'){panel.hidden=true;launcher.setAttribute('aria-expanded','false');launcher.focus({preventScroll:true});}});
  panel.querySelector('#chat-form').addEventListener('submit',(event)=>{event.preventDefault();ask(input.value);});
  input.addEventListener('keydown',(event)=>{if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();ask(input.value);}});
  newChat.addEventListener('click',()=>{history=[];persist();renderHistory();input.focus();});
  renderHistory();
})();
