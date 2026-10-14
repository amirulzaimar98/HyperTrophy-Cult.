const STORAGE_KEY = "twoday-workout-v1";
const starterPlan = {
  A: [
    {name:"Chest press / Push-up", muscle:"Chest", gym:"Barbell or dumbbell bench press", home:"Push-ups; use an incline if needed", sets:3,reps:"8–12"},
    {name:"Row", muscle:"Back · lats", gym:"Seated cable row", home:"One-arm row with 12 kg dumbbell, each side", sets:3,reps:"8–12 / side"},
    {name:"Squat", muscle:"Quads · glutes", gym:"Barbell squat or leg press", home:"12 kg goblet squat", sets:3,reps:"10–15"},
    {name:"Romanian deadlift", muscle:"Hamstrings · glutes · lower back", gym:"Barbell or dumbbell Romanian deadlift", home:"Single-leg hip hinge holding dumbbell", sets:3,reps:"8–12"},
    {name:"Shoulder press", muscle:"Shoulders · triceps", gym:"Seated dumbbell shoulder press", home:"Single-arm overhead press, if 12 kg is manageable", sets:3,reps:"8–12 / side"},
    {name:"Biceps curl", muscle:"Biceps · forearms", gym:"Dumbbell or cable curl", home:"Single-arm curl; no swinging", sets:2,reps:"8–12 / side"},
    {name:"Triceps extension", muscle:"Triceps", gym:"Cable pushdown", home:"Two-hand overhead extension if comfortable", sets:2,reps:"10–15"},
    {name:"Calf raise", muscle:"Calves", gym:"Calf raise machine", home:"Single-leg calf raise; hold dumbbell only if safe", sets:3,reps:"12–20"},
    {name:"Plank", muscle:"Abs · deep core", gym:"Forearm plank", home:"Forearm plank", sets:3,reps:"30–60 sec"},
    {name:"Reverse crunch", muscle:"Abs · lower core", gym:"Reverse crunch", home:"Reverse crunch on floor", sets:2,reps:"10–15"}
  ],
  B: [
    {name:"Incline press / Push-up", muscle:"Chest · front shoulders", gym:"Incline dumbbell or barbell press", home:"Standard push-up or feet-elevated push-up if strong enough", sets:3,reps:"8–12"},
    {name:"Vertical pull / Row", muscle:"Lats · upper back · biceps", gym:"Lat pulldown", home:"One-arm dumbbell row, elbow close to body", sets:3,reps:"10–15 / side"},
    {name:"Split squat", muscle:"Quads · glutes · adductors", gym:"Dumbbell or Smith-machine split squat", home:"Bodyweight or 12 kg split squat", sets:3,reps:"8–12 / leg"},
    {name:"Hip thrust / Glute bridge", muscle:"Glutes · hamstrings", gym:"Barbell hip thrust", home:"Glute bridge; secure dumbbell across hips or use single-leg version", sets:3,reps:"10–15"},
    {name:"Side/rear shoulder raise", muscle:"Side delts · rear delts", gym:"Lateral raise and reverse fly", home:"Use a lighter household item; 12 kg may be too heavy", sets:2,reps:"12–20"},
    {name:"Hammer curl", muscle:"Biceps · brachialis · forearms", gym:"Dumbbell hammer curl", home:"Single-arm neutral-grip curl if manageable", sets:2,reps:"8–12 / side"},
    {name:"Triceps extension / Close push-up", muscle:"Triceps · chest", gym:"Cable overhead triceps extension", home:"Close-grip or incline close-grip push-up", sets:2,reps:"8–15"},
    {name:"Single-leg calf raise", muscle:"Calves", gym:"Standing calf raise machine", home:"Single-leg calf raise, holding support for balance", sets:3,reps:"12–20 / leg"},
    {name:"Side plank", muscle:"Obliques · lateral core", gym:"Side plank", home:"Side plank", sets:2,reps:"20–45 sec / side"},
    {name:"Bird dog", muscle:"Deep core · spinal stability", gym:"Bird dog", home:"Bird dog on hands and knees", sets:2,reps:"8–12 / side"}
  ]
};
let state = loadState();
let activeDay = "A";
let locationMode = "gym";
let timerSeconds = 90;
let timerRemaining = 90;
let timerInterval = null;

function loadState(){
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {history:saved.history || [], custom:saved.custom || [], logs:saved.logs || {}, reminder:saved.reminder || {time:"18:00",days:[3,6]}};
  } catch { return {history:[],custom:[],logs:{},reminder:{time:"18:00",days:[3,6]}}; }
}
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function escapeHTML(value){return String(value).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function toast(message){const el=document.querySelector("#toast");el.textContent=message;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),2500);}
function getPlan(){return [...starterPlan[activeDay],...state.custom.filter(x=>x.day===activeDay || x.day==="both")];}
function logKey(day,exerciseIndex){return `${day}-${locationMode}-${exerciseIndex}`;}

function renderExercises(){
  const plan=getPlan();
  document.querySelector("#session-summary").innerHTML=`<span>${activeDay==="A"?"DAY 01 · FULL BODY A":"DAY 02 · FULL BODY B"}</span><span>${plan.length} exercises · ${locationMode==="gym"?"Gym session":"Home · 12 kg dumbbell"}</span>`;
  document.querySelector("#exercise-list").innerHTML=plan.map((ex,i)=>{
    const key=logKey(activeDay,i);
    const saved=state.logs[key]||{};
    const alternative=locationMode==="gym"?(ex.gym||ex.home||"Custom exercise"):(ex.home||ex.gym||"Custom exercise");
    const sets=Number(ex.sets)||3;
    return `<article class="exercise-card">
      <div class="exercise-top"><div class="exercise-number">${String(i+1).padStart(2,"0")}</div><div class="exercise-main"><h3>${escapeHTML(ex.name)}</h3><span class="muscle-tag">${escapeHTML(ex.muscle)}</span>
      <div class="exercise-option"><strong>${locationMode==="gym"?"Gym version":"Home version"}</strong>${escapeHTML(alternative)}</div>
      <div class="exercise-controls">
        <label>Sets<input type="number" min="1" max="10" value="${saved.sets ?? sets}" data-field="sets" data-key="${key}"></label>
        <label>Target reps<input type="text" maxlength="20" value="${escapeHTML(saved.reps ?? ex.reps)}" data-field="reps" data-key="${key}"></label>
        <label>Weight (kg)<input type="number" min="0" max="500" step="0.5" placeholder="Optional" value="${saved.weight ?? ""}" data-field="weight" data-key="${key}"></label>
      </div>
      <div class="set-checks">${Array.from({length:sets},(_,n)=>`<label class="set-check ${(saved.completed||[]).includes(n)?"done":""}"><input type="checkbox" data-set="${n}" data-key="${key}" ${(saved.completed||[]).includes(n)?"checked":""}> Set ${n+1}</label>`).join("")}</div>
      </div></div>
    </article>`;
  }).join("");
  document.querySelectorAll("[data-field]").forEach(input=>input.addEventListener("change",()=>{
    const key=input.dataset.key;state.logs[key]=state.logs[key]||{};
    state.logs[key][input.dataset.field]=input.value;saveState();
  }));
  document.querySelectorAll("[data-set]").forEach(input=>input.addEventListener("change",()=>{
    const key=input.dataset.key;state.logs[key]=state.logs[key]||{};
    state.logs[key].completed=state.logs[key].completed||[];
    const n=Number(input.dataset.set);
    state.logs[key].completed=input.checked?[...new Set([...state.logs[key].completed,n])]:state.logs[key].completed.filter(x=>x!==n);
    input.closest(".set-check").classList.toggle("done",input.checked);saveState();
  }));
}
function renderCustom(){
  const root=document.querySelector("#custom-list");
  if(!state.custom.length){root.innerHTML='<p class="empty">Your custom exercises will appear here.</p>';return;}
  root.innerHTML=state.custom.map((x,i)=>`<div class="custom-row"><div><strong>${escapeHTML(x.name)}</strong><small>${escapeHTML(x.muscle)} · ${x.sets} sets × ${escapeHTML(x.reps)} · Day ${x.day==="both"?"A & B":x.day}</small></div><button class="text-button" data-remove="${i}">Remove</button></div>`).join("");
  root.querySelectorAll("[data-remove]").forEach(btn=>btn.addEventListener("click",()=>{state.custom.splice(Number(btn.dataset.remove),1);saveState();renderCustom();renderExercises();}));
}
function renderProgress(){
  document.querySelector("#stat-sessions").textContent=state.history.length;
  document.querySelector("#stat-sets").textContent=state.history.reduce((sum,h)=>sum+h.sets,0);
  const dates=[...new Set(state.history.map(h=>h.date))].sort().reverse();
  let streak=0;
  if(dates.length){let d=new Date();d.setHours(0,0,0,0);if(!dates.includes(dateString(d)))d.setDate(d.getDate()-1);while(dates.includes(dateString(d))){streak++;d.setDate(d.getDate()-1);}}
  document.querySelector("#stat-streak").textContent=`${streak} day${streak===1?"":"s"}`;
  const hist=document.querySelector("#history-list");
  hist.innerHTML=state.history.length?state.history.slice().reverse().slice(0,12).map(h=>`<div class="history-item"><div><strong>Full Body ${escapeHTML(h.day)} · ${escapeHTML(h.location)}</strong><small>${escapeHTML(h.date)} · ${h.sets} sets completed</small></div><small>${escapeHTML(h.time)}</small></div>`).join(""):'<p class="empty">Complete a session to start building your history.</p>';
  const logs=Object.entries(state.logs).filter(([,v])=>v.completed&&v.completed.length);
  document.querySelector("#exercise-history").innerHTML=logs.length?logs.slice(-10).reverse().map(([key,v])=>`<div class="history-item"><div><strong>${escapeHTML(key.replaceAll("-"," · "))}</strong><small>${v.completed.length} set(s) marked complete${v.weight?` · ${escapeHTML(v.weight)} kg`:""}</small></div><small>${escapeHTML(v.reps||"")}</small></div>`).join(""):'<p class="empty">Tick completed sets during a workout to see them here.</p>';
}
function dateString(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
function switchView(view){
  document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  document.querySelectorAll(".view").forEach(s=>s.classList.toggle("active",s.id===`view-${view}`));
  if(view==="progress")renderProgress();if(view==="builder")renderCustom();
}
document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>switchView(b.dataset.view)));
document.querySelectorAll("[data-day]").forEach(b=>b.addEventListener("click",()=>{activeDay=b.dataset.day;document.querySelectorAll("[data-day]").forEach(x=>x.classList.toggle("selected",x===b));renderExercises();}));
document.querySelectorAll("[data-location]").forEach(b=>b.addEventListener("click",()=>{locationMode=b.dataset.location;document.querySelectorAll("[data-location]").forEach(x=>x.classList.toggle("active",x===b));renderExercises();}));

document.querySelector("#finish-session").addEventListener("click",()=>{
  const keys=Object.keys(state.logs).filter(k=>k.startsWith(`${activeDay}-${locationMode}-`));
  const sets=keys.reduce((sum,k)=>sum+((state.logs[k].completed||[]).length),0);
  if(!sets && !confirm("You have not marked any sets complete. Save this session anyway?"))return;
  const now=new Date();
  state.history.push({day:activeDay,location:locationMode==="gym"?"Gym":"Home",date:dateString(now),time:now.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}),sets});
  saveState();renderProgress();toast("Session saved. Nice work!");
});
document.querySelector("#builder-form").addEventListener("submit",e=>{
  e.preventDefault();
  const dayChoice=prompt("Add this exercise to Day A, Day B, or both? Enter A, B, or both.","both");
  const day=(dayChoice||"both").toLowerCase();
  if(!["a","b","both"].includes(day)){toast("Enter A, B, or both.");return;}
  state.custom.push({name:document.querySelector("#custom-name").value.trim(),muscle:document.querySelector("#custom-muscle").value,gym:document.querySelector("#custom-gym").value.trim(),home:document.querySelector("#custom-home").value.trim(),sets:Number(document.querySelector("#custom-sets").value),reps:document.querySelector("#custom-reps").value.trim(),day});
  saveState();e.target.reset();document.querySelector("#custom-sets").value=3;document.querySelector("#custom-reps").value="8–12";renderCustom();renderExercises();toast("Custom exercise added.");
});
document.querySelector("#clear-custom").addEventListener("click",()=>{if(confirm("Remove all custom exercises?")){state.custom=[];saveState();renderCustom();renderExercises();}});
document.querySelector("#export-data").addEventListener("click",()=>{
  const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="twoday-workout-backup.json";a.click();URL.revokeObjectURL(url);
});
document.querySelector("#clear-history").addEventListener("click",()=>{
  if(confirm("Delete all saved history, custom exercises, and workout logs? This cannot be undone.")){state={history:[],custom:[],logs:{},reminder:state.reminder};saveState();renderProgress();renderCustom();renderExercises();toast("Saved workout data deleted.");}
});

// Reminder preferences. Web notifications are best-effort and generally require the page to remain open.
function loadReminderUI(){
  document.querySelector("#reminder-time").value=state.reminder.time||"18:00";
  document.querySelectorAll("#reminder-days input").forEach(c=>c.checked=(state.reminder.days||[]).includes(Number(c.value)));
}
document.querySelector("#save-reminder").addEventListener("click",async()=>{
  state.reminder.time=document.querySelector("#reminder-time").value;
  state.reminder.days=[...document.querySelectorAll("#reminder-days input:checked")].map(c=>Number(c.value));
  saveState();
  if("Notification" in window && Notification.permission==="default"){
    try{await Notification.requestPermission();}catch{}
  }
  document.querySelector("#reminder-status").textContent=NotificationSupported()?"Reminder preferences saved. Keep this page open for best-effort reminders.":"Preferences saved, but this browser does not support notifications.";
  toast("Reminder preferences saved.");
});
function NotificationSupported(){return "Notification" in window && Notification.permission==="granted";}
document.querySelector("#test-reminder").addEventListener("click",async()=>{
  if(!("Notification" in window)){document.querySelector("#reminder-status").textContent="Notifications are not supported by this browser.";return;}
  if(Notification.permission!=="granted"){const permission=await Notification.requestPermission();if(permission!=="granted"){document.querySelector("#reminder-status").textContent="Notification permission was not granted.";return;}}
  new Notification("TwoDay workout reminder",{body:"Time to move. Start your next full-body session when you're ready."});
  document.querySelector("#reminder-status").textContent="Test notification sent.";
});
function checkReminder(){
  if(!NotificationSupported())return;
  const now=new Date(),r=state.reminder;
  if(!(r.days||[]).includes(now.getDay()))return;
  const [h,m]=(r.time||"18:00").split(":").map(Number);
  const marker=`${dateString(now)}-${h}:${m}`;
  if(now.getHours()===h&&now.getMinutes()===m&&sessionStorage.getItem("twoday-reminded")!==marker){
    new Notification("TwoDay workout reminder",{body:"Your planned workout is waiting. Start with a warm-up."});
    sessionStorage.setItem("twoday-reminded",marker);
  }
}
setInterval(checkReminder,30000);

// Rest timer
function renderTimer(){const m=Math.floor(timerRemaining/60),s=timerRemaining%60;document.querySelector("#timer-display").textContent=`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;}
document.querySelectorAll("[data-seconds]").forEach(b=>b.addEventListener("click",()=>{timerSeconds=Number(b.dataset.seconds);timerRemaining=timerSeconds;renderTimer();}));
document.querySelector("#timer-start").addEventListener("click",()=>{
  if(timerInterval){clearInterval(timerInterval);timerInterval=null;document.querySelector("#timer-start").textContent="Resume";return;}
  document.querySelector("#timer-start").textContent="Pause";
  timerInterval=setInterval(()=>{
    timerRemaining--;renderTimer();
    if(timerRemaining<=0){clearInterval(timerInterval);timerInterval=null;document.querySelector("#timer-start").textContent="Start";if("Notification" in window&&Notification.permission==="granted")new Notification("Rest finished",{body:"Your next set is ready when you are."});else toast("Rest finished — next set when ready.");}
  },1000);
});
document.querySelector("#timer-reset").addEventListener("click",()=>{clearInterval(timerInterval);timerInterval=null;timerRemaining=timerSeconds;renderTimer();document.querySelector("#timer-start").textContent="Start";});

if("serviceWorker" in navigator && location.protocol.startsWith("http")){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));}
loadReminderUI();renderExercises();renderCustom();renderProgress();renderTimer();
