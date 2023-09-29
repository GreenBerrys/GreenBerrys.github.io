
let dialogBackVal = undefined;  // Rückgabewert dialoge  (ok/abbruch)
let sorting = 0;                // Sortierung
let sortDir = 0;                // Sortierrichtung
let todoView = 0;               // Ansicht liste/karten

// ====================================== FUNKTIONEN ====================
// ------------------------------------------------------
function newTodo(dialog = null)
{
const todoNodeTxt=      "<div class='todoLeftCol'>"+
                            "<div class='todoDate'>12.12.2022</div>"+
                            "<div class='todoPrio'>3</div>"+
                            "<div class='todoFunc'>"+
                                "<img class='todoDel' src='./images/del.svg'>"+
                                "<img class='todoEdit' src='./images/new.svg'>"+
                            "</div>"+
                        "</div>"+  
                        "<div class='todoMiddleCol'>"+
                            "<div class='todoTitle'>Titel</div>"+
                            "<div class='todoText'>Text ertetetr</div>"+
                        "</div>"+  
                        "<div class='todoRightCol'>"+
                            "<img  class='todoState' src='./images/state0.svg'>"+
                        "</div>";
                
    console.log('newTodo():'); 
    
    const todoNodes = document.querySelector('#todos'); 

    const node = document.createElement('div');

    if(!todoView)                        
        node.className = 'todo';
    else
        node.className = 'todo cardView'                        

    node.innerHTML = todoNodeTxt;
    todoNodes.appendChild(node);                        

    if(dialog !== null)
    {
        todoDialog2node(dialog, todoNodes.lastChild);
    }    
}
// ------------------------------------------------------
function todoDialog2node(dialog, node)
{

    console.log('todoDialog2node():');

    if(dialog == null)
    {
        console.log('dialog ungültig',dialog);
    }

    let date = new Date(dialog.querySelector('#date').value)
                                    .toLocaleString('de-DE').split(',')[0];
    //console.log('Date:', date);

    node.querySelectorAll('.todoDate')[0].innerText = date;
    
    node.querySelectorAll('.todoPrio')[0].innerText=
                            dialog.querySelector('#prior').value;

    const titel = node.querySelectorAll('.todoTitle')[0];
    const text = node.querySelectorAll('.todoText')[0];

    if(titel === null)
    {
        console.log('titelelement ist null!')
    }
    else
    {
        titel.innerText = dialog.querySelector('#title').value;
    }
    if(text === null)
    {
        console.log('textelement ist null!')
    }
    else
    {
        text.innerText = dialog.querySelector('#text').value;

    }

}
// ------------------------------------------------------
function todoNode2dialog(dialog, node)
{

console.log('todoNode2dialog():');

let date = node.querySelectorAll('.todoDate')[0].innerText.split('.');

date[1].length === 1 ? date[1] = '0' + date[1] : null;
date[0].length === 1 ? date[0] = '0' + date[0] : null;
[date[0], date[1], date[2]] = [date[2], date[1], date[0]];

//console.log('Date:',date.join('-'));

dialog.querySelector('#date').value = date.join('-');

dialog.querySelector('#prior').value = 
           node.querySelectorAll('.todoPrio')[0].innerText;
dialog.querySelector('#title').value = 
           node.querySelectorAll('.todoTitle')[0].innerText;
dialog.querySelector('#text').value = 
           node.querySelectorAll('.todoText')[0].innerText;
}
// ------------------------------------------------------
function saveTodos()
{
    const todoSektion = document.querySelector('#todos');
    const todos = todoSektion.querySelectorAll('.todo');
    const todoList = [];

    console.log('saveTodos():');

    for(const todo of todos)
    {
        todoList.push({'date':todo.querySelectorAll('.todoDate')[0].innerText,
                       'prio':todo.querySelectorAll('.todoPrio')[0].innerText,
                       'title':todo.querySelectorAll('.todoTitle')[0].innerText.
                                                            replaceAll('"',"'"),  
                       'text':todo.querySelectorAll('.todoText')[0].innerText.
                                                            replaceAll('"',"'"),  
                       'state':todo.querySelectorAll('.todoState')[0].src.
                                           endsWith('state0.svg') ? false : true 
                      });
    }
    localStorage.setItem('todo00', JSON.stringify(todoList));
}
// ------------------------------------------------------
function loadTodos()
{
    const todoSektion = document.querySelector('#todos');
    const todos = todoSektion.querySelectorAll('.todo');
    const todoList = JSON.parse(localStorage.getItem("todo00"));

    console.log('loadTodos():');

    for(const todo of todos)
    {
        todo.remove();
    }
    for(const todo of todoList)
    {
        newTodo();
        const todoNode = todoSektion.lastChild;
        todoNode.querySelectorAll('.todoDate')[0].innerText = todo.date;
        todoNode.querySelectorAll('.todoPrio')[0].innerText = todo.prio;
        todoNode.querySelectorAll('.todoTitle')[0].innerText = todo.title;
        todoNode.querySelectorAll('.todoText')[0].innerText = todo.text;
        if(todo.state === true)
        {
            todoNode.querySelectorAll('.todoState')[0].src='./images/state1.svg';
        }
        else
        {
            todoNode.querySelectorAll('.todoState')[0].src='./images/state0.svg';
        }
    }
}
// ------------------------------------------------------
function sortTodos(dialog)
{
    console.log('sortTodos():');
    console.log(dialog.querySelector('input[name="sort"]:checked').id);
    console.log(dialog.querySelector('input[name="dir"]:checked').id);

    const todoSektion = document.querySelector('#todos');
    dialog.querySelector('input[name="dir"]:checked').id === 'up' ? sortDir = 0 : sortDir = 1;

    const childCopy = Array.from(todoSektion.children).map((child) => todoSektion.removeChild(child));

    switch(dialog.querySelector('input[name="sort"]:checked').id)
    {
        case 'date':
                sorting = 0;
                if(sortDir){
                    childCopy.sort((x, y) => {const d1 = x.querySelectorAll('.todoDate')[0].innerText.split('.');
                                              const d2 = y.querySelectorAll('.todoDate')[0].innerText.split('.'); 
                                              return (parseInt(d2[2],10) * 500 + parseInt(d2[1],10) * 32 + parseInt(d2[0],10)) -
                                                     (parseInt(d1[2],10) * 500 + parseInt(d1[1],10) * 32 + parseInt(d1[0],10))
                                             });
                }
                else{
                    childCopy.sort((x, y) => {const d2 = x.querySelectorAll('.todoDate')[0].innerText.split('.');
                                              const d1 = y.querySelectorAll('.todoDate')[0].innerText.split('.'); 
                                              return (parseInt(d2[2],10) * 500 + parseInt(d2[1],10) * 32 + parseInt(d2[0],10)) -
                                                     (parseInt(d1[2],10) * 500 + parseInt(d1[1],10) * 32 + parseInt(d1[0],10))
                                             });
                }
                break;
        case 'prio':
                sorting = 1;
                if(sortDir){
                    childCopy.sort((x, y) => parseInt(x.querySelectorAll('.todoPrio')[0].innerText,10) >
                                             parseInt(y.querySelectorAll('.todoPrio')[0].innerText,10) ? -1 : 1);
                }
                else{
                    childCopy.sort((x, y) => parseInt(x.querySelectorAll('.todoPrio')[0].innerText,10) <
                                             parseInt(y.querySelectorAll('.todoPrio')[0].innerText,10) ? -1 : 1);
                }
                break;
        case 'state':
                sorting = 2;
                if(sortDir){
                    childCopy.sort((x, y) => x.querySelectorAll('.todoState')[0].src.endsWith('state0.svg') &&
                                             y.querySelectorAll('.todoState')[0].src.endsWith('state1.svg') ? -1 : 1);
                }
                else{
                    childCopy.sort((x, y) => x.querySelectorAll('.todoState')[0].src.endsWith('state1.svg') &&
                                             y.querySelectorAll('.todoState')[0].src.endsWith('state0.svg') ? -1 : 1);
                }
                break;     
    }
    childCopy.forEach((child) => todoSektion.appendChild(child));
}
// ====================================== INIT EVENTLISTENER =============
document.addEventListener('DOMContentLoaded', () => 
{
    document.querySelector('#mainMenu').addEventListener('click', mainMenu);
    document.querySelector('#todos').addEventListener('click', todoFunc);
    document.querySelector('#dialogs').addEventListener('click', dialogHandler);

    loadTodos();
});

window.addEventListener('beforeunload', () => saveTodos() );

// ====================================== MENÜS ==========================
function todoFunc(event)
{
    let node=event.target.parentNode;

    switch(event.target.className)
    {
            case 'todoDel':

                  console.log('todoDel');
                 
                  while(!node.classList.contains('todo'))
                  {
                    node=node.parentNode;
                  }

                  if(node.querySelectorAll('.todoState')[0].src.endsWith('state0.svg'))
                  {
                    const dialog = document.querySelector('#stopDelete');
                    openDialog(dialog);
                    dialogWait(dialog).then(()=> dialogBackVal === true ? null : null); 
                     
                     break;
                  }
                  else
                  {
                    node.remove();
                  }
                 break;
            case 'todoEdit':
                 console.log('todoEdit');

                 const dialog = document.querySelector('#todoInput');
                 
                 while(!node.classList.contains('todo'))
                  {
                    node=node.parentNode;
                  }

                 todoNode2dialog(dialog, node);
                 openDialog(dialog);
                 dialogWait(dialog).then(()=> dialogBackVal === true ? todoDialog2node(dialog, node) : null); 
                
                 break;
            case 'todoState':

                 if(event.target.src.endsWith('state0.svg'))
                 {
                    event.target.src = './images/state1.svg';
                 }
                 else
                 {
                    event.target.src = './images/state0.svg';

                 }
                 console.log('todoState');
                 break;
    }
}    
// ------------------------------------------------------
function mainMenu(event)
{

        let dialog = null;
        
        switch(event.target.id || event.target.parentNode.id){
            case 'new':
                console.log('new');

                dialog = document.querySelector('#todoInput');
                dialog.reset();
                dialog.querySelector('#date').value = 
                               new Date().toLocaleDateString('fr-CA');

                openDialog(dialog);
                dialogWait(dialog).then(()=> dialogBackVal === true ? newTodo(dialog) : null);

                break;
            case 'load':
                console.log('load');
                loadTodos();
                break;
            case 'save':
                console.log('save');
                saveTodos();
                break;
            case 'sort':
                console.log('sort');

                dialog = document.querySelector('#sortDialog');
                dialog.reset();
                switch(sorting)
                {
                   case 0:
                        dialog.querySelector('#date').checked = true;
                        break;     
                   case 1:
                        dialog.querySelector('#prio').checked = true;
                        break;     
                   case 2:
                        dialog.querySelector('#state').checked = true;
                        break;     

                }
                switch(sortDir)
                {
                   case 0:
                        dialog.querySelector('#up').checked = true;
                        break;     
                   case 1:
                        dialog.querySelector('#down').checked = true;
                        break;     
                }
                openDialog(dialog);
                dialogWait(dialog).then(()=> dialogBackVal === true ? sortTodos(dialog) : null);
                break;
            case 'view':
                console.log('setup');
                let todos = document.querySelector('#todos');
                for(const todo of todos.children)
                    {
                        todo.classList.toggle('cardView');
                    }
                todos.classList.toggle('cardWrap');  

                if(!todoView)
                {
                    document.querySelector('#view > img').src = "./images/view0.svg";
                    todoView = 1;
                }
                else
                {
                    document.querySelector('#view > img').src = "./images/view1.svg";
                    todoView = 0;
                }


                break;
        }
}
// ====================================== DIALOG =========================

function openDialog(dialog)
{
    console.log('openDialog():');

    document.querySelector('#modLayer').classList.remove('disable');
    dialog.classList.remove('disable');
}

function closeDialog(dialog)
{
    document.querySelector('#modLayer').classList.add('disable');
    dialog.classList.add('disable');

    console.log('closeDialog():');

}
function dialogHandler(event)
{
    console.log('dialogHandler():');

    let retId = event.target.id || event.target.parentNode.id;

    if(retId != 'ok' && retId != 'cancel')
    {
        return;
    }
  
    retId === 'ok' ? dialogBackVal = true : dialogBackVal = false;

    let dialog = event.target.parentNode

    while(!dialog.classList.contains('dialog'))
        {
          dialog=dialog.parentNode;
        }
    closeDialog(dialog);
}
function dialogWait(dialog)
{
    console.log('dialogWait():');

    return new Promise( function(resolve, reject){

    let timerID = setInterval(() => {if(dialog.classList.contains('disable')){
                                        clearInterval(timerID);
                                        resolve(true);
                                        }
                                    }, 150);
    });
}
