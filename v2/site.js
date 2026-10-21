// Mobile menu
(function(){
  var b=document.querySelector('.menu-toggle'), n=document.getElementById('nav');
  if(!b||!n) return;
  b.addEventListener('click',function(){
    var open=n.classList.toggle('open');
    b.setAttribute('aria-expanded',open?'true':'false');
  });
})();

// Abë's guided intake. Scripted, not generative: nothing typed here leaves
// the page unless the visitor chooses to email it.
(function(){
  var root=document.getElementById('abe-guide');
  if(!root) return;
  var stage=root.querySelector('[data-stage]');
  var BASE=root.getAttribute('data-base')||'';
  var EMAIL='hello@bravetto.com';
  var state={role:'',question:'',systems:[]};

  var ROLES=['Operations','Executive sponsor','IT or security','Team member','Media'];
  var SYSTEMS=['ERP (SAP, Oracle…)','CRM','Inventory or warehouse','Finance','Help desk or tickets','Phone and call notes','Spreadsheets and email','A few people’s heads'];

  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function chips(list,multi,selected){
    return '<div class="chips" role="group">'+list.map(function(x){
      var on=multi?selected.indexOf(x)>-1:selected===x;
      return '<button type="button" class="chip" aria-pressed="'+on+'" data-v="'+esc(x)+'">'+esc(x)+'</button>';
    }).join('')+'</div>';
  }
  function nav(back,nextLabel,skip){
    return '<div class="guide-nav">'+
      (nextLabel?'<button type="button" class="btn btn-gold" data-act="next">'+nextLabel+'</button>':'')+
      (skip?'<button type="button" class="linkbtn" data-act="skip">Skip</button>':'')+
      (back?'<button type="button" class="linkbtn" data-act="back">Back</button>':'')+
      '</div>';
  }
  function list(a){
    if(a.length<2) return a.join('');
    return a.slice(0,-1).join(', ')+' and '+a[a.length-1];
  }

  var steps=[
    function(){ // welcome
      return '<h3>Hi. I’m Abë.</h3>'+
        '<p class="msg">I’m Bravetto’s AI Being, and I’m your guide here. Say my name like “maybe” without the M.</p>'+
        '<p class="msg">I’ll ask three short questions about your work, then point you to what’s worth a look. Answer in your own words, or skip anything.</p>'+
        nav(false,'Start');
    },
    function(){
      return '<p class="progress">1 of 3</p><h3>What’s your role?</h3>'+chips(ROLES,false,state.role)+nav(true,'Next',true);
    },
    function(){
      return '<p class="progress">2 of 3</p><h3>What question keeps coming up in your work?</h3>'+
        '<p class="msg">The one people ask again and again, or the one that takes too many steps to answer.</p>'+
        '<label for="abe-q" class="label" style="position:absolute;left:-999px">Your recurring question</label>'+
        '<textarea id="abe-q" placeholder="For example: Where does this order stand, and what changed since yesterday?">'+esc(state.question)+'</textarea>'+
        nav(true,'Next',true);
    },
    function(){
      return '<p class="progress">3 of 3</p><h3>Where does the answer live today?</h3><p class="msg">Pick any that apply.</p>'+chips(SYSTEMS,true,state.systems)+nav(true,'See what I heard',true);
    },
    function(){ // reflect + continue
      var heard=[];
      if(state.role) heard.push('You work in <strong>'+esc(state.role.toLowerCase())+'</strong>.');
      if(state.question) heard.push('The question that keeps coming up is “'+esc(state.question)+'”');
      if(state.systems.length) heard.push('The answer sits in '+esc(list(state.systems.map(function(s){return s.replace(/ \(.*\)/,'');}).map(function(s){return /^[A-Z][a-z]/.test(s)?s.charAt(0).toLowerCase()+s.slice(1):s;})))+'.');
      var point='';
      if(state.role==='IT or security'){
        point='You’ll want our <a href="'+BASE+'trust/">trust and security</a> page. Detailed questions about systems and data handling are best answered in a conversation.';
      }else if(state.role==='Media'){
        point='Our <a href="'+BASE+'resources/">resources and media</a> page has public materials and the right contact.';
      }else if(state.systems.length>1){
        point='When an answer spans several systems, that’s the work <strong>AbëCONNECTs</strong> does: connecting the systems you already run. See the <a href="'+BASE+'use-cases/">work examples</a>.';
      }else{
        point='A good next look is our <a href="'+BASE+'use-cases/">work examples</a>, especially keeping track of work in progress with <strong>AbëSHADOWs</strong>.';
      }
      var body='Hello Bravetto,\n\nI’d like to schedule a 30-minute discovery call.\n\n'+
        (state.role?'My role: '+state.role+'\n':'')+
        (state.question?'The question that keeps coming up: '+state.question+'\n':'')+
        (state.systems.length?'Where the answer lives today: '+state.systems.join('; ')+'\n':'')+
        '\nName:\nCompany:\nGood times to talk:\n';
      var href='mailto:'+EMAIL+'?subject='+encodeURIComponent('Discovery call request')+'&body='+encodeURIComponent(body);
      return '<h3>Here’s what I heard.</h3>'+
        (heard.length?'<div class="summary">'+heard.join(' ')+'</div>':'<p class="msg">You skipped the questions. That’s fine.</p>')+
        '<p class="msg" style="margin-top:16px">'+point+'</p>'+
        '<p class="msg">I can’t tell you yet whether AbëONE fits. That takes a conversation with the team about your work and systems. A 30-minute discovery call is the place to start; a custom demo may follow.</p>'+
        '<div class="guide-nav"><a class="btn btn-gold" href="'+href+'">Email a discovery call request</a>'+
        '<button type="button" class="linkbtn" data-act="restart">Start over</button></div>'+
        '<p class="note">This opens your email app with what you told me filled in. Nothing is sent or stored until you send it.</p>';
    }
  ];
  var i=0;
  function render(focus){
    stage.innerHTML=steps[i]();
    if(focus){var h=stage.querySelector('h3'); if(h){h.setAttribute('tabindex','-1');h.focus();}}
  }
  function save(){
    var t=stage.querySelector('textarea'); if(t) state.question=t.value.trim();
  }
  stage.addEventListener('click',function(e){
    var c=e.target.closest('.chip');
    if(c){
      var v=c.getAttribute('data-v');
      if(i===1){state.role=state.role===v?'':v;}
      if(i===3){var k=state.systems.indexOf(v); if(k>-1) state.systems.splice(k,1); else state.systems.push(v);}
      stage.querySelectorAll('.chip').forEach(function(x){
        var xv=x.getAttribute('data-v');
        x.setAttribute('aria-pressed', i===1?String(state.role===xv):String(state.systems.indexOf(xv)>-1));
      });
      return;
    }
    var a=e.target.closest('[data-act]'); if(!a) return;
    var act=a.getAttribute('data-act');
    save();
    if(act==='next'||act==='skip'){ if(act==='skip'){ if(i===1) state.role=''; if(i===2) state.question=''; if(i===3) state.systems=[]; } i=Math.min(i+1,steps.length-1); }
    if(act==='back') i=Math.max(i-1,0);
    if(act==='restart'){ state={role:'',question:'',systems:[]}; i=0; }
    render(true);
  });
  render(false);
})();
