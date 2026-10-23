// Budgetron chat interface: render messages, send budget snapshots to the local server, and remember launcher position/visibility. The API key stays on the server and never appears in this file.
// Real Gemini chat. API credentials stay in the local server's .env file.
(() => {
  const chatHistoryKey='budgetron-chat-history-v1';
  let conversationHistory=[];
  try {const saved=JSON.parse(sessionStorage.getItem(chatHistoryKey));if(Array.isArray(saved))conversationHistory=saved.filter(item=>item && ['user','assistant'].includes(item.role) && typeof item.content==='string').slice(-14);}catch{}
  let isReplyPending=false;
  const robot='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="6" width="18" height="15" rx="5"/><path d="M12 6V3m-3 13h6"/><circle cx="8" cy="12" r="1" fill="currentColor"/><circle cx="16" cy="12" r="1" fill="currentColor"/></svg>';
  const chatLauncher=document.createElement('button');chatLauncher.className='chat-launcher';chatLauncher.type='button';chatLauncher.setAttribute('aria-label','Chat with Budgetron');chatLauncher.setAttribute('aria-expanded','false');chatLauncher.setAttribute('aria-controls','budgetron-chat');chatLauncher.innerHTML=robot+'<span>Ask Budgetron</span>';
  const chatPanel=document.createElement('section');chatPanel.id='budgetron-chat';chatPanel.className='budgetron-chat';chatPanel.hidden=true;chatPanel.setAttribute('role','dialog');chatPanel.setAttribute('aria-labelledby','chat-title');
  chatPanel.innerHTML=`<div class="chat-header"><span class="chat-avatar">${robot}</span><div><h2 id="chat-title">Budgetron AI</h2><p>Your app and budget guide</p></div><button type="button" class="text-button chat-close" aria-label="Close chat">×</button></div>
    <div class="chat-toolbar"><span class="chat-provider">Powered by Gemini</span><button type="button" class="secondary chat-new" id="chat-new">New Chat</button></div>
    <details class="chat-display-settings"><summary>Position &amp; visibility</summary><p>Drag Ask Budgetron anywhere. With the button focused, use Alt + arrow keys to move it.</p><label><input id="chat-home-only" type="checkbox"> Show only on Home</label><button type="button" class="text-button" id="chat-reset-position">Reset position</button><small>You can always change this setting from Home.</small></details>
    <div id="chat-messages" class="chat-messages" role="log" aria-label="Conversation with Budgetron" aria-live="polite" aria-relevant="additions"></div>
    <div class="chat-composer"><p id="chat-connection" class="chat-connection" role="status"></p><label class="chat-share"><input id="chat-share-budget" type="checkbox" checked> Include my sample budget</label>
    <form id="chat-form"><label class="sr-only" for="chat-input">Message Budgetron</label><textarea id="chat-input" rows="2" maxlength="2000" placeholder="Ask about this app or your demo budget…" required></textarea><button id="chat-send" type="submit" aria-label="Send message">↑</button></form><p class="chat-footnote">AI can make mistakes. Shared messages and sample budget data go to Google.</p></div>`;
  document.body.append(chatLauncher,chatPanel);
  const messageList=chatPanel.querySelector('#chat-messages'),messageInput=chatPanel.querySelector('#chat-input'),sendButton=chatPanel.querySelector('#chat-send'),newChatButton=chatPanel.querySelector('#chat-new'),connectionStatus=chatPanel.querySelector('#chat-connection'),shareBudgetCheckbox=chatPanel.querySelector('#chat-share-budget');
  // Store display preferences separately from the budget, so resetting demo money keeps them.
  const displaySettingsKey = 'budgetron-chat-display-v1';
  const isHomePage = /\/pages\/home\/home\.html$/.test(location.pathname) || /\/(?:index\.html)?$/.test(location.pathname);
  let displaySettings = {homeOnly:false, position:null};
  try {
    const savedSettings = JSON.parse(localStorage.getItem(displaySettingsKey));
    if (savedSettings && typeof savedSettings === 'object') {
      displaySettings.homeOnly = savedSettings.homeOnly === true;
      if (Number.isFinite(savedSettings.position?.x) && Number.isFinite(savedSettings.position?.y)) {
        displaySettings.position = {x:Math.max(0,Math.min(1,savedSettings.position.x)), y:Math.max(0,Math.min(1,savedSettings.position.y))};
      }
    }
  } catch { /* Dragging still works for this page when storage is unavailable. */ }
  const homeOnlyCheckbox = chatPanel.querySelector('#chat-home-only');
  homeOnlyCheckbox.checked = displaySettings.homeOnly;
  chatLauncher.hidden = displaySettings.homeOnly && !isHomePage;
  chatLauncher.title = 'Click to chat. Drag to move, or use Alt + arrow keys when focused.';
  chatLauncher.setAttribute('aria-describedby','chat-move-help');
  const moveHelp = document.createElement('span');
  moveHelp.id = 'chat-move-help'; moveHelp.className = 'sr-only';
  moveHelp.textContent = 'Drag to move. Keyboard: Alt plus arrow keys. Display settings are inside the chat.';
  document.body.append(moveHelp);
  // Remember launcher preferences independently of the demo budget.
  function saveDisplaySettings() {
    try { localStorage.setItem(displaySettingsKey,JSON.stringify(displaySettings)); } catch { /* Keep preferences in memory for this page. */ }
  }
  // Ratios keep the preferred position usable across desktop and phone viewport sizes.
  // Compute usable movement space with a small margin around every viewport edge.
  function launcherBounds() {
    return {left:12, top:12, width:Math.max(0,innerWidth-chatLauncher.offsetWidth-24), height:Math.max(0,innerHeight-chatLauncher.offsetHeight-24)};
  }
  // Keep the conversation near the launcher while clamping it inside the viewport.
  function placePanel() {
    if (chatPanel.hidden || chatLauncher.hidden) return;
    const launcherRect = chatLauncher.getBoundingClientRect();
    const panelLeft = Math.max(12,Math.min(innerWidth-chatPanel.offsetWidth-12,launcherRect.right-chatPanel.offsetWidth));
    const above = launcherRect.top-chatPanel.offsetHeight-12;
    const below = launcherRect.bottom+12;
    const panelTop = above >= 12 ? above : below+chatPanel.offsetHeight <= innerHeight-12 ? below : Math.max(12,Math.min(innerHeight-chatPanel.offsetHeight-12,launcherRect.top));
    Object.assign(chatPanel.style,{left:`${panelLeft}px`,top:`${panelTop}px`,right:'auto',bottom:'auto'});
  }
  // Restore the saved relative position, then position the conversation beside it.
  function placeLauncher() {
    if (chatLauncher.hidden) return;
    if (displaySettings.position) {
      const bounds = launcherBounds();
      Object.assign(chatLauncher.style,{left:`${bounds.left+displaySettings.position.x*bounds.width}px`,top:`${bounds.top+displaySettings.position.y*bounds.height}px`,right:'auto',bottom:'auto'});
    } else { chatLauncher.removeAttribute('style'); }
    placePanel();
  }
  // Convert a requested pixel position to clamped ratios so it survives screen-size changes.
  function moveLauncher(left,top) {
    const bounds = launcherBounds();
    displaySettings.position = {x:bounds.width ? Math.max(0,Math.min(1,(left-bounds.left)/bounds.width)) : 0,y:bounds.height ? Math.max(0,Math.min(1,(top-bounds.top)/bounds.height)) : 0};
    placeLauncher();
  }
  let dragState = null;
  let suppressDragClick = false;
  chatLauncher.addEventListener('pointerdown',event=>{
    if (!event.isPrimary || event.button !== 0) return;
    const rectangle = chatLauncher.getBoundingClientRect();
    dragState = {pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,left:rectangle.left,top:rectangle.top,moved:false,originalPosition:displaySettings.position};
    suppressDragClick = false;
    chatLauncher.setPointerCapture(event.pointerId);
  });
  chatLauncher.addEventListener('pointermove',event=>{
    if (!dragState || event.pointerId !== dragState.pointerId) return;
    const deltaX = event.clientX-dragState.startX, deltaY = event.clientY-dragState.startY;
    if (!dragState.moved && Math.hypot(deltaX,deltaY)<6) return;
    dragState.moved = true;
    chatLauncher.classList.add('is-dragging');
    moveLauncher(dragState.left+deltaX,dragState.top+deltaY);
  });
  // Save completed drags and suppress the pointer-release click that would otherwise open chat.
  function finishDrag(event) {
    if (!dragState || event.pointerId !== dragState.pointerId) return;
    const wasMoved = dragState.moved;
    if (event.type === 'pointercancel') {displaySettings.position=dragState.originalPosition;placeLauncher();}
    else if (wasMoved) saveDisplaySettings();
    dragState = null;chatLauncher.classList.remove('is-dragging');
    // Pointer release also fires click; consume that click so dragging never opens chat.
    suppressDragClick = wasMoved;
    setTimeout(()=>{suppressDragClick=false;},0);
  }
  chatLauncher.addEventListener('pointerup',finishDrag);
  chatLauncher.addEventListener('pointercancel',finishDrag);
  chatLauncher.addEventListener('lostpointercapture',finishDrag);
  chatLauncher.addEventListener('keydown',event=>{
    const directions = {ArrowLeft:[-20,0],ArrowRight:[20,0],ArrowUp:[0,-20],ArrowDown:[0,20]};
    if (!event.altKey || !directions[event.key]) return;
    event.preventDefault();
    const rectangle = chatLauncher.getBoundingClientRect(), [deltaX,deltaY] = directions[event.key];
    moveLauncher(rectangle.left+deltaX,rectangle.top+deltaY);saveDisplaySettings();
  });
  homeOnlyCheckbox.addEventListener('change',()=>{
    displaySettings.homeOnly=homeOnlyCheckbox.checked;saveDisplaySettings();
    chatLauncher.hidden=displaySettings.homeOnly && !isHomePage;
    if (chatLauncher.hidden) {chatPanel.hidden=true;chatLauncher.setAttribute('aria-expanded','false');document.querySelector('h1')?.setAttribute('tabindex','-1');document.querySelector('h1')?.focus({preventScroll:true});}
    else placeLauncher();
  });
  chatPanel.querySelector('#chat-reset-position').addEventListener('click',()=>{
    displaySettings.position=null;saveDisplaySettings();placeLauncher();
  });
  window.addEventListener('resize',placeLauncher);
  new ResizeObserver(placePanel).observe(chatPanel);
  placeLauncher();

  try{shareBudgetCheckbox.checked=sessionStorage.getItem('budgetron-share-budget')!=='false';}catch{}
  shareBudgetCheckbox.addEventListener('change',()=>{try{sessionStorage.setItem('budgetron-share-budget',String(shareBudgetCheckbox.checked));}catch{}});
  // Keep a bounded chat history within this browser tab across page navigation.
  function persist(){try{sessionStorage.setItem(chatHistoryKey,JSON.stringify(conversationHistory.slice(-14)));}catch{}}
  // Render simple bold/bullet formatting using text nodes rather than trusting AI-generated HTML.
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
  // Append one labeled conversation message and scroll to the newest content.
  function bubble(role,text){
    const item=document.createElement('article');item.className=`chat-message ${role}`;
    const label=document.createElement('span');label.className='chat-message-label';label.textContent=role==='user'?'You':'Budgetron';
    const content=document.createElement('div');formatText(content,text);item.append(label,content);messageList.append(item);messageList.scrollTop=messageList.scrollHeight;return item;
  }
  // Restore the conversation or show clickable starter questions when history is empty.
  function renderHistory(){
    messageList.replaceChildren();
    if(!conversationHistory.length){
      const welcome=document.createElement('div');welcome.className='chat-welcome';
      const title=document.createElement('h3');title.textContent='Your money. Your questions.';
      const subtitle=document.createElement('p');subtitle.textContent='I help with this app and the budget you track here. Ask about spending, savings goals, accounts, or your calendar.';
      welcome.append(title,subtitle);
      for(const text of ['Do I have enough saved for an emergency?','Does my budget match my spending?','Am I spending more than I earn?','How can I reach my savings goal?','What payments do I have coming up?']){
        const button=document.createElement('button');button.type='button';button.className='chat-suggestion secondary';
        const spark=document.createElement('span');spark.className='chat-suggestion-spark';spark.textContent='✳';spark.setAttribute('aria-hidden','true');
        const label=document.createElement('span');label.textContent=text;
        const arrow=document.createElement('span');arrow.className='chat-suggestion-arrow';arrow.setAttribute('aria-hidden','true');arrow.innerHTML='<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m8 5 5 5-5 5"/></svg>';
        button.append(spark,label,arrow);button.addEventListener('click',()=>ask(text));welcome.append(button);
      }
      messageList.append(welcome);
    }else conversationHistory.forEach(item=>bubble(item.role,item.content));
  }
  // Build a bounded read-only snapshot from the latest budget, or return null when sharing is off.
  function snapshot(){
    if(!shareBudgetCheckbox.checked)return null;
    const budget=typeof budgetData==='object'?budgetData:null;if(!budget)return null;
    const date=isoDate(new Date()),month=date.slice(0,7);
    const currentMonthPurchases=budget.events.filter(item=>item.kind==='purchase'&&item.date.startsWith(month));
    const spent=currentMonthPurchases.reduce((sum,item)=>sum+item.amount,0);
    const categoryTotals=Object.fromEntries(Object.keys(categories).map(name=>[name,currentMonthPurchases.filter(item=>item.category===name).reduce((sum,item)=>sum+item.amount,0)/100]));
    return {date,currency:'USD',amountUnits:'dollars',monthlyIncome:budget.income/100,spentThisMonth:spent/100,incomeLeftAfterSpending:(budget.income-spent)/100,categoryTotals,
      accounts:budget.accounts.slice(0,20).map(item=>({bank:item.bank,type:item.type,balance:item.balance/100,monthlyAllocation:item.allocation/100})),
      goals:(Array.isArray(budget.goals)?budget.goals:budget.goal?[budget.goal]:[]).slice(0,12).map(goal=>({name:goal.name,target:goal.target/100,saved:goalSavings(goal)/100,dueDate:goal.dueDate||null,tracks:goal.accountId?'one savings account':'all savings accounts'})),
      recentPurchases:[...currentMonthPurchases].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,12).map(item=>({name:item.name,date:item.date,category:item.category,amount:item.amount/100})),
      upcomingPayments:budget.events.filter(item=>item.kind==='planned'&&item.date>=date).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,12).map(item=>({name:item.name,date:item.date,amount:item.amount/100})),
      transferRule:budget.transfer?{amount:budget.transfer.amount/100,nextDate:budget.transfer.date,repeatMonthly:budget.transfer.repeat}:null};
  }
  // Explain how to launch the local AI server and provide a link to its website.
  function showConnectionHelp(message){
    connectionStatus.textContent=message+' ';
    const link=document.createElement('a');link.href='http://127.0.0.1:3000/';link.textContent='Open the local Budgetron website';connectionStatus.append(link);
  }
  // Check that this origin runs the Budgetron server and has an API key configured.
  async function checkConnection(){
    if(location.protocol==='file:'){
      showConnectionHelp('AI chat needs the local server. Run Start Budgetron.bat, then use the website it opens.');return false;
    }
    try{
      const response=await fetch('/api/chat/status',{cache:'no-store',signal:AbortSignal.timeout(5000)});
      if(!response.ok || !response.headers.get('content-type')?.includes('application/json'))throw new Error('Not the Budgetron server');
      const state=await response.json();
      if(state.provider!=='Gemini' || typeof state.configured!=='boolean')throw new Error('Not the Budgetron server');
      connectionStatus.textContent=state.configured?'AI is ready.':'Add your Gemini key to .env and save it. Then send your question again.';
      return state.configured;
    }catch{
      showConnectionHelp('AI chat needs the Budgetron server. Run Start Budgetron.bat; VS Code Live Server and GitHub Pages cannot run the AI server.');return false;
    }
  }
  // Submit a question, display a pending reply and recover cleanly from connection/provider failures.
  async function ask(text,retry=false){
    text=text.trim();if(!text||isReplyPending)return;
    if(!await checkConnection())return;
    isReplyPending=true;sendButton.disabled=true;newChatButton.disabled=true;chatPanel.setAttribute('aria-busy','true');
    messageList.querySelector('.chat-welcome')?.remove();messageList.querySelectorAll('.chat-error').forEach(item=>item.remove());
    if(!retry)bubble('user',text);
    messageInput.value='';
    const thinking=bubble('assistant','Thinking…');thinking.classList.add('chat-thinking');
    const requestHistory=[...conversationHistory.slice(-14),{role:'user',content:text}];
    try{
      const response=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:requestHistory,budget:snapshot()}),signal:AbortSignal.timeout(55000)});
      const result=await response.json();if(!response.ok)throw new Error(result.error||'The AI is unavailable. Please try again.');
      if(typeof result.reply!=='string'||!result.reply.trim())throw new Error('No response received. Please try again.');
      thinking.remove();bubble('assistant',result.reply);conversationHistory=[...requestHistory,{role:'assistant',content:result.reply}].slice(-14);persist();connectionStatus.textContent='AI is ready.';
    }catch(error){
      thinking.remove();const item=document.createElement('div');item.className='chat-error';item.setAttribute('role','alert');
      const textNode=document.createElement('p');textNode.textContent=error.name==='TimeoutError'?'The AI took too long. Try again.':error.message;
      const retryButton=document.createElement('button');retryButton.type='button';retryButton.className='text-button';retryButton.textContent='Try Again';retryButton.addEventListener('click',()=>ask(text,true));item.append(textNode,retryButton);messageList.append(item);
    }finally{isReplyPending=false;sendButton.disabled=false;newChatButton.disabled=false;chatPanel.removeAttribute('aria-busy');messageList.scrollTop=messageList.scrollHeight;}
  }
  chatLauncher.addEventListener('click',()=>{
    if (suppressDragClick) return;
    chatPanel.hidden=!chatPanel.hidden;chatLauncher.setAttribute('aria-expanded',String(!chatPanel.hidden));
    if(!chatPanel.hidden){placePanel();checkConnection();messageInput.focus({preventScroll:true});messageList.scrollTop=messageList.scrollHeight;}
  });
  chatPanel.querySelector('.chat-close').addEventListener('click',()=>{chatPanel.hidden=true;chatLauncher.setAttribute('aria-expanded','false');chatLauncher.focus({preventScroll:true});});
  chatPanel.addEventListener('keydown',(event)=>{if(event.key==='Escape'){chatPanel.hidden=true;chatLauncher.setAttribute('aria-expanded','false');chatLauncher.focus({preventScroll:true});}});
  chatPanel.querySelector('#chat-form').addEventListener('submit',(event)=>{event.preventDefault();ask(messageInput.value);});
  messageInput.addEventListener('keydown',(event)=>{if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();ask(messageInput.value);}});
  newChatButton.addEventListener('click',()=>{conversationHistory=[];persist();renderHistory();messageInput.focus();});
  renderHistory();
})();
