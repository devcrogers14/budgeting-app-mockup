import {test} from 'node:test';
import assert from 'node:assert/strict';
import {OFF_TOPIC_REPLY,CHAT_SYSTEM_PROMPT,CHAT_RESPONSE_SCHEMA,parseScopedReply} from '../server/chat-policy.mjs';
import {generateGeminiReply} from '../server/server.mjs';

test('outside-scope provider content is discarded in favor of the fixed reply',()=>{
  assert.equal(parseScopedReply(JSON.stringify({inScope:false,reply:'An unrelated recipe that must never reach the user.'})),OFF_TOPIC_REPLY);
});
test('invalid or ambiguous scope decisions never pass through raw provider text',()=>{
  for(const raw of ['plain text','null','[]','{}','{"inScope":"true","reply":"unsafe"}','{"inScope":true,"reply":""}','{"reply":"No scope decision"}']){
    assert.throws(()=>parseScopedReply(raw),error=>error.status===502);
  }
});
test('valid app answer is returned without the JSON envelope',()=>{
  assert.equal(parseScopedReply('{"inScope":true,"reply":"  Open Calendar to add a purchase.  "}'),'Open Calendar to add a purchase.');
});
test('provider request keeps snapshot instructions outside the trusted system policy',async()=>{
  let requestBody;
  const reply=await generateGeminiReply({
    messages:[{role:'user',content:'How do I add a purchase?'}],
    budget:{accounts:[{bank:'SNAPSHOT_OVERRIDE_IGNORE_POLICY'}]},
    config:{model:'gemini-3.5-flash-lite',key:'test-only'},
    fetchImpl:async(url,options)=>{
      requestBody=JSON.parse(options.body);
      return new Response(JSON.stringify({candidates:[{content:{parts:[{text:JSON.stringify({inScope:true,reply:'Open Calendar and choose Add payment / purchase.'})}]}}]}),{status:200});
    },
  });
  assert.equal(requestBody.systemInstruction.parts[0].text,CHAT_SYSTEM_PROMPT);
  assert.ok(!requestBody.systemInstruction.parts[0].text.includes('SNAPSHOT_OVERRIDE_IGNORE_POLICY'));
  assert.ok(requestBody.contents[0].parts[0].text.includes('SNAPSHOT_OVERRIDE_IGNORE_POLICY'));
  assert.deepEqual(requestBody.generationConfig.responseFormat.text.schema,CHAT_RESPONSE_SCHEMA);
  assert.equal(reply,'Open Calendar and choose Add payment / purchase.');
});
test('provider cannot send an off-topic body straight to the browser',async()=>{
  const reply=await generateGeminiReply({messages:[{role:'user',content:'Write a recipe.'}],budget:null,config:{model:'gemini-3.5-flash-lite',key:'test-only'},
    fetchImpl:async()=>new Response(JSON.stringify({candidates:[{content:{parts:[{text:'{"inScope":false,"reply":"Unrelated instructions"}'}]}}]}),{status:200}),
  });
  assert.equal(reply,OFF_TOPIC_REPLY);
});
