(function(){
var b=document.getElementById('open');
function go(){if(window.CloudSecret)window.CloudSecret.open(false)}
b.addEventListener('click',go);
window.addEventListener('load',function(){if(location.hash==='#open')go()});
})();
