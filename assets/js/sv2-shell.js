(() => {
 'use strict';
 if(window.CampusShell)return;window.CampusShell=true;
 const root=new URL('../../',document.currentScript.src),key='campusmind.theme.v1';
 try{document.documentElement.dataset.theme=localStorage.getItem(key)==='dark'?'dark':'light';}catch{}
 const render=()=>{
  const main=document.querySelector('main');
  if(main&&!document.querySelector('.brand-logo')){const a=document.createElement('a');a.className='campus-brand';a.href=new URL('index.html',root);const img=document.createElement('img');img.src=new URL('assets/images/campusmind-logo.png',root);img.alt='';img.className='brand-logo';a.append(img,document.createTextNode('CampusMind'));(document.querySelector('.sidebar')||main).prepend(a);}
  for(const img of document.querySelectorAll('main > a > .brand-logo')){const a=img.parentElement;a.classList.add('campus-brand');if(!a.textContent.trim()){img.alt='';a.append(document.createTextNode('CampusMind'));}}
  if(!document.querySelector('.campus-support')){const footer=document.querySelector('.site-footer')||document.createElement('footer');footer.classList.add('campus-support');for(const p of footer.querySelectorAll('p'))if(p.textContent.trim()==='Bản prototype học phần CSE122')p.remove();const p=document.createElement('p');p.textContent='CampusMind không phải dịch vụ khẩn cấp. Nếu có nguy hiểm tức thời, hãy tìm sự trợ giúp trực tiếp từ người đáng tin cậy hoặc cơ sở cấp cứu gần nhất.';const a=document.createElement('a');a.href=new URL('policies.html',root);a.textContent='Thông tin sử dụng và quyền riêng tư';footer.append(p,a);if(!document.body.dataset.role){const note=document.createElement('p');note.textContent='Thông tin minh họa cho mục đích học tập';footer.append(note);}if(!footer.isConnected)document.body.append(footer);}
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render,{once:true});else render();
})();
