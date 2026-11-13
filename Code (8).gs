/** HRIS v2 – backend. HTML file must be named exactly: Portal */
const COLS=['Employee Number','Company','Surname','First Name','Middle Name','Gender','Date Hire','Birthdate','Department','Section','Position Title','Position Level','Employment Status','Immediate Head (Emp No)','Mobile','Email','City Address','Provincial Address','Educational Attainment','School Graduated','Degree','Civil Status','Dependents','Blood Type','TIN','SSS','PhilHealth','HDMF','Status','Last Day','Remarks','Work Location','Location City/Municipality'];
const DATES=['Date Hire','Birthdate','Last Day'];
const REG_COLS=['Surname','First Name','Middle Name','Gender','Birthdate','Mobile','Email','City Address','Provincial Address','Educational Attainment','School Graduated','Degree','Civil Status','Dependents','Blood Type','TIN','SSS','PhilHealth','HDMF'];
const REGH=['Reg ID','Submitted','Status','Password Hash','Salt','Employee Number'].concat(REG_COLS);
const UH=['Employee Number','Role','Password Hash','Salt','Must Change','Failed Attempts','Locked','Active'];
const TEXTCOLS=['Employee Number','Mobile','TIN','SSS','PhilHealth','HDMF'];
const SELF=['Mobile','Email','City Address','Provincial Address','Educational Attainment','School Graduated','Degree','Civil Status','Dependents','Blood Type','TIN','SSS','PhilHealth','HDMF'];
const LIST_COLS=['Employee Number','Surname','First Name','Company','Department','Work Location','Location City/Municipality','Position Title','Employment Status','Status','Mobile','Email'];
const LISTS={'Company':['LC Avrasya, Inc','Cebu Grasya Foods, Inc','LMA Avrasya, Inc'],
 'Department':['Human Resources','Finance','Accounting','Sales & Retail','Supply Chain','Leasing & Admin','Construction & Engineering'],
 'Position Level':['Rank & File','Supervisory','Managerial','Executive'],
 'Employment Status':['Probationary','Regular','Contractual','Fixed-Term','Seasonal','Project-Based'],
 'Educational Attainment':['Elementary','High School','Senior High School','College','Post Graduate'],
 'Civil Status':['Single','Married','Widowed','Separated'],'Gender':['Male','Female'],
 'Blood Type':['A+','A-','B+','B-','AB+','AB-','O+','O-'],'Status':['Active','Inactive'],'Work Location':['Head Office','Branch','Store']};
// ===== Role based access control (editable by the Super Admin in the portal: Role Permissions) =====
// perms = what a role can open/do | scope = whose records it can see | groups = which personal-data groups it can read about OTHER people
// widgets = which dashboard sections are sent to it | levels/statuses = optional row filters (e.g. payroll classes)
const PERM_CATALOG=[
 ['Personal self-service',[['me','My profile'],['att','Time in/out, leave, overtime & CTO'],['hris','My HRIS dashboard']]],
 ['People data',[['team','View employees within the data scope'],['edit','Add / edit employees, registrations, deactivate'],['export','Download the masterfile'],['users','Reset passwords / unlock accounts'],['roles','Assign roles to accounts'],['hist','View login history']]],
 ['Dashboards',[['dash','Analytics dashboard']]],
 ['Attendance & scheduling',[['attview','Attendance reports (view & export)'],['attrep','Approve requests (log corrections, leave, overtime/CTO)'],['tkadj','Correct attendance logs & reset phones'],['sched','Plot work schedules'],['geo','Branch geofence & shift templates'],['hol','Philippine holidays setup']]],
 ['Company content',[['ann','Announcements, activities & daily quotes'],['lrn','Learning hours'],['lvcr','Manually set available leave (leave credits)']]],
 ['Payroll (reserved for Phase 4)',[['pay','Payroll data']]]];
const ALL_PERMS=PERM_CATALOG.reduce((a,g)=>a.concat(g[1].map(x=>x[0])),[]).concat(['rbac']);
const WIDGETS=[['w_headcount','Headcount, status, trends & separations'],['w_org','Company, department, position & location'],['w_demo','Gender & education'],['w_sens','Age, civil status, dependents & birthdays'],['w_comp','Probation milestones & regularization'],['w_ids','Missing government IDs']];
const W_ALL=WIDGETS.map(w=>w[0]);
const G_ALL=['Identity','Employment','Contact','Address','Personal','Education','Government IDs','Remarks'];
const SCOPES=[['own','Own record only'],['direct','Direct reports'],['dept+direct','Direct reports in my department'],['dept|direct','My department or direct reports'],['dept','Whole department'],['all','Whole company']];
const P_HR='me att hris team dash edit users hist export attrep tkadj sched geo ann lrn lvcr';
const ROLE_DEFS=[
 {role:'Employee',rank:10,desc:'Own profile, attendance, leave, overtime and CTO.',perms:'me att hris',scope:'own',groups:['Identity'],widgets:[]},
 {role:'Supervisor',rank:20,desc:'Leads a team: sees direct reports, plots schedules, approves their requests.',perms:'me att hris team attrep sched',scope:'direct',groups:['Identity','Employment','Contact'],widgets:[]},
 {role:'Manager',rank:30,desc:'Manages a team within a department.',perms:'me att hris team dash attrep sched',scope:'dept+direct',groups:['Identity','Employment','Contact','Education'],widgets:['w_headcount','w_org','w_demo','w_comp']},
 {role:'Admin-Department Head',rank:40,desc:'Heads a department: sees the whole department and approves its requests.',perms:'me att hris team dash attrep sched',scope:'dept',groups:['Identity','Employment','Contact','Education'],widgets:['w_headcount','w_org','w_demo','w_comp']},
 {role:'HR-Learning & Development',rank:50,desc:'Trainings, learning hours and company announcements.',perms:'me att hris team dash lrn ann',scope:'all',groups:['Identity','Employment','Education'],widgets:['w_headcount','w_org','w_demo']},
 {role:'HR-Timekeeping',rank:50,desc:'Attendance, schedules, geofence, log corrections and approvals.',perms:'me att hris team dash attview attrep tkadj sched geo',scope:'all',groups:['Identity','Employment'],widgets:['w_headcount']},
 {role:'HR-Employee Relations',rank:50,desc:'Employee concerns, requests and company announcements.',perms:'me att hris team dash attrep ann',scope:'all',groups:['Identity','Employment','Contact','Personal','Education','Remarks'],widgets:['w_headcount','w_org','w_demo','w_sens','w_comp']},
 {role:'HR-Talent Management',rank:50,desc:'Recruitment, onboarding, employee records and development.',perms:'me att hris team dash edit lrn ann',scope:'all',groups:['Identity','Employment','Contact','Address','Personal','Education'],widgets:['w_headcount','w_org','w_demo','w_comp']},
 {role:'Payroll-Confidential',rank:50,desc:'Payroll for confidential positions (managerial and executive).',perms:'me att hris team export pay',scope:'all',groups:['Identity','Employment','Personal','Government IDs'],widgets:[],levels:['Managerial','Executive']},
 {role:'Payroll-NonConfidential',rank:50,desc:'Payroll for non-confidential monthly-paid positions.',perms:'me att hris team export pay',scope:'all',groups:['Identity','Employment','Personal','Government IDs'],widgets:[],levels:['Rank & File','Supervisory']},
 {role:'Payroll-DailyPaid',rank:50,desc:'Payroll for daily-paid rank & file employees.',perms:'me att hris team export pay',scope:'all',groups:['Identity','Employment','Personal','Government IDs'],widgets:[],levels:['Rank & File'],statuses:['Contractual','Fixed-Term','Seasonal','Project-Based']},
 {role:'HR',rank:60,desc:'Full HR access: all employees, records, reports and tools.',perms:P_HR,scope:'all',groups:G_ALL,widgets:W_ALL},
 {role:'Admin',rank:70,desc:'HR access plus role assignment and holiday setup.',perms:P_HR+' roles hol',scope:'all',groups:G_ALL,widgets:W_ALL},
 {role:'Super Admin',rank:100,desc:'Everything, including Role Permissions. Cannot be restricted.',perms:ALL_PERMS.join(' '),scope:'all',groups:G_ALL,widgets:W_ALL}];
const RANK=(function(){const o={};ROLE_DEFS.forEach(d=>o[d.role]=d.rank);return o;})();
const normRole_=r=>r==='Head'?'Manager':r;
const assignable_=r=>Object.keys(RANK).filter(k=>r==='Super Admin'||RANK[k]<RANK[r]);
const RB_H=['Role','Description','Permissions','Scope','Data Groups','Dashboard Widgets','Levels','Statuses','Updated By','Updated At'];
let _RC=null,_EM=null;
function cfgFrom_(role,rank,desc,perms,scope,groups,widgets,levels,statuses,custom){
 const uniq=a=>a.filter((x,i)=>a.indexOf(x)===i);
 perms=uniq(perms.filter(p=>ALL_PERMS.indexOf(p)>=0&&(p!=='rbac'||role==='Super Admin')));if(perms.indexOf('me')<0)perms.unshift('me');
 if(SCOPES.map(x=>x[0]).indexOf(scope)<0)scope='own';
 groups=uniq(['Identity'].concat(groups.filter(g=>G_ALL.indexOf(g)>=0)));widgets=uniq(widgets.filter(w=>W_ALL.indexOf(w)>=0));
 levels=levels.filter(x=>LISTS['Position Level'].indexOf(x)>=0);statuses=statuses.filter(x=>LISTS['Employment Status'].indexOf(x)>=0);
 if(role==='Super Admin'){perms=ALL_PERMS.slice();scope='all';groups=G_ALL.slice();widgets=W_ALL.slice();levels=[];statuses=[];}
 const eff=perms.slice();if(scope==='all'&&!levels.length&&!statuses.length)eff.push('all');
 return{role:role,rank:rank,desc:desc,perms:eff,base:perms,scope:scope,groups:groups,widgets:widgets,levels:levels,statuses:statuses,custom:!!custom};}
function rbacLoad_(){if(_RC)return _RC;
 const cache=CacheService.getScriptCache(),c=cache.get('rbac');if(c){try{_RC=JSON.parse(c);return _RC;}catch(e){}}
 const m={};ROLE_DEFS.forEach(d=>m[d.role]=cfgFrom_(d.role,d.rank,d.desc,d.perms.split(' '),d.scope,d.groups,d.widgets,d.levels||[],d.statuses||[],false));
 try{const v=mkSheet_('Roles',RB_H,[1]).getDataRange().getValues();v.shift();
  v.forEach(r=>{const role=String(r[0]).trim(),d=ROLE_DEFS.filter(x=>x.role===role)[0];if(!d||role==='Super Admin')return;
   const sp=(x,ch)=>String(x||'').split(ch).map(y=>y.trim()).filter(Boolean);
   m[role]=cfgFrom_(role,d.rank,String(r[1]||d.desc),sp(r[2],' '),String(r[3]||d.scope),sp(r[4],'|'),sp(r[5],' '),sp(r[6],'|'),sp(r[7],'|'),true);});}catch(e){}
 try{cache.put('rbac',JSON.stringify(m),300);}catch(e){}
 _RC=m;return m;}
function roleCfg_(role){const m=rbacLoad_();return m[role]||m['Employee'];}
function empLite_(id){if(!_EM){_EM={};rows_('Employees').forEach(e=>{_EM[String(e['Employee Number'])]={level:String(e['Position Level']||''),status:String(e['Employment Status']||'')};});}return _EM[String(id)];}
// may this user see the record of employee `id`?  (own record: always; otherwise by the role's scope and row filters)
function inScope_(s,id,dept,head){const cfg=roleCfg_(s.role);
 if(String(id)===String(s.id))return true;
 if(cfg.perms.indexOf('all')>=0)return true;
 if(cfg.perms.indexOf('team')<0)return false;
 const d=!!s.dept&&String(dept||'').trim()===s.dept,h=String(head||'').trim()===String(s.id);
 let ok=false;
 switch(cfg.scope){case 'all':ok=true;break;case 'dept':ok=d;break;case 'direct':ok=h;break;case 'dept|direct':ok=d||h;break;case 'dept+direct':ok=d&&h;break;default:ok=false;}
 if(!ok)return false;
 if(cfg.levels.length||cfg.statuses.length){const e=empLite_(id);if(!e)return false;
  if(cfg.levels.length&&cfg.levels.indexOf(e.level)<0)return false;if(cfg.statuses.length&&cfg.statuses.indexOf(e.status)<0)return false;}
 return true;}
function allowedFields_(s){const cfg=roleCfg_(s.role),a={};cfg.groups.forEach(g=>(EXPORT_GROUPS[g]||[]).forEach(f=>{a[f]=true;}));return a;}
function scopeLabel_(cfg,s){const b={own:'Your own record',direct:'Your direct reports','dept+direct':'Your direct reports in '+(s.dept||'your department'),'dept|direct':'Your department and direct reports',dept:'Your department: '+(s.dept||''),all:'All employees'}[cfg.scope]||'';
 return b+(cfg.levels.length?' · '+cfg.levels.join(', '):'')+(cfg.statuses.length?' · '+cfg.statuses.join(', '):'');}
function homeOf_(cfg){const p=cfg.perms;if(p.indexOf('dash')>=0&&p.indexOf('all')>=0)return'exec';
 if(p.indexOf('team')>=0&&['direct','dept+direct','dept|direct','dept'].indexOf(cfg.scope)>=0)return'team';return'self';}
const TZ=Session.getScriptTimeZone();

/* ---------- Menu & setup ---------- */
// Messages & prompts: shown as a pop-up when run from the spreadsheet menu; when run from the Apps Script editor
// (where pop-ups are not allowed) the message goes to the Execution log and a toast in the sheet instead.
function notify_(msg){try{SpreadsheetApp.getUi().alert(msg);}catch(e){Logger.log(msg);try{ss_().toast(String(msg).replace(/\n+/g,' ').slice(0,300),'HRIS',30);}catch(x){}}}
function uiOrNull_(){try{return SpreadsheetApp.getUi();}catch(e){notify_('This step needs a prompt. Open the Google Sheet and choose it from the HRIS menu (the Apps Script editor cannot show prompts).');return null;}}
function onOpen(){SpreadsheetApp.getUi().createMenu('HRIS')
 .addItem('1. Run first-time setup','setup').addItem('2. Create accounts for all employees','createAccounts')
 .addItem('3. Create Super Admin','createSuperAdmin').addItem('4. Reset / create a login','checkAccount')
 .addItem('5. Upgrade old roles (Head→Manager, ADMIN→Super Admin)','migrateRoles')
 .addItem('6. Set up Attendance & Geofence sheets (Phase 2)','setupAttendance')
 .addItem('7. Set up monthly archive (keeps the portal fast)','setupMaintenance').addToUi();}

function setup(){
 const ss=ss_(), mk=(n,h)=>{const s=ss.getSheetByName(n)||ss.insertSheet(n);
  if(s.getLastRow()===0){s.getRange(1,1,1,h.length).setValues([h]).setFontWeight('bold').setBackground('#1f6f5c').setFontColor('#fff');s.setFrozenRows(1);}return s;};
 const emp=mk('Employees',COLS);mk('Users',UH);mk('LoginHistory',['Timestamp','Employee Number','Result','Note']);mk('Temp Credentials',['Employee Number','Temporary Password','Created']);mk('Registrations',REGH);
 COLS.forEach((c,i)=>{const r=emp.getRange(2,i+1,1999,1);
  if(LISTS[c])r.setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(LISTS[c],true).setAllowInvalid(false).build());
  if(DATES.includes(c))r.setNumberFormat('yyyy-mm-dd');if(TEXTCOLS.includes(c))r.setNumberFormat('@');});
 if(!findRow_('Users','ADMIN')){const pw=tempPw_();addUser_('ADMIN','Super Admin',pw);emp.appendRow(['ADMIN','','Administrator','System']);
  notify_('Setup done.\n\nEmployee Number: ADMIN\nTemporary password: '+pw+'\n\nYou will be asked to change it.');}
 else notify_('Setup done (ADMIN already exists).');
}

function migrateRoles(){
 const s=sh_('Users'),n=s.getLastRow()-1;if(n<1)return;const rg=s.getRange(2,1,n,2),v=rg.getValues();let k=0;
 v.forEach(r=>{let nr=r[1];if(r[1]==='Head')nr='Manager';if(String(r[0])==='ADMIN'&&r[1]==='Admin')nr='Super Admin';if(nr!==r[1]){r[1]=nr;k++;}});
 rg.setValues(v);notify_(k+' role(s) updated.');}

function createAccounts(){
 const have=new Set(rows_('Users').map(u=>String(u[UH[0]]))),out=[];
 rows_('Employees').forEach(e=>{const id=String(e['Employee Number']);
  if(id&&!have.has(id)&&e['Status']!=='Inactive'){const pw=tempPw_();addUser_(id,'Employee',pw);out.push([id,pw,new Date()]);}});
 if(out.length){const s=sh_('Temp Credentials');s.getRange(s.getLastRow()+1,1,out.length,3).setValues(out);}
 notify_(out.length+' account(s) created. Passwords are in "Temp Credentials".');
}

function createSuperAdmin(){
 const ui=uiOrNull_();if(!ui)return;
 const ask=p=>{const r=ui.prompt('HR Super Admin',p,ui.ButtonSet.OK_CANCEL);return r.getSelectedButton()===ui.Button.OK?r.getResponseText().trim():null;};
 const id=ask('Employee Number (e.g. HR-001):');if(!id)return;const sn=ask('Surname:');if(!sn)return;const fn=ask('First name:');if(!fn)return;
 if(!findRow_('Employees',id)){const o={'Employee Number':id,'Surname':sn,'First Name':fn,'Department':'Human Resources','Position Title':'HR Super Admin','Status':'Active'};
  sh_('Employees').appendRow(COLS.map(c=>o[c]||''));}
 resetOrAdd_(id,'Super Admin');
}
function checkAccount(){
 const ui=uiOrNull_();if(!ui)return;
 const r=ui.prompt('Reset / create a login','Employee Number:',ui.ButtonSet.OK_CANCEL);
 if(r.getSelectedButton()!==ui.Button.OK)return;const id=r.getResponseText().trim();if(!id)return;
 resetOrAdd_(id,'Employee');
}
function resetOrAdd_(id,role){
 const pw=tempPw_();
 if(findRow_('Users',id)){const salt=Utilities.getUuid();
  setUser_(id,{'Password Hash':hash_(pw,salt),'Salt':salt,'Must Change':true,'Failed Attempts':0,'Locked':false,'Active':true});
  if(role!=='Employee')setUser_(id,{'Role':role});}
 else addUser_(id,role,pw);
 notify_('Done.\n\nEmployee Number: '+id+'\nTemporary password: '+pw);
}

/* ---------- Helpers ---------- */
let _ss=null;const _sh={};
function ss_(){if(_ss)return _ss;const p=PropertiesService.getScriptProperties(),id=p.getProperty('SS_ID');
 if(id)return(_ss=SpreadsheetApp.openById(id));
 const a=SpreadsheetApp.getActive();if(!a)throw new Error('Spreadsheet not linked. Open the sheet and run HRIS > 1. Run first-time setup.');
 p.setProperty('SS_ID',a.getId());return(_ss=a);}
const sh_=n=>{if(!_sh[n]){_sh[n]=ss_().getSheetByName(n);if(n==='Employees'&&_sh[n])ensureEmpCols_(_sh[n]);}return _sh[n];};
function ensureEmpCols_(s){   // adds any new masterlist columns (e.g. Work Location) to an existing Employees sheet, once
 const cache=CacheService.getScriptCache();if(cache.get('colsok1'))return;
 const n=COLS.length;if(s.getMaxColumns()<n)s.insertColumnsAfter(s.getMaxColumns(),n-s.getMaxColumns());
 const h=s.getRange(1,1,1,n).getValues()[0];
 for(let i=0;i<n;i++){if(!h[i]){
  s.getRange(1,i+1).setValue(COLS[i]).setFontWeight('bold').setBackground('#1f6f5c').setFontColor('#fff');
  if(LISTS[COLS[i]])s.getRange(2,i+1,1999,1).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(LISTS[COLS[i]],true).setAllowInvalid(true).build());}}
 cache.put('colsok1','1',21600);}
const d_=v=>v instanceof Date?Utilities.formatDate(v,TZ,'yyyy-MM-dd'):(v==null?'':v);
const tempPw_=()=>Utilities.getUuid().replace(/-/g,'').slice(0,8)+'A1';
const hash_=(pw,salt)=>Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,salt+pw));
const can_=(s,p)=>roleCfg_(s.role).perms.indexOf(p)>=0;
const need_=(s,p)=>{if(!can_(s,p))throw new Error('You do not have access to this.');};
const toDate_=v=>v instanceof Date?v:(v?new Date(v+'T00:00:00'):'');
let _RM={on:false};
function memo_(){_RM.on=true;}   // read-only APIs switch this on so repeated sheet reads inside one request are reused
function rows_(n){if(_RM.on&&_RM[n])return _RM[n];const v=sh_(n).getDataRange().getValues(),h=v.shift();
 const out=v.map((r,i)=>{const o={_row:i+2};h.forEach((k,j)=>o[k]=r[j]);return o;}).filter(o=>o[h[0]]!=='');if(_RM.on)_RM[n]=out;return out;}
function findRow_(n,id){const s=sh_(n);if(!s)return 0;
 const f=s.getRange('A:A').createTextFinder(String(id)).matchEntireCell(true).findNext();return f?f.getRow():0;}
function addUser_(id,role,pw){const salt=Utilities.getUuid();sh_('Users').appendRow([id,role,hash_(pw,salt),salt,true,0,false,true]);}
function setUser_(id,p){const rg=sh_('Users').getRange(findRow_('Users',id),1,1,8),v=rg.getValues()[0];
 Object.keys(p).forEach(k=>v[UH.indexOf(k)]=p[k]);rg.setValues([v]);}
function log_(id,res,note){const s=sh_('LoginHistory');if(s)s.appendRow([new Date(),id,res,note||'']);}
function pwOk_(p){if(!p||p.length<8||!/\d/.test(p)||!/[A-Za-z]/.test(p))throw new Error('Use at least 8 characters with letters and numbers.');}

function canManage_(s,id,eq){   // may this user manage the account/record of employee id?
 const r=findRow_('Users',id);if(!r)return true;
 const tr=RANK[normRole_(sh_('Users').getRange(r,2).getValue())]||0;
 return s.role==='Super Admin'||(eq?RANK[s.role]>=tr:RANK[s.role]>tr);}
function deptOf_(id){const r=findRow_('Employees',id);return r?String(sh_('Employees').getRange(r,COLS.indexOf('Department')+1).getValue()).trim():'';}

function session_(t,pending){
 const c=CacheService.getScriptCache().get('s_'+t);
 if(!c)throw new Error('SESSION expired. Please log in again.');
 const s=JSON.parse(c);s.token=t;s.role=normRole_(s.role);if(!RANK[s.role])throw new Error('SESSION Unknown role.');
 if(!s.c&&!pending&&s.role!==CONSENT_EXEMPT)throw new Error('CONSENT You must accept the Data Privacy Consent first.');
 return s;}

/* ---------- Web app ---------- */
function doGet(){
 // The HTML file should be named Portal; Code / Index are accepted too.
 const names=['Portal','Code','Index'];let lastErr='';
 for(const n of names){
  try{return HtmlService.createHtmlOutputFromFile(n).setTitle('HRIS').addMetaTag('viewport','width=device-width, initial-scale=1, viewport-fit=cover');}
  catch(e){lastErr=String(e);}
 }
 return HtmlService.createHtmlOutput('<p style="font:16px sans-serif;padding:24px">HRIS: no HTML file found. In Apps Script add an HTML file named <b>Portal</b> and paste Portal.html into it.<br><small>'+lastErr+'</small></p>');}

function api_ping(){const miss=['Employees','Users','LoginHistory','Registrations'].filter(n=>!sh_(n));return{ok:!miss.length,missing:miss};}
function api_regInfo(){return{cols:REG_COLS,lists:LISTS,dates:DATES};}

function api_login(id,pw){
 id=String(id).trim();pw=String(pw||'');
 const us=sh_('Users');if(!us)throw new Error('System not set up. Open the Google Sheet and run HRIS > 1. Run first-time setup.');
 const uv=us.getDataRange().getValues();let u=null;   // ONE read of the Users sheet, searched in memory
 for(let k=1;k<uv.length;k++){if(String(uv[k][0])===id){u=uv[k];break;}}
 if(!u){log_(id,'FAILED','Unknown account');throw new Error('No login account for this Employee Number. New employee? Tap Register.');}
 if(u[7]!==true){log_(id,'BLOCKED','Inactive');throw new Error('This account is deactivated. Contact HR.');}
 if(u[6]===true){log_(id,'BLOCKED','Locked');throw new Error('Account locked. Contact HR.');}
 if(hash_(pw,u[3])!==u[2]){const n=(u[5]||0)+1;setUser_(id,{'Failed Attempts':n,'Locked':n>=5});log_(id,'FAILED','Attempt '+n);throw new Error('Wrong employee number or password.');}
 if(u[5])setUser_(id,{'Failed Attempts':0});
 const ev=sh_('Employees').getDataRange().getValues();let er=null;   // ONE read of Employees
 for(let k=1;k<ev.length;k++){if(String(ev[k][0])===id){er=ev[k];break;}}
 const s={id:id,role:normRole_(u[1]),dept:er?String(er[COLS.indexOf('Department')]||'').trim():''};
 if(!RANK[s.role])throw new Error('Your account has an unknown role. Contact HR.');
 const ok=s.role===CONSENT_EXEMPT||hasConsent_(id);s.c=ok;   // Super Admin skips the consent
 const t=Utilities.getUuid();
 CacheService.getScriptCache().put('s_'+t,JSON.stringify(s),21600);
 log_(id,'SUCCESS');
 return{token:t,mustChange:u[4]===true,needConsent:!ok,consent:ok?null:consentInfo_(),boot:ok?boot_(s,er):null};   // login + dashboard data in ONE call
}
function boot_(s,er){
 const me={};
 if(!er){const r=findRow_('Employees',s.id);if(r)er=sh_('Employees').getRange(r,1,1,COLS.length).getValues()[0];}
 if(er)COLS.forEach((k,i)=>me[k]=d_(er[i]));
 return{role:s.role,dept:s.dept||'',assign:assignable_(s.role),id:s.id,name:((me['First Name']||'')+' '+(me['Surname']||'')).trim()||s.id,
  perms:roleCfg_(s.role).perms,home:homeOf_(roleCfg_(s.role)),scope:roleCfg_(s.role).scope,self:SELF,dates:DATES,lists:LISTS,me:me,cols:COLS};}
function api_boot(t){
 const s=session_(t,true);
 if(!s.c){
  if(s.role===CONSENT_EXEMPT||hasConsent_(s.id)){s.c=true;CacheService.getScriptCache().put('s_'+t,JSON.stringify({id:s.id,role:s.role,dept:s.dept,c:true}),21600);}
  else return{needConsent:true,consent:consentInfo_()};
 }
 return boot_(s);}
function api_logout(t){CacheService.getScriptCache().remove('s_'+t);}

function api_changePw(t,oldPw,newPw){
 const s=session_(t),u=sh_('Users').getRange(findRow_('Users',s.id),1,1,8).getValues()[0];
 if(hash_(oldPw,u[3])!==u[2])throw new Error('Current password is incorrect.');
 pwOk_(newPw);const salt=Utilities.getUuid();
 setUser_(s.id,{'Password Hash':hash_(newPw,salt),'Salt':salt,'Must Change':false});log_(s.id,'PASSWORD_CHANGED');}

function api_employees(t){
 const s=session_(t),all=can_(s,'all');if(!all)need_(s,'team');
 return rows_('Employees').filter(e=>e['Employee Number']!=='ADMIN'&&inScope_(s,e['Employee Number'],e['Department'],e['Immediate Head (Emp No)']))
  .map(e=>{const al=allowedFields_(s);return LIST_COLS.map(c=>al[c]?d_(e[c]):'');});}

function api_saveMe(t,o){
 const s=session_(t),r=findRow_('Employees',s.id);if(!r)throw new Error('Your employee record was not found. Contact HR.');
 const rg=sh_('Employees').getRange(r,1,1,COLS.length),v=rg.getValues()[0];
 SELF.forEach(c=>{if(o[c]!==undefined)v[COLS.indexOf(c)]=o[c];});rg.setValues([v]);log_(s.id,'PROFILE_UPDATED');}

/* ---------- Registration ---------- */
function api_register(o,pw,cn){
 const cache=CacheService.getScriptCache(),n=Number(cache.get('regN')||0);
 if(n>30)throw new Error('Too many registrations. Try again in a few minutes.');cache.put('regN',String(n+1),600);
 ['Surname','First Name','Birthdate','Mobile','Email'].forEach(k=>{if(!String(o[k]||'').trim())throw new Error(k+' is required.');});
 pwOk_(pw);
 if(!cn||cn.agree!==true||String(cn.name||'').trim().length<3)throw new Error('You must accept the Data Privacy Consent (and type your full name) to register.');
 const mail=String(o['Email']).trim().toLowerCase();
 if(rows_('Registrations').some(r=>r['Status']==='Pending'&&String(r['Email']).toLowerCase()===mail)||rows_('Employees').some(e=>String(e['Email']).toLowerCase()===mail))
  throw new Error('This email is already registered. Contact HR.');
 const salt=Utilities.getUuid();
 const rid=Utilities.getUuid();
 sh_('Registrations').appendRow([rid,new Date(),'Pending',hash_(pw,salt),salt,''].concat(REG_COLS.map(c=>c==='Birthdate'?toDate_(o[c]):(o[c]||''))));
 addConsent_('REG:'+rid,String(cn.name).trim(),'registration form');
 log_('(registration)','REGISTERED',mail);}

function api_registrations(t){
 const s=session_(t);need_(s,'edit');
 return rows_('Registrations').filter(r=>r['Status']==='Pending').map(r=>{
  const x={'Reg ID':r['Reg ID'],Submitted:Utilities.formatDate(new Date(r['Submitted']),TZ,'yyyy-MM-dd HH:mm')};
  REG_COLS.forEach(c=>x[c]=d_(r[c]));return x;});}

function api_approveReg(t,regId,a){
 const s=session_(t);need_(s,'edit');
 const reg=rows_('Registrations').find(r=>r['Reg ID']===regId);
 if(!reg||reg['Status']!=='Pending')throw new Error('This registration is no longer pending.');
 const id=String(a['Employee Number']||'').trim();
 if(!id||!a['Company']||!a['Department']||!a['Date Hire'])throw new Error('Employee Number, company, department and date hired are required.');
 if(findRow_('Employees',id)||findRow_('Users',id))throw new Error('Employee Number already exists.');
 const o=Object.assign({},reg,a,{'Employee Number':id,'Status':'Active'});
 sh_('Employees').appendRow(COLS.map(c=>DATES.includes(c)?toDate_(o[c]):(o[c]===undefined?'':o[c])));
 sh_('Users').appendRow([id,'Employee',reg['Password Hash'],reg['Salt'],false,0,false,true]);
 const cr=consentRow_('REG:'+regId);addConsent_(id,cr?cr[3]:'','accepted at registration '+(cr?Utilities.formatDate(new Date(cr[2]),TZ,'yyyy-MM-dd HH:mm'):''));
 const rs=sh_('Registrations');rs.getRange(reg._row,3).setValue('Approved');rs.getRange(reg._row,6).setValue(id);
 try{if(reg['Email'])MailApp.sendEmail(reg['Email'],'Your HRIS account is ready','Hi '+reg['First Name']+',\n\nYour registration was approved.\nEmployee Number: '+id+'\nSign in with this number and the password you chose.');}catch(e){}
 log_(s.id,'REGISTRATION_APPROVED',id);}

function api_rejectReg(t,regId){
 const s=session_(t);need_(s,'edit');const reg=rows_('Registrations').find(r=>r['Reg ID']===regId);
 if(!reg)throw new Error('Registration not found.');sh_('Registrations').getRange(reg._row,3).setValue('Rejected');log_(s.id,'REGISTRATION_REJECTED',reg['Email']);}

/* ---------- Admin ---------- */
function api_users(t){const s=session_(t);need_(s,'users');
 return rows_('Users').map(u=>({id:u['Employee Number'],role:normRole_(u['Role']),locked:u['Locked']===true,active:u['Active']===true}))
  .map(u=>(u.manage=s.role==='Super Admin'||RANK[u.role]<RANK[s.role],u)).filter(u=>u.manage||String(u.id)===s.id);}
function api_resetPw(t,id){
 const s=session_(t);need_(s,'users');if(!findRow_('Users',id))throw new Error('Account not found.');
 if(!canManage_(s,id))throw new Error('You do not have access to this account.');
 const pw=tempPw_(),salt=Utilities.getUuid();
 setUser_(id,{'Password Hash':hash_(pw,salt),'Salt':salt,'Must Change':true,'Failed Attempts':0,'Locked':false});log_(s.id,'PASSWORD_RESET',id);return pw;}
function api_history(t){const s=session_(t);need_(s,'hist');
 const sh=sh_('LoginHistory'),n=sh.getLastRow()-1;if(n<1)return[];
 const v=sh.getRange(Math.max(2,sh.getLastRow()-199),1,Math.min(200,n),4).getValues();
 return v.reverse().map(r=>[Utilities.formatDate(new Date(r[0]),TZ,'yyyy-MM-dd HH:mm'),r[1],r[2],r[3]]);}

/* ---------- Super Admin dashboard & employee management ---------- */
function api_dashboard(t,company,fresh){memo_();
 const s=session_(t);need_(s,'dash');const scoped=!can_(s,'all');
 const cc=CacheService.getScriptCache(),ck='dsh_'+s.role+'_'+(scoped?s.id:'all')+'_'+((company&&!scoped)?company:'');
 if(!fresh){const hit=cc.get(ck);if(hit){try{return JSON.parse(hit);}catch(e){}}}
 if(scoped&&roleCfg_(s.role).scope.indexOf('dept')>=0&&!s.dept)throw new Error('Your employee record has no department. Contact HR.');
 const base=rows_('Employees').filter(x=>x['Employee Number']!=='ADMIN'&&(!scoped||inScope_(s,x['Employee Number'],x['Department'],x['Immediate Head (Emp No)']))),all=(company&&!scoped)?base.filter(x=>x['Company']===company):base,
  act=all.filter(x=>x['Status']!=='Inactive'),DAY=86400000,YR=365.25*DAY,now=new Date(),
  today=new Date(now.getFullYear(),now.getMonth(),now.getDate()),in30=new Date(today.getTime()+30*DAY),ago30=new Date(today.getTime()-30*DAY),
  addM=(d,m)=>{const x=new Date(d);x.setMonth(x.getMonth()+m);return x;},ago12=addM(today,-12),
  dt=v=>v instanceof Date?v:null,nm=x=>(String(x['First Name']||'')+' '+String(x['Surname']||'')).trim(),
  tally=(list,k,order)=>{const m={};list.forEach(x=>{const v=x[k]||'Not set';m[v]=(m[v]||0)+1;});
   const ks=order?order.filter(o=>m[o]).concat(Object.keys(m).filter(o=>!order.includes(o))):Object.keys(m).sort((a,b)=>m[b]-m[a]);return ks.map(o=>[o,m[o]]);};
 const sep=all.filter(x=>x['Status']==='Inactive'&&dt(x['Last Day']));
 const sm=[];for(let i=11;i>=0;i--){const d=addM(new Date(today.getFullYear(),today.getMonth(),1),-i);sm.push([Utilities.formatDate(d,TZ,'MMM yy'),0,Utilities.formatDate(d,TZ,'yyyy-MM')]);}
 sep.forEach(x=>{const r=sm.find(m=>m[2]===Utilities.formatDate(x['Last Day'],TZ,'yyyy-MM'));if(r)r[1]++;});
 const hcm=sm.map(m=>{const y=+m[2].slice(0,4),mo=+m[2].slice(5)-1;let e=new Date(y,mo+1,0,23,59,59);if(e>now)e=now;
  return [m[0],all.filter(x=>{const h=dt(x['Date Hire']),l=dt(x['Last Day']);if(h&&h>e)return false;if(x['Status']==='Inactive')return !!l&&l>e;return !(l&&l<=e);}).length];});
 const ages=act.map(x=>dt(x['Birthdate'])).filter(Boolean).map(b=>(today-b)/YR),
  ten=act.map(x=>dt(x['Date Hire'])).filter(Boolean).map(h=>Math.max(0,(today-h)/YR)),
  avg=a=>a.length?+(a.reduce((p,c)=>p+c,0)/a.length).toFixed(1):0;
 const ab={'Under 25':0,'25-34':0,'35-44':0,'45-54':0,'55+':0};
 ages.forEach(a=>{ab[a<25?'Under 25':a<35?'25-34':a<45?'35-44':a<55?'45-54':'55+']++;});
 const tb={'Under 5 yrs':0,'5-9 yrs':0,'10-14 yrs':0,'15-19 yrs':0,'20-24 yrs':0,'25-29 yrs':0,'30+ yrs':0};
 ten.forEach(t=>{const y=Math.floor(t/5)*5;tb[y<5?'Under 5 yrs':y>=30?'30+ yrs':y+'-'+(y+4)+' yrs']++;});
 const bd=act.filter(x=>dt(x['Birthdate'])&&x['Birthdate'].getMonth()===today.getMonth())
  .sort((a,b)=>a['Birthdate'].getDate()-b['Birthdate'].getDate()).map(x=>[x['Birthdate'].getDate(),nm(x),x['Department']||'']);
 const ml=[],mc={'1st Month':0,'3rd Month':0,'5th Month':0,'Regularization':0};
 act.filter(x=>x['Employment Status']==='Probationary'&&dt(x['Date Hire'])).forEach(x=>{
  [[1,'1st Month'],[3,'3rd Month'],[5,'5th Month'],[6,'Regularization']].forEach(m=>{const d=addM(x['Date Hire'],m[0]);
   if(d>=today&&d<=in30){mc[m[1]]++;ml.push([m[1],d_(d),String(x['Employee Number']),nm(x),x['Department']||'']);}});});
 ml.sort((a,b)=>a[1]<b[1]?-1:1);
 const IDS=['TIN','SSS','PhilHealth','HDMF'],e0=(x,k)=>!String(x[k]||'').trim(),miss=[];
 act.forEach(x=>{const m=IDS.filter(k=>e0(x,k));if(m.length)miss.push([String(x['Employee Number']),nm(x),x['Department']||'',m.join(', ')]);});
 const out={manpower:act.length,regular:act.filter(x=>x['Employment Status']==='Regular').length,
  probationary:act.filter(x=>x['Employment Status']==='Probationary').length,
  sep12:sep.filter(x=>x['Last Day']>=ago12).length,sep30:sep.filter(x=>x['Last Day']>=ago30).length,
  avgAge:avg(ages),avgTenure:avg(ten),new30:act.filter(x=>dt(x['Date Hire'])&&x['Date Hire']>=ago30&&x['Date Hire']<=today).length,
  dependents:act.reduce((n,x)=>n+(parseInt(x['Dependents'],10)||0),0),
  regDue:mc['Regularization'],evalDue:mc['1st Month']+mc['3rd Month']+mc['5th Month'],
  missCount:miss.length,missById:IDS.map(k=>[k,act.filter(x=>e0(x,k)).length]),missList:miss.slice(0,100),
  bdays:bd,milestones:Object.keys(mc).map(k=>[k,mc[k]]),mlist:ml.slice(0,100),
  byCompany:tally(base.filter(x=>x['Status']!=='Inactive'),'Company',LISTS['Company']),
  employment:tally(act,'Employment Status',LISTS['Employment Status']),gender:tally(act,'Gender'),civil:tally(act,'Civil Status',LISTS['Civil Status']),
  education:tally(act,'Educational Attainment',LISTS['Educational Attainment']),department:tally(act,'Department'),positionLevel:tally(act,'Position Level',LISTS['Position Level']),workLoc:tally(act,'Work Location',LISTS['Work Location']),cities:tally(act,'Location City/Municipality').slice(0,8),
  ageDist:Object.keys(ab).map(k=>[k,ab[k]]),tenureDist:Object.keys(tb).map(k=>[k,tb[k]]),manpowerMonthly:hcm,sepMonthly:sm.map(m=>[m[0],m[1]])};
 const cfg=roleCfg_(s.role),W=cfg.widgets,hide=(w,keys)=>{if(W.indexOf(w)<0)keys.forEach(k=>{out[k]=null;});};
 hide('w_headcount',['manpower','regular','probationary','new30','sep12','sep30','sepMonthly','manpowerMonthly','employment','avgTenure','tenureDist']);
 hide('w_org',['byCompany','department','positionLevel','workLoc','cities']);
 hide('w_demo',['gender','education']);
 hide('w_sens',['avgAge','ageDist','civil','dependents','bdays']);
 hide('w_comp',['regDue','evalDue','milestones','mlist']);
 hide('w_ids',['missCount','missById','missList']);
 out.widgets=W.slice();
 if(scoped)Object.assign(out,{scoped:true,dept:s.dept,scopeLabel:scopeLabel_(cfg,s)});
 try{const js=JSON.stringify(out);if(js.length<90000)cc.put(ck,js,180);}catch(e){}
 return out;}

function api_employee(t,id){
 const s=session_(t);need_(s,'edit');const r=findRow_('Employees',id);if(!r)throw new Error('Employee not found.');
 const al=allowedFields_(s),v=sh_('Employees').getRange(r,1,1,COLS.length).getValues()[0],o={};COLS.forEach((k,i)=>o[k]=(al[k]||String(id)===s.id)?d_(v[i]):'');return o;}

function api_saveEmployee(t,o,isNew){
 const s=session_(t);need_(s,'edit');const id=String(o['Employee Number']||'').trim();
 if(!id||!o['Surname']||!o['First Name']||!o['Company']||!o['Department'])throw new Error('Employee Number, name, company and department are required.');
 const r=findRow_('Employees',id);
 if(isNew&&(r||findRow_('Users',id)))throw new Error('Employee Number already exists.');
 if(!isNew&&!r)throw new Error('Employee not found.');
 const row=COLS.map(c=>DATES.includes(c)?toDate_(o[c]):(o[c]===undefined?'':o[c]));
 {const al=allowedFields_(s);if(!isNew){const old=sh_('Employees').getRange(r,1,1,COLS.length).getValues()[0];COLS.forEach((c,i)=>{if(!al[c]&&String(id)!==s.id)row[i]=old[i];});}else COLS.forEach((c,i)=>{if(!al[c]&&c!=='Employee Number')row[i]='';});}
 let pw=null;
 if(isNew){sh_('Employees').appendRow(row);pw=tempPw_();addUser_(id,'Employee',pw);}
 else{if(!canManage_(s,id,true))throw new Error('You do not have access to this record.');sh_('Employees').getRange(r,1,1,COLS.length).setValues([row]);
  if(findRow_('Users',id)&&o['Status'])setUser_(id,{'Active':o['Status']!=='Inactive'});}
 log_(s.id,isNew?'EMPLOYEE_ADDED':'EMPLOYEE_UPDATED',id);return{tempPassword:pw};}

function api_deactivate(t,id,lastDay){
 const s=session_(t);need_(s,'edit');const r=findRow_('Employees',id);if(!r)throw new Error('Employee not found.');
 if(String(id)===s.id)throw new Error('You cannot deactivate yourself.');if(!canManage_(s,id,true))throw new Error('You do not have access to this record.');
 const sh=sh_('Employees');sh.getRange(r,COLS.indexOf('Status')+1).setValue('Inactive');
 sh.getRange(r,COLS.indexOf('Last Day')+1).setValue(lastDay?toDate_(lastDay):new Date());
 if(findRow_('Users',id))setUser_(id,{'Active':false});log_(s.id,'DEACTIVATED',id);}

function api_setRole(t,id,role){
 const s=session_(t);need_(s,'roles');
 if(!RANK[role]||!assignable_(s.role).includes(role))throw new Error('You cannot assign this role.');
 if(String(id)===s.id)throw new Error('You cannot change your own role.');
 if(!findRow_('Users',id))throw new Error('Account not found.');
 if(!canManage_(s,id))throw new Error('You do not have access to this account.');
 setUser_(id,{'Role':role});log_(s.id,'ROLE_CHANGED',id+' -> '+role);}

/* ---------- Profile pictures (private Drive folder; small JPEGs) ---------- */
function authorize(){photoFolder_();UrlFetchApp.fetch('https://www.google.com',{muteHttpExceptions:true});}   // run once from the editor to grant Drive access
function photoFolder_(){
 const p=PropertiesService.getScriptProperties(),id=p.getProperty('PHOTO_FOLDER');
 try{if(id)return DriveApp.getFolderById(id);}catch(e){}
 const f=DriveApp.createFolder('HRIS Profile Photos');p.setProperty('PHOTO_FOLDER',f.getId());return f;}
function empHead_(id){const r=findRow_('Employees',id);
 return r?String(sh_('Employees').getRange(r,COLS.indexOf('Immediate Head (Emp No)')+1).getValue()):'';}

function api_photo(t,id){
 const s=session_(t);id=String(id||s.id);
 if(!(id===s.id||can_(s,'all')||(can_(s,'team')&&inScope_(s,id,deptOf_(id),empHead_(id)))))throw new Error('You do not have access to this.');
 return photoData_(id);}
function photoData_(id){
 const c=CacheService.getScriptCache(),k='p_'+id,hit=c.get(k);if(hit!==null)return hit==='-'?'':hit;
 const it=photoFolder_().getFilesByName(id+'.jpg');
 const u=it.hasNext()?'data:image/jpeg;base64,'+Utilities.base64Encode(it.next().getBlob().getBytes()):'';
 try{c.put(k,u||'-',21600);}catch(e){}return u;}

function api_savePhoto(t,dataUrl,id){
 const s=session_(t);id=String(id||s.id);
 if(id!==s.id){need_(s,'edit');if(!findRow_('Employees',id))throw new Error('Employee not found.');}
 const m=/^data:image\/jpeg;base64,([A-Za-z0-9+\/=]+)$/.exec(dataUrl||'');
 if(!m||m[1].length>300000)throw new Error('Please choose a smaller picture.');
 const f=photoFolder_(),old=f.getFilesByName(id+'.jpg');while(old.hasNext())old.next().setTrashed(true);
 f.createFile(Utilities.newBlob(Utilities.base64Decode(m[1]),'image/jpeg',id+'.jpg'));
 CacheService.getScriptCache().remove('p_'+id);log_(s.id,'PHOTO_UPDATED',id);}


/* ---------- Extended employee profile (separate "Profiles" sheet, created automatically) ---------- */
const PROF=['Nickname','Short Bio','Interests & Hobbies','Fun Facts','Certifications','LinkedIn','Facebook','Instagram','Website'];
function profSheet_(){
 let s=ss_().getSheetByName('Profiles');
 if(!s){s=ss_().insertSheet('Profiles');
  s.getRange(1,1,1,PROF.length+2).setValues([['Employee Number'].concat(PROF,['Updated'])]).setFontWeight('bold').setBackground('#111').setFontColor('#fff');
  s.setFrozenRows(1);s.getRange(2,1,1999,1).setNumberFormat('@');}
 _sh['Profiles']=s;return s;}

function api_profile(t){const s=session_(t);return profileOf_(s.id);}
function profileOf_(id){
 const ps=profSheet_(),r=findRow_('Profiles',id),prof={},v=r?ps.getRange(r,1,1,PROF.length+2).getValues()[0]:[];
 PROF.forEach((k,i)=>prof[k]=String(v[i+1]||''));
 let boss=null;const er=findRow_('Employees',id);
 if(er){const hid=String(sh_('Employees').getRange(er,COLS.indexOf('Immediate Head (Emp No)')+1).getValue()).trim(),br=hid?findRow_('Employees',hid):0;
  if(br){const b=sh_('Employees').getRange(br,1,1,COLS.length).getValues()[0];
   boss={id:hid,name:(b[COLS.indexOf('First Name')]+' '+b[COLS.indexOf('Surname')]).trim(),title:String(b[COLS.indexOf('Position Title')]||'')};}}
 return{prof:prof,boss:boss};}

function api_saveProfile(t,o){
 const s=session_(t),ps=profSheet_(),clean=v=>{v=String(v==null?'':v).trim();return /^[=+\-@]/.test(v)?' '+v:v;};
 const p={};PROF.forEach(k=>p[k]=clean(o[k]));
 if(p['Nickname'].length>40)throw new Error('Nickname is limited to 40 characters.');
 if(p['Short Bio'].split(/\s+/).filter(Boolean).length>100)throw new Error('Short bio is limited to 100 words.');
 ['Short Bio','Interests & Hobbies','Fun Facts','Certifications'].forEach(k=>{if(p[k].length>1200)throw new Error(k+' is too long (max 1,200 characters).');});
 ['LinkedIn','Facebook','Instagram','Website'].forEach(k=>{if(p[k]&&!/^https?:\/\/\S+$/i.test(p[k].trim()))throw new Error(k+' must be a full link starting with http:// or https://');});
 const row=[String(s.id)].concat(PROF.map(k=>p[k]),[new Date()]),r=findRow_('Profiles',s.id);
 if(r)ps.getRange(r,1,1,row.length).setValues([row]);else ps.appendRow(row);
 log_(s.id,'PROFILE_UPDATED','extended');}


/* ---------- Data Privacy Act of 2012 (RA 10173) consent & waiver ---------- */
// Change the version whenever the wording changes: every user will then be asked to accept again.
const CONSENT_VERSION='DPA-2026-1';
const CONSENT_EXEMPT='Super Admin';   // this role is not asked to sign the consent (set to '' to require it from everyone)
const DPO_CONTACT='[Data Protection Officer: name, email and mobile - edit DPO_CONTACT in Code.gs]';
const COMPANY_TXT='LC Avrasya, Inc, Cebu Grasya Foods, Inc and LMA Avrasya, Inc (together, the "Company")';

function consentText_(){return [
 {h:'1. Who we are',p:[COMPANY_TXT+' operate this Human Resource Information System (HRIS) portal and act as personal information controllers of the data collected through it. This notice explains how your personal data is handled, in line with Republic Act No. 10173 (Data Privacy Act of 2012), its Implementing Rules and Regulations, and the issuances of the National Privacy Commission (NPC).']},
 {h:'2. What we collect',p:['Personal information:'],li:['Name, gender, date of birth, civil status, mobile number, email, city and provincial address.','Employment details: employee number, company, department, position, hire date, employment status, reporting line, tenure and separation date.','Education and credentials: educational attainment, school, degree, certifications.','Profile information you choose to add: photo, nickname, short bio, interests, fun facts and social or professional links.','Portal records: login history, password-change and profile-update logs, and your consent record.']},
 {p:['Sensitive personal information:'],li:['Government-issued numbers: TIN, SSS, PhilHealth and HDMF (Pag-IBIG).','Age, date of birth, civil status, number of dependents, and blood type.']},
 {h:'3. Why we collect it (purposes)',li:['Creating and maintaining your employment record and portal account.','Payroll, tax withholding, benefits, leaves, and statutory contributions, remittances and reports to BIR, SSS, PhilHealth, Pag-IBIG/HDMF, DOLE and other government agencies.','Workforce planning, probation and regularization tracking, performance evaluation, training and internal directories.','Safety, emergency contact and medical-assistance purposes, and compliance with legal, audit and regulatory requirements.','Security of the portal, including preventing unauthorized access.']},
 {h:'4. Legal basis',p:['We process your data to comply with legal obligations (for example labor, tax and social-legislation requirements), to carry out your employment contract, and, for information that needs your consent under Sections 12 and 13 of the Data Privacy Act, on the basis of the consent you give below.']},
 {h:'5. Who may receive your data',li:['Authorized HR, Finance and Accounting personnel, and your department Manager (limited to work-related information within your department).','Government agencies and regulators, banks, HMO and insurance providers, auditors and professional advisers, only as needed for the purposes above and under confidentiality obligations.','Our service providers that host this system. The portal runs on Google Workspace (Google Sheets, Drive and Apps Script), so your data may be stored on servers outside the Philippines. We require appropriate safeguards.']},
 {p:['We do not sell your personal data.']},
 {h:'6. Storage, security and retention',p:['Access is role-based: employees see their own record, Managers see limited information of their own department, and only authorized HR and administrators see company-wide records. Passwords are stored as salted hashes, and portal activity is logged. We keep your data for as long as you are employed and afterwards for the periods required by law or needed to protect the Company\'s legal interests, then dispose of it securely.']},
 {h:'7. Your rights as a data subject',li:['To be informed, and to access your personal data.','To object to processing and to withdraw your consent.','To correct inaccurate data (you may update many details yourself in My Profile; HR corrects the rest).','To suspend, withdraw, block, remove or destroy data that is incomplete, outdated, false, unlawfully obtained or no longer necessary.','To data portability, and to claim damages for inaccurate, incomplete, outdated, false, unlawfully obtained or unauthorized use of your data.','To file a complaint with the National Privacy Commission (www.privacy.gov.ph).']},
 {h:'8. Withdrawing consent',p:['You may withdraw your consent by writing to the Data Protection Officer. Withdrawal does not affect processing that is already done, or processing that we are required by law to continue (for example payroll and government remittances). It may limit your ability to use the portal.']},
 {h:'9. Data Protection Officer',p:[DPO_CONTACT]},
 {h:'10. Your consent and waiver',p:['By ticking the boxes and typing my full name below, I confirm that I have read and understood this notice; that the information I give is true, accurate and complete; that I will keep it updated; and that I have the authority to give information about my dependents or other persons and have informed them of this notice.','I voluntarily and freely consent to the Company collecting, recording, using, storing, sharing and otherwise processing my personal and sensitive personal information for the purposes above, and I waive any claim against the Company for processing done in accordance with this notice and the Data Privacy Act of 2012. This does not waive any right that the law gives me and that cannot be waived.']}
];}
function consentInfo_(){return{version:CONSENT_VERSION,text:consentText_()};}
function api_consent(){return consentInfo_();}

function consentSheet_(){
 let s=ss_().getSheetByName('Consents');
 if(!s){s=ss_().insertSheet('Consents');
  s.getRange(1,1,1,6).setValues([['Employee Number / Ref','Version','Accepted At','Typed Full Name','Source','Note']]).setFontWeight('bold').setBackground('#111').setFontColor('#fff');
  s.setFrozenRows(1);s.getRange(2,1,5000,1).setNumberFormat('@');}
 return s;}
function consentRow_(id){
 const s=ss_().getSheetByName('Consents');if(!s||s.getLastRow()<2)return null;
 const v=s.getRange(2,1,s.getLastRow()-1,6).getValues();
 for(let i=v.length-1;i>=0;i--){if(String(v[i][0])===String(id))return v[i];}
 return null;}
function hasConsent_(id){
 const s=ss_().getSheetByName('Consents');if(!s||s.getLastRow()<2)return false;
 const v=s.getRange(2,1,s.getLastRow()-1,2).getValues();
 for(let i=v.length-1;i>=0;i--){if(String(v[i][0])===String(id)&&String(v[i][1])===CONSENT_VERSION)return true;}
 return false;}
function addConsent_(id,name,source){consentSheet_().appendRow([String(id),CONSENT_VERSION,new Date(),name,source,'']);}

function api_acceptConsent(t,name){
 const s=session_(t,true);name=String(name||'').trim();
 const r=findRow_('Employees',s.id),sn=r?String(sh_('Employees').getRange(r,COLS.indexOf('Surname')+1).getValue()).trim().toLowerCase():'';
 if(name.length<3||(sn&&name.toLowerCase().indexOf(sn)<0))throw new Error('Please type your full name, including your surname, as your electronic signature.');
 if(!hasConsent_(s.id))addConsent_(s.id,name,'portal login');
 const s2={id:s.id,role:s.role,dept:s.dept,c:true};
 CacheService.getScriptCache().put('s_'+t,JSON.stringify(s2),21600);
 log_(s.id,'CONSENT_ACCEPTED',CONSENT_VERSION);
 return boot_(s2);}


/* ---------- View / review another employee's profile (read-only, scoped by role) ---------- */
function api_viewProfile(t,id){
 const s=session_(t);id=String(id||'').trim();need_(s,'team');
 const r=findRow_('Employees',id);if(!r)throw new Error('Employee not found.');
 const v=sh_('Employees').getRange(r,1,1,COLS.length).getValues()[0],e={};COLS.forEach((k,i)=>e[k]=v[i]);
 if(!inScope_(s,id,e['Department'],e['Immediate Head (Emp No)']))throw new Error('You do not have access to this profile.');
 const all=can_(s,'all'),emp={},al=allowedFields_(s);
 COLS.forEach(k=>{if(al[k])emp[k]=d_(e[k]);});
 const pr=profileOf_(id);let consent=null;
 if(all){const ur=findRow_('Users',id),role=ur?normRole_(sh_('Users').getRange(ur,2).getValue()):'',cr=consentRow_(id);
  consent=role===CONSENT_EXEMPT?'Not required for this role':(cr?'Accepted '+Utilities.formatDate(new Date(cr[2]),TZ,'yyyy-MM-dd')+' ('+cr[1]+')':'Not yet accepted');}
 return{emp:emp,prof:pr.prof,boss:pr.boss,photo:photoData_(id),consent:consent,canEdit:can_(s,'edit')};}


/* ---------- Masterfile download (HR and Super Admin): Excel, PDF, CSV, TXT with filters ---------- */
const EXPORT_GROUPS={
 'Identity':['Employee Number','Company','Surname','First Name','Middle Name','Gender'],
 'Employment':['Date Hire','Department','Work Location','Location City/Municipality','Section','Position Title','Position Level','Employment Status','Immediate Head (Emp No)','Status','Last Day'],
 'Contact':['Mobile','Email'],
 'Address':['City Address','Provincial Address'],
 'Personal':['Birthdate','Civil Status','Dependents','Blood Type'],
 'Education':['Educational Attainment','School Graduated','Degree'],
 'Government IDs':['TIN','SSS','PhilHealth','HDMF'],
 'Remarks':['Remarks']};

function api_exportInfo(t){
 const s=session_(t);need_(s,'export');
 const al=allowedFields_(s),g={};Object.keys(EXPORT_GROUPS).forEach(k=>{const f=EXPORT_GROUPS[k].filter(x=>al[x]);if(f.length)g[k]=f;});
 return{groups:g,total:Math.max(0,sh_('Employees').getLastRow()-1)};}

function api_export(t,o){
 const s=session_(t);need_(s,'export');o=o||{};const f=o.filters||{},fmt=String(o.format||'xlsx');
 if(['xlsx','pdf','csv','txt'].indexOf(fmt)<0)throw new Error('Unknown file type.');
 const al=allowedFields_(s);let cols=[];(o.groups||[]).forEach(g=>{if(EXPORT_GROUPS[g])cols=cols.concat(EXPORT_GROUPS[g].filter(x=>al[x]));});
 if(!cols.length)throw new Error('Choose at least one group of information.');
 const from=f.hireFrom?toDate_(f.hireFrom):null,to=f.hireTo?new Date(toDate_(f.hireTo).getTime()+86399999):null;
 const rows=rows_('Employees').filter(e=>{
  if(String(e['Employee Number'])==='ADMIN')return false;
  if(!inScope_(s,e['Employee Number'],e['Department'],e['Immediate Head (Emp No)']))return false;
  if(f.company&&e['Company']!==f.company)return false;
  if(f.department&&e['Department']!==f.department)return false;
  if(f.workLocation&&e['Work Location']!==f.workLocation)return false;
  if(f.employmentStatus&&e['Employment Status']!==f.employmentStatus)return false;
  if(f.positionLevel&&e['Position Level']!==f.positionLevel)return false;
  if(f.gender&&e['Gender']!==f.gender)return false;
  if(f.status==='Active'&&e['Status']==='Inactive')return false;
  if(f.status==='Inactive'&&e['Status']!=='Inactive')return false;
  const h=e['Date Hire'];
  if(from&&!(h instanceof Date&&h>=from))return false;
  if(to&&!(h instanceof Date&&h<=to))return false;
  return true;});
 if(!rows.length)throw new Error('No employees match these filters.');
 const body=rows.map(e=>cols.map(k=>String(d_(e[k])==null?'':d_(e[k]))));
 const name='HRIS_Masterfile_'+Utilities.formatDate(new Date(),TZ,'yyyyMMdd_HHmm')+'.'+fmt;
 let bytes,mime;
 if(fmt==='csv'||fmt==='txt'){
  const safe=v=>/^[=@]|^[+\-][A-Za-z(]/.test(v)?"'"+v:v,
   q=v=>{v=safe(v);return /[",\r\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;},
   tab=v=>safe(v).replace(/[\t\r\n]+/g,' ');
  const text=fmt==='csv'?'\ufeff'+[cols].concat(body).map(r=>r.map(q).join(',')).join('\r\n'):[cols].concat(body).map(r=>r.map(tab).join('\t')).join('\r\n');
  bytes=Utilities.newBlob(text,'text/plain').getBytes();mime=fmt==='csv'?'text/csv':'text/plain';
 }else{
  const tmp=SpreadsheetApp.create('HRIS export '+Utilities.getUuid().slice(0,8));
  try{
   const sh=tmp.getSheets()[0];sh.setName('Masterfile');
   const rg=sh.getRange(1,1,body.length+1,cols.length);rg.setNumberFormat('@');rg.setValues([cols].concat(body));
   sh.getRange(1,1,1,cols.length).setFontWeight('bold').setBackground('#bcc5ad').setFontColor('#050504');
   sh.setFrozenRows(1);if(body.length<=1500)sh.autoResizeColumns(1,cols.length);
   SpreadsheetApp.flush();
   let url='https://docs.google.com/spreadsheets/d/'+tmp.getId()+'/export?format='+fmt;
   if(fmt==='pdf')url+='&size=legal&portrait=false&fitw=true&gridlines=false&sheetnames=false&printtitle=false&pagenumbers=true&gid='+sh.getSheetId();
   const res=UrlFetchApp.fetch(url,{headers:{Authorization:'Bearer '+ScriptApp.getOAuthToken()},muteHttpExceptions:true});
   if(res.getResponseCode()!==200)throw new Error('Export failed ('+res.getResponseCode()+'). In Apps Script run the function authorize once, then redeploy.');
   bytes=res.getBlob().getBytes();
   mime=fmt==='pdf'?'application/pdf':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  }finally{try{DriveApp.getFileById(tmp.getId()).setTrashed(true);}catch(e){}}
 }
 log_(s.id,'EXPORT',fmt+' | '+rows.length+' rows | '+(o.groups||[]).join('+')+' | '+JSON.stringify(f));
 return{name:name,mime:mime,b64:Utilities.base64Encode(bytes),count:rows.length};}


/* =====================================================================
   PHASE 2 - ATTENDANCE, GEO-FENCING, DEVICE LOCK, REQUESTS & SCHEDULES
   Sheets (created automatically): Branches, Attendance, Devices, AttRequests, Shifts, Schedules
   ===================================================================== */
const BR_H=['Branch ID','Branch Name','Company','Latitude','Longitude','Radius (m)','Shift Start','Shift End','Grace (min)','Break (min)','Active'];
const AT_H=['Key','Date','Employee Number','Name','Company','Department','Branch','Time In','In Lat','In Lng','In Accuracy (m)','In Distance (m)','In GPS','Time Out','Out Lat','Out Lng','Out Accuracy (m)','Out Distance (m)','Out GPS','Late (min)','Undertime (min)','Work Hours','Note','Device','Shift','Valid','Invalid Reason'];
const A={key:0,date:1,id:2,name:3,co:4,dept:5,br:6,tin:7,inLat:8,inLng:9,inAcc:10,inDist:11,inGps:12,tout:13,outLat:14,outLng:15,outAcc:16,outDist:17,outGps:18,late:19,under:20,work:21,note:22,dev:23,shift:24,valid:25,why:26};
const DV_H=['Employee Number','Device ID','Device','Registered At','Status','Last Seen','Registered By','Fingerprint','Aliases'];
const RQ_H=['Req ID','Submitted','Employee Number','Name','Department','Type','Date','Req Time In','Req Time Out','Reason','Status','Reviewed By','Reviewed At','Review Note','Approver'];
const SH_H=['Code','Name','Start','End','Break (min)','Grace (min)','Type'];
const SC_H=['Key','Month','Employee Number'].concat(Array.apply(null,Array(31)).map((x,i)=>String(i+1)));
const SHIFT_SEED=[['GEN','Regular day','08:00','17:00',60,10,'Work'],['M','Morning (24h operations)','06:00','14:00',30,10,'Work'],['A','Afternoon (24h operations)','14:00','22:00',30,10,'Work'],['N','Night (24h operations)','22:00','06:00',30,10,'Work'],['D12','Day 12-hour','07:00','19:00',60,10,'Work'],['N12','Night 12-hour','19:00','07:00',60,10,'Work'],['OFF','Rest day','','','','','Off'],['EXEC','Executive / Senior leader (flexible)','','','','','Flexible']];
const ATT_MAX_ACC=100;          // reject GPS readings less accurate than this many metres
const ATT_ALLOW_OUTSIDE=false;  // false = employees cannot time in/out outside a branch geofence
const ATT_LATE_MODE='full';     // 'full' = once past the grace period, late = minutes since shift start | 'after' = only minutes after the grace period
const ATT_DEFAULT={start:'08:00',end:'17:00',grace:10,brk:60,radius:100};   // used when a branch leaves these blank
const ATT_MAX_DAYS=93;          // longest report range
const SCHED_MONTHS=12;          // managers can plot this many months ahead (current month + 11)

const ymd_=d=>Utilities.formatDate(d,TZ,'yyyy-MM-dd');
const nd_=v=>v instanceof Date?ymd_(v):String(v||'').trim();
// reads a time from a Date / number / text (7:46, 07:46:00, 7:46 AM, 0.32) and returns zero-padded 'HH:mm', or '' when it cannot be read
function hm_(v){let m=NaN;
 if(v instanceof Date){const q=Utilities.formatDate(v,TZ,'HH:mm:ss').split(':');m=(+q[0])*60+(+q[1])+(+q[2]>=30?1:0);}
 else if(typeof v==='number'){if(v>=0&&v<1)m=Math.round(v*1440);}
 else{const x=String(v==null?'':v).trim().match(/^(\d{1,2})[:.](\d{2})(?::\d{2})?\s*([AaPp][Mm])?$/);
  if(x){let h=+x[1];const mi=+x[2];if(x[3]){const pm=x[3].toLowerCase()==='pm';if(h<1||h>12)return'';h=h%12+(pm?12:0);}if(h<24&&mi<60)m=h*60+mi;}}
 if(isNaN(m))return'';m=((m%1440)+1440)%1440;return p2_(Math.floor(m/60))+':'+p2_(m%60);}
const tm_=v=>hm_(v)||String(v==null?'':v).trim();
const hms_=v=>v instanceof Date?Utilities.formatDate(v,TZ,'HH:mm:ss'):'';
function isDate_(x){return /^\d{4}-\d{2}-\d{2}$/.test(String(x||''))&&!isNaN(new Date(x+'T00:00:00'));}
function isTime_(x){return /^([01]\d|2[0-3]):[0-5]\d$/.test(String(x||''));}
const addDays_=(d,n)=>ymd_(new Date(new Date(d+'T12:00:00').getTime()+n*864e5));

function mkSheet_(name,head,txt,fmts){let s=ss_().getSheetByName(name);
 if(!s){s=ss_().insertSheet(name);s.getRange(1,1,1,head.length).setValues([head]).setFontWeight('bold').setBackground('#1f6f5c').setFontColor('#fff');s.setFrozenRows(1);
  (txt||[]).forEach(c=>s.getRange(2,c,3000,1).setNumberFormat('@'));
  Object.keys(fmts||{}).forEach(c=>s.getRange(2,Number(c),5000,1).setNumberFormat(fmts[c]));}
 else if(s.getLastColumn()<head.length){s.getRange(1,1,1,head.length).setValues([head]).setFontWeight('bold').setBackground('#1f6f5c').setFontColor('#fff');}
 _sh[name]=s;return s;}
const brSheet_=()=>mkSheet_('Branches',BR_H,[1,7,8]);
const atSheet_=()=>mkSheet_('Attendance',AT_H,[1,2,3],{8:'yyyy-mm-dd hh:mm:ss',14:'yyyy-mm-dd hh:mm:ss'});
const dvSheet_=()=>mkSheet_('Devices',DV_H,[1,2,8,9]);
const rqSheet_=()=>mkSheet_('AttRequests',RQ_H,[1,3,7,8,9]);
const scSheet_=()=>mkSheet_('Schedules',SC_H,[1,2,3]);
function shSheet_(){const s=mkSheet_('Shifts',SH_H,[1,3,4]);
 if(s.getLastRow()<2){s.getRange(2,1,SHIFT_SEED.length,SH_H.length).setValues(SHIFT_SEED);}
 else{const c=CacheService.getScriptCache();if(!c.get('exec_ok')){if(!findRow_('Shifts','EXEC'))s.appendRow(['EXEC','Executive / Senior leader (flexible)','','','','','Flexible']);c.put('exec_ok','1',21600);}}
 return s;}
function setupAttendance(){atSheet_();brSheet_();dvSheet_();rqSheet_();shSheet_();scSheet_();lnSheet_();lvSheet_();anSheet_();quSheet_();otSheet_();holSheet_();mkSheet_('Roles',RB_H,[1]);lcSheet_();slSheet_();sgSheet_();
 notify_('Attendance, device, request, shift, schedule, learning, leave and announcement sheets are ready.\n\nNext: open the portal > Geofence Settings and add each branch, then review the shift templates.');}

/* ---------- branches / geometry ---------- */
function branchesRaw_(){const v=brSheet_().getDataRange().getValues();v.shift();
 return v.filter(r=>String(r[0]).trim()!=='').map(r=>({id:String(r[0]).trim(),name:String(r[1]||'').trim(),company:String(r[2]||'').trim(),
  lat:Number(r[3]),lng:Number(r[4]),radius:Number(r[5])||ATT_DEFAULT.radius,start:tm_(r[6])||ATT_DEFAULT.start,end:tm_(r[7])||ATT_DEFAULT.end,
  grace:r[8]===''?ATT_DEFAULT.grace:Number(r[8]),brk:r[9]===''?ATT_DEFAULT.brk:Number(r[9]),active:String(r[10]||'Yes').trim().toLowerCase()!=='no'}))
  .filter(b=>isFinite(b.lat)&&isFinite(b.lng));}
function branches_(all){const c=CacheService.getScriptCache();let list=null;const h=c.get('br_v');if(h){try{list=JSON.parse(h);}catch(e){}}
 if(!list){list=branchesRaw_();try{c.put('br_v',JSON.stringify(list),300);}catch(e){}}
 return all?list:list.filter(b=>b.active);}
function empInfo_(id){const r=findRow_('Employees',id);if(!r)throw new Error('Employee record not found.');
 const v=sh_('Employees').getRange(r,1,1,COLS.length).getValues()[0],g=k=>String(v[COLS.indexOf(k)]||'').trim();
 return{id:String(id),name:(g('First Name')+' '+g('Surname')).trim()||String(id),company:g('Company'),dept:g('Department'),head:g('Immediate Head (Emp No)'),level:g('Position Level'),title:g('Position Title')};}
const eligible_=e=>branches_(false).filter(b=>!b.company||b.company===e.company);
function dist_(la1,ln1,la2,ln2){const R=6371000,r=x=>x*Math.PI/180,dl=r(la2-la1),dn=r(ln2-ln1),
 h=Math.sin(dl/2)*Math.sin(dl/2)+Math.cos(r(la1))*Math.cos(r(la2))*Math.sin(dn/2)*Math.sin(dn/2);return 2*R*Math.asin(Math.sqrt(h));}

/* ---------- shifts & schedules ---------- */
function shifts_(){const v=shSheet_().getDataRange().getValues();v.shift();
 return v.filter(r=>String(r[0]).trim()!=='').map(r=>({code:String(r[0]).trim(),name:String(r[1]||'').trim(),start:tm_(r[2]),end:tm_(r[3]),
  brk:r[4]===''?60:Number(r[4]),grace:r[5]===''?10:Number(r[5]),type:(t=>t==='Off'?'Off':t==='Flexible'?'Flexible':'Work')(String(r[6]||'Work').trim())}));}
let _SMAP=null;
function shiftMap_(){if(!_SMAP){_SMAP={};shifts_().forEach(x=>_SMAP[x.code]=x);}return _SMAP;}
const isFlex_=code=>{if(!code)return false;const m=shiftMap_()[code];return !!m&&m.type==='Flexible';};
function isSenior_(o){const lv=String(o.level||o['Position Level']||''),ti=String(o.title||o['Position Title']||'').toLowerCase();return lv==='Executive'||(lv==='Managerial'&&ti.indexOf('senior')>=0);}
const isOver_=b=>!!(b&&b.type!=='Off'&&b.start&&b.end&&b.end<=b.start);
function shiftEndAt_(date,b){const st=new Date(date+'T'+b.start+':00');let en=new Date(date+'T'+b.end+':00');if(en<=st)en=new Date(en.getTime()+864e5);return en;}
function schedCode_(id,date){scSheet_();const r=findRow_('Schedules',date.slice(0,7)+'|'+id);if(!r)return'';
 return String(sh_('Schedules').getRange(r,3+Number(date.slice(8,10))).getValue()||'').trim();}
function shiftFor_(id,date){const c=schedCode_(id,date);if(!c)return null;const m=shiftMap_()[c];return m||null;}
function workShift_(id,date,b,e){const sc=shiftFor_(id,date);
 if(sc&&sc.type==='Off')return{code:sc.code,type:'Off',start:'',end:'',grace:0,brk:0};
 if(sc)return sc;
 if(e&&isSenior_(e)&&shiftMap_()['EXEC'])return shiftMap_()['EXEC'];    // Executives & Senior leaders without a plotted schedule: flexible (no late, one log counts)
 return{code:'',type:'Work',start:b.start,end:b.end,grace:b.grace,brk:b.brk};}

// late / undertime / worked hours for one day
function calc_(date,tin,tout,b){
 let late=0,under=0,work=0;
 if(b.type==='Off'||b.type==='Flexible'){if(tin&&tout&&tout>tin)work=Math.round((tout-tin)/60000/60*100)/100;return{late:0,under:0,work:work};}   // rest day / flexible: never late or undertime
 const st=new Date(date+'T'+b.start+':00'),en=shiftEndAt_(date,b);
 if(tin){const d=Math.floor((tin-st)/60000);if(d>b.grace)late=ATT_LATE_MODE==='full'?d:d-b.grace;}
 if(tout){const d=Math.floor((en-tout)/60000);if(d>0)under=d;}
 if(tin&&tout&&tout>tin){const sp=(tout-tin)/60000;work=Math.max(0,sp>=300?sp-b.brk:sp);}   // break is deducted only on shifts of 5+ hours
 return{late:late,under:under,work:Math.round(work/60*100)/100};}

function attObj_(r){return{date:nd_(r[A.date]),id:String(r[A.id]),name:r[A.name],company:r[A.co],dept:r[A.dept],branch:r[A.br],
 tin:hms_(r[A.tin]),tout:hms_(r[A.tout]),inGps:r[A.inGps]||'',outGps:r[A.outGps]||'',inDist:r[A.inDist],outDist:r[A.outDist],
 inLat:r[A.inLat],inLng:r[A.inLng],outLat:r[A.outLat],outLng:r[A.outLng],late:Number(r[A.late])||0,under:Number(r[A.under])||0,work:Number(r[A.work])||0,
 note:r[A.note]||'',shift:String(r[A.shift]||''),flex:isFlex_(String(r[A.shift]||'')),valid:String(r[A.valid]||'Valid'),why:String(r[A.why]||''),device:String(r[A.dev]||'')};}
function attRowsFrom_(sh,from,to){const n=sh.getLastRow()-1;if(n<1)return[];
 const dts=sh.getRange(2,A.date+1,n,1).getValues();let lo=-1,hi=-1;
 for(let i=0;i<n;i++){const d=nd_(dts[i][0]);if(d>=from&&d<=to){if(lo<0)lo=i;hi=i;}}
 if(lo<0)return[];
 return sh.getRange(2+lo,1,hi-lo+1,AT_H.length).getValues().filter(r=>{const d=nd_(r[A.date]);return d>=from&&d<=to;});}
function attRows_(from,to){let out=attRowsFrom_(atSheet_(),from,to);const first=PropertiesService.getScriptProperties().getProperty('att_first');
 if(first&&from<first){const hi=to<first?to:addDays_(first,-1);for(let y=+from.slice(0,4);y<=+hi.slice(0,4);y++){const a=archSheetRead_(y);if(a)out=out.concat(attRowsFrom_(a,from,hi));}}
 return out;}
function attRow_(id,date){const sh=atSheet_(),key=date+'|'+id,n=sh.getLastRow();if(n<2)return null;
 let row=0;const k=Math.min(n-1,6000),v=sh.getRange(n-k+1,1,k,1).getValues();   // rows are appended in date order: today's and yesterday's records are at the bottom
 for(let i=k-1;i>=0;i--){if(String(v[i][0])===key){row=n-k+1+i;break;}}
 if(!row&&date<addDays_(ymd_(new Date()),-3))row=findRow_('Attendance',key);    // only older dates need the full search
 if(!row)return null;return{row:row,v:sh.getRange(row,1,1,AT_H.length).getValues()[0]};}

/* ---------- one registered phone per employee ---------- */
function activeDevice_(id){const c=CacheService.getScriptCache(),k='dv_'+id,h=c.get(k);
 if(h){if(h==='none')return null;try{return JSON.parse(h);}catch(e){}}
 const v=dvSheet_().getDataRange().getValues();let r=null;
 for(let i=v.length-1;i>=1;i--){if(String(v[i][0])===String(id)&&v[i][4]==='Active'){const dd=x=>x instanceof Date?ymd_(x):String(x||'');
  r={row:i+1,devId:String(v[i][1]),label:String(v[i][2]||''),at:dd(v[i][3]),seen:dd(v[i][5]),fp:String(v[i][7]||''),aliases:String(v[i][8]||'').split(',').filter(Boolean)};break;}}
 try{c.put(k,r?JSON.stringify(r):'none',21600);}catch(e){}return r;}
// A phone is recognised by (1) its browser token, or (2) its device profile (screen, GPU, touch, timezone - the same in every browser on one phone).
// A different browser on the SAME phone is therefore linked automatically instead of asking the employee to register again.
function devMatch_(id,ad,devId,fp){devId=String(devId||'');fp=String(fp||'');const okId=/^[A-Za-z0-9-]{16,64}$/.test(devId),okFp=/^[a-f0-9]{8,40}$/.test(fp),sh=dvSheet_();
 if(okId&&(ad.devId===devId||ad.aliases.indexOf(devId)>=0)){
  if(!ad.fp&&okFp){sh.getRange(ad.row,8).setValue(fp);ad.fp=fp;CacheService.getScriptCache().remove('dv_'+id);}    // learn the profile of phones registered before this update
  return{ok:true,how:'token'};}
 if(okId&&okFp&&ad.fp&&ad.fp===fp){
  const al=ad.aliases.concat([devId]).slice(-4);sh.getRange(ad.row,9).setValue(al.join(','));ad.aliases=al;CacheService.getScriptCache().remove('dv_'+id);
  log_(id,'DEVICE_LINKED','another browser on the registered phone');return{ok:true,how:'profile'};}
 return{ok:false,how:'none'};}
function resetDevice_(id,by){const sh=dvSheet_(),v=sh.getDataRange().getValues();let n=0;
 for(let i=1;i<v.length;i++){if(String(v[i][0])===String(id)&&v[i][4]==='Active'){sh.getRange(i+1,5).setValue('Reset by '+by+' '+ymd_(new Date()));n++;}}
 CacheService.getScriptCache().remove('dv_'+id);return n;}
function api_deviceInfo(t,devId,fp){const s=session_(t);need_(s,'att');const ad=activeDevice_(s.id);
 if(!ad)return{state:'none'};
 const m=devMatch_(s.id,ad,devId,fp);
 return{state:m.ok?'match':'other',linked:m.how==='profile',label:ad.label,since:ad.at};}
function api_registerDevice(t,devId,label,fp){const s=session_(t);need_(s,'att');
 if(!/^(Android|iPhone\/iPad)/.test(String(label||'')))throw new Error('Phone registration works only on a mobile phone. Open the portal on your phone to register it.');
 devId=String(devId||'');if(!/^[A-Za-z0-9-]{16,64}$/.test(devId))throw new Error('This browser could not create a device ID. Turn off private browsing and allow site data, then reload.');
 const lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
  if(activeDevice_(s.id))throw new Error('You already have a registered phone. To change phones, send a phone change request.');
  const v=dvSheet_().getDataRange().getValues();
  for(let i=1;i<v.length;i++){if(String(v[i][1])===devId&&v[i][4]==='Active')throw new Error('This phone is already registered to another employee.');}
  const fpv=/^[a-f0-9]{8,40}$/.test(String(fp||''))?String(fp):'';
  dvSheet_().appendRow([String(s.id),devId,String(label||'').slice(0,120),new Date(),'Active',new Date(),String(s.id),fpv,'']);
  CacheService.getScriptCache().remove('dv_'+s.id);log_(s.id,'DEVICE_REGISTERED',String(label||'').slice(0,60));return{ok:true};
 }finally{lock.releaseLock();}}
function api_resetDevice(t,id){const s=session_(t);need_(s,'tkadj');if(!findRow_('Employees',id))throw new Error('Employee not found.');
 const n=resetDevice_(id,s.id);log_(s.id,'DEVICE_RESET',String(id));return{ok:true,n:n};}
function api_devices(t){const s=session_(t);need_(s,'tkadj');
 const nm={};rows_('Employees').forEach(e=>nm[String(e['Employee Number'])]={name:((e['First Name']||'')+' '+(e['Surname']||'')).trim(),dept:e['Department']});
 const v=dvSheet_().getDataRange().getValues();v.shift();const act=v.filter(r=>r[4]==='Active'),cnt={};act.forEach(r=>{const f=String(r[7]||'');if(f)cnt[f]=(cnt[f]||0)+1;});
 return act.map(r=>({id:String(r[0]),name:(nm[String(r[0])]||{}).name||'',dept:(nm[String(r[0])]||{}).dept||'',label:String(r[2]||''),at:r[3] instanceof Date?ymd_(r[3]):'',seen:r[5] instanceof Date?ymd_(r[5]):'',
  browsers:1+String(r[8]||'').split(',').filter(Boolean).length,shared:cnt[String(r[7]||'')]||1}))
  .sort((a,b)=>a.name>b.name?1:-1);}

/* ---------- time in / time out ---------- */
function api_attToday(t){const s=session_(t);need_(s,'att');
 const e=empInfo_(s.id),today=ymd_(new Date()),r=attRow_(s.id,today),sc=shiftFor_(s.id,today)||(isSenior_(e)&&ATT_WORKDAYS.indexOf(new Date().getDay())>=0?shiftMap_()['EXEC']||null:null);
 return{date:today,rec:r?attObj_(r.v):null,maxAcc:ATT_MAX_ACC,allowOutside:ATT_ALLOW_OUTSIDE,shift:sc,
  branches:eligible_(e).map(b=>({id:b.id,name:b.name,lat:b.lat,lng:b.lng,radius:b.radius,start:b.start,end:b.end,grace:b.grace}))};}

function api_punch(t,kind,lat,lng,acc,devId,devLabel,fp){const s=session_(t);need_(s,'att');
 let lk=null;   // validation runs without the lock; it is taken only to read-then-write the attendance row
 try{
  kind=kind==='out'?'out':'in';lat=Number(lat);lng=Number(lng);acc=Math.round(Number(acc)||0);
  if(!isFinite(lat)||!isFinite(lng)||Math.abs(lat)>90||Math.abs(lng)>180||(lat===0&&lng===0))throw new Error('Could not read your GPS location. Turn on Location and try again.');
  if(!acc||acc>ATT_MAX_ACC)throw new Error('GPS signal is too weak (±'+(acc||'?')+' m). Move to an open area or turn on Precise Location, then try again.');
  if(!/^(Android|iPhone\/iPad)/.test(String(devLabel||'')))throw new Error('Time in/out works only on a mobile phone. Please open the portal on your registered phone.');
  const ad=activeDevice_(s.id);
  if(!ad)throw new Error('Register this phone first: open Time In / Out and tap "Register this phone".');
  const sameDev=devMatch_(s.id,ad,devId,fp).ok;
  const e=empInfo_(s.id),brs=eligible_(e);
  if(!brs.length)throw new Error('No active branch geofence is set up for your company yet. Please contact HR.');
  let best=null;brs.forEach(b=>{const d=dist_(lat,lng,b.lat,b.lng);if(!best||d<best.d)best={b:b,d:d};});
  const inside=best.d<=best.b.radius,dm=Math.round(best.d),gps=inside?'Verified':'Outside';
  if(!inside&&!ATT_ALLOW_OUTSIDE){log_(s.id,'ATT_BLOCKED',kind+' '+dm+' m from '+best.b.name);
   throw new Error('You are '+dm+' m away from '+best.b.name+'. Move within '+best.b.radius+' m of the branch to time '+kind+'.');}
  lk=LockService.getScriptLock();lk.waitLock(25000);
  const now=new Date(),today=ymd_(now),yest=addDays_(today,-1),sheet=atSheet_(),sm=shiftMap_();
  let date=today,ex=null;
  const yRec=attRow_(s.id,yest);
  if(kind==='in'){
   if(yRec&&yRec.v[A.tin]&&!yRec.v[A.tout]){const yb=sm[String(yRec.v[A.shift]||'')];
    if(yb&&isOver_(yb)&&now<new Date(shiftEndAt_(yest,yb).getTime()+3*36e5))throw new Error('Your night shift from yesterday is still open. Time out first.');}
   const ys=shiftFor_(s.id,yest);
   if(!yRec&&ys&&isOver_(ys)&&now<shiftEndAt_(yest,ys))date=yest;     // late arrival after midnight still belongs to yesterday's night shift
   ex=attRow_(s.id,date);
  }else{
   ex=attRow_(s.id,today);
   if((!ex||!ex.v[A.tin])&&yRec&&yRec.v[A.tin]&&!yRec.v[A.tout]&&now-yRec.v[A.tin]<20*36e5){date=yest;ex=yRec;}   // time-out of an overnight shift
  }
  const dv=String(devLabel||'').slice(0,120);
  if(sameDev&&ad.seen!==ymd_(now)){dvSheet_().getRange(ad.row,6).setValue(now);CacheService.getScriptCache().remove('dv_'+s.id);}   // 'last used' is refreshed once a day
  if(kind==='in'){
   if(ex&&ex.v[A.tin])throw new Error('You already timed in today at '+Utilities.formatDate(ex.v[A.tin],TZ,'h:mm a')+'.');
   const ws=workShift_(s.id,date,best.b,e),c=calc_(date,now,null,ws),row=new Array(AT_H.length).fill('');
   row[A.key]=date+'|'+s.id;row[A.date]=date;row[A.id]=String(s.id);row[A.name]=e.name;row[A.co]=e.company;row[A.dept]=e.dept;row[A.br]=best.b.name;
   row[A.tin]=now;row[A.inLat]=lat;row[A.inLng]=lng;row[A.inAcc]=acc;row[A.inDist]=dm;row[A.inGps]=gps;row[A.late]=c.late;row[A.under]=0;row[A.work]=0;row[A.dev]=dv;
   row[A.shift]=ws.code;row[A.valid]=sameDev?'Valid':'Invalid';row[A.why]=sameDev?'':'Time-in from a phone that is not registered to this employee';
   sheet.appendRow(row);log_(s.id,'TIME_IN',best.b.name+' '+dm+' m'+(sameDev?'':' [UNREGISTERED PHONE]'));
   return{ok:true,kind:'in',time:Utilities.formatDate(now,TZ,'h:mm a'),branch:best.b.name,dist:dm,late:c.late,under:0,work:0,valid:sameDev,shift:ws.code};}
  if(!ex||!ex.v[A.tin])throw new Error('Please time in first.');
  if(now-ex.v[A.tin]<60000)throw new Error('Please wait a minute before timing out.');
  const bn=String(ex.v[A.br]),b=branches_(true).filter(x=>x.name===bn)[0]||best.b,sc=String(ex.v[A.shift]||''),
   ws=sc&&sm[sc]?(sm[sc].type==='Off'?{code:sc,type:'Off',start:'',end:'',grace:0,brk:0}:sm[sc]):{code:'',type:'Work',start:b.start,end:b.end,grace:b.grace,brk:b.brk},
   c=calc_(nd_(ex.v[A.date]),ex.v[A.tin],now,ws);
  sheet.getRange(ex.row,A.tout+1,1,6).setValues([[now,lat,lng,acc,dm,gps]]);
  sheet.getRange(ex.row,A.late+1,1,3).setValues([[c.late,c.under,c.work]]);
  let valid=String(ex.v[A.valid]||'Valid'),why=String(ex.v[A.why]||'');
  if(!sameDev){valid='Invalid';why=(why?why+' | ':'')+'Time-out from a phone that is not registered to this employee';}
  sheet.getRange(ex.row,A.valid+1,1,2).setValues([[valid,why]]);
  if(dv)sheet.getRange(ex.row,A.dev+1).setValue(dv);
  if(ex.v[A.tout])sheet.getRange(ex.row,A.note+1).setValue(String(ex.v[A.note]||'')+(ex.v[A.note]?' | ':'')+'Time-out updated '+Utilities.formatDate(now,TZ,'HH:mm'));
  log_(s.id,'TIME_OUT',best.b.name+' '+dm+' m'+(sameDev?'':' [UNREGISTERED PHONE]'));
  return{ok:true,kind:'out',time:Utilities.formatDate(now,TZ,'h:mm a'),branch:best.b.name,dist:dm,late:c.late,under:c.under,work:c.work,valid:valid==='Valid'};
 }finally{if(lk)lk.releaseLock();}}

function api_attMine(t,from,to){const s=session_(t);need_(s,'att');
 const today=ymd_(new Date());if(!isDate_(to))to=today;if(!isDate_(from))from=addDays_(to,-30);
 return attRows_(from,to).filter(r=>String(r[A.id])===String(s.id)).map(attObj_).sort((a,b)=>a.date<b.date?1:-1);}

/* ---------- reports ---------- */
function api_attReport(t,from,to,company,dept){memo_();const s=session_(t);need_(s,'attview');
 if(!isDate_(from)||!isDate_(to))throw new Error('Choose a valid From and To date.');
 if(from>to)throw new Error('The From date must be before the To date.');
 if((new Date(to+'T00:00:00')-new Date(from+'T00:00:00'))/864e5>ATT_MAX_DAYS)throw new Error('Please choose a range of '+ATT_MAX_DAYS+' days or less.');
 const emps={};rows_('Employees').forEach(e=>{const id=String(e['Employee Number']);
  if(id==='ADMIN'||!inScope_(s,id,e['Department'],e['Immediate Head (Emp No)']))return;
  if(company&&e['Company']!==company)return;if(dept&&e['Department']!==dept)return;emps[id]=e;});
 const det=attRows_(from,to).filter(r=>emps[String(r[A.id])]).map(attObj_).sort((a,b)=>a.date===b.date?(a.name>b.name?1:-1):(a.date<b.date?1:-1));
 const mk=(id,name,co,dp)=>({id:id,name:name,company:co,dept:dp,days:0,lateCount:0,lateMin:0,underCount:0,underMin:0,hours:0,noOut:0,outside:0,invalid:0});
 const sm={};Object.keys(emps).forEach(id=>{const e=emps[id];if(e['Status']==='Inactive')return;sm[id]=mk(id,((e['First Name']||'')+' '+(e['Surname']||'')).trim(),e['Company'],e['Department']);});
 det.forEach(r=>{const o=sm[r.id]||(sm[r.id]=mk(r.id,r.name,r.company,r.dept));
  if(r.valid==='Invalid'){o.invalid++;return;}      // invalid logs are not counted until corrected
  o.days++;if(r.late>0){o.lateCount++;o.lateMin+=r.late;}if(r.under>0){o.underCount++;o.underMin+=r.under;}o.hours=Math.round((o.hours+r.work)*100)/100;
  if(!r.tout&&!r.flex)o.noOut++;if(r.inGps==='Outside'||r.outGps==='Outside')o.outside++;});
 let missing=[];
 if(from===to){const have={};det.forEach(r=>{if(r.valid!=='Invalid')have[r.id]=1;});
  missing=Object.keys(sm).filter(id=>!have[id]).map(id=>({id:id,name:sm[id].name,company:sm[id].company,dept:sm[id].dept}));}
 return{from:from,to:to,detail:det,summary:Object.keys(sm).map(k=>sm[k]).sort((a,b)=>a.name>b.name?1:-1),missing:missing,
  canAdjust:can_(s,'tkadj'),mode:ATT_LATE_MODE};}

/* ---------- branch geofence settings ---------- */
function api_branches(t){const s=session_(t);need_(s,'geo');return branches_(true);}
function api_saveBranch(t,o){const s=session_(t);need_(s,'geo');o=o||{};
 const name=String(o.name||'').trim(),lat=Number(o.lat),lng=Number(o.lng),rad=Number(o.radius),grace=Number(o.grace),brk=Number(o.brk);
 if(!name)throw new Error('Enter the branch name.');
 if(!isFinite(lat)||lat<-90||lat>90||!isFinite(lng)||lng<-180||lng>180)throw new Error('Enter a valid latitude and longitude (for example 10.3157 and 123.8854).');
 if(!(rad>=20&&rad<=5000))throw new Error('Radius must be between 20 and 5,000 metres.');
 if(!isTime_(o.start)||!isTime_(o.end))throw new Error('Enter shift start and end as HH:MM (24-hour), e.g. 08:00 and 17:00.');
 if(!(grace>=0&&grace<=240)||!(brk>=0&&brk<=240))throw new Error('Grace and break minutes must be between 0 and 240.');
 const co=String(o.company||'').trim();if(co&&LISTS['Company'].indexOf(co)<0)throw new Error('Unknown company.');
 const sh=brSheet_();let id=String(o.id||'').trim(),row=id?findRow_('Branches',id):0;
 if(!row){const nums=sh.getLastRow()>1?sh.getRange(2,1,sh.getLastRow()-1,1).getValues().map(r=>parseInt(String(r[0]).replace(/\D/g,''),10)||0):[0];
  id='BR'+String(Math.max.apply(null,nums.concat([0]))+1).padStart(3,'0');row=sh.getLastRow()+1;}
 sh.getRange(row,1,1,BR_H.length).setValues([[id,name,co,lat,lng,rad,o.start,o.end,grace,brk,o.active===false?'No':'Yes']]);
 sh.getRange(row,7,1,2).setNumberFormat('@');sh.getRange(row,1).setNumberFormat('@');
 CacheService.getScriptCache().remove('br_v');log_(s.id,'BRANCH_SAVED',id+' '+name);return branches_(true);}
function api_deleteBranch(t,id){const s=session_(t);need_(s,'geo');brSheet_();const row=findRow_('Branches',id);
 if(!row)throw new Error('Branch not found.');brSheet_().deleteRow(row);CacheService.getScriptCache().remove('br_v');log_(s.id,'BRANCH_DELETED',id);return branches_(true);}

/* ---------- shift templates (incl. 24-hour operations) ---------- */
function api_shifts(t){const s=session_(t);need_(s,'att');return shifts_();}
function api_saveShift(t,o){const s=session_(t);need_(s,'geo');o=o||{};
 const code=String(o.code||'').trim().toUpperCase(),type=o.type==='Off'?'Off':o.type==='Flexible'?'Flexible':'Work',name=String(o.name||'').trim();
 if(!/^[A-Z0-9]{1,6}$/.test(code))throw new Error('Shift code must be 1 to 6 letters or numbers, e.g. M, A, N, D12.');
 if(!name)throw new Error('Enter a shift name.');
 let st='',en='',brk='',gr='';
 if(type==='Work'){if(!isTime_(o.start)||!isTime_(o.end))throw new Error('Enter shift start and end as HH:MM (24-hour). A night shift may end earlier than it starts, e.g. 22:00 to 06:00.');
  if(o.start===o.end)throw new Error('Shift start and end cannot be the same.');
  st=o.start;en=o.end;brk=Number(o.brk);gr=Number(o.grace);if(!(brk>=0&&brk<=240)||!(gr>=0&&gr<=240))throw new Error('Break and grace minutes must be between 0 and 240.');}
 const sh=shSheet_();let row=findRow_('Shifts',code);if(!row)row=sh.getLastRow()+1;
 _SMAP=null;sh.getRange(row,1,1,SH_H.length).setValues([[code,name,st,en,brk,gr,type]]);sh.getRange(row,1).setNumberFormat('@');sh.getRange(row,3,1,2).setNumberFormat('@');
 log_(s.id,'SHIFT_SAVED',code);return shifts_();}
function api_deleteShift(t,code){const s=session_(t);need_(s,'geo');code=String(code||'').trim();
 if(code==='OFF')throw new Error('The OFF (rest day) shift cannot be deleted.');shSheet_();const row=findRow_('Shifts',code);
 if(!row)throw new Error('Shift not found.');sh_('Shifts').deleteRow(row);log_(s.id,'SHIFT_DELETED',code);return shifts_();}

/* ---------- work schedules (12 months) ---------- */
function schedWindow_(s){const cur=Utilities.formatDate(new Date(),TZ,'yyyy-MM'),y=+cur.slice(0,4),m=+cur.slice(5)-1,mk=k=>Utilities.formatDate(new Date(y,m+k,1),TZ,'yyyy-MM');
 return{from:can_(s,'all')?mk(-1):mk(0),to:mk(SCHED_MONTHS-1),cur:cur};}
function planEmps_(s,company,dept,head){const all=can_(s,'all');
 return rows_('Employees').filter(e=>{const id=String(e['Employee Number']);if(id==='ADMIN'||e['Status']==='Inactive')return false;
  const h=String(e['Immediate Head (Emp No)']||'').trim();
  if(!all&&h!==String(s.id))return false;   // a manager plots only his/her direct reports
  if(company&&e['Company']!==company)return false;if(dept&&e['Department']!==dept)return false;if(head&&h!==head)return false;return true;})
 .map(e=>({id:String(e['Employee Number']),name:((e['Surname']||'')+', '+(e['First Name']||'')).trim(),dept:e['Department'],pos:e['Position Title'],level:e['Position Level'],head:String(e['Immediate Head (Emp No)']||'').trim(),company:e['Company']}))
 .sort((a,b)=>a.name>b.name?1:-1);}
function daysIn_(m){return new Date(+m.slice(0,4),+m.slice(5),0).getDate();}
function api_teamSchedule(t,month,company,dept,head){memo_();const s=session_(t);need_(s,'sched');const w=schedWindow_(s);
 if(!/^\d{4}-\d{2}$/.test(String(month||''))||month<w.from||month>w.to)throw new Error('Choose a month between '+w.from+' and '+w.to+'.');
 const emps=planEmps_(s,company,dept,head);
 if(emps.length>250)throw new Error('That is '+emps.length+' employees. Narrow it down by company, department or manager (max 250).');
 const v=scSheet_().getDataRange().getValues(),by={};for(let i=1;i<v.length;i++){if(v[i][1]===month||String(v[i][1])===month)by[String(v[i][2])]=v[i].slice(3,34);}
 const nm={};if(can_(s,'all'))rows_('Employees').forEach(e=>nm[String(e['Employee Number'])]=((e['First Name']||'')+' '+(e['Surname']||'')).trim());
 const heads=can_(s,'all')?Object.keys(planEmps_(s,'','','').reduce((o,e)=>(e.head&&(o[e.head]=1),o),{})).map(h=>({id:h,name:nm[h]||h})).sort((a,b)=>a.name>b.name?1:-1):[];
 return{month:month,days:daysIn_(month),window:w,shifts:shifts_(),heads:heads,all:can_(s,'all'),today:ymd_(new Date()),holidays:holRows_().filter(x=>x.date.slice(0,7)===month),canHol:can_(s,'hol'),
  rows:emps.map(e=>({id:e.id,name:e.name,dept:e.dept,pos:e.pos,level:e.level,codes:(by[e.id]||[]).map(x=>String(x||'')).concat(Array(31).fill('')).slice(0,31)}))};}
function schedBulk_(updates){    // updates: [{month,id,codes[31]}] -> one read, one write
 const sh=scSheet_(),lock=LockService.getScriptLock();lock.waitLock(30000);
 try{
  const v=sh.getDataRange().getValues(),idx={};for(let i=1;i<v.length;i++)idx[String(v[i][0])]=i;
  updates.forEach(u=>{const key=u.month+'|'+u.id;let i=idx[key];
   if(i==null){v.push([key,u.month,String(u.id)].concat(Array(31).fill('')));i=v.length-1;idx[key]=i;}
   for(let d=0;d<31;d++)v[i][3+d]=u.codes[d]==null?'':u.codes[d];});
  if(v.length>1){sh.getRange(2,1,v.length-1,SC_H.length).setNumberFormat('@');sh.getRange(1,1,v.length,SC_H.length).setValues(v);}
 }finally{lock.releaseLock();}}
function checkPlot_(s,ids,w){const ok={};planEmps_(s,'','','').forEach(e=>ok[e.id]=1);
 ids.forEach(id=>{if(!ok[String(id)])throw new Error('You can only plot schedules for your direct reports ('+id+' is not one of them).');});}
function api_saveSchedule(t,month,rows){const s=session_(t);need_(s,'sched');const w=schedWindow_(s);
 if(!/^\d{4}-\d{2}$/.test(String(month||''))||month<w.from||month>w.to)throw new Error('That month is outside your 12-month planning window.');
 rows=rows||[];if(!rows.length)return{ok:true,n:0};if(rows.length>250)throw new Error('Too many employees in one save.');
 checkPlot_(s,rows.map(r=>r.id),w);const sm=shiftMap_(),today=ymd_(new Date()),all=can_(s,'all'),dn=daysIn_(month);
 const cur={};const v=scSheet_().getDataRange().getValues();for(let i=1;i<v.length;i++){if(String(v[i][1])===month)cur[String(v[i][2])]=v[i].slice(3,34);}
 const ups=rows.map(r=>{const codes=(r.codes||[]).slice(0,31).map(x=>String(x||'').trim());while(codes.length<31)codes.push('');
  codes.forEach((c,d)=>{if(c&&!sm[c])throw new Error('Unknown shift code "'+c+'".');
   if(d>=dn&&c)throw new Error('This month has only '+dn+' days.');
   const dt=month+'-'+String(d+1).padStart(2,'0'),old=String(((cur[String(r.id)]||[])[d])||'');
   if(!all&&dt<today&&c!==old)throw new Error('Past days cannot be changed ('+dt+'). Ask HR.');});
  return{month:month,id:String(r.id),codes:codes};});
 schedBulk_(ups);log_(s.id,'SCHEDULE_SAVED',month+' x'+ups.length);return{ok:true,n:ups.length};}
function api_applyPattern(t,o){const s=session_(t);need_(s,'sched');o=o||{};const w=schedWindow_(s),sm=shiftMap_(),all=can_(s,'all'),today=ymd_(new Date());
 const ids=(o.ids||[]).map(String);if(!ids.length)throw new Error('Select at least one employee.');if(ids.length>120)throw new Error('Apply to 120 employees or fewer at a time.');
 checkPlot_(s,ids,w);
 if(!isDate_(o.from)||!isDate_(o.to)||o.from>o.to)throw new Error('Choose a valid From and To date.');
 const lo=w.from+'-01',hi=w.to+'-'+String(daysIn_(w.to)).padStart(2,'0');
 if(o.from<lo||o.to>hi)throw new Error('Dates must be within '+lo+' and '+hi+' (12-month window).');
 if(!all&&o.from<today)throw new Error('Past days cannot be changed. Start from today.');
 const type=o.type==='cycle'?'cycle':'weekly';let days=[],cyc=[];
 if(type==='weekly'){days=(o.days||[]).map(Number).filter(d=>d>=0&&d<=6);if(!days.length)throw new Error('Choose at least one day of the week.');if(!sm[o.code])throw new Error('Choose a shift.');}
 else{cyc=(o.cycle||[]).map(x=>String(x||'').trim().toUpperCase()).filter(x=>x);if(!cyc.length)throw new Error('Enter the rotation, e.g. M,M,A,A,N,N,OFF.');cyc.forEach(c=>{if(!sm[c])throw new Error('Unknown shift code "'+c+'" in the rotation.');});}
 const stag=Math.max(0,Math.floor(Number(o.stagger)||0)),byM={};
 const cur={};const v=scSheet_().getDataRange().getValues();for(let i=1;i<v.length;i++)cur[v[i][0]]=v[i].slice(3,34).map(x=>String(x||''));
 ids.forEach((id,k)=>{let d=o.from,n=0;
  while(d<=o.to){const m=d.slice(0,7),key=m+'|'+id,dd=+d.slice(8,10)-1;const row=byM[key]||(byM[key]={month:m,id:id,codes:(cur[key]||Array(31).fill('')).slice()});
   const dow=new Date(d+'T12:00:00').getDay();
   if(type==='weekly'){if(days.indexOf(dow)>=0)row.codes[dd]=o.code;else if(o.offOthers&&sm['OFF'])row.codes[dd]='OFF';}
   else row.codes[dd]=cyc[(((n+k*stag)%cyc.length)+cyc.length)%cyc.length];
   d=addDays_(d,1);n++;}});
 const ups=Object.keys(byM).map(k=>byM[k]);schedBulk_(ups);log_(s.id,'SCHEDULE_PATTERN',ids.length+' employees '+o.from+'..'+o.to);return{ok:true,n:ups.length};}
function api_mySchedule(t,from,days){const s=session_(t);need_(s,'att');scSheet_();
 if(!isDate_(from))from=ymd_(new Date());days=Math.min(62,Math.max(1,Number(days)||14));
 const sm=shiftMap_(),out=[],cache={};
 for(let i=0;i<days;i++){const d=addDays_(from,i),mk=d.slice(0,7);
  if(!(mk in cache)){const r=findRow_('Schedules',mk+'|'+s.id);cache[mk]=r?sh_('Schedules').getRange(r,4,1,31).getValues()[0]:[];}
  const code=String((cache[mk][+d.slice(8,10)-1])||'').trim(),x=sm[code];
  out.push({date:d,code:code,name:x?x.name:'',start:x?x.start:'',end:x?x.end:'',off:x?x.type==='Off':false});}
 return out;}

/* ---------- correction requests (invalid / error logs) & phone change ---------- */
function rqObj_(r){return{id:String(r[0]),submitted:r[1] instanceof Date?Utilities.formatDate(r[1],TZ,'yyyy-MM-dd HH:mm'):String(r[1]||''),emp:String(r[2]),name:r[3],dept:r[4],type:r[5],date:nd_(r[6]),tin:tm_(r[7]),tout:tm_(r[8]),
 reason:r[9],status:r[10],by:r[11],at:r[12] instanceof Date?Utilities.formatDate(r[12],TZ,'yyyy-MM-dd HH:mm'):String(r[12]||''),note:r[13]};}
function api_attRequest(t,o){const s=session_(t);need_(s,'att');o=o||{};
 const type=o.type==='Device change'?'Device change':'Log correction',reason=String(o.reason||'').trim();
 if(reason.length<5)throw new Error('Please explain the reason (at least a few words).');
 const today=ymd_(new Date());let date='',tin='',tout='';
 if(type==='Log correction'){date=String(o.date||'');tin=String(o.tin||'');tout=String(o.tout||'');
  if(!isDate_(date)||date>today||date<addDays_(today,-60))throw new Error('Choose a date within the last 60 days.');
  tin=hm_(tin);tout=tout?hm_(tout):'';if(!tin)throw new Error('Enter your correct time in (HH:MM).');if(String(o.tout||'')&&!tout)throw new Error('Enter your time out as HH:MM, or leave it blank.');}
 const e=empInfo_(s.id),sh=rqSheet_(),v=sh.getDataRange().getValues();
 for(let i=1;i<v.length;i++){if(String(v[i][2])===String(s.id)&&v[i][10]==='Pending'&&v[i][5]===type&&(type==='Device change'||nd_(v[i][6])===date))throw new Error('You already have a pending request for this.');}
 const id='RQ'+Utilities.formatDate(new Date(),TZ,'yyMMddHHmmss')+Utilities.getUuid().slice(0,3).toUpperCase();
 sh.appendRow([id,new Date(),String(s.id),e.name,e.dept,type,date,tin,tout,reason,'Pending','','','',e.head]);
 sh.getRange(sh.getLastRow(),1,1,9).setNumberFormat('@');sh.getRange(sh.getLastRow(),2).setNumberFormat('yyyy-mm-dd hh:mm');
 log_(s.id,'ATT_REQUEST',type+' '+date);return{ok:true,id:id};}
function api_myRequests(t){const s=session_(t);need_(s,'att');const v=rqSheet_().getDataRange().getValues();v.shift();
 return v.filter(r=>String(r[2])===String(s.id)).map(rqObj_).reverse().slice(0,50);}
function reqList_(s){
 const em={};rows_('Employees').forEach(e=>em[String(e['Employee Number'])]=e);
 const v=rqSheet_().getDataRange().getValues();v.shift();const cut=addDays_(ymd_(new Date()),-60);
 return v.filter(r=>{const e=em[String(r[2])];if(!e)return false;if(!inScope_(s,String(r[2]),e['Department'],e['Immediate Head (Emp No)']))return false;
  if(String(r[2])===String(s.id)&&!can_(s,'all'))return false;
  return r[10]==='Pending'||(r[12] instanceof Date&&ymd_(r[12])>=cut);})
  .map(r=>{const o=rqObj_(r);o.mine=String(r[2])===String(s.id);return o;}).sort((a,b)=>(a.status==='Pending'?0:1)-(b.status==='Pending'?0:1)||(a.submitted<b.submitted?1:-1));}
function api_requests(t){memo_();const s=session_(t);need_(s,'attrep');return reqList_(s);}

function api_reviewRequest(t,reqId,approve,note){const s=session_(t);need_(s,'attrep');
 const lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
  const row=findRow_('AttRequests',reqId);if(!row)throw new Error('Request not found.');
  const sh=rqSheet_(),r=sh.getRange(row,1,1,RQ_H.length).getValues()[0];
  if(r[10]!=='Pending')throw new Error('This request was already '+String(r[10]).toLowerCase()+'.');
  const emp=String(r[2]),er=findRow_('Employees',emp);if(!er)throw new Error('Employee not found.');
  const ev=sh_('Employees').getRange(er,1,1,COLS.length).getValues()[0];
  if(!inScope_(s,emp,ev[COLS.indexOf('Department')],ev[COLS.indexOf('Immediate Head (Emp No)')]))throw new Error('You do not have access to this employee.');
  if(emp===String(s.id))throw new Error('You cannot review your own request.');
  note=String(note||'').trim().slice(0,300);
  if(approve){
   if(r[5]==='Device change'){resetDevice_(emp,s.id);}
   else adjustCore_(s.id,emp,nd_(r[6]),tm_(r[7]),tm_(r[8]),'Approved request '+reqId+' ('+String(r[9]).slice(0,120)+')','');
  }
  sh.getRange(row,11,1,4).setValues([[approve?'Approved':'Rejected',String(s.id),new Date(),note]]);
  log_(s.id,approve?'ATT_REQ_APPROVED':'ATT_REQ_REJECTED',reqId);return{ok:true};
 }finally{lock.releaseLock();}}

/* ---------- direct correction by HR + shared core ---------- */
function adjustCore_(by,id,date,tin,tout,note,branchId){
 if(!isDate_(date))throw new Error('The date "'+date+'" is not valid.');
 const tin0=tin,tout0=tout;tin=hm_(tin);tout=tout?hm_(tout):'';
 if(!tin)throw new Error('The time in ("'+tin0+'") could not be read. Ask the employee to send the request again with the time in as HH:MM, or correct it under Attendance Reports.');
 if(tout0&&!tout)throw new Error('The time out ("'+tout0+'") could not be read. Ask the employee to send the request again with the time out as HH:MM.');
 const e=empInfo_(id),brs=branches_(true),b=brs.filter(x=>x.id===branchId)[0]||eligible_(e)[0]||brs[0];
 if(!b)throw new Error('Set up at least one branch first.');
 const dtin=new Date(date+'T'+tin+':00');let dtout=null;
 if(tout){dtout=new Date(date+'T'+tout+':00');if(dtout<=dtin)dtout=new Date(dtout.getTime()+864e5);if(dtout-dtin>20*36e5)throw new Error('Time out is more than 20 hours after time in. Please check the times.');}
 const ws=workShift_(id,date,b,e),c=calc_(date,dtin,dtout,ws),sheet=atSheet_(),ex=attRow_(id,date);
 const row=new Array(AT_H.length).fill('');
 row[A.key]=date+'|'+id;row[A.date]=date;row[A.id]=String(id);row[A.name]=e.name;row[A.co]=e.company;row[A.dept]=e.dept;row[A.br]=b.name;
 row[A.tin]=dtin;row[A.inGps]='Manual';row[A.tout]=dtout||'';row[A.outGps]=dtout?'Manual':'';row[A.late]=c.late;row[A.under]=c.under;row[A.work]=c.work;
 row[A.note]='Corrected by '+by+' ('+ymd_(new Date())+'): '+note;row[A.shift]=ws.code;row[A.valid]='Valid';row[A.why]='';
 if(ex)sheet.getRange(ex.row,1,1,AT_H.length).setValues([row]);else sheet.appendRow(row);
 log_(by,'ATT_ADJUSTED',id+' '+date);}
function api_attAdjust(t,id,date,tin,tout,branchId,note){const s=session_(t);need_(s,'tkadj');
 note=String(note||'').trim();if(!note)throw new Error('Enter the reason for this correction.');
 const r=findRow_('Employees',id);if(!r)throw new Error('Employee not found.');
 const er=sh_('Employees').getRange(r,1,1,COLS.length).getValues()[0];
 if(!inScope_(s,id,er[COLS.indexOf('Department')],er[COLS.indexOf('Immediate Head (Emp No)')]))throw new Error('You do not have access to this employee.');
 adjustCore_(s.id,id,date,tin,tout,note,branchId);return{ok:true};}


/* =====================================================================
   SELF-SERVICE (MY HRIS): completeness, learning hours, leave, calendar,
   announcements feed, team roster.   Sheets: Learning, Leaves, Announcements
   ===================================================================== */
const LEARN_REQ={'Rank & File':16,'Supervisory':24,'Managerial':32,'Executive':40};   // required learning hours per year by Position Level - EDIT TO YOUR POLICY
const LEARN_CATS=['Training','Seminar','Online course','On-the-job','Safety / Compliance'];
const LEAVE_TYPES=['Vacation','Sick','Emergency','Others'];
const ATT_WORKDAYS=[1,2,3,4,5];   // used for the calendar & leave day-count when no schedule is plotted (0=Sun ... 6=Sat)
const PERSONAL_F=['Gender','Birthdate','Mobile','Email','City Address','Provincial Address','Civil Status','Dependents','Educational Attainment','School Graduated','Degree','Blood Type'];
const GOV_F=['TIN','SSS','PhilHealth','HDMF'];
const LN_H=['Learning ID','Employee Number','Name','Date','Title','Category','Hours','Added By'];
const LV_H=['Leave ID','Filed','Employee Number','Name','Department','Type','From','To','Whole/Half','Days','Days With Pay','Days Without Pay','Reason','Status','Approver','Reviewed By','Reviewed At','Note'];
const AN_H=['ID','Type','Title','Details','Date','End Date','Posted By','Posted At'];
const lnSheet_=()=>mkSheet_('Learning',LN_H,[1,2,4]);
const lvSheet_=()=>mkSheet_('Leaves',LV_H,[1,3,7,8]);
const anSheet_=()=>mkSheet_('Announcements',AN_H,[1,5,6]);
const QU_H=['Quote ID','Quote','Author','Show On','Active','Added By','Added At'];
function quSheet_(){const sh=mkSheet_('Quotes',QU_H,[1,4]);
 if(sh.getLastRow()<2){const now=new Date();sh.getRange(2,1,QUOTES.length,QU_H.length).setValues(QUOTES.map((q,i)=>['Q'+String(i+1).padStart(3,'0'),q,'','','Yes','system',now]));}
 return sh;}
const QUOTES=['Small steps taken every day add up to big results.','A good day starts with a good attitude.','Do your best today; tomorrow will thank you.','Great teams are built one kind word at a time.','Quality is doing the right thing even when no one is watching.','Progress, not perfection.','Your effort today is the foundation of someone else’s great experience.','Be the reason a customer — or a teammate — smiles today.','Hard work shows up even on the days talent does not.','Learn something new today and teach it tomorrow.','Teamwork turns ordinary people into extraordinary results.','Consistency beats intensity.','Take pride in the little things; they make the big things possible.','Every shift is a chance to do it a little better than yesterday.','Start where you are. Use what you have. Do what you can.','Courtesy costs nothing but means everything.','Clean, safe and friendly — that is how we make a good name.','A grateful heart makes any workday lighter.','Listen first; great service begins with understanding.','Challenges are just lessons wearing work clothes.','When we help each other, the whole day moves faster.','Be early, be ready, be kind.','Mistakes are proof that you are trying — learn and keep going.','Success is the sum of small efforts repeated daily.','Your attitude decides how your day will taste.','Work with purpose and the hours will fly.','Respect for people and pride in our product — that is our recipe.','Dream big, start small, act now.','Show up. Do the work. Support your team.','Patience and persistence make every goal reachable.','Make today’s work something you are proud to sign.','Good habits quietly build a great career.','Safety first so everyone goes home happy.','Little kindnesses make a big workplace.','You are part of something bigger — thank you for being here.'];

function empRec_(id){const r=findRow_('Employees',id);if(!r)return null;const v=sh_('Employees').getRange(r,1,1,COLS.length).getValues()[0],o={};COLS.forEach((c,i)=>o[c]=v[i]);return o;}
const empName_=o=>((o['First Name']||'')+' '+(o['Surname']||'')).trim();
const p2_=n=>String(n).padStart(2,'0');
function leaveCredit_(o){if(LEAVE_AUTO_STATUSES.indexOf(String(o['Employment Status']||''))<0)return 0;const lv=String(o['Position Level']||''),ti=String(o['Position Title']||'').toLowerCase();
 if(ti.indexOf('crew')>=0)return 12;if(lv==='Managerial'&&ti.indexOf('senior')>=0)return 18;
 return{'Rank & File':14,'Supervisory':14,'Managerial':16,'Executive':24}[lv]||14;}

/* ----- leave ----- */
function lvObj_(r){return{id:String(r[0]),filed:r[1] instanceof Date?Utilities.formatDate(r[1],TZ,'yyyy-MM-dd HH:mm'):String(r[1]||''),emp:String(r[2]),name:r[3],dept:r[4],type:r[5],from:nd_(r[6]),to:nd_(r[7]),half:String(r[8]||'Whole'),
 days:Number(r[9])||0,pay:Number(r[10])||0,nopay:Number(r[11])||0,reason:r[12],status:r[13],approver:String(r[14]||''),by:r[15],at:r[16] instanceof Date?Utilities.formatDate(r[16],TZ,'yyyy-MM-dd HH:mm'):String(r[16]||''),note:r[17]};}
function leaveRows_(){if(_RM.on&&_RM.LV)return _RM.LV;const v=lvSheet_().getDataRange().getValues();v.shift();const o=v.filter(r=>String(r[0]).trim()!=='').map(lvObj_);if(_RM.on)_RM.LV=o;return o;}
function leaveBal_(id,o,year){const ov=lcMap_()[String(id)+'|'+year],cr=ov?ov.credit:leaveCredit_(o);let used=0,pend=0;
 leaveRows_().forEach(l=>{if(l.emp!==String(id)||l.from.slice(0,4)!==String(year)||isSpecial_(l.type))return;if(l.status==='Approved')used+=l.pay;else if(l.status==='Pending')pend+=l.pay;});
 return{credit:cr,used:used,pending:pend,remaining:Math.max(0,r2_(cr-used-pend)),year:year,manual:!!ov,note:ov?ov.note:'',auto:LEAVE_AUTO_STATUSES.indexOf(String(o['Employment Status']||''))>=0};}
function countLeaveDays_(id,from,to,half){scSheet_();const cache={},sm=shiftMap_(),hs={};holRows_().forEach(x=>hs[x.date]=x.type);let n=0;
 for(let d=from;d<=to;d=addDays_(d,1)){const mk=d.slice(0,7);
  if(!(mk in cache)){const r=findRow_('Schedules',mk+'|'+id);cache[mk]=r?sh_('Schedules').getRange(r,4,1,31).getValues()[0].map(x=>String(x||'').trim()):[];}
  const code=cache[mk][+d.slice(8,10)-1]||'',x=sm[code],dow=new Date(d+'T12:00:00').getDay();
  if(code&&x){if(x.type!=='Off')n++;}else if(ATT_WORKDAYS.indexOf(dow)>=0&&!(hs[d]&&hs[d]!=='Special working day'))n++;}
 return half&&half!=='Whole'?(n>0?0.5:0):n;}
function api_myLeaves(t){const s=session_(t);need_(s,'att');const o=empRec_(s.id);if(!o)throw new Error('Employee record not found.');
 const yr=+ymd_(new Date()).slice(0,4);
 const sp=specialBal_(s.id,o,yr);
 return{bal:leaveBal_(s.id,o,yr),special:sp.filter(x=>x.days>0),types:LEAVE_TYPES.concat(sp.filter(x=>x.days>0).map(x=>x.type)),rows:leaveRows_().filter(l=>l.emp===String(s.id)).reverse().slice(0,60)};}
function api_fileLeave(t,o){const s=session_(t);need_(s,'att');o=o||{};
 const lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
  const e=empRec_(s.id);if(!e)throw new Error('Employee record not found.');
  const type=String(o.type||''),from=String(o.from||''),to=String(o.to||from),half=o.half==='AM'||o.half==='PM'?o.half:'Whole',reason=String(o.reason||'').trim(),today=ymd_(new Date());
  const spT=slTypes_().filter(x=>x.type===type&&x.active)[0];
  if(LEAVE_TYPES.indexOf(type)<0&&!spT)throw new Error('Choose the type of leave.');
  if(!isDate_(from)||!isDate_(to)||to<from)throw new Error('Choose valid leave dates.');
  if(from<addDays_(today,-30))throw new Error('Leave can only be filed up to 30 days back.');
  if((new Date(to+'T00:00:00')-new Date(from+'T00:00:00'))/864e5>60)throw new Error('Leave of more than 60 days needs HR.');
  if(half!=='Whole'&&from!==to)throw new Error('A half-day leave must be a single date.');
  if(reason.length<3)throw new Error('Enter the reason for your leave.');
  const days=countLeaveDays_(s.id,from,to,half);if(!days)throw new Error('There are no working days in those dates (rest days are not counted).');
  const clash=leaveRows_().filter(l=>l.emp===String(s.id)&&(l.status==='Pending'||l.status==='Approved')&&l.from<=to&&l.to>=from);
  if(clash.length)throw new Error('You already have a leave application covering '+clash[0].from+(clash[0].to!==clash[0].from?' to '+clash[0].to:'')+'.');
  let availNow;
  if(spT){const sb=specialBal_(s.id,e,+from.slice(0,4)).filter(x=>x.type===type)[0];if(!sb||sb.days<=0)throw new Error('You are not entitled to '+type+'. Ask HR to enrol you'+(spT.elig==='assigned'?' (e.g. with your solo parent ID).':'.'));availNow=sb.available;}
  else availNow=leaveBal_(s.id,e,+from.slice(0,4)).remaining;
  const pay=o.pay==='without'?0:Math.min(days,availNow),nopay=Math.round((days-pay)*100)/100;   // employee chooses: with pay (uses credits) or without pay
  const id='LV'+Utilities.formatDate(new Date(),TZ,'yyMMddHHmmss')+Utilities.getUuid().slice(0,3).toUpperCase(),sh=lvSheet_();
  sh.appendRow([id,new Date(),String(s.id),empName_(e),e['Department'],type,from,to,half,days,pay,nopay,reason,'Pending',String(e['Immediate Head (Emp No)']||''),'','','']);
  const r=sh.getLastRow();sh.getRange(r,1,1,3).setNumberFormat('@');sh.getRange(r,7,1,2).setNumberFormat('@');sh.getRange(r,2).setNumberFormat('yyyy-mm-dd hh:mm');
  log_(s.id,'LEAVE_FILED',type+' '+from+'..'+to+' '+days+'d');return{ok:true,id:id,days:days,pay:pay,nopay:nopay};
 }finally{lock.releaseLock();}}
function api_cancelLeave(t,id){const s=session_(t);need_(s,'att');const row=findRow_('Leaves',id);if(!row)throw new Error('Leave not found.');
 const sh=lvSheet_(),r=sh.getRange(row,1,1,LV_H.length).getValues()[0];
 if(String(r[2])!==String(s.id))throw new Error('This is not your leave application.');if(r[13]!=='Pending')throw new Error('Only pending applications can be cancelled.');
 sh.getRange(row,14).setValue('Cancelled');log_(s.id,'LEAVE_CANCELLED',id);return{ok:true};}
function leaveList_(s){const em={};rows_('Employees').forEach(e=>em[String(e['Employee Number'])]=e);const cut=addDays_(ymd_(new Date()),-60);
 return leaveRows_().filter(l=>{const e=em[l.emp];if(!e)return false;if(!inScope_(s,l.emp,e['Department'],e['Immediate Head (Emp No)']))return false;
  if(l.emp===String(s.id)&&!can_(s,'all'))return false;return l.status==='Pending'||(l.at&&l.at.slice(0,10)>=cut&&l.status!=='Cancelled');})
  .map(l=>{l.mine=l.emp===String(s.id);return l;}).sort((a,b)=>(a.status==='Pending'?0:1)-(b.status==='Pending'?0:1)||(a.filed<b.filed?1:-1));}
function api_leaveRequests(t){memo_();const s=session_(t);need_(s,'attrep');return leaveList_(s);}
function api_reviewLeave(t,id,approve,note){const s=session_(t);need_(s,'attrep');
 const lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
  const row=findRow_('Leaves',id);if(!row)throw new Error('Leave application not found.');
  const sh=lvSheet_(),r=sh.getRange(row,1,1,LV_H.length).getValues()[0];
  if(r[13]!=='Pending')throw new Error('This application was already '+String(r[13]).toLowerCase()+'.');
  const emp=String(r[2]),e=empRec_(emp);if(!e)throw new Error('Employee not found.');
  if(!inScope_(s,emp,e['Department'],e['Immediate Head (Emp No)']))throw new Error('You do not have access to this employee.');
  if(emp===String(s.id))throw new Error('You cannot review your own leave.');
  sh.getRange(row,14).setValue(approve?'Approved':'Rejected');sh.getRange(row,16,1,3).setValues([[String(s.id),new Date(),String(note||'').trim().slice(0,300)]]);
  log_(s.id,approve?'LEAVE_APPROVED':'LEAVE_REJECTED',id);return{ok:true};
 }finally{lock.releaseLock();}}

/* ----- learning hours ----- */
function lnRows_(){const v=lnSheet_().getDataRange().getValues();v.shift();
 return v.filter(r=>String(r[0]).trim()!=='').map(r=>({id:String(r[0]),emp:String(r[1]),name:r[2],date:nd_(r[3]),title:r[4],cat:r[5],hours:Number(r[6])||0,by:r[7]}));}
function api_learningSummary(t){memo_();const s=session_(t);need_(s,'lrn');const yr=ymd_(new Date()).slice(0,4),tot={};
 const all=lnRows_();all.filter(x=>x.date.slice(0,4)===yr).forEach(x=>tot[x.emp]=(tot[x.emp]||0)+x.hours);
 const rows=rows_('Employees').filter(e=>String(e['Employee Number'])!=='ADMIN'&&e['Status']!=='Inactive').map(e=>{const id=String(e['Employee Number']),req=LEARN_REQ[e['Position Level']]||0,act=Math.round((tot[id]||0)*100)/100;
  return{id:id,name:empName_(e),dept:e['Department'],level:e['Position Level'],actual:act,required:req,pct:req?Math.round(act/req*100):100};}).sort((a,b)=>a.pct-b.pct||(a.name>b.name?1:-1));
 return{year:yr,cats:LEARN_CATS,rows:rows,recent:all.reverse().slice(0,25),req:LEARN_REQ};}
function api_addLearning(t,o){const s=session_(t);need_(s,'lrn');o=o||{};const id=String(o.emp||'').trim(),e=empRec_(id);
 if(!e)throw new Error('Employee number '+id+' was not found.');const hrs=Number(o.hours),title=String(o.title||'').trim(),date=String(o.date||'');
 if(!title)throw new Error('Enter the title of the training.');if(!(hrs>=0.25&&hrs<=200))throw new Error('Hours must be between 0.25 and 200.');
 if(!isDate_(date)||date>ymd_(new Date()))throw new Error('Choose the date the training took place (not in the future).');
 const cat=LEARN_CATS.indexOf(o.cat)>=0?o.cat:'Training',lid='LN'+Utilities.formatDate(new Date(),TZ,'yyMMddHHmmss')+Utilities.getUuid().slice(0,2).toUpperCase(),sh=lnSheet_();
 sh.appendRow([lid,id,empName_(e),date,title,cat,hrs,String(s.id)]);sh.getRange(sh.getLastRow(),1,1,4).setNumberFormat('@');
 log_(s.id,'LEARNING_ADDED',id+' '+hrs+'h');return{ok:true,name:empName_(e)};}
function api_deleteLearning(t,id){const s=session_(t);need_(s,'lrn');lnSheet_();const row=findRow_('Learning',id);if(!row)throw new Error('Record not found.');sh_('Learning').deleteRow(row);log_(s.id,'LEARNING_DELETED',id);return{ok:true};}

/* ----- announcements & daily feed ----- */
function anRows_(){const v=anSheet_().getDataRange().getValues();v.shift();
 return v.filter(r=>String(r[0]).trim()!=='').map(r=>({id:String(r[0]),type:String(r[1]||'Activity'),title:r[2],details:r[3],date:nd_(r[4]),end:nd_(r[5]),by:r[6]}));}
function api_feed(t){memo_();const s=session_(t);need_(s,'me');const today=ymd_(new Date()),fk='feed_'+today,fcc=CacheService.getScriptCache(),fh=fcc.get(fk);if(fh){try{return JSON.parse(fh);}catch(e){}}
 const rows=anRows_();
 const hol=holRows_().filter(x=>x.date>=today&&x.date<=addDays_(today,90)&&x.type!=='Special working day').map(x=>({id:x.id,type:'Activity',title:x.name,details:x.type,date:x.date,end:'',holiday:true}));
 const acts=rows.filter(x=>x.type==='Activity'&&(x.end||x.date)>=today).concat(hol).sort((a,b)=>a.date>b.date?1:-1).slice(0,10);
 const notes=rows.filter(x=>x.type==='Notice'&&(!x.end||x.end>=today)&&(!x.date||x.date<=today)).sort((a,b)=>a.date<b.date?1:-1).slice(0,4);
 const mo=new Date().getMonth(),td=new Date().getDate(),bd=[];
 rows_('Employees').forEach(e=>{if(String(e['Employee Number'])==='ADMIN'||e['Status']==='Inactive')return;const b=e['Birthdate'];if(!(b instanceof Date)||b.getMonth()!==mo)return;
  bd.push({day:b.getDate(),name:empName_(e),dept:e['Department']||'',today:b.getDate()===td,past:b.getDate()<td});});
 bd.sort((a,b)=>a.day-b.day||(a.name>b.name?1:-1));
 const q=quoteOfDay_();
 const fres={activities:acts,notices:notes,birthdays:bd,month:Utilities.formatDate(new Date(),TZ,'MMMM'),quote:q.text,quoteBy:q.author||''};try{fcc.put(fk,JSON.stringify(fres),120);}catch(e){}
 return fres;}
function api_announcements(t){const s=session_(t);need_(s,'ann');return anRows_().sort((a,b)=>a.date<b.date?1:-1);}
function api_saveAnnouncement(t,o){const s=session_(t);need_(s,'ann');o=o||{};const type=o.type==='Notice'?'Notice':'Activity',title=String(o.title||'').trim();
 if(!title)throw new Error('Enter a title.');if(!isDate_(o.date))throw new Error('Choose the date.');if(o.end&&(!isDate_(o.end)||o.end<o.date))throw new Error('The end date must be on or after the start date.');
 const sh=anSheet_();let id=String(o.id||'').trim(),row=id?findRow_('Announcements',id):0;
 if(!row){id='AN'+Utilities.formatDate(new Date(),TZ,'yyMMddHHmmss')+Utilities.getUuid().slice(0,2).toUpperCase();row=sh.getLastRow()+1;}
 sh.getRange(row,1,1,AN_H.length).setValues([[id,type,title,String(o.details||'').trim().slice(0,500),o.date,o.end||'',String(s.id),new Date()]]);sh.getRange(row,1,1,6).setNumberFormat('@');
 log_(s.id,'ANNOUNCEMENT_SAVED',id);CacheService.getScriptCache().remove('feed_'+ymd_(new Date()));return anRows_().sort((a,b)=>a.date<b.date?1:-1);}
function api_deleteAnnouncement(t,id){const s=session_(t);need_(s,'ann');anSheet_();const row=findRow_('Announcements',id);if(!row)throw new Error('Announcement not found.');
 sh_('Announcements').deleteRow(row);log_(s.id,'ANNOUNCEMENT_DELETED',id);CacheService.getScriptCache().remove('feed_'+ymd_(new Date()));return anRows_().sort((a,b)=>a.date<b.date?1:-1);}


/* ----- daily motivational quotes (editable by HR / Admin / Super Admin) ----- */
function quRows_(){const v=quSheet_().getDataRange().getValues();v.shift();
 return v.filter(r=>String(r[0]).trim()!=='').map(r=>({id:String(r[0]),text:String(r[1]||''),author:String(r[2]||''),showOn:nd_(r[3]),active:String(r[4]||'Yes').trim().toLowerCase()!=='no'}));}
function quoteOfDay_(){const today=ymd_(new Date()),all=quRows_().filter(q=>q.active),pin=all.filter(q=>q.showOn===today)[0];
 if(pin)return pin;const pool=all.filter(q=>!q.showOn);const doy=Math.floor((new Date()-new Date(new Date().getFullYear(),0,0))/864e5);
 return pool.length?pool[doy%pool.length]:{text:QUOTES[doy%QUOTES.length],author:''};}
function api_quotes(t){const s=session_(t);need_(s,'ann');return{rows:quRows_(),today:quoteOfDay_()};}
function api_saveQuote(t,o){const s=session_(t);need_(s,'ann');o=o||{};const text=String(o.text||'').trim(),author=String(o.author||'').trim().slice(0,60);
 if(text.length<5||text.length>240)throw new Error('The quote must be between 5 and 240 characters.');
 if(o.showOn&&!isDate_(o.showOn))throw new Error('Choose a valid date, or leave it blank for the daily rotation.');
 const sh=quSheet_();let id=String(o.id||'').trim(),row=id?findRow_('Quotes',id):0;
 if(!row){id='Q'+Utilities.formatDate(new Date(),TZ,'yyMMddHHmmss')+Utilities.getUuid().slice(0,2).toUpperCase();row=sh.getLastRow()+1;}
 sh.getRange(row,1,1,QU_H.length).setValues([[id,text,author,o.showOn||'',o.active===false?'No':'Yes',String(s.id),new Date()]]);sh.getRange(row,1).setNumberFormat('@');sh.getRange(row,4).setNumberFormat('@');
 log_(s.id,'QUOTE_SAVED',id);CacheService.getScriptCache().remove('feed_'+ymd_(new Date()));return{rows:quRows_(),today:quoteOfDay_()};}
function api_deleteQuote(t,id){const s=session_(t);need_(s,'ann');quSheet_();const row=findRow_('Quotes',id);if(!row)throw new Error('Quote not found.');
 sh_('Quotes').deleteRow(row);log_(s.id,'QUOTE_DELETED',id);CacheService.getScriptCache().remove('feed_'+ymd_(new Date()));return{rows:quRows_(),today:quoteOfDay_()};}

/* ----- My HRIS: completeness, learning, leave ----- */
function api_myHris(t){const s=session_(t);need_(s,'hris');if(String(s.id)==='ADMIN')throw new Error('The system administrator account is not an employee, so personal pages are not available. Sign in with your own employee account.');const e=empRec_(s.id);if(!e)throw new Error('Your employee record was not found. Please contact HR.');
 const filled=k=>{const v=e[k];return v instanceof Date||(v!==''&&v!=null&&String(v).trim()!=='');},
  mk=a=>{const miss=a.filter(k=>!filled(k));return{done:a.length-miss.length,total:a.length,missing:miss};};
 const yr=ymd_(new Date()).slice(0,4),mine=lnRows_().filter(x=>x.emp===String(s.id)),act=Math.round(mine.filter(x=>x.date.slice(0,4)===yr).reduce((a,x)=>a+x.hours,0)*100)/100,req=LEARN_REQ[e['Position Level']]||0;
 return{name:empName_(e),role:s.role,level:e['Position Level']||'',position:e['Position Title']||'',status:e['Employment Status']||'',
  personal:mk(PERSONAL_F),gov:mk(GOV_F),learning:{actual:act,required:req,year:yr,recent:mine.slice(-4).reverse()},leave:leaveBal_(s.id,e,+yr),cto:Object.assign(ctoBal_(s.id),{rule:otRule_(e['Position Level'])})};}

/* ----- My attendance calendar (with missing logs) ----- */
function api_myMonth(t,month){const s=session_(t);need_(s,'att');const cur=Utilities.formatDate(new Date(),TZ,'yyyy-MM');
 if(!/^\d{4}-\d{2}$/.test(String(month||'')))month=cur;if(month>cur)month=cur;
 const e=empRec_(s.id),sen=!!e&&isSenior_(e),hire=e&&e['Date Hire'] instanceof Date?ymd_(e['Date Hire']):'',n=daysIn_(month),today=ymd_(new Date()),first=month+'-01',last=month+'-'+p2_(n);
 const recs={};attRows_(first,last<today?last:today).filter(r=>String(r[A.id])===String(s.id)).forEach(r=>{const o=attObj_(r);recs[o.date]=o;});
 scSheet_();const sr=findRow_('Schedules',month+'|'+s.id),codes=sr?sh_('Schedules').getRange(sr,4,1,31).getValues()[0].map(x=>String(x||'').trim()):[],sm=shiftMap_();
 const lv={};leaveRows_().filter(l=>l.emp===String(s.id)&&l.status==='Approved'&&l.from<=last&&l.to>=first).forEach(l=>{for(let d=l.from;d<=l.to;d=addDays_(d,1))lv[d]=l;});
 const hm={};holRows_().filter(x=>x.date>=first&&x.date<=last).forEach(x=>hm[x.date]=x);
 otRows_().filter(o=>o.emp===String(s.id)&&o.type==='CTO Use'&&o.status==='Approved'&&o.date>=first&&o.date<=last).forEach(o=>{lv[o.date]={type:'CTO '+(o.hours>=8?'(whole day)':'(half day)'),half:o.hours>=8?'Whole':'Half'};});
 const sum={present:0,late:0,under:0,missing:0,noout:0,invalid:0,leave:0,rest:0},days=[];
 for(let i=1;i<=n;i++){const d=month+'-'+p2_(i),dow=new Date(d+'T12:00:00').getDay(),code=codes[i-1]||((sen&&ATT_WORKDAYS.indexOf(dow)>=0&&sm['EXEC'])?'EXEC':''),x=sm[code],off=code&&x?x.type==='Off':(!code&&ATT_WORKDAYS.indexOf(dow)<0),rec=recs[d]||null,flex=!!(x&&x.type==='Flexible');
  let st='';
  if(hire&&d<hire)st='pre';
  else if(lv[d]){st='leave';sum.leave++;}
  else if(d>today)st='future';
  else if(rec&&rec.valid==='Invalid'){st='invalid';sum.invalid++;}
  else if(rec&&rec.tin){sum.present++;if(flex){st='ok';}else if(!rec.tout&&d<today){st='noout';sum.noout++;}else if(!rec.tout)st='in';else if(rec.late>0){st='late';sum.late++;}else if(rec.under>0){st='under';sum.under++;}else st='ok';if(rec.under>0&&st==='late')sum.under++;}
  else if(!code&&hm[d]&&hm[d].type!=='Special working day'){st='holiday';}
  else if(off){st='rest';sum.rest++;}
  else if(d===today)st='pending';
  else{st='missing';sum.missing++;}
  days.push({date:d,dow:dow,code:code,flex:flex,off:!!off,hol:hm[d]?{name:hm[d].name,type:hm[d].type}:null,st:st,rec:rec?{tin:rec.tin,tout:rec.tout,late:rec.late,under:rec.under,work:rec.work,why:rec.why,branch:rec.branch}:null,leave:lv[d]?{type:lv[d].type,half:lv[d].half}:null});}
 return{month:month,days:days,sum:sum,cur:cur,first:new Date(first+'T12:00:00').getDay(),workdays:ATT_WORKDAYS};}

/* ----- Manager: team roster status & pending approvals ----- */
function api_teamRoster(t){memo_();const s=session_(t);need_(s,'team');const today=ymd_(new Date()),mk=today.slice(0,7);
 const emps=rows_('Employees').filter(e=>{const id=String(e['Employee Number']);return id!=='ADMIN'&&e['Status']!=='Inactive'&&id!==String(s.id)&&inScope_(s,id,e['Department'],e['Immediate Head (Emp No)']);});
 if(emps.length>400)throw new Error('Too many employees for the roster view.');
 const rec={};attRows_(today,today).forEach(r=>{rec[String(r[A.id])]=attObj_(r);});
 const lv={};leaveRows_().filter(l=>l.status==='Approved'&&l.from<=today&&l.to>=today).forEach(l=>lv[l.emp]=l);
 const sc={};const v=scSheet_().getDataRange().getValues();for(let i=1;i<v.length;i++){if(String(v[i][1])===mk)sc[String(v[i][2])]=String(v[i][2+Number(today.slice(8,10))]||'').trim();}
 const sm=shiftMap_(),tally={};LISTS['Employment Status'].forEach(k=>tally[k]=0);
 const rows=emps.map(e=>{const id=String(e['Employee Number']),es=e['Employment Status']||'Not set';tally[es]=(tally[es]||0)+1;
  const r=rec[id],code=sc[id]||'',x=sm[code];let st='Not yet in';
  if(lv[id])st='On leave';else if(r&&r.valid==='Invalid')st='Invalid log';else if(r&&r.tout)st='Timed out';else if(r&&r.tin)st=r.late>0?'In · late':'In';else if(code&&x&&x.type==='Off')st='Rest day';
  return{id:id,name:empName_(e),pos:e['Position Title']||'',status:es,today:st,shift:code,tin:r?r.tin:''};}).sort((a,b)=>a.name>b.name?1:-1);
 const rq=reqList_(s).filter(x=>x.status==='Pending'&&!x.mine).length,lq=leaveList_(s).filter(x=>x.status==='Pending'&&!x.mine).length;
 return{headcount:rows.length,tally:Object.keys(tally).map(k=>[k,tally[k]]),rows:rows,pending:{logs:rq,leaves:lq,ots:otList_(s).filter(x=>x.status==='Pending'&&!x.mine).length},scope:s.role};}


/* =====================================================================
   OVERTIME & CHANGE TIME OFF (CTO)
   Rank & File ........ min 1 hour; manager approves as Regular OT (paid) or Change Time Off
   Supervisory / Managerial / Executive ... Change Time Off only; min 4 hours;
        credited in whole 4-hour blocks - any excess is NOT accumulated
   CTO can be used only in 4-hour (half-day) or 8-hour (whole-day) blocks.
   ===================================================================== */
const OT_MIN_RF=1;               // minimum overtime hours - Rank & File
const OT_MIN_UP=4;               // minimum overtime hours - Supervisory, Managerial, Executive
const CTO_BLOCKS=[4,8];          // CTO utilization allowed only in these hour blocks
const OT_MAX_HOURS=16;           // longest single overtime request
const OT_H=['OT ID','Filed','Employee Number','Name','Department','Level','Type','Date','From','To','Hours','Reason','Status','Approver','Convert To','Approved Hours','Credited CTO Hours','Reviewed By','Reviewed At','Note'];
const otSheet_=()=>mkSheet_('Overtime',OT_H,[1,3,8,9,10]);
const r2_=n=>Math.round(n*100)/100;
function otRule_(level){const rf=String(level||'')==='Rank & File';return{rf:rf,min:rf?OT_MIN_RF:OT_MIN_UP,kinds:rf?['Regular OT','CTO']:['CTO'],blocks:CTO_BLOCKS};}
function otObj_(r){return{id:String(r[0]),filed:r[1] instanceof Date?Utilities.formatDate(r[1],TZ,'yyyy-MM-dd HH:mm'):String(r[1]||''),emp:String(r[2]),name:r[3],dept:r[4],level:String(r[5]||''),type:String(r[6]||'OT'),date:nd_(r[7]),
 from:tm_(r[8]),to:tm_(r[9]),hours:Number(r[10])||0,reason:r[11],status:r[12],approver:String(r[13]||''),convert:String(r[14]||''),approved:Number(r[15])||0,cto:Number(r[16])||0,
 by:r[17],at:r[18] instanceof Date?Utilities.formatDate(r[18],TZ,'yyyy-MM-dd HH:mm'):String(r[18]||''),note:r[19]};}
function otRows_(){if(_RM.on&&_RM.OT)return _RM.OT;const v=otSheet_().getDataRange().getValues();v.shift();const o=v.filter(r=>String(r[0]).trim()!=='').map(otObj_);if(_RM.on)_RM.OT=o;return o;}
function ctoBal_(id){let earned=0,used=0,pendUse=0,pendOt=0;
 otRows_().forEach(o=>{if(o.emp!==String(id))return;
  if(o.type==='OT'){if(o.status==='Approved'&&o.convert==='CTO')earned+=o.cto;else if(o.status==='Pending')pendOt+=o.hours;}
  else if(o.type==='CTO Use'){if(o.status==='Approved')used+=o.hours;else if(o.status==='Pending')pendUse+=o.hours;}});
 return{earned:r2_(earned),used:r2_(used),pendingUse:r2_(pendUse),pendingOt:r2_(pendOt),balance:r2_(earned-used-pendUse)};}
function api_myOvertime(t){const s=session_(t);need_(s,'att');const e=empRec_(s.id);if(!e)throw new Error('Employee record not found.');
 return{rule:otRule_(e['Position Level']),level:e['Position Level']||'',bal:ctoBal_(s.id),rows:otRows_().filter(o=>o.emp===String(s.id)).reverse().slice(0,60)};}
function api_requestOvertime(t,o){const s=session_(t);need_(s,'att');o=o||{};
 const lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
  const e=empRec_(s.id);if(!e)throw new Error('Employee record not found.');const rule=otRule_(e['Position Level']),today=ymd_(new Date());
  const date=String(o.date||''),from=hm_(o.from),to=hm_(o.to),reason=String(o.reason||'').trim();
  if(!isDate_(date)||date<addDays_(today,-30)||date>addDays_(today,14))throw new Error('Choose an overtime date from the last 30 days up to 14 days ahead.');
  if(!from||!to)throw new Error('Enter the overtime start and end times (HH:MM).');
  let a=new Date(date+'T'+from+':00'),b=new Date(date+'T'+to+':00');if(b<=a)b=new Date(b.getTime()+864e5);
  const hrs=r2_((b-a)/36e5);
  if(hrs>OT_MAX_HOURS)throw new Error('A single overtime request can be at most '+OT_MAX_HOURS+' hours.');
  if(hrs<rule.min)throw new Error((rule.rf?'Rank & File':'Supervisory, Managerial and Executive')+' overtime must be at least '+rule.min+' hour'+(rule.min>1?'s':'')+'. You entered '+hrs+' hour'+(hrs===1?'':'s')+'.');
  if(reason.length<3)throw new Error('Enter the reason / work done during overtime.');
  const clash=otRows_().filter(x=>x.emp===String(s.id)&&x.type==='OT'&&x.date===date&&(x.status==='Pending'||x.status==='Approved'));
  if(clash.length)throw new Error('You already have an overtime request for '+date+'.');
  const id='OT'+Utilities.formatDate(new Date(),TZ,'yyMMddHHmmss')+Utilities.getUuid().slice(0,3).toUpperCase(),sh=otSheet_();
  sh.appendRow([id,new Date(),String(s.id),empName_(e),e['Department'],e['Position Level']||'','OT',date,from,to,hrs,reason,'Pending',String(e['Immediate Head (Emp No)']||''),'','','','','','']);
  const r=sh.getLastRow();sh.getRange(r,1,1,3).setNumberFormat('@');sh.getRange(r,8,1,3).setNumberFormat('@');
  const credit=rule.rf?null:Math.floor(hrs/4)*4;
  log_(s.id,'OT_REQUESTED',date+' '+hrs+'h');return{ok:true,id:id,hours:hrs,credit:credit,excess:rule.rf?0:r2_(hrs-credit)};
 }finally{lock.releaseLock();}}
function api_requestCto(t,o){const s=session_(t);need_(s,'att');o=o||{};
 const lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
  const e=empRec_(s.id);if(!e)throw new Error('Employee record not found.');const today=ymd_(new Date()),date=String(o.date||''),hrs=Number(o.hours),reason=String(o.reason||'').trim();
  if(!isDate_(date)||date<today||date>addDays_(today,180))throw new Error('Choose the date you want to use your CTO (today up to 6 months ahead).');
  if(CTO_BLOCKS.indexOf(hrs)<0)throw new Error('CTO can only be used in '+CTO_BLOCKS.join(' or ')+'-hour blocks (half day or whole day).');
  const bal=ctoBal_(s.id);if(hrs>bal.balance)throw new Error('Not enough CTO. Available: '+bal.balance+' hour(s).');
  if(otRows_().some(x=>x.emp===String(s.id)&&x.type==='CTO Use'&&x.date===date&&(x.status==='Pending'||x.status==='Approved')))throw new Error('You already filed a CTO for '+date+'.');
  const id='CT'+Utilities.formatDate(new Date(),TZ,'yyMMddHHmmss')+Utilities.getUuid().slice(0,3).toUpperCase(),sh=otSheet_();
  sh.appendRow([id,new Date(),String(s.id),empName_(e),e['Department'],e['Position Level']||'','CTO Use',date,'','',hrs,reason||'Use of change time off','Pending',String(e['Immediate Head (Emp No)']||''),'','','','','','']);
  const r=sh.getLastRow();sh.getRange(r,1,1,3).setNumberFormat('@');sh.getRange(r,8,1,3).setNumberFormat('@');
  log_(s.id,'CTO_REQUESTED',date+' '+hrs+'h');return{ok:true,id:id};
 }finally{lock.releaseLock();}}
function api_cancelOvertime(t,id){const s=session_(t);need_(s,'att');otSheet_();const row=findRow_('Overtime',id);if(!row)throw new Error('Request not found.');
 const sh=otSheet_(),r=sh.getRange(row,1,1,OT_H.length).getValues()[0];
 if(String(r[2])!==String(s.id))throw new Error('This is not your request.');if(r[12]!=='Pending')throw new Error('Only pending requests can be cancelled.');
 sh.getRange(row,13).setValue('Cancelled');log_(s.id,'OT_CANCELLED',id);return{ok:true};}
function otList_(s){const em={};rows_('Employees').forEach(e=>em[String(e['Employee Number'])]=e);const cut=addDays_(ymd_(new Date()),-60);
 return otRows_().filter(o=>{const e=em[o.emp];if(!e)return false;if(!inScope_(s,o.emp,e['Department'],e['Immediate Head (Emp No)']))return false;
  if(o.emp===String(s.id)&&!can_(s,'all'))return false;return o.status==='Pending'||(o.at&&o.at.slice(0,10)>=cut&&o.status!=='Cancelled');})
  .map(o=>{o.mine=o.emp===String(s.id);return o;}).sort((a,b)=>(a.status==='Pending'?0:1)-(b.status==='Pending'?0:1)||(a.filed<b.filed?1:-1));}
function api_overtimeRequests(t){memo_();const s=session_(t);need_(s,'attrep');const L=otList_(s);
 L.forEach(o=>{o.rule=otRule_(o.level);if(o.status!=='Pending')return;
  if(o.type==='OT'){const r=attRow_(o.emp,o.date);if(r){const a=attObj_(r.v);o.att={tin:a.tin,tout:a.tout,valid:a.valid};}}
  else{o.bal=ctoBal_(o.emp);}});
 return L;}
function api_reviewOvertime(t,id,approve,note,kind,hours){const s=session_(t);need_(s,'attrep');
 const lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
  const row=findRow_('Overtime',id);if(!row)throw new Error('Request not found.');
  const sh=otSheet_(),r=sh.getRange(row,1,1,OT_H.length).getValues()[0],o=otObj_(r);
  if(o.status!=='Pending')throw new Error('This request was already '+o.status.toLowerCase()+'.');
  const e=empRec_(o.emp);if(!e)throw new Error('Employee not found.');
  if(!inScope_(s,o.emp,e['Department'],e['Immediate Head (Emp No)']))throw new Error('You do not have access to this employee.');
  if(o.emp===String(s.id))throw new Error('You cannot review your own request.');
  let conv='',appr=0,cto=0;
  if(approve){
   if(o.type==='OT'){
    const rule=otRule_(e['Position Level']);let h=(hours===''||hours==null)?o.hours:Number(hours);
    if(!(h>0)||h>o.hours+1e-9)throw new Error('Approved hours must be more than 0 and not more than the '+o.hours+' hour(s) requested.');
    if(h<rule.min)throw new Error('Approved hours cannot be less than the '+rule.min+'-hour minimum for this level.');
    conv=rule.rf?String(kind||''):'CTO';
    if(rule.kinds.indexOf(conv)<0)throw new Error(rule.rf?'Choose how to approve this Rank & File overtime: Regular OT or Change Time Off.':'Supervisory, Managerial and Executive overtime is Change Time Off only.');
    if(conv==='Regular OT'){appr=Math.floor(h*2)/2;}
    else if(rule.rf){appr=Math.floor(h*2)/2;cto=appr;}
    else{cto=Math.floor(h/4)*4;appr=cto;}      // credited in whole 4-hour blocks; excess is not accumulated
    if(appr<rule.min)throw new Error('After rounding, the credited hours ('+appr+') fall below the '+rule.min+'-hour minimum.');
   }else{
    const bal=ctoBal_(o.emp);if(o.hours>bal.earned-bal.used+1e-9)throw new Error('The employee only has '+r2_(bal.earned-bal.used)+' CTO hour(s) available.');
    appr=o.hours;
   }
  }
  sh.getRange(row,13).setValue(approve?'Approved':'Rejected');
  sh.getRange(row,15,1,6).setValues([[conv,approve?appr:'',approve&&o.type==='OT'?cto:'',String(s.id),new Date(),String(note||'').trim().slice(0,300)]]);
  log_(s.id,(approve?'OT_APPROVED ':'OT_REJECTED ')+id,conv+' '+appr);return{ok:true,credited:cto,approved:appr,kind:conv,excess:approve&&o.type==='OT'&&!otRule_(e['Position Level']).rf?r2_(o.hours-cto):0};
 }finally{lock.releaseLock();}}

/* =====================================================================
   PHILIPPINE HOLIDAYS (Super Admin & Admin)  -  sheet: Holidays
   ===================================================================== */
const HOL_TYPES=['Regular holiday','Special non-working','Special working day','Local / company holiday'];
const HL_H=['Holiday ID','Date','Holiday','Type','Note','Added By'];
const holSheet_=()=>mkSheet_('Holidays',HL_H,[1,2]);
function holRows_(){if(_RM.on&&_RM.HL)return _RM.HL;const v=holSheet_().getDataRange().getValues();v.shift();
 const o=v.filter(r=>String(r[0]).trim()!=='').map(r=>({id:String(r[0]),date:nd_(r[1]),name:String(r[2]||''),type:String(r[3]||''),note:String(r[4]||'')})).sort((a,b)=>a.date>b.date?1:-1);if(_RM.on)_RM.HL=o;return o;}
function easter_(y){const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31),da=((h+l-7*m+114)%31)+1;return new Date(y,mo-1,da);}
const CNY_={2025:'01-29',2026:'02-17',2027:'02-06',2028:'01-26',2029:'02-13',2030:'02-03'};
function stdHolidays_(y){const P=(m,d)=>y+'-'+p2_(m)+'-'+p2_(d),E=easter_(y),ed=n=>ymd_(new Date(E.getFullYear(),E.getMonth(),E.getDate()+n)),R=HOL_TYPES[0],S=HOL_TYPES[1],W=HOL_TYPES[2];
 let lm=new Date(y,7,31);while(lm.getDay()!==1)lm=new Date(y,7,lm.getDate()-1);
 const L=[[P(1,1),"New Year's Day",R,''],[ed(-3),'Maundy Thursday',R,'Holy Week (computed from Easter)'],[ed(-2),'Good Friday',R,'Holy Week (computed from Easter)'],[ed(-1),'Black Saturday',S,'Holy Week (computed from Easter)'],
  [P(4,9),'Araw ng Kagitingan (Day of Valor)',R,''],[P(5,1),'Labor Day',R,''],[P(6,12),'Independence Day',R,''],[ymd_(lm),'National Heroes Day',R,'Last Monday of August'],
  [P(8,21),'Ninoy Aquino Day',S,''],[P(11,1),"All Saints' Day",S,''],[P(11,2),"All Souls' Day",S,'Declared yearly - verify the proclamation'],[P(11,30),'Bonifacio Day',R,''],
  [P(12,8),'Feast of the Immaculate Conception of Mary',S,''],[P(12,24),'Christmas Eve',S,'Declared yearly - verify the proclamation'],[P(12,25),'Christmas Day',R,''],[P(12,30),'Rizal Day',R,''],
  [P(12,31),"New Year's Eve",S,'Declared yearly - verify the proclamation'],[P(2,25),'EDSA People Power Revolution Anniversary',W,'Verify yearly classification']];
 if(CNY_[y])L.push([y+'-'+CNY_[y],'Chinese New Year',S,'Declared yearly - verify the proclamation']);
 return L;}
function api_holidays(t,year){const s=session_(t);need_(s,'me');year=String(year||ymd_(new Date()).slice(0,4));
 return holRows_().filter(x=>x.date.slice(0,4)===year);}
function api_seedHolidays(t,year){const s=session_(t);need_(s,'hol');year=Number(year);
 if(!(year>=2024&&year<=2035))throw new Error('Choose a year between 2024 and 2035.');
 const have={};holRows_().forEach(x=>have[x.date+'|'+x.name.toLowerCase()]=1);
 const sh=holSheet_(),add=[];
 stdHolidays_(year).forEach((h,i)=>{if(have[h[0]+'|'+h[1].toLowerCase()])return;
  add.push(['H'+Utilities.formatDate(new Date(),TZ,'yyMMddHHmmss')+year+String(i).padStart(2,'0'),h[0],h[1],h[2],h[3],String(s.id)]);});
 if(add.length){const r0=sh.getLastRow()+1;sh.getRange(r0,1,add.length,HL_H.length).setNumberFormat('@').setValues(add);}
 log_(s.id,'HOLIDAYS_SEEDED',year+' +'+add.length);CacheService.getScriptCache().remove('feed_'+ymd_(new Date()));return{added:add.length,rows:holRows_().filter(x=>x.date.slice(0,4)===String(year))};}
function api_saveHoliday(t,o){const s=session_(t);need_(s,'hol');o=o||{};const name=String(o.name||'').trim(),type=String(o.type||'');
 if(!isDate_(o.date))throw new Error('Choose the holiday date.');if(name.length<2||name.length>80)throw new Error('Enter the holiday name.');
 if(HOL_TYPES.indexOf(type)<0)throw new Error('Choose the holiday type.');
 const sh=holSheet_();let id=String(o.id||'').trim(),row=id?findRow_('Holidays',id):0;
 if(!row){id='H'+Utilities.formatDate(new Date(),TZ,'yyMMddHHmmss')+Utilities.getUuid().slice(0,2).toUpperCase();row=sh.getLastRow()+1;}
 sh.getRange(row,1,1,HL_H.length).setNumberFormat('@').setValues([[id,o.date,name,type,String(o.note||'').trim().slice(0,200),String(s.id)]]);
 log_(s.id,'HOLIDAY_SAVED',o.date+' '+name);CacheService.getScriptCache().remove('feed_'+ymd_(new Date()));return holRows_().filter(x=>x.date.slice(0,4)===o.date.slice(0,4));}
function api_deleteHoliday(t,id){const s=session_(t);need_(s,'hol');holSheet_();const row=findRow_('Holidays',id);if(!row)throw new Error('Holiday not found.');
 const yr=nd_(sh_('Holidays').getRange(row,2).getValue()).slice(0,4);sh_('Holidays').deleteRow(row);log_(s.id,'HOLIDAY_DELETED',id);CacheService.getScriptCache().remove('feed_'+ymd_(new Date()));return holRows_().filter(x=>x.date.slice(0,4)===yr);}

/* =====================================================================
   NOTIFICATIONS (bell): actions needing approval, updates on my requests, company updates
   ===================================================================== */
function api_notifications(t,mode){memo_();const s=session_(t);need_(s,'me');const personal=mode==='self',today=ymd_(new Date());
 const cc=CacheService.getScriptCache(),ck='nt_'+s.id+'_'+(personal?'s':'w'),hit=cc.get(ck);if(hit){try{return JSON.parse(hit);}catch(e){}}const props=PropertiesService.getScriptProperties(),seen=Number(props.getProperty('nseen_'+s.id))||0,cut=Date.now()-14*864e5;
 const ms=x=>{if(x instanceof Date)return x.getTime();const q=String(x||'').trim();if(!q)return 0;const d=new Date(q.replace(' ','T')+(q.length<=10?'T00:00:00':':00'));return isNaN(d)?0:d.getTime();};
 const items=[];let pend=0;
 if(!personal&&can_(s,'attrep')){
  const a=reqList_(s).filter(x=>x.status==='Pending'&&!x.mine),b=leaveList_(s).filter(x=>x.status==='Pending'&&!x.mine),c=otList_(s).filter(x=>x.status==='Pending'&&!x.mine);pend=a.length+b.length+c.length;
  a.slice(0,8).forEach(x=>items.push({kind:'approval',icon:'todo',title:x.name+' · '+(x.type==='Device change'?'phone change':'log correction'),text:(x.date?x.date+' · ':'')+x.reason,at:ms(x.submitted),tab:'arq'}));
  b.slice(0,8).forEach(x=>items.push({kind:'approval',icon:'todo',title:x.name+' · '+x.type+' leave',text:x.from+(x.to!==x.from?' → '+x.to:'')+' · '+x.days+' day(s)',at:ms(x.filed),tab:'arq'}));
  c.slice(0,8).forEach(x=>items.push({kind:'approval',icon:'todo',title:x.name+' · '+(x.type==='CTO Use'?'use of CTO':'overtime'),text:x.date+' · '+x.hours+'h',at:ms(x.filed),tab:'arq'}));}
 const upd=(what,st,when,by,note,tab,text)=>{const at=ms(when);if(at<cut)return;items.push({kind:'update',icon:st==='Approved'?'ok':'no',title:what+' '+st.toLowerCase(),text:(text?text+' · ':'')+(note?'“'+note+'” ':'')+(by?'· by '+by:''),at:at,tab:tab,unread:at>seen});};
 const me=String(s.id);
 const rq=rqSheet_().getDataRange().getValues();rq.shift();rq.forEach(r=>{if(String(r[2])===me&&(r[10]==='Approved'||r[10]==='Rejected'))upd(r[5]==='Device change'?'Phone change request':'Log correction',r[10],r[12],r[11],r[13],'att',nd_(r[6]));});
 leaveRows_().forEach(l=>{if(l.emp===me&&(l.status==='Approved'||l.status==='Rejected'))upd('Leave ('+l.type+')',l.status,l.at,l.by,l.note,'lv',l.from+(l.to!==l.from?' → '+l.to:''));});
 otRows_().forEach(o=>{if(o.emp===me&&(o.status==='Approved'||o.status==='Rejected'))upd(o.type==='CTO Use'?'CTO request':'Overtime request',o.status,o.at,o.by,o.note,'ot',o.date+' · '+o.hours+'h');});
 const av=anSheet_().getDataRange().getValues();av.shift();
 av.forEach(r=>{if(!String(r[0]).trim())return;const at=r[7] instanceof Date?r[7].getTime():0;if(at<cut)return;if(r[5]&&nd_(r[5])<ymd_(new Date()))return;
  items.push({kind:'company',icon:'co',title:(r[1]==='Notice'?'Announcement: ':'New activity: ')+r[2],text:(r[4]?nd_(r[4])+(r[3]?' · ':''):'')+String(r[3]||'').slice(0,90),at:at,tab:'hr',unread:at>seen});});
 const grp={};holRows_().filter(x=>/^\d{12}/.test(x.id.slice(1,13))&&x.date>=today).forEach(x=>{const k=x.id.slice(1,11);(grp[k]=grp[k]||[]).push(x);});
 Object.keys(grp).forEach(k=>{const a=grp[k],q=a[0].id.slice(1,13),at=new Date(2000+Number(q.slice(0,2)),Number(q.slice(2,4))-1,Number(q.slice(4,6)),Number(q.slice(6,8)),Number(q.slice(8,10)),Number(q.slice(10,12))).getTime();if(!(at>=cut))return;
  items.push({kind:'company',icon:'co',title:a.length>1?'Holiday calendar updated':'Holiday: '+a[0].name,text:a.length>1?a.length+' holidays added · next: '+a[0].name+' ('+a[0].date+')':a[0].date+' · '+a[0].type,at:at,tab:'hr',unread:at>seen});});
 const ord={approval:0,update:1,company:2};items.sort((x,y)=>ord[x.kind]-ord[y.kind]||y.at-x.at);
 const unread=items.filter(x=>x.unread).length;
 const res={items:items.slice(0,40),unread:unread,pending:pend,badge:pend+unread};try{cc.put(ck,JSON.stringify(res),60);}catch(e){}
 return res;}
function api_notifSeen(t){const s=session_(t);need_(s,'me');PropertiesService.getScriptProperties().setProperty('nseen_'+s.id,String(Date.now()));CacheService.getScriptCache().removeAll(['nt_'+s.id+'_s','nt_'+s.id+'_w']);return{ok:true};}

/* =====================================================================
   ROLE PERMISSIONS CONSOLE (Super Admin only)
   ===================================================================== */
function rbacView_(){const m=rbacLoad_();
 return{roles:ROLE_DEFS.map(d=>{const c=m[d.role];return{role:c.role,rank:c.rank,desc:c.desc,perms:c.base,scope:c.scope,groups:c.groups,widgets:c.widgets,levels:c.levels,statuses:c.statuses,custom:c.custom,locked:c.role==='Super Admin'};}),
  catalog:{perms:PERM_CATALOG,groups:G_ALL,widgets:WIDGETS,scopes:SCOPES,levels:LISTS['Position Level'],statuses:LISTS['Employment Status']}};}
function api_rbac(t){const s=session_(t);need_(s,'rbac');return rbacView_();}
function api_saveRoles(t,list){const s=session_(t);need_(s,'rbac');list=list||[];if(!list.length)return rbacView_();
 const lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
  const sh=mkSheet_('Roles',RB_H,[1]),v=sh.getDataRange().getValues(),idx={};for(let i=1;i<v.length;i++)idx[String(v[i][0])]=i+1;
  list.forEach(c=>{const d=ROLE_DEFS.filter(x=>x.role===c.role)[0];if(!d)throw new Error('Unknown role "'+c.role+'".');if(c.role==='Super Admin')throw new Error('The Super Admin role cannot be changed.');
   const t0=cfgFrom_(c.role,d.rank,String(c.desc||d.desc).slice(0,200),(c.perms||[]).map(String),String(c.scope||'own'),(c.groups||[]).map(String),(c.widgets||[]).map(String),(c.levels||[]).map(String),(c.statuses||[]).map(String),true);
   if(c.scope==='all'&&!(t0.levels.length||t0.statuses.length)){/* company-wide */}
   if(t0.base.indexOf('team')<0&&t0.scope!=='own')throw new Error(c.role+': turn on "View employees within the data scope" or set the scope to Own record only.');
   if(c.role==='Employee'&&(t0.scope!=='own'))throw new Error('The Employee role can only see its own record.');
   const row=[c.role,t0.desc,t0.base.join(' '),t0.scope,t0.groups.join('|'),t0.widgets.join(' '),t0.levels.join('|'),t0.statuses.join('|'),String(s.id),new Date()],r=idx[c.role]||(sh.getLastRow()+1);
   sh.getRange(r,1,1,RB_H.length).setNumberFormat('@').setValues([row]);idx[c.role]=r;});
  CacheService.getScriptCache().remove('rbac');_RC=null;log_(s.id,'ROLES_SAVED',list.map(x=>x.role).join(', '));return rbacView_();
 }finally{lock.releaseLock();}}
function api_resetRole(t,role){const s=session_(t);need_(s,'rbac');role=String(role||'');
 if(!ROLE_DEFS.some(d=>d.role===role)||role==='Super Admin')throw new Error('This role cannot be reset.');
 const sh=mkSheet_('Roles',RB_H,[1]),row=findRow_('Roles',role);if(row)sh.deleteRow(row);
 CacheService.getScriptCache().remove('rbac');_RC=null;log_(s.id,'ROLE_RESET',role);return rbacView_();}

/* =====================================================================
   LEAVE CREDITS: yearly renewal for Regular employees + manual input (HR)
   ===================================================================== */
const LEAVE_AUTO_STATUSES=['Regular'];   // these statuses get the yearly leave credits automatically every January 1; others get 0 unless HR enters them manually
const LC_H=['Key','Employee Number','Year','Credit','Note','Set By','Set At'];
const lcSheet_=()=>mkSheet_('LeaveCredits',LC_H,[1,2,3]);
let _LCM=null;
function lcMap_(){if(_LCM)return _LCM;_LCM={};const v=lcSheet_().getDataRange().getValues();v.shift();
 v.forEach(r=>{if(String(r[0]).trim())_LCM[String(r[1])+'|'+String(r[2])]={credit:Number(r[3])||0,note:String(r[4]||'')};});return _LCM;}
function api_leaveCredits(t,year){memo_();const s=session_(t);need_(s,'lvcr');year=String(year||ymd_(new Date()).slice(0,4));
 const used={},pend={};leaveRows_().forEach(l=>{if(l.from.slice(0,4)!==year||isSpecial_(l.type))return;if(l.status==='Approved')used[l.emp]=(used[l.emp]||0)+l.pay;else if(l.status==='Pending')pend[l.emp]=(pend[l.emp]||0)+l.pay;});
 const m=lcMap_();
 const rows=rows_('Employees').filter(e=>{const id=String(e['Employee Number']);return id!=='ADMIN'&&e['Status']!=='Inactive'&&inScope_(s,id,e['Department'],e['Immediate Head (Emp No)']);})
  .map(e=>{const id=String(e['Employee Number']),def=leaveCredit_(e),ov=m[id+'|'+year],cr=ov?ov.credit:def,u=used[id]||0,p=pend[id]||0;
   return{id:id,name:((e['Surname']||'')+', '+(e['First Name']||'')).trim(),dept:e['Department'],level:e['Position Level'],status:e['Employment Status']||'',def:def,credit:cr,used:u,pending:p,available:Math.max(0,r2_(cr-u-p)),manual:!!ov,note:ov?ov.note:''};})
  .sort((a,b)=>a.name>b.name?1:-1);
 return{year:year,rows:rows,auto:LEAVE_AUTO_STATUSES};}
function api_setLeaveCredit(t,o){const s=session_(t);need_(s,'lvcr');o=o||{};const id=String(o.id||'').trim(),year=String(o.year||ymd_(new Date()).slice(0,4)),av=Number(o.available),note=String(o.note||'').trim();
 const e=empRec_(id);if(!e)throw new Error('Employee not found.');
 if(!inScope_(s,id,e['Department'],e['Immediate Head (Emp No)']))throw new Error('You do not have access to this employee.');
 if(!(av>=0&&av<=120)||Math.round(av*2)!==av*2)throw new Error('Enter the available leave in days (0 to 120, in half-day steps).');
 if(note.length<3)throw new Error('Enter the reason or source of this leave balance (for the audit trail).');
 let used=0,pend=0;leaveRows_().forEach(l=>{if(l.emp!==id||l.from.slice(0,4)!==year||isSpecial_(l.type))return;if(l.status==='Approved')used+=l.pay;else if(l.status==='Pending')pend+=l.pay;});
 const credit=r2_(av+used+pend),sh=lcSheet_(),key=id+'|'+year;let row=findRow_('LeaveCredits',key);if(!row)row=sh.getLastRow()+1;
 sh.getRange(row,1,1,LC_H.length).setNumberFormat('@').setValues([[key,id,year,credit,note.slice(0,200),String(s.id),new Date()]]);
 _LCM=null;log_(s.id,'LEAVE_CREDIT_SET',id+' '+year+' available '+av);return{ok:true};}
function api_resetLeaveCredit(t,id,year){const s=session_(t);need_(s,'lvcr');year=String(year||ymd_(new Date()).slice(0,4));id=String(id||'');
 const e=empRec_(id);if(!e)throw new Error('Employee not found.');if(!inScope_(s,id,e['Department'],e['Immediate Head (Emp No)']))throw new Error('You do not have access to this employee.');
 lcSheet_();const row=findRow_('LeaveCredits',id+'|'+year);if(row)sh_('LeaveCredits').deleteRow(row);_LCM=null;log_(s.id,'LEAVE_CREDIT_RESET',id+' '+year);return{ok:true};}
function api_setLeavePay(t,id,mode){const s=session_(t);need_(s,'att');const row=findRow_('Leaves',id);if(!row)throw new Error('Leave not found.');
 const lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
  const sh=lvSheet_(),r=sh.getRange(row,1,1,LV_H.length).getValues()[0],l=lvObj_(r);
  if(l.emp!==String(s.id))throw new Error('This is not your leave application.');if(l.status!=='Pending')throw new Error('The pay choice can only be changed while the application is pending.');
  const e=empRec_(s.id),sbb=isSpecial_(l.type)?specialBal_(s.id,e,+l.from.slice(0,4)).filter(x=>x.type===l.type)[0]:null,avail=(sbb?sbb.available:leaveBal_(s.id,e,+l.from.slice(0,4)).remaining)+l.pay;
  const pay=mode==='without'?0:Math.min(l.days,avail),nopay=r2_(l.days-pay);
  sh.getRange(row,11,1,2).setValues([[pay,nopay]]);log_(s.id,'LEAVE_PAY_CHANGED',id+' '+(mode==='without'?'without pay':'with pay'));return{ok:true,pay:pay,nopay:nopay};
 }finally{lock.releaseLock();}}

/* =====================================================================
   SPECIAL LEAVE CREDITS (Single Parent 7 days, Calamity 3 days, Bereavement 3 days - all with pay)
   Separate from the yearly Vacation/Sick credits. Set up by Super Admin, Admin and HR (permission "lvcr").
   Types: sheet SpecialLeaveTypes | per-employee assignments: sheet SpecialLeaveGrants
   ===================================================================== */
const SL_H=['Type','Days','Eligibility','Active'];
const SL_SEED=[['Single Parent Leave',7,'assigned','Yes'],['Calamity Leave',3,'all','Yes'],['Bereavement Leave',3,'all','Yes']];
const SL_ELIG=['all','regular','assigned'];
const SG_H=['Key','Employee Number','Year','Type','Days','Note','Set By','Set At'];
function slSheet_(){const s=mkSheet_('SpecialLeaveTypes',SL_H,[1]);if(s.getLastRow()<2)s.getRange(2,1,SL_SEED.length,SL_H.length).setValues(SL_SEED);return s;}
const sgSheet_=()=>mkSheet_('SpecialLeaveGrants',SG_H,[1,2,3,4]);
let _SLT=null,_SGM=null;
function slTypes_(){if(!_SLT){const v=slSheet_().getDataRange().getValues();v.shift();
 _SLT=v.filter(r=>String(r[0]).trim()!=='').map(r=>({type:String(r[0]).trim(),days:Number(r[1])||0,elig:SL_ELIG.indexOf(String(r[2]).trim())>=0?String(r[2]).trim():'assigned',active:String(r[3]||'Yes').trim().toLowerCase()!=='no'}));}return _SLT;}
function sgMap_(){if(!_SGM){_SGM={};const v=sgSheet_().getDataRange().getValues();v.shift();
 v.forEach(r=>{if(String(r[0]).trim())_SGM[String(r[1])+'|'+String(r[2])+'|'+String(r[3])]={days:Number(r[4])||0,note:String(r[5]||'')};});}return _SGM;}
const isSpecial_=ty=>slTypes_().some(x=>x.type===ty);
function specialBal_(id,e,year){const g=sgMap_(),ls=leaveRows_().filter(l=>l.emp===String(id)&&l.from.slice(0,4)===String(year));
 return slTypes_().filter(x=>x.active).map(x=>{const gr=g[String(id)+'|'+year+'|'+x.type];
  const ent=gr?gr.days:(x.elig==='all'?x.days:(x.elig==='regular'&&String(e['Employment Status']||'')==='Regular'?x.days:0));
  let used=0,pend=0;ls.forEach(l=>{if(l.type!==x.type)return;if(l.status==='Approved')used+=l.pay;else if(l.status==='Pending')pend+=l.pay;});
  return{type:x.type,days:ent,def:x.days,elig:x.elig,used:r2_(used),pending:r2_(pend),available:Math.max(0,r2_(ent-used-pend)),granted:!!gr,note:gr?gr.note:''};});}
function api_specialLeave(t,year){memo_();const s=session_(t);need_(s,'lvcr');year=String(year||ymd_(new Date()).slice(0,4));
 const em={};rows_('Employees').forEach(e=>{em[String(e['Employee Number'])]=e;});
 const types=slTypes_(),g=sgMap_(),ls=leaveRows_().filter(l=>l.from.slice(0,4)===year),grants=[];
 Object.keys(g).forEach(k=>{const q=k.split('|');if(q[1]!==year)return;const e=em[q[0]];if(!e||!inScope_(s,q[0],e['Department'],e['Immediate Head (Emp No)']))return;
  let used=0,pend=0;ls.forEach(l=>{if(l.emp!==q[0]||l.type!==q[2])return;if(l.status==='Approved')used+=l.pay;else if(l.status==='Pending')pend+=l.pay;});
  grants.push({emp:q[0],name:((e['Surname']||'')+', '+(e['First Name']||'')).trim(),dept:e['Department'],type:q[2],days:g[k].days,used:r2_(used),pending:r2_(pend),available:Math.max(0,r2_(g[k].days-used-pend)),note:g[k].note});});
 const count={};types.forEach(x=>{count[x.type]=0;});
 Object.keys(em).forEach(id=>{const e=em[id];if(id==='ADMIN'||e['Status']==='Inactive')return;
  types.forEach(x=>{if(!x.active)return;const gr=g[id+'|'+year+'|'+x.type];const ent=gr?gr.days:(x.elig==='all'?x.days:(x.elig==='regular'&&String(e['Employment Status']||'')==='Regular'?x.days:0));if(ent>0)count[x.type]++;});});
 return{year:year,types:types.map(x=>Object.assign({entitled:count[x.type]||0},x)),grants:grants.sort((a,b)=>a.name>b.name?1:-1)};}
function api_saveSpecialType(t,o){const s=session_(t);need_(s,'lvcr');o=o||{};const name=String(o.type||'').trim(),days=Number(o.days),elig=String(o.elig||'');
 if(name.length<3||name.length>40)throw new Error('Enter the name of the special leave (3 to 40 characters).');
 if(LEAVE_TYPES.some(x=>x.toLowerCase()===name.toLowerCase()))throw new Error('"'+name+'" is already a standard leave type.');
 if(!(days>=0&&days<=60)||Math.round(days*2)!==days*2)throw new Error('Enter the days per year (0 to 60, in half-day steps).');
 if(SL_ELIG.indexOf(elig)<0)throw new Error('Choose who gets this leave.');
 const sh=slSheet_();let row=findRow_('SpecialLeaveTypes',name);if(!row)row=sh.getLastRow()+1;
 sh.getRange(row,1,1,SL_H.length).setNumberFormat('@').setValues([[name,days,elig,o.active===false?'No':'Yes']]);_SLT=null;
 log_(s.id,'SPECIAL_LEAVE_TYPE',name+' '+days+'d '+elig);return api_specialLeave(t,'');}
function api_grantSpecial(t,o){const s=session_(t);need_(s,'lvcr');o=o||{};const id=String(o.id||'').trim(),type=String(o.type||''),year=String(o.year||ymd_(new Date()).slice(0,4)),days=Number(o.days),note=String(o.note||'').trim();
 if(!slTypes_().some(x=>x.type===type))throw new Error('Choose the special leave.');
 const e=empRec_(id);if(!e)throw new Error('Employee not found.');
 if(!inScope_(s,id,e['Department'],e['Immediate Head (Emp No)']))throw new Error('You do not have access to this employee.');
 if(!(days>=0&&days<=60)||Math.round(days*2)!==days*2)throw new Error('Enter the days (0 to 60, in half-day steps).');
 if(note.length<3)throw new Error('Enter the reason or reference (for the audit trail), e.g. solo parent ID number.');
 const sh=sgSheet_(),key=id+'|'+year+'|'+type;let row=findRow_('SpecialLeaveGrants',key);if(!row)row=sh.getLastRow()+1;
 sh.getRange(row,1,1,SG_H.length).setNumberFormat('@').setValues([[key,id,year,type,days,note.slice(0,200),String(s.id),new Date()]]);_SGM=null;
 log_(s.id,'SPECIAL_LEAVE_GRANT',id+' '+type+' '+days+'d '+year);return api_specialLeave(t,year);}
function api_removeSpecial(t,id,type,year){const s=session_(t);need_(s,'lvcr');year=String(year||ymd_(new Date()).slice(0,4));id=String(id||'');
 const e=empRec_(id);if(!e)throw new Error('Employee not found.');if(!inScope_(s,id,e['Department'],e['Immediate Head (Emp No)']))throw new Error('You do not have access to this employee.');
 sgSheet_();const row=findRow_('SpecialLeaveGrants',id+'|'+year+'|'+type);if(row)sh_('SpecialLeaveGrants').deleteRow(row);_SGM=null;
 log_(s.id,'SPECIAL_LEAVE_REMOVED',id+' '+type+' '+year);return api_specialLeave(t,year);}

/* =====================================================================
   CAPACITY: monthly archive of old attendance & login history (keeps the main sheets small and fast)
   A Google spreadsheet holds at most 10 million cells; ~700 employees x ~300 days x 27 columns of attendance is ~5.7 million cells per year.
   ===================================================================== */
const ATT_KEEP_MONTHS=6;     // attendance older than this many months moves to a yearly archive spreadsheet
const LOG_KEEP_DAYS=90;      // login history older than this moves to the archive
const ARCH_BATCH=20000;      // rows moved per run (stays inside Apps Script's time limit; the next run continues)
function archBook_(kind,year){const p=PropertiesService.getScriptProperties(),k='arch_'+kind+'_'+year;let id=p.getProperty(k);
 if(id){try{return SpreadsheetApp.openById(id);}catch(e){}}
 const b=SpreadsheetApp.create('HRIS '+(kind==='att'?'Attendance':'Login history')+' archive '+year);p.setProperty(k,b.getId());return b;}
function archSheetWrite_(kind,year,head,name){const b=archBook_(kind,year);let s=b.getSheetByName(name);
 if(!s){s=b.getSheets()[0];s.setName(name);s.getRange(1,1,1,head.length).setValues([head]).setFontWeight('bold');s.setFrozenRows(1);}return s;}
function archSheetRead_(year){const id=PropertiesService.getScriptProperties().getProperty('arch_att_'+year);if(!id)return null;
 try{return SpreadsheetApp.openById(id).getSheetByName('Attendance');}catch(e){return null;}}
function archiveOldData(){const lock=LockService.getScriptLock();if(!lock.tryLock(30000))return'Another task is running; try again in a minute.';const out=[];
 try{
  const p=PropertiesService.getScriptProperties(),now=new Date();
  // 1. attendance: move the oldest rows (the sheet is in date order, so they are a block at the top)
  const cut=ymd_(new Date(now.getFullYear(),now.getMonth()-ATT_KEEP_MONTHS,1)),sh=atSheet_(),n=sh.getLastRow()-1;
  if(n>0){const dts=sh.getRange(2,A.date+1,n,1).getValues();let k=0;while(k<n&&k<ARCH_BATCH&&nd_(dts[k][0])<cut)k++;
   if(k>0){const rows=sh.getRange(2,1,k,AT_H.length).getValues(),by={};
    rows.forEach(r=>{const y=nd_(r[A.date]).slice(0,4);(by[y]=by[y]||[]).push(r);});
    Object.keys(by).forEach(y=>{const a=archSheetWrite_('att',y,AT_H,'Attendance'),st=a.getLastRow()+1;
     a.getRange(st,1,by[y].length,3).setNumberFormat('@');a.getRange(st,1,by[y].length,AT_H.length).setValues(by[y]);});
    SpreadsheetApp.flush();sh.deleteRows(2,k);
    p.setProperty('att_first',sh.getLastRow()>1?nd_(sh.getRange(2,A.date+1).getValue()):cut);
    out.push('Attendance: '+k+' row(s) archived');}}
  // 2. login history
  const lh=sh_('LoginHistory');if(lh&&lh.getLastRow()>1){const m=lh.getLastRow()-1,ts=lh.getRange(2,1,m,1).getValues(),lim=new Date(now.getTime()-LOG_KEEP_DAYS*864e5);let k=0;
   while(k<m&&k<ARCH_BATCH&&ts[k][0] instanceof Date&&ts[k][0]<lim)k++;
   if(k>0){const head=lh.getRange(1,1,1,4).getValues()[0],rows=lh.getRange(2,1,k,4).getValues(),by={};
    rows.forEach(r=>{const y=String(r[0].getFullYear());(by[y]=by[y]||[]).push(r);});
    Object.keys(by).forEach(y=>{const a=archSheetWrite_('log',y,head,'LoginHistory');a.getRange(a.getLastRow()+1,1,by[y].length,4).setValues(by[y]);});
    SpreadsheetApp.flush();lh.deleteRows(2,k);out.push('Login history: '+k+' row(s) archived');}}
 }finally{lock.releaseLock();}
 return out.join('; ')||'Nothing to archive yet.';}
function setupMaintenance(){ScriptApp.getProjectTriggers().filter(t=>t.getHandlerFunction()==='archiveOldData').forEach(t=>ScriptApp.deleteTrigger(t));
 ScriptApp.newTrigger('archiveOldData').timeBased().onMonthDay(1).atHour(2).create();
 const r=archiveOldData();notify_('Monthly archive is on (1st of every month, about 2 AM).\n\nThis run: '+r+'\n\nAttendance older than '+ATT_KEEP_MONTHS+' months and login history older than '+LOG_KEEP_DAYS+' days move to archive spreadsheets in your Drive. Reports still include archived days automatically.');}
