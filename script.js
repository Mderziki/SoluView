// SoluView Interactive Features
window.addEventListener("scroll",function(){
  const h=document.querySelector(".header");
  if(window.scrollY>50)h.classList.add("scrolled");
  else h.classList.remove("scrolled");
});
